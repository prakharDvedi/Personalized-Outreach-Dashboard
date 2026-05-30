// auth file - uses better auth

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

const connectionString = process.env.DATABASE_URL;
const betterAuthUrl = process.env.BETTER_AUTH_URL;
const betterAuthSecret = process.env.BETTER_AUTH_SECRET;

if (!connectionString) {
  console.warn("DATABASE_URL is not set")
}

if (!betterAuthSecret) {
  console.warn("BETTER_AUTH_SECRET is not set")
}

const pool = new Pool({ connectionString });
const db = drizzle(pool, { schema });

export const auth = betterAuth({
  secret: betterAuthSecret,
  baseURL: betterAuthUrl,
  trustedOrigins: betterAuthUrl ? [betterAuthUrl] : [],
  plugins: [nextCookies()],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
  },
});
