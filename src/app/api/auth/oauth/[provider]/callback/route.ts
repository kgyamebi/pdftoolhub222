import { NextResponse } from "next/server";
import { completeSignIn } from "@/lib/auth/complete";
import { exchangeCode, fetchOAuthProfile, readOAuthState, type OAuthProvider } from "@/lib/auth/oauth";
import { SITE_URL } from "@/lib/config";

export const runtime = "nodejs";

function asProvider(value: string): OAuthProvider | null {
  return value === "google" || value === "microsoft" ? value : null;
}

export async function GET(request: Request, context: { params: Promise<{ provider: string }> }) {
  const { provider: raw } = await context.params;
  const provider = asProvider(raw);
  const url = new URL(request.url);
  const err = url.searchParams.get("error");
  if (err) return NextResponse.redirect(`${SITE_URL}/login?error=denied`);
  if (!provider) return NextResponse.redirect(`${SITE_URL}/login?error=unknown_provider`);
  const code = url.searchParams.get("code") || "";
  const state = url.searchParams.get("state") || "";
  const parsed = readOAuthState(state);
  if (!code || !parsed || parsed.provider !== provider) {
    return NextResponse.redirect(`${SITE_URL}/login?error=invalid_state`);
  }
  try {
    const tokens = await exchangeCode(provider, code, parsed.verifier);
    const profile = await fetchOAuthProfile(provider, tokens.access_token);
    await completeSignIn(profile);
    return NextResponse.redirect(`${SITE_URL}/account?signedin=1`);
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(`${SITE_URL}/login?error=oauth_failed`);
  }
}
