import { SITE_URL } from "@/lib/config";
import { signPayload, verifyPayload } from "@/lib/auth/crypto";

const MAGIC_TTL = 20 * 60;

export function createMagicToken(email: string) {
  return signPayload({ email: email.trim().toLowerCase(), purpose: "magic" }, MAGIC_TTL);
}

export function verifyMagicToken(token: string) {
  const data = verifyPayload<{ email?: string; purpose?: string }>(token);
  if (!data?.email || data.purpose !== "magic") return null;
  return data.email;
}

export function magicLinkUrl(token: string) {
  return `${SITE_URL}/api/auth/email/verify?token=${encodeURIComponent(token)}`;
}

export const MAGIC_MINUTES = 20;

const buckets = new Map<string, number[]>();

export function rateLimitEmail(email: string, max = 5, windowMs = 60 * 60 * 1000) {
  const key = email.trim().toLowerCase();
  const now = Date.now();
  const recent = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (recent.length >= max) return false;
  recent.push(now);
  buckets.set(key, recent);
  return true;
}
