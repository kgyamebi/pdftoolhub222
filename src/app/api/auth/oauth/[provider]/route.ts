import { NextResponse } from "next/server";
import { beginOAuth, type OAuthProvider } from "@/lib/auth/oauth";
import { SITE_URL } from "@/lib/config";

export const runtime = "nodejs";

function asProvider(value: string): OAuthProvider | null {
  return value === "google" || value === "microsoft" ? value : null;
}

export async function GET(_request: Request, context: { params: Promise<{ provider: string }> }) {
  const { provider: raw } = await context.params;
  const provider = asProvider(raw);
  if (!provider) return NextResponse.redirect(`${SITE_URL}/login?error=unknown_provider`);
  const started = beginOAuth(provider);
  if (!started) {
    return NextResponse.redirect(`${SITE_URL}/login?error=${provider}_not_configured`);
  }
  return NextResponse.redirect(started.url);
}
