export type EmailKind =
  | "welcome"
  | "magic-link"
  | "verify-email"
  | "new-signin"
  | "quota-warning";

export type EmailMessage = {
  kind: EmailKind;
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type EmailProviderId = "resend" | "console";

export interface EmailProvider {
  id: EmailProviderId;
  send(message: EmailMessage): Promise<{ id: string }>;
}

export type WelcomeVars = { name?: string };
export type MagicLinkVars = { name?: string; url: string; minutes: number };
export type NewSigninVars = { name?: string; provider: string; at: string };
export type QuotaVars = { name?: string; remaining: number; max: number };
