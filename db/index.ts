import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

type DbClient = NodePgDatabase<typeof schema>;

let cachedDb: DbClient | null = null;

function getConnectionString() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }
  return connectionString;
}

function createDbClient(): DbClient {
  const pool = new Pool({
    connectionString: getConnectionString(),
  });

  return drizzle(pool, { schema });
}

export function getDb(): DbClient {
  if (cachedDb) {
    return cachedDb;
  }

  cachedDb = createDbClient();
  return cachedDb;
}

export const db = new Proxy({} as DbClient, {
  get(_target, prop) {
    const client = getDb() as DbClient & Record<PropertyKey, unknown>;
    return client[prop];
  },
}) as DbClient;
