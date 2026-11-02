import dotenv from "dotenv";
import { setupDatabase } from "../db/sequelize";
import { app } from "./express";

dotenv.config();

const port = Number(process.env.PORT) || 3000;
const storage = process.env.DB_STORAGE || ":memory:";

setupDatabase(storage).then(() => {
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
});
