# FC Monolito

Sistema monolítico modular em TypeScript, com os módulos `client-adm`, `product-adm`, `store-catalog`, `payment` e `invoice` (Nota Fiscal).

## Módulo Invoice

Localizado em `src/modules/invoice`, expõe suas funcionalidades apenas pela Facade:

```
src/modules/invoice
├── domain/        # Invoice (aggregate root) e InvoiceItems; Address (value object) em @shared
├── gateway/       # InvoiceGateway (contrato de persistência)
├── repository/    # InvoiceRepository + models Sequelize (invoices, invoice_items)
├── usecase/
│   ├── generate-invoice/   # GenerateInvoiceUseCase
│   └── find-invoice/       # FindInvoiceUseCase
├── facade/        # InvoiceFacade + interface/DTOs públicos
└── factory/       # InvoiceFacadeFactory
```

Uso por outros módulos:

```ts
import InvoiceFacadeFactory from "./modules/invoice/factory/invoice.facade.factory";

const invoiceFacade = InvoiceFacadeFactory.create();
const invoice = await invoiceFacade.generate({ /* GenerateInvoiceUseCaseInputDto */ });
const found = await invoiceFacade.find({ id: invoice.id });
```

## Pré-requisitos

- Node.js 16+
- npm

## Como rodar os testes

```bash
npm install
npm test
```

O comando `npm test` faz a checagem de tipos (`tsc --noEmit`) e executa o Jest. Os testes de repositório e facade usam SQLite em memória, sem necessidade de banco externo.

Para rodar apenas os testes do módulo Invoice:

```bash
npx jest src/modules/invoice
```
