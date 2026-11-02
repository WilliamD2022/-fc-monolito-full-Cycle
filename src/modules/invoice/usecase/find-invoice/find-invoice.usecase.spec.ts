import Address from "../../../@shared/domain/value-object/address";
import Id from "../../../@shared/domain/value-object/id.value-object";
import InvoiceItems from "../../domain/invoice-items.entity";
import Invoice from "../../domain/invoice.entity";
import FindInvoiceUseCase from "./find-invoice.usecase";

const invoice = new Invoice({
  id: new Id("1"),
  name: "Lucian",
  document: "1234-5678",
  address: new Address("Rua 123", "99", "Casa Verde", "Criciúma", "SC", "88888-888"),
  items: [
    new InvoiceItems({ id: new Id("1"), name: "Item 1", price: 100 }),
    new InvoiceItems({ id: new Id("2"), name: "Item 2", price: 200 }),
  ],
});

const MockRepository = () => {
  return {
    generate: jest.fn(),
    find: jest.fn().mockReturnValue(Promise.resolve(invoice)),
  };
};

describe("Find Invoice use case unit test", () => {
  it("should find an invoice", async () => {
    const repository = MockRepository();
    const usecase = new FindInvoiceUseCase(repository);

    const result = await usecase.execute({ id: "1" });

    expect(repository.find).toHaveBeenCalledWith("1");
    expect(result.id).toBe("1");
    expect(result.name).toBe(invoice.name);
    expect(result.document).toBe(invoice.document);
    expect(result.address).toEqual({
      street: "Rua 123",
      number: "99",
      complement: "Casa Verde",
      city: "Criciúma",
      state: "SC",
      zipCode: "88888-888",
    });
    expect(result.items).toEqual([
      { id: "1", name: "Item 1", price: 100 },
      { id: "2", name: "Item 2", price: 200 },
    ]);
    expect(result.total).toBe(300);
    expect(result.createdAt).toEqual(invoice.createdAt);
  });
});
