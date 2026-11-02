import express, { Request, Response } from "express";
import CheckoutFacadeFactory from "../../../modules/checkout/factory/checkout.facade.factory";

export const checkoutRoute = express.Router();

checkoutRoute.post("/", async (req: Request, res: Response) => {
  try {
    const facade = CheckoutFacadeFactory.create();
    const output = await facade.placeOrder({
      clientId: req.body.clientId,
      products: req.body.products,
    });
    res.status(201).send(output);
  } catch (err) {
    res.status(400).send({ message: (err as Error).message });
  }
});
