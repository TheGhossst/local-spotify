import { NextRequest, NextResponse } from "next/server";
import { signSession, SESSION_COOKIE } from "@/app/lib/auth";

const NO_CACHE = { "Cache-Control": "no-store" };

function sessionResponse(token: string) {
  const res = NextResponse.json({ ok: true }, { headers: NO_CACHE });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const password = body?.password ?? "";

  const configuredPassword = process.env.AUTH_PASSWORD;

  if (!configuredPassword) {
    return sessionResponse(await signSession());
  }

  if (password !== configuredPassword) {
    return NextResponse.json(
      { error: "Invalid password" },
      { status: 401, headers: NO_CACHE }
    );
  }

  return sessionResponse(await signSession());
}
