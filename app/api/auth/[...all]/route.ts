// Handles all authentication routes

export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

const { GET: authGET, POST: authPOST } = toNextJsHandler(auth);

function handleAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : "Authentication failed";
  console.error("[auth-route]", message, error);
  return NextResponse.json({ error: { message } }, { status: 500 });
}

export async function GET(request: Request) {
  try {
    return await authGET(request);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(request: Request) {
  try {
    return await authPOST(request);
  } catch (error) {
    return handleAuthError(error);
  }
}
