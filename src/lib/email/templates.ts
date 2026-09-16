import { APP_NAME, SITE_URL } from "@/lib/config";
import { emailLayout, stripHtml } from "@/lib/email/layout";
import type { EmailKind, EmailMessage, MagicLinkVars, NewSigninVars, QuotaVars, WelcomeVars } from "@/lib/email/types";

function pack(kind: EmailKind, to: string, subject: string, html: string): EmailMessage {
  return { kind, to, subject, html, text: stripHtml(html) };
}

export function welcomeEmail(to: string, vars: WelcomeVars = {}): EmailMessage {
  const name = vars.name?.trim() || "there";
  const html = emailLayout({
    preheader: `Your optional ${APP_NAME} account is ready. Tools still run locally.`,
    heading: `Welcome, ${name}.`,
    bodyHtml: `<p>You can now keep favorites and a higher local limit on this device after checkout. Core PDF tools still work without signing in.</p>
      <p>We store your email and sign-in provider — not the bytes of your documents.</p>`,
    ctaLabel: "Open your account",
    ctaUrl: `${SITE_URL}/account`,
  });
  return pack("welcome", to, `Welcome to ${APP_NAME}`, html);
}

export function magicLinkEmail(to: string, vars: MagicLinkVars): EmailMessage {
  const html = emailLayout({
    preheader: `Your ${APP_NAME} sign-in link expires in ${vars.minutes} minutes.`,
    heading: "Continue with email",
    bodyHtml: `<p>Use this one-time link to sign in${vars.name ? `, ${escapePlain(vars.name)}` : ""}. It expires in ${vars.minutes} minutes and can be used once.</p>
      <p>If you did not ask for this, you can ignore the message. Nobody gets your PDFs in email.</p>`,
    ctaLabel: "Sign in",
    ctaUrl: vars.url,
  });
  return pack("magic-link", to, `Sign in to ${APP_NAME}`, html);
}

export function verifyEmail(to: string, vars: MagicLinkVars): EmailMessage {
  const html = emailLayout({
    preheader: `Confirm this email for ${APP_NAME}.`,
    heading: "Confirm your email",
    bodyHtml: `<p>Confirm that you own this address. The link expires in ${vars.minutes} minutes.</p>`,
    ctaLabel: "Confirm email",
    ctaUrl: vars.url,
  });
  return pack("verify-email", to, `Confirm your ${APP_NAME} email`, html);
}

export function newSigninEmail(to: string, vars: NewSigninVars): EmailMessage {
  const html = emailLayout({
    preheader: `New ${APP_NAME} sign-in with ${vars.provider}.`,
    heading: "New sign-in",
    bodyHtml: `<p>Someone signed in to ${APP_NAME} with <strong>${escapePlain(vars.provider)}</strong> at ${escapePlain(vars.at)}.</p>
      <p>If this was you, no action is needed. If it was not, sign out of other sessions and contact us from the account page.</p>`,
    ctaLabel: "Review account",
    ctaUrl: `${SITE_URL}/account`,
  });
  return pack("new-signin", to, `New ${APP_NAME} sign-in`, html);
}

export function quotaWarningEmail(to: string, vars: QuotaVars): EmailMessage {
  const html = emailLayout({
    preheader: `${vars.remaining} of ${vars.max} free operations left today.`,
    heading: "You are close to today’s free limit",
    bodyHtml: `<p>${vars.remaining} of ${vars.max} local operations remain today. Premium raises the cap when billing is configured — tools never fake a download when you run out.</p>`,
    ctaLabel: "See plans",
    ctaUrl: `${SITE_URL}/pricing`,
  });
  return pack("quota-warning", to, `${APP_NAME}: ${vars.remaining} operations left today`, html);
}

function escapePlain(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
