import { Sequelize } from "sequelize-typescript";
import InvoiceFacadeFactory from "../factory/invoice.facade.factory";
import { InvoiceItemModel } from "../repository/invoice-item.model";
import { InvoiceModel } from "../repository/invoice.model";

const input = {
  name: "Lucian",
  document: "1234-5678",
  street: "Rua 123",
  number: "99",
  complement: "Casa Verde",
  city: "Criciúma",
  state: "SC",
  zipCode: "88888-888",
  items: [
    { id: "1", name: "Item 1", price: 100 },
    { id: "2", name: "Item 2", price: 200 },
  ],
};

describe("Invoice Facade test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    sequelize.addModels([InvoiceModel, InvoiceItemModel]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should generate an invoice", async () => {
    const facade = InvoiceFacadeFactory.create();

    const output = await facade.generate(input);

    expect(output.id).toBeDefined();
    expect(output.name).toBe(input.name);
    expect(output.document).toBe(input.document);
    expect(output.street).toBe(input.street);
    expect(output.number).toBe(input.number);
    expect(output.complement).toBe(input.complement);
    expect(output.city).toBe(input.city);
    expect(output.state).toBe(input.state);
    expect(output.zipCode).toBe(input.zipCode);
    expect(output.items).toEqual(input.items);
    expect(output.total).toBe(300);

    const invoiceDb = await InvoiceModel.findOne({
      where: { id: output.id },
      include: [InvoiceItemModel],
    });
    expect(invoiceDb).not.toBeNull();
    expect(invoiceDb.items).toHaveLength(2);
  });

  it("should find an invoice", async () => {
    const facade = InvoiceFacadeFactory.create();
    const generated = await facade.generate(input);

    const output = await facade.find({ id: generated.id });

    expect(output.id).toBe(generated.id);
    expect(output.name).toBe(input.name);
    expect(output.document).toBe(input.document);
    expect(output.address).toEqual({
      street: input.street,
      number: input.number,
      complement: input.complement,
      city: input.city,
      state: input.state,
      zipCode: input.zipCode,
    });
    expect([...output.items].sort((a, b) => a.id.localeCompare(b.id))).toEqual(input.items);
    expect(output.total).toBe(300);
    expect(output.createdAt).toBeInstanceOf(Date);
  });
});
