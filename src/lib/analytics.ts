import { STORAGE_PREFIX } from "@/lib/config";

export type AnalyticsEvent =
  | "tool_viewed"
  | "upload_started"
  | "upload_completed"
  | "processing_started"
  | "processing_completed"
  | "download_completed"
  | "workflow_started"
  | "workflow_completed"
  | "signup"
  | "subscription_started"
  | "search"
  | "error";

type Payload = {
  name: AnalyticsEvent;
  tool?: string;
  ok?: boolean;
  extra?: string;
};

const KEY = `${STORAGE_PREFIX}:events`;

export function track(payload: Payload) {
  if (typeof window === "undefined") return;
  const event = {
    ...payload,
    at: Date.now(),
  };
  try {
    const prev = JSON.parse(localStorage.getItem(KEY) || "[]") as unknown[];
    const next = [...prev, event].slice(-200);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
  void fetch("/api/v1/analytics", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: payload.name, tool: payload.tool }),
  }).catch(() => undefined);
}

export function readEvents(): Payload[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as Payload[];
  } catch {
    return [];
  }
}

export function recentTools(limit = 6): string[] {
  const slugs: string[] = [];
  for (const event of readEvents().reverse()) {
    if (event.name === "tool_viewed" && event.tool && !slugs.includes(event.tool)) slugs.push(event.tool);
    if (slugs.length >= limit) break;
  }
  return slugs;
}

export function favoriteTools(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}:favorites`) || "[]") as string[];
  } catch {
    return [];
  }
}

export function toggleFavorite(slug: string) {
  const current = favoriteTools();
  const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
  localStorage.setItem(`${STORAGE_PREFIX}:favorites`, JSON.stringify(next));
  return next;
}
