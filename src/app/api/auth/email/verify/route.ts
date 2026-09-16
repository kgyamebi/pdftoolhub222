import { NextResponse } from "next/server";
import { completeSignIn } from "@/lib/auth/complete";
import { verifyMagicToken } from "@/lib/auth/magic-link";
import { SITE_URL } from "@/lib/config";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  const email = verifyMagicToken(token);
  if (!email) {
    return NextResponse.redirect(`${SITE_URL}/login?error=expired`);
  }
  await completeSignIn({ email, provider: "email" });
  return NextResponse.redirect(`${SITE_URL}/account?signedin=1`);
}
