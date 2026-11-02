import Address from "../../@shared/domain/value-object/address";
import Id from "../../@shared/domain/value-object/id.value-object";
import InvoiceItems from "./invoice-items.entity";
import Invoice from "./invoice.entity";

const address = new Address("Rua 123", "99", "Casa Verde", "Criciúma", "SC", "88888-888");

describe("Invoice entity unit test", () => {
  it("should create an invoice and calculate the total", () => {
    const invoice = new Invoice({
      id: new Id("1"),
      name: "Invoice 1",
      document: "1234-5678",
      address,
      items: [
        new InvoiceItems({ id: new Id("i1"), name: "Item 1", price: 100 }),
        new InvoiceItems({ id: new Id("i2"), name: "Item 2", price: 250.5 }),
      ],
    });

    expect(invoice.id.id).toBe("1");
    expect(invoice.items).toHaveLength(2);
    expect(invoice.total).toBe(350.5);
    expect(invoice.createdAt).toBeInstanceOf(Date);
    expect(invoice.updatedAt).toBeInstanceOf(Date);
  });

  it("should throw an error when invoice has no items", () => {
    expect(
      () => new Invoice({ name: "Invoice 1", document: "1234-5678", address, items: [] })
    ).toThrow("Invoice must have at least one item");
  });

  it("should throw an error when name is empty", () => {
    expect(
      () =>
        new Invoice({
          name: "",
          document: "1234-5678",
          address,
          items: [new InvoiceItems({ name: "Item 1", price: 10 })],
        })
    ).toThrow("Invoice name is required");
  });

  it("should throw an error when item price is negative", () => {
    expect(() => new InvoiceItems({ name: "Item 1", price: -1 })).toThrow(
      "Invoice item price must be greater than or equal to 0"
    );
  });
});
