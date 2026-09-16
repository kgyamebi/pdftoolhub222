import { getEmailProvider } from "@/lib/email/provider";
import { magicLinkEmail, newSigninEmail, quotaWarningEmail, verifyEmail, welcomeEmail } from "@/lib/email/templates";
import type { EmailKind, EmailMessage, MagicLinkVars, NewSigninVars, QuotaVars, WelcomeVars } from "@/lib/email/types";

export async function sendEmail(message: EmailMessage) {
  return getEmailProvider().send(message);
}

export async function sendWelcome(to: string, vars?: WelcomeVars) {
  return sendEmail(welcomeEmail(to, vars));
}

export async function sendMagicLink(to: string, vars: MagicLinkVars) {
  return sendEmail(magicLinkEmail(to, vars));
}

export async function sendVerifyEmail(to: string, vars: MagicLinkVars) {
  return sendEmail(verifyEmail(to, vars));
}

export async function sendNewSignin(to: string, vars: NewSigninVars) {
  return sendEmail(newSigninEmail(to, vars));
}

export async function sendQuotaWarning(to: string, vars: QuotaVars) {
  return sendEmail(quotaWarningEmail(to, vars));
}

export const EMAIL_KINDS: EmailKind[] = ["welcome", "magic-link", "verify-email", "new-signin", "quota-warning"];
