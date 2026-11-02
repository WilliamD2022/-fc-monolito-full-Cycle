import Id from "../../../@shared/domain/value-object/id.value-object";
import UseCaseInterface from "../../../@shared/usecase/use-case.interface";
import ClientAdmFacadeInterface from "../../../client-adm/facade/client-adm.facade.interface";
import InvoiceFacadeInterface from "../../../invoice/facade/invoice.facade.interface";
import PaymentFacadeInterface from "../../../payment/facade/facade.interface";
import ProductAdmFacadeInterface from "../../../product-adm/facade/product-adm.facade.interface";
import StoreCatalogFacadeInterface from "../../../store-catalog/facade/store-catalog.facade.interface";
import Client from "../../domain/client.entity";
import Order from "../../domain/order.entity";
import Product from "../../domain/product.entity";
import CheckoutGateway from "../../gateway/checkout.gateway";
import { PlaceOrderInputDto, PlaceOrderOutputDto } from "./place-order.dto";

type PlaceOrderUseCaseProps = {
  clientFacade: ClientAdmFacadeInterface;
  productFacade: ProductAdmFacadeInterface;
  catalogFacade: StoreCatalogFacadeInterface;
  paymentFacade: PaymentFacadeInterface;
  invoiceFacade: InvoiceFacadeInterface;
  repository: CheckoutGateway;
};

export default class PlaceOrderUseCase implements UseCaseInterface {
  private _clientFacade: ClientAdmFacadeInterface;
  private _productFacade: ProductAdmFacadeInterface;
  private _catalogFacade: StoreCatalogFacadeInterface;
  private _paymentFacade: PaymentFacadeInterface;
  private _invoiceFacade: InvoiceFacadeInterface;
  private _repository: CheckoutGateway;

  constructor(props: PlaceOrderUseCaseProps) {
    this._clientFacade = props.clientFacade;
    this._productFacade = props.productFacade;
    this._catalogFacade = props.catalogFacade;
    this._paymentFacade = props.paymentFacade;
    this._invoiceFacade = props.invoiceFacade;
    this._repository = props.repository;
  }

  async execute(input: PlaceOrderInputDto): Promise<PlaceOrderOutputDto> {
    const client = await this.getClient(input.clientId);

    await this.validateProducts(input);
    const products = await Promise.all(
      input.products.map((p) => this.getProduct(p.productId))
    );

    const order = new Order({ client, products });

    const payment = await this._paymentFacade.process({
      orderId: order.id.id,
      amount: order.total,
    });

    let invoiceId: string | null = null;
    if (payment.status === "approved") {
      order.approved();
      const invoice = await this._invoiceFacade.generate({
        name: client.name,
        document: client.document,
        street: client.address.street,
        number: client.address.number,
        complement: client.address.complement,
        city: client.address.city,
        state: client.address.state,
        zipCode: client.address.zipCode,
        items: products.map((product) => ({
          id: product.id.id,
          name: product.name,
          price: product.salesPrice,
        })),
      });
      invoiceId = invoice.id;
    }

    await this._repository.addOrder(order);

    return {
      id: order.id.id,
      invoiceId,
      status: order.status,
      total: order.total,
      products: order.products.map((product) => ({
        productId: product.id.id,
      })),
    };
  }

  private async getClient(clientId: string): Promise<Client> {
    const client = await this._clientFacade.find({ id: clientId });
    if (!client) {
      throw new Error("Client not found");
    }

    return new Client({
      id: new Id(client.id),
      name: client.name,
      email: client.email,
      document: client.document,
      address: client.address,
    });
  }

  private async validateProducts(input: PlaceOrderInputDto): Promise<void> {
    if (!input.products || input.products.length === 0) {
      throw new Error("No products selected");
    }

    for (const p of input.products) {
      const product = await this._productFacade.checkStock({
        productId: p.productId,
      });
      if (product.stock <= 0) {
        throw new Error(
          `Product ${product.productId} is not available in stock`
        );
      }
    }
  }

  private async getProduct(productId: string): Promise<Product> {
    const product = await this._catalogFacade.find({ id: productId });
    if (!product) {
      throw new Error("Product not found");
    }

    return new Product({
      id: new Id(product.id),
      name: product.name,
      description: product.description,
      salesPrice: product.salesPrice,
    });
  }
}
