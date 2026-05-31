import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function createAuthClient() {
  const fallbackBaseURL = getRequiredEnv("BETTER_AUTH_URL");
  const secret = getRequiredEnv("BETTER_AUTH_SECRET");

  return betterAuth({
    secret,
    baseURL: {
      allowedHosts: ["localhost:3000", "127.0.0.1:3000", "*.vercel.app"],
      fallback: fallbackBaseURL,
      protocol: process.env.NODE_ENV === "development" ? "http" : "https",
    },
    onAPIError: {
      throw: true,
      onError: (error) => {
        console.error("[better-auth]", error);
      },
    },
    plugins: [nextCookies()],
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: { ...schema, user: schema.appUsers, users: schema.appUsers },
      usePlural: true,
    }),
    emailAndPassword: {
      enabled: true,
    },
  });
}

type AuthClient = ReturnType<typeof createAuthClient>;

let cachedAuth: AuthClient | undefined;

export function getAuthClient(): AuthClient {
  if (!cachedAuth) {
    cachedAuth = createAuthClient();
  }

  return cachedAuth;
}

export const auth = new Proxy({} as AuthClient, {
  get(_target, prop) {
    const client = getAuthClient() as Record<PropertyKey, unknown>;
    const value = client[prop];

    if (typeof value === "function") {
      return value.bind(client);
    }

    return value;
  },
}) as AuthClient;
