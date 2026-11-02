import { Sequelize } from "sequelize-typescript";
import request from "supertest";
import { setupDatabase } from "../../db/sequelize";
import { app } from "../express";
import { productPayload } from "../test-utils/e2e-helpers";

describe("E2E test for products", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = await setupDatabase();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a product", async () => {
    const payload = productPayload("p1", 150);

    const response = await request(app).post("/products").send(payload);

    expect(response.status).toBe(201);
    expect(response.body.id).toBe("p1");
    expect(response.body.name).toBe(payload.name);
    expect(response.body.description).toBe(payload.description);
    expect(response.body.purchasePrice).toBe(payload.purchasePrice);
    expect(response.body.salesPrice).toBe(payload.salesPrice);
    expect(response.body.stock).toBe(payload.stock);
    expect(response.body.createdAt).toBeDefined();
  });

  it("should generate an id when it is not informed", async () => {
    const { id, ...payload } = productPayload("p1", 150);

    const response = await request(app).post("/products").send(payload);

    expect(response.status).toBe(201);
    expect(response.body.id).toEqual(expect.any(String));
  });

  it("should return 400 when product data is invalid", async () => {
    const response = await request(app).post("/products").send({ name: "Product" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
  });
});
