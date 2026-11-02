import { Sequelize } from "sequelize-typescript";
import Address from "../../@shared/domain/value-object/address";
import Id from "../../@shared/domain/value-object/id.value-object";
import InvoiceItems from "../domain/invoice-items.entity";
import Invoice from "../domain/invoice.entity";
import { InvoiceItemModel } from "./invoice-item.model";
import { InvoiceModel } from "./invoice.model";
import InvoiceRepository from "./invoice.repository";

const makeInvoice = (id: string) =>
  new Invoice({
    id: new Id(id),
    name: "Lucian",
    document: "1234-5678",
    address: new Address("Rua 123", "99", "Casa Verde", "Criciúma", "SC", "88888-888"),
    items: [
      new InvoiceItems({ id: new Id("1"), name: "Item 1", price: 100 }),
      new InvoiceItems({ id: new Id("2"), name: "Item 2", price: 200 }),
    ],
  });

describe("Invoice Repository test", () => {
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
    const invoice = makeInvoice("1");
    const repository = new InvoiceRepository();
    await repository.generate(invoice);

    const invoiceDb = await InvoiceModel.findOne({
      where: { id: "1" },
      include: [InvoiceItemModel],
    });

    expect(invoiceDb.id).toBe("1");
    expect(invoiceDb.name).toBe(invoice.name);
    expect(invoiceDb.document).toBe(invoice.document);
    expect(invoiceDb.street).toBe(invoice.address.street);
    expect(invoiceDb.zipCode).toBe(invoice.address.zipCode);
    expect(invoiceDb.items).toHaveLength(2);
    expect(invoiceDb.createdAt).toStrictEqual(invoice.createdAt);
  });

  it("should find an invoice", async () => {
    const invoice = makeInvoice("1");
    const repository = new InvoiceRepository();
    await repository.generate(invoice);

    const result = await repository.find("1");

    expect(result.id.id).toBe("1");
    expect(result.name).toBe(invoice.name);
    expect(result.document).toBe(invoice.document);
    expect(result.address).toEqual(invoice.address);
    expect(result.items.map((i) => i.id.id).sort()).toEqual(["1", "2"]);
    expect(result.total).toBe(300);
    expect(result.createdAt).toStrictEqual(invoice.createdAt);
  });

  it("should allow the same product item in different invoices", async () => {
    const repository = new InvoiceRepository();
    await repository.generate(makeInvoice("1"));
    await repository.generate(makeInvoice("2"));

    expect(await InvoiceItemModel.count()).toBe(4);
  });

  it("should throw an error when invoice is not found", async () => {
    const repository = new InvoiceRepository();
    await expect(repository.find("999")).rejects.toThrow(
      "Invoice with id 999 not found"
    );
  });
});
