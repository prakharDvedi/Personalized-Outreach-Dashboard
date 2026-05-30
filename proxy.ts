// Middleware to protect routes and redirect based on authentication status

import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const APP_PREFIX = "/dashboard";
const AUTH_ROUTES = new Set(["/login", "/signup"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  const isAuthRoute = AUTH_ROUTES.has(pathname);
  const isProtectedRoute = pathname.startsWith(APP_PREFIX);

  if (!sessionCookie && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (sessionCookie && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/offerings/:path*", "/prompt/:path*", "/prospects/:path*", "/login", "/signup"],
};
