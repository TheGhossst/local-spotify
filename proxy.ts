import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/app/lib/auth";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // If no AUTH_PASSWORD is configured, auth is disabled — pass through
  if (!process.env.AUTH_PASSWORD) {
    return NextResponse.next();
  }

  // Allow login page and auth API routes unconditionally
  if (pathname === "/login" || pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    const payload = await verifySession(token);
    if (payload) return NextResponse.next();
  }

  // Redirect unauthenticated requests to /login
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
