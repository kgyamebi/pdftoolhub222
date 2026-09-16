import assert from "node:assert/strict";
import { test } from "node:test";
import { createMagicToken, rateLimitEmail, verifyMagicToken } from "../src/lib/auth/magic-link.ts";
import { beginOAuth, oauthCallbackUrl } from "../src/lib/auth/oauth.ts";
import { signPayload, verifyPayload } from "../src/lib/auth/crypto.ts";
import { magicLinkEmail, quotaWarningEmail, welcomeEmail } from "../src/lib/email/templates.ts";

test("signed session payload round-trips", () => {
  const token = signPayload({ email: "a@b.edu", provider: "google" }, 60);
  const data = verifyPayload<{ email: string; provider: string }>(token);
  assert.equal(data?.email, "a@b.edu");
  assert.equal(data?.provider, "google");
});

test("tampered session payload is rejected", () => {
  const token = signPayload({ email: "a@b.edu" }, 60);
  assert.equal(verifyPayload(token.slice(0, -2) + "zz"), null);
});

test("magic link tokens verify the same email", () => {
  const token = createMagicToken("Student@University.EDU");
  assert.equal(verifyMagicToken(token), "student@university.edu");
});

test("magic link rate limit trips after several sends", () => {
  const email = `limit-${Date.now()}@school.edu`;
  for (let i = 0; i < 5; i++) assert.equal(rateLimitEmail(email), true);
  assert.equal(rateLimitEmail(email), false);
});

test("Google authorize URL uses PKCE when configured", () => {
  process.env.GOOGLE_CLIENT_ID = "gid.apps.googleusercontent.com";
  process.env.GOOGLE_CLIENT_SECRET = "gsec";
  const started = beginOAuth("google");
  assert.ok(started);
  assert.ok(started.url.includes("accounts.google.com"));
  assert.ok(started.url.includes("code_challenge"));
  assert.ok(started.url.includes("openid"));
  assert.equal(oauthCallbackUrl("google").endsWith("/api/auth/oauth/google/callback"), true);
});

test("Microsoft authorize URL uses the common tenant for school accounts", () => {
  delete process.env.MICROSOFT_TENANT_ID;
  delete process.env.AZURE_AD_TENANT_ID;
  process.env.MICROSOFT_CLIENT_ID = "mid";
  process.env.MICROSOFT_CLIENT_SECRET = "msec";
  const started = beginOAuth("microsoft");
  assert.ok(started);
  assert.ok(started.url.includes("login.microsoftonline.com/common/"));
  assert.ok(started.url.includes("User.Read"));
});

test("welcome and magic-link emails never include PDF bytes", () => {
  const welcome = welcomeEmail("a@b.edu", { name: "Ada" });
  const magic = magicLinkEmail("a@b.edu", { url: "https://example.test/sign-in", minutes: 20 });
  const quota = quotaWarningEmail("a@b.edu", { remaining: 2, max: 10 });
  for (const msg of [welcome, magic, quota]) {
    assert.equal(msg.html.includes("application/pdf"), false);
    assert.ok(msg.html.includes("Sign in") || msg.html.includes("Open your account") || msg.html.includes("See plans"));
    assert.ok(msg.text.length > 20);
  }
  assert.ok(magic.html.includes("https://example.test/sign-in"));
});
