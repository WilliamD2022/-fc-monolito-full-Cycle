import request from "supertest";
import { app } from "../express";

export const clientPayload = {
  name: "Lucian",
  email: "lucian@xpto.com",
  document: "1234-5678",
  address: {
    street: "Rua 123",
    number: "99",
    complement: "Casa Verde",
    city: "Criciúma",
    state: "SC",
    zipCode: "88888-888",
  },
};

export const productPayload = (id: string, salesPrice: number, stock = 10) => ({
  id,
  name: `Product ${id}`,
  description: `Description ${id}`,
  purchasePrice: salesPrice / 2,
  salesPrice,
  stock,
});

export const createClient = (id = "c1") =>
  request(app).post("/clients").send({ id, ...clientPayload });

export const createProduct = (id: string, salesPrice: number, stock = 10) =>
  request(app).post("/products").send(productPayload(id, salesPrice, stock));
