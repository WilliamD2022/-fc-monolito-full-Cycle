import { Sequelize } from "sequelize-typescript";
import { OrderItemModel } from "../../modules/checkout/repository/order-item.model";
import { OrderModel } from "../../modules/checkout/repository/order.model";
import { ClientModel } from "../../modules/client-adm/repository/client.model";
import { InvoiceItemModel } from "../../modules/invoice/repository/invoice-item.model";
import { InvoiceModel } from "../../modules/invoice/repository/invoice.model";
import TransactionModel from "../../modules/payment/repository/transaction.model";
import { ProductModel as ProductAdmModel } from "../../modules/product-adm/repository/product.model";
import StoreCatalogProductModel from "../../modules/store-catalog/repository/product.model";

export async function setupDatabase(storage = ":memory:"): Promise<Sequelize> {
  const sequelize = new Sequelize({
    dialect: "sqlite",
    storage,
    logging: false,
  });

  sequelize.addModels([
    ProductAdmModel,
    StoreCatalogProductModel,
    ClientModel,
    TransactionModel,
    InvoiceModel,
    InvoiceItemModel,
    OrderModel,
    OrderItemModel,
  ]);

  // product-adm e store-catalog mapeiam a mesma tabela "products".
  // A tabela é criada pelo model do product-adm (que tem todas as colunas);
  // o model do store-catalog só lê um subconjunto delas.
  await ProductAdmModel.sync();
  await sequelize.sync();

  return sequelize;
}
