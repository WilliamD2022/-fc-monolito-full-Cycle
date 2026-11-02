import { Sequelize } from "sequelize-typescript";
import request from "supertest";
import { setupDatabase } from "../../db/sequelize";
import { app } from "../express";
import { createClient, createProduct } from "../test-utils/e2e-helpers";

describe("E2E test for checkout", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = await setupDatabase();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should place an approved order and generate an invoice", async () => {
    await createClient("c1");
    await createProduct("p1", 100);
    await createProduct("p2", 50);

    const response = await request(app)
      .post("/checkout")
      .send({
        clientId: "c1",
        products: [{ productId: "p1" }, { productId: "p2" }],
      });

    expect(response.status).toBe(201);
    expect(response.body.id).toEqual(expect.any(String));
    expect(response.body.status).toBe("approved");
    expect(response.body.total).toBe(150);
    expect(response.body.invoiceId).toEqual(expect.any(String));
    expect(response.body.products).toEqual([
      { productId: "p1" },
      { productId: "p2" },
    ]);
  });

  it("should keep the order pending when payment is declined (total < 100)", async () => {
    await createClient("c1");
    await createProduct("p1", 30);

    const response = await request(app)
      .post("/checkout")
      .send({ clientId: "c1", products: [{ productId: "p1" }] });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("pending");
    expect(response.body.total).toBe(30);
    expect(response.body.invoiceId).toBeNull();
  });

  it("should return 400 when product is out of stock", async () => {
    await createClient("c1");
    await createProduct("p1", 100, 0);

    const response = await request(app)
      .post("/checkout")
      .send({ clientId: "c1", products: [{ productId: "p1" }] });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Product p1 is not available in stock");
  });

  it("should return 400 when client does not exist", async () => {
    await createProduct("p1", 100);

    const response = await request(app)
      .post("/checkout")
      .send({ clientId: "nope", products: [{ productId: "p1" }] });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Client not found");
  });
});
