import { BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { OrderModel } from "./order.model";

@Table({
  tableName: "order_items",
  timestamps: false,
})
export class OrderItemModel extends Model {
  // Chave composta: o mesmo produto pode estar em vários pedidos
  @PrimaryKey
  @Column({ allowNull: false, field: "product_id" })
  productId: string;

  @PrimaryKey
  @ForeignKey(() => OrderModel)
  @Column({ allowNull: false, field: "order_id" })
  orderId: string;

  @BelongsTo(() => OrderModel)
  order: OrderModel;

  @Column({ allowNull: false })
  name: string;

  @Column({ allowNull: false })
  description: string;

  @Column({ allowNull: false, field: "sales_price" })
  salesPrice: number;
}
