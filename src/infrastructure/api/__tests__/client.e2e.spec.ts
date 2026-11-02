import { Sequelize } from "sequelize-typescript";
import request from "supertest";
import { setupDatabase } from "../../db/sequelize";
import { app } from "../express";
import { clientPayload } from "../test-utils/e2e-helpers";

describe("E2E test for clients", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = await setupDatabase();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a client", async () => {
    const response = await request(app)
      .post("/clients")
      .send({ id: "c1", ...clientPayload });

    expect(response.status).toBe(201);
    expect(response.body.id).toBe("c1");
    expect(response.body.name).toBe(clientPayload.name);
    expect(response.body.email).toBe(clientPayload.email);
    expect(response.body.document).toBe(clientPayload.document);
    expect(response.body.address).toEqual(clientPayload.address);
    expect(response.body.createdAt).toBeDefined();
  });

  it("should return 400 when client data is invalid", async () => {
    const response = await request(app).post("/clients").send({ name: "Lucian" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
  });
});
