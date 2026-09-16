import { cookies } from "next/headers";
import { signPayload, verifyPayload } from "@/lib/auth/crypto";
import type { SessionUser } from "@/lib/auth/types";

export const SESSION_COOKIE = "pth_session";
const TTL_SEC = 60 * 60 * 24 * 30;

function cookieSecure() {
  return (process.env.NEXT_PUBLIC_APP_URL || "").startsWith("https");
}

export async function createSession(user: SessionUser) {
  const token = signPayload({ ...user }, TTL_SEC);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: cookieSecure(),
    maxAge: TTL_SEC,
  });
  return token;
}

export async function readSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const data = verifyPayload<SessionUser & { exp: number }>(token);
  if (!data?.email || !data.id) return null;
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    image: data.image,
    provider: data.provider,
    plan: data.plan || "free",
  };
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
