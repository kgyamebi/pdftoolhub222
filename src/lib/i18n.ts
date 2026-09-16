export const en = {
  uploadCta: "Upload a PDF",
  explore: "Explore all tools",
  processingLocal: "Processing on your device",
  ready: "Your file is ready.",
  tryAgain: "Try again",
  chooseAnother: "Choose another file",
  download: "Download",
  continueWorkspace: "Keep this file in the workspace",
};

export type Locale = "en";

export function t(key: keyof typeof en, locale: Locale = "en") {
  if (locale === "en") return en[key];
  return en[key];
}
