// Edge-safe session helpers (used by middleware and server code)
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "tg_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function key() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error("AUTH_SECRET is missing or too short (set it in .env)");
  return new TextEncoder().encode(s);
}

export interface SessionPayload {
  uid: number;
  email: string;
}

export async function signSession(p: SessionPayload) {
  return new SignJWT({ ...p })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key());
}

export async function verifySession(token?: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    if (typeof payload.uid !== "number" || typeof payload.email !== "string") return null;
    return { uid: payload.uid, email: payload.email };
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE = MAX_AGE;
