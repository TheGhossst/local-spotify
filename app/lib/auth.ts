import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const SESSION_COOKIE = "ls_session";
const EXPIRY = "7d";

function getSecret(): Uint8Array {
  const raw = process.env.AUTH_SECRET ?? "local-spotify-default-secret-change-me";
  return new TextEncoder().encode(raw);
}

export async function signSession(): Promise<string> {
  return new SignJWT({ sub: "user" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}

export { SESSION_COOKIE };
