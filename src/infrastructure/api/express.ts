import express, { Express } from "express";
import { checkoutRoute } from "./routes/checkout.route";
import { clientRoute } from "./routes/client.route";
import { invoiceRoute } from "./routes/invoice.route";
import { productRoute } from "./routes/product.route";

export const app: Express = express();
app.use(express.json());
app.use("/products", productRoute);
app.use("/clients", clientRoute);
app.use("/checkout", checkoutRoute);
app.use("/invoice", invoiceRoute);
