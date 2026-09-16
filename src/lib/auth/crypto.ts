import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export function authSecret() {
  return process.env.AUTH_SECRET || "dev-only-replace-me";
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function safeEqual(a: string, b: string) {
  const left = createHash("sha256").update(a).digest();
  const right = createHash("sha256").update(b).digest();
  return timingSafeEqual(left, right);
}

export type SignedPayload = Record<string, unknown> & { exp: number };

export function signPayload(data: Record<string, unknown>, ttlSec: number) {
  const payload: SignedPayload = { ...data, exp: Math.floor(Date.now() / 1000) + ttlSec };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", authSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyPayload<T extends Record<string, unknown>>(token: string): T | null {
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", authSecret()).update(body).digest("base64url");
  if (!safeEqual(sig, expected)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T & { exp?: number };
    if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function pkceVerifier() {
  return randomToken(32);
}

export function pkceChallenge(verifier: string) {
  return createHash("sha256").update(verifier).digest("base64url");
}
