import Address from "../../../@shared/domain/value-object/address";
import PlaceOrderUseCase from "./place-order.usecase";

const client = {
  id: "c1",
  name: "Client 1",
  email: "client@x.com",
  document: "1234-5678",
  address: new Address("Rua 123", "99", "Casa Verde", "Criciúma", "SC", "88888-888"),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const catalog: Record<string, any> = {
  p1: { id: "p1", name: "P1", description: "d1", salesPrice: 40 },
  p2: { id: "p2", name: "P2", description: "d2", salesPrice: 80 },
};

const makeDeps = (paymentStatus = "approved", stock = 10) => ({
  clientFacade: {
    add: jest.fn(),
    find: jest.fn().mockResolvedValue(client),
  },
  productFacade: {
    addProduct: jest.fn(),
    checkStock: jest
      .fn()
      .mockImplementation(({ productId }) => Promise.resolve({ productId, stock })),
  },
  catalogFacade: {
    findAll: jest.fn(),
    find: jest.fn().mockImplementation(({ id }) => Promise.resolve(catalog[id])),
  },
  paymentFacade: {
    process: jest.fn().mockImplementation(({ orderId, amount }) =>
      Promise.resolve({
        transactionId: "t1",
        orderId,
        amount,
        status: paymentStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    ),
  },
  invoiceFacade: {
    generate: jest.fn().mockResolvedValue({ id: "inv1" }),
    find: jest.fn(),
  },
  repository: {
    addOrder: jest.fn(),
    findOrder: jest.fn(),
  },
});

const input = {
  clientId: "c1",
  products: [{ productId: "p1" }, { productId: "p2" }],
};

describe("Place Order use case unit test", () => {
  it("should place an approved order and generate an invoice", async () => {
    const deps = makeDeps("approved");
    const usecase = new PlaceOrderUseCase(deps);

    const output = await usecase.execute(input);

    expect(output.id).toBeDefined();
    expect(output.status).toBe("approved");
    expect(output.total).toBe(120);
    expect(output.invoiceId).toBe("inv1");
    expect(output.products).toEqual(input.products);
    expect(deps.paymentFacade.process).toHaveBeenCalledWith({
      orderId: output.id,
      amount: 120,
    });
    expect(deps.invoiceFacade.generate).toHaveBeenCalledWith({
      name: client.name,
      document: client.document,
      street: "Rua 123",
      number: "99",
      complement: "Casa Verde",
      city: "Criciúma",
      state: "SC",
      zipCode: "88888-888",
      items: [
        { id: "p1", name: "P1", price: 40 },
        { id: "p2", name: "P2", price: 80 },
      ],
    });
    expect(deps.repository.addOrder).toHaveBeenCalledTimes(1);
  });

  it("should keep the order pending and not generate invoice when payment is declined", async () => {
    const deps = makeDeps("declined");
    const usecase = new PlaceOrderUseCase(deps);

    const output = await usecase.execute(input);

    expect(output.status).toBe("pending");
    expect(output.invoiceId).toBeNull();
    expect(deps.invoiceFacade.generate).not.toHaveBeenCalled();
    expect(deps.repository.addOrder).toHaveBeenCalledTimes(1);
  });

  it("should throw an error when client is not found", async () => {
    const deps = makeDeps();
    deps.clientFacade.find.mockResolvedValue(null);
    const usecase = new PlaceOrderUseCase(deps);

    await expect(usecase.execute(input)).rejects.toThrow("Client not found");
  });

  it("should throw an error when no products are selected", async () => {
    const usecase = new PlaceOrderUseCase(makeDeps());

    await expect(usecase.execute({ clientId: "c1", products: [] })).rejects.toThrow(
      "No products selected"
    );
  });

  it("should throw an error when a product is out of stock", async () => {
    const deps = makeDeps("approved", 0);
    const usecase = new PlaceOrderUseCase(deps);

    await expect(usecase.execute(input)).rejects.toThrow(
      "Product p1 is not available in stock"
    );
    expect(deps.paymentFacade.process).not.toHaveBeenCalled();
  });
});
