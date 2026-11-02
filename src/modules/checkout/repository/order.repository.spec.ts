import { Sequelize } from "sequelize-typescript";
import Address from "../../@shared/domain/value-object/address";
import Id from "../../@shared/domain/value-object/id.value-object";
import Client from "../domain/client.entity";
import Order from "../domain/order.entity";
import Product from "../domain/product.entity";
import { OrderItemModel } from "./order-item.model";
import { OrderModel } from "./order.model";
import OrderRepository from "./order.repository";

describe("Order Repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });
    sequelize.addModels([OrderModel, OrderItemModel]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should add and find an order", async () => {
    const order = new Order({
      id: new Id("o1"),
      client: new Client({
        id: new Id("c1"),
        name: "Client 1",
        email: "client@x.com",
        document: "1234-5678",
        address: new Address("Rua 123", "99", "Casa Verde", "Criciúma", "SC", "88888-888"),
      }),
      products: [
        new Product({ id: new Id("p1"), name: "P1", description: "d1", salesPrice: 40 }),
        new Product({ id: new Id("p2"), name: "P2", description: "d2", salesPrice: 60 }),
      ],
    });
    order.approved();

    const repository = new OrderRepository();
    await repository.addOrder(order);
    const result = await repository.findOrder("o1");

    expect(result.id.id).toBe("o1");
    expect(result.status).toBe("approved");
    expect(result.client.id.id).toBe("c1");
    expect(result.client.address).toEqual(order.client.address);
    expect(result.products).toHaveLength(2);
    expect(result.total).toBe(100);
  });

  it("should return null when order is not found", async () => {
    const repository = new OrderRepository();
    expect(await repository.findOrder("999")).toBeNull();
  });
});
