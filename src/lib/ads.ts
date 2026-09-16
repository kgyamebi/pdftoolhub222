export type AdSlotId = "header-banner" | "tool-sidebar" | "after-result";

export function shouldShowAds(plan: "free" | "premium") {
  return plan === "free" && process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
}

export const AD_COPY: Record<AdSlotId, { label: string; note: string }> = {
  "header-banner": {
    label: "Announcement",
    note: "Ads never replace Download. Premium hides this slot.",
  },
  "tool-sidebar": {
    label: "Sponsored",
    note: "Kept away from upload and download controls.",
  },
  "after-result": {
    label: "Related",
    note: "Shown after a successful download, never as a fake button.",
  },
};
