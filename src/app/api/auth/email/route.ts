import { NextResponse } from "next/server";
import { sendMagicLink } from "@/lib/email";
import { createMagicToken, MAGIC_MINUTES, magicLinkUrl, rateLimitEmail } from "@/lib/auth/magic-link";

export const runtime = "nodejs";

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string } | null;
  const email = body?.email?.trim().toLowerCase() || "";
  if (!validEmail(email)) {
    return NextResponse.json({ ok: false, message: "Enter a valid email address." }, { status: 400 });
  }
  if (!rateLimitEmail(email)) {
    return NextResponse.json({ ok: false, message: "Too many sign-in emails. Try again in an hour." }, { status: 429 });
  }
  const token = createMagicToken(email);
  const url = magicLinkUrl(token);
  try {
    await sendMagicLink(email, { url, minutes: MAGIC_MINUTES });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "We could not send the email. Try Google or Microsoft, or check EMAIL_API_KEY." }, { status: 502 });
  }
  const preview = process.env.NODE_ENV !== "production" || process.env.EMAIL_PROVIDER === "console" || !process.env.RESEND_API_KEY;
  return NextResponse.json({
    ok: true,
    message: "Check your email for a sign-in link.",
    previewUrl: preview ? url : undefined,
  });
}
