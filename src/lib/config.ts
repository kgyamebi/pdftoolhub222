export const APP_NAME = "PDF Tools Hub";
export const APP_TAGLINE = "Everything you need to work with PDFs.";
export const APP_DESCRIPTION =
  "Convert, compress, edit, organize, protect and understand your documents — quickly and securely. Processing happens in your browser whenever possible, so files stay on your device.";

export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://127.0.0.1:43127";

export const LIMITS = {
  maxFileBytesFree: 25 * 1024 * 1024,
  maxFileBytesPremium: 200 * 1024 * 1024,
  maxFilesPerBatchFree: 8,
  maxFilesPerBatchPremium: 50,
  maxPagesFree: 80,
  maxPagesPremium: 500,
  maxOpsPerDayFree: 10,
  maxOpsPerDayPremium: 500,
  jobTimeoutMs: 120_000,
  workspaceTtlMs: 2 * 60 * 60 * 1000,
} as const;

export const PRICING = {
  free: {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    blurb: "Core tools, in-browser processing, no account required.",
    features: [
      "All core PDF tools",
      `${LIMITS.maxOpsPerDayFree} operations per day`,
      `Files up to ${LIMITS.maxFileBytesFree / 1024 / 1024} MB`,
      "Up to 8 files per batch",
      "Session workspace",
      "Automatic local file expiry",
    ],
  },
  premium: {
    id: "premium",
    name: "Premium",
    priceMonthly: 9,
    priceYearly: 79,
    blurb: "Higher limits, batch ZIP downloads, and AI tools when configured.",
    features: [
      `${LIMITS.maxOpsPerDayPremium} operations per day`,
      `Files up to ${LIMITS.maxFileBytesPremium / 1024 / 1024} MB`,
      "Batch processing and ZIP download",
      "Saved workflows and favorites",
      "AI summarization when an API key is set",
      "No advertisement slots",
    ],
  },
  business: {
    id: "business",
    name: "Business",
    priceMonthly: 29,
    priceYearly: 249,
    blurb: "Team workflows, admin controls, and API access as you grow.",
    features: [
      "Custom usage limits",
      "Shared workflow templates",
      "Admin analytics",
      "API keys (architecture ready)",
      "Priority processing path",
      "Regional payment providers later",
    ],
  },
} as const;

export const FEATURE_FLAGS = {
  adsEnabled: false,
  aiRemoteEnabled: Boolean(process.env.AI_API_KEY),
  paymentsEnabled: Boolean(process.env.STRIPE_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY),
  requireAuthForPremium: true,
} as const;

export const STORAGE_PREFIX = "pth";
