import { SITE_URL } from "@/lib/config";
import { pkceChallenge, pkceVerifier, signPayload, verifyPayload } from "@/lib/auth/crypto";
import type { AuthProviderId } from "@/lib/auth/types";

export type OAuthProvider = "google" | "microsoft";

type OAuthConfig = {
  clientId: string;
  clientSecret: string;
  authUrl: string;
  tokenUrl: string;
  scope: string;
};

export function oauthConfigured(provider: OAuthProvider) {
  return Boolean(oauthConfig(provider)?.clientId && oauthConfig(provider)?.clientSecret);
}

export function oauthConfig(provider: OAuthProvider): OAuthConfig | null {
  if (provider === "google") {
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID || "";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET || "";
    if (!clientId || !clientSecret) return null;
    return {
      clientId,
      clientSecret,
      authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      scope: "openid email profile",
    };
  }
  const clientId = process.env.MICROSOFT_CLIENT_ID || process.env.AUTH_MICROSOFT_ID || process.env.AZURE_AD_CLIENT_ID || "";
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET || process.env.AUTH_MICROSOFT_SECRET || process.env.AZURE_AD_CLIENT_SECRET || "";
  const tenant = process.env.MICROSOFT_TENANT_ID || process.env.AZURE_AD_TENANT_ID || "common";
  if (!clientId || !clientSecret) return null;
  return {
    clientId,
    clientSecret,
    authUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`,
    tokenUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
    scope: "openid email profile User.Read",
  };
}

export function oauthCallbackUrl(provider: OAuthProvider) {
  return `${SITE_URL}/api/auth/oauth/${provider}/callback`;
}

export function beginOAuth(provider: OAuthProvider) {
  const config = oauthConfig(provider);
  if (!config) return null;
  const verifier = pkceVerifier();
  const state = signPayload({ provider, verifier, nonce: pkceVerifier() }, 600);
  const url = new URL(config.authUrl);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", oauthCallbackUrl(provider));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", config.scope);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", pkceChallenge(verifier));
  url.searchParams.set("code_challenge_method", "S256");
  if (provider === "google") {
    url.searchParams.set("prompt", "select_account");
    url.searchParams.set("access_type", "online");
  } else {
    url.searchParams.set("response_mode", "query");
  }
  return { url: url.toString(), state };
}

export function readOAuthState(state: string) {
  return verifyPayload<{ provider: OAuthProvider; verifier: string }>(state);
}

export async function exchangeCode(provider: OAuthProvider, code: string, verifier: string) {
  const config = oauthConfig(provider);
  if (!config) throw new Error("OAuth is not configured");
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: oauthCallbackUrl(provider),
    code_verifier: verifier,
  });
  const res = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    throw new Error(`Token exchange failed (${res.status})`);
  }
  return (await res.json()) as { access_token: string; id_token?: string };
}

export async function fetchOAuthProfile(provider: OAuthProvider, accessToken: string) {
  if (provider === "google") {
    const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error("Google profile failed");
    const data = (await res.json()) as { id?: string; email?: string; name?: string; picture?: string };
    if (!data.email) throw new Error("Google did not return an email");
    return { email: data.email, name: data.name, image: data.picture, provider: "google" as AuthProviderId };
  }
  const res = await fetch("https://graph.microsoft.com/v1.0/me?$select=displayName,mail,userPrincipalName,id", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Microsoft profile failed");
  const data = (await res.json()) as { mail?: string; userPrincipalName?: string; displayName?: string };
  const email = data.mail || data.userPrincipalName;
  if (!email) throw new Error("Microsoft did not return an email");
  return { email, name: data.displayName, image: undefined, provider: "microsoft" as AuthProviderId };
}
