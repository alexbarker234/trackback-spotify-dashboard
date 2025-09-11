import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/schema";

dotenv.config();

export const db = drizzle(
  new Pool({
    connectionString: process.env.DATABASE_URL
  }),
  { schema }
);
