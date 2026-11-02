# FC Monolito

Sistema monolítico modular em TypeScript, com os módulos `client-adm`, `product-adm`, `store-catalog`, `payment`, `invoice` (Nota Fiscal) e `checkout`, expostos por uma API REST em Express.

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

## Módulo Checkout

Localizado em `src/modules/checkout`. O `PlaceOrderUseCase` executa o fluxo da compra conversando com os outros módulos apenas pelas Facades:

1. Busca o cliente (`client-adm`)
2. Valida o estoque dos produtos (`product-adm`)
3. Busca o preço de venda dos produtos (`store-catalog`)
4. Processa o pagamento (`payment`). O pagamento é aprovado quando o total é maior ou igual a 100.
5. Se aprovado, gera a nota fiscal (`invoice`) e marca o pedido como `approved`; senão, o pedido fica `pending`
6. Salva o pedido

## API

Código em `src/infrastructure/api` (Express). O banco é SQLite, configurado em `src/infrastructure/db/sequelize.ts`.

| Método | Rota | Descrição | Sucesso |
|---|---|---|---|
| POST | `/products` | Cadastra produto | 201 |
| POST | `/clients` | Cadastra cliente | 201 |
| POST | `/checkout` | Realiza a compra | 201 |
| GET | `/invoice/:id` | Consulta nota fiscal | 200 (404 se não existir) |

### Executando a API

```bash
npm install
npm start          # sobe em http://localhost:3000
# ou
npm run dev        # com reload automático (nodemon)
```

Variáveis de ambiente opcionais:

- `PORT`: porta HTTP (padrão `3000`)
- `DB_STORAGE`: arquivo do SQLite (padrão `:memory:`, os dados se perdem ao reiniciar). Exemplo: `DB_STORAGE=database.sqlite npm start`

### Exemplo do fluxo completo

```bash
curl -X POST http://localhost:3000/clients -H "Content-Type: application/json" -d '{
  "id": "c1", "name": "Ana", "email": "ana@email.com", "document": "123.456.789-00",
  "address": { "street": "Rua A", "number": "1", "complement": "Ap 2",
               "city": "Curitiba", "state": "PR", "zipCode": "80000-000" }
}'

curl -X POST http://localhost:3000/products -H "Content-Type: application/json" -d '{
  "id": "p1", "name": "Notebook", "description": "16GB RAM",
  "purchasePrice": 2000, "salesPrice": 3500, "stock": 5
}'

curl -X POST http://localhost:3000/checkout -H "Content-Type: application/json" -d '{
  "clientId": "c1", "products": [{ "productId": "p1" }]
}'
# resposta: { "id": "...", "invoiceId": "<ID_DA_NOTA>", "status": "approved", "total": 3500, ... }

curl http://localhost:3000/invoice/<ID_DA_NOTA>
```

## Pré-requisitos

- Node.js 16+
- npm

## Como rodar os testes

```bash
npm install
npm test
```

O comando `npm test` (ou `npm run test`) faz a checagem de tipos (`tsc --noEmit`) e executa **todos** os testes com Jest: os unitários e os E2E da API.

Os testes E2E ficam em `src/infrastructure/api/__tests__` (arquivos `*.e2e.spec.ts`) e usam Supertest. Eles validam o status code e o corpo da resposta de cada endpoint. Todos os testes usam SQLite em memória, sem necessidade de banco externo.

Para rodar apenas os testes E2E:

```bash
npx jest src/infrastructure/api
```

Para rodar apenas os testes do módulo Invoice:

```bash
npx jest src/modules/invoice
```
