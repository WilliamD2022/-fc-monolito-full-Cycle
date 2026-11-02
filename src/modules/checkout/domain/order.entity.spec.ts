import Address from "../../@shared/domain/value-object/address";
import Id from "../../@shared/domain/value-object/id.value-object";
import Client from "./client.entity";
import Order from "./order.entity";
import Product from "./product.entity";

describe("Order entity unit test", () => {
  const client = new Client({
    id: new Id("c1"),
    name: "Client 1",
    email: "client@x.com",
    document: "1234-5678",
    address: new Address("Rua 123", "99", "Casa Verde", "Criciúma", "SC", "88888-888"),
  });

  it("should create a pending order and calculate the total", () => {
    const order = new Order({
      client,
      products: [
        new Product({ id: new Id("p1"), name: "P1", description: "d", salesPrice: 40 }),
        new Product({ id: new Id("p2"), name: "P2", description: "d", salesPrice: 60 }),
      ],
    });

    expect(order.status).toBe("pending");
    expect(order.total).toBe(100);
  });

  it("should approve an order", () => {
    const order = new Order({ client, products: [] });
    order.approved();
    expect(order.status).toBe("approved");
  });
});
