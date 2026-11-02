import Address from "../../@shared/domain/value-object/address";
import Id from "../../@shared/domain/value-object/id.value-object";
import Client from "../domain/client.entity";
import Order from "../domain/order.entity";
import Product from "../domain/product.entity";
import CheckoutGateway from "../gateway/checkout.gateway";
import { OrderItemModel } from "./order-item.model";
import { OrderModel } from "./order.model";

export default class OrderRepository implements CheckoutGateway {
  async addOrder(order: Order): Promise<void> {
    await OrderModel.create(
      {
        id: order.id.id,
        clientId: order.client.id.id,
        clientName: order.client.name,
        clientEmail: order.client.email,
        clientDocument: order.client.document,
        street: order.client.address.street,
        number: order.client.address.number,
        complement: order.client.address.complement,
        city: order.client.address.city,
        state: order.client.address.state,
        zipCode: order.client.address.zipCode,
        status: order.status,
        items: order.products.map((product) => ({
          productId: product.id.id,
          name: product.name,
          description: product.description,
          salesPrice: product.salesPrice,
        })),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
      { include: [OrderItemModel] }
    );
  }

  async findOrder(id: string): Promise<Order | null> {
    const order = await OrderModel.findOne({
      where: { id },
      include: [OrderItemModel],
    });

    if (!order) {
      return null;
    }

    return new Order({
      id: new Id(order.id),
      client: new Client({
        id: new Id(order.clientId),
        name: order.clientName,
        email: order.clientEmail,
        document: order.clientDocument,
        address: new Address(
          order.street,
          order.number,
          order.complement,
          order.city,
          order.state,
          order.zipCode
        ),
      }),
      products: order.items.map(
        (item) =>
          new Product({
            id: new Id(item.productId),
            name: item.name,
            description: item.description,
            salesPrice: item.salesPrice,
          })
      ),
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  }
}
