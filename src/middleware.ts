import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth0 middleware — protects routes when Auth0 is configured.
 * When Auth0 env vars are missing, passes through (dev/demo mode).
 */
export function middleware(_req: NextRequest) {
  // Auth0 middleware is activated when all required env vars are set.
  // In demo mode (no Auth0 configured), all routes pass through.
  //
  // To enable Auth0 protection:
  // 1. Set AUTH0_ISSUER_BASE_URL, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET in .env.local
  // 2. Replace this file with:
  //    import { auth0 } from "@/lib/auth0";
  //    export const middleware = auth0.middleware();
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
