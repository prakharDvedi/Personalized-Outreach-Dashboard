import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";

type AuthClient = ReturnType<typeof betterAuth>;

let cachedAuth: AuthClient | null = null;

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function createAuthClient(): AuthClient {
  const baseURL = getRequiredEnv("BETTER_AUTH_URL");
  const secret = getRequiredEnv("BETTER_AUTH_SECRET");

  return betterAuth({
    secret,
    baseURL,
    trustedOrigins: [baseURL],
    plugins: [nextCookies()],
    database: drizzleAdapter(db, {
      provider: "pg",
      schema,
      usePlural: true,
    }),
    emailAndPassword: {
      enabled: true,
    },
  }) as unknown as AuthClient;
}

export function getAuth(): AuthClient {
  if (!cachedAuth) {
    cachedAuth = createAuthClient();
  }
  return cachedAuth;
}

export const auth = new Proxy({} as AuthClient, {
  get(_target, prop) {
    const client = getAuth() as AuthClient & Record<PropertyKey, unknown>;
    return client[prop];
  },
}) as AuthClient;
