// for preventing multiple instances of pg pool 

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL ?? ""

if (!connectionString && process.env.NODE_ENV === "production") {
  console.warn("DATABASE_URL is not set — database calls will fail at runtime")
}

const globalForDb = globalThis as typeof globalThis & {
  pgPool?: Pool;
};

const pool =
  globalForDb.pgPool ??
  new Pool({
    connectionString,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = pool;
}

export const db = drizzle(pool, { schema });