import express, { Request, Response } from "express";
import Address from "../../../modules/@shared/domain/value-object/address";
import ClientAdmFacadeFactory from "../../../modules/client-adm/factory/client-adm.facade.factory";

export const clientRoute = express.Router();

clientRoute.post("/", async (req: Request, res: Response) => {
  try {
    const facade = ClientAdmFacadeFactory.create();
    const address = req.body.address ?? {};
    const output = await facade.add({
      id: req.body.id,
      name: req.body.name,
      email: req.body.email,
      document: req.body.document,
      address: new Address(
        address.street,
        address.number,
        address.complement,
        address.city,
        address.state,
        address.zipCode
      ),
    });

    res.status(201).send({
      id: output.id,
      name: output.name,
      email: output.email,
      document: output.document,
      address: {
        street: output.address.street,
        number: output.address.number,
        complement: output.address.complement,
        city: output.address.city,
        state: output.address.state,
        zipCode: output.address.zipCode,
      },
      createdAt: output.createdAt,
      updatedAt: output.updatedAt,
    });
  } catch (err) {
    res.status(400).send({ message: (err as Error).message });
  }
});
