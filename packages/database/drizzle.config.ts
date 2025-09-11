import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config();

export default defineConfig({
  dialect: "postgresql",
  schema: "./schema",
  dbCredentials: {
    url: process.env.DATABASE_URL!
  }
});
