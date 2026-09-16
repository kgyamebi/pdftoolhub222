import { STORAGE_PREFIX } from "@/lib/config";
import { readEvents } from "@/lib/analytics";
import { usageSnapshot } from "@/lib/usage";

const VISIT_KEY = `${STORAGE_PREFIX}:visits`;

export function recordVisit() {
  if (typeof window === "undefined") return;
  const today = new Date().toISOString().slice(0, 10);
  try {
    const raw = JSON.parse(localStorage.getItem(VISIT_KEY) || "[]") as string[];
    const days = raw.includes(today) ? raw : [...raw, today].slice(-60);
    localStorage.setItem(VISIT_KEY, JSON.stringify(days));
  } catch {
    /* ignore */
  }
}

export function visitStreak(): number {
  if (typeof window === "undefined") return 0;
  try {
    const days = (JSON.parse(localStorage.getItem(VISIT_KEY) || "[]") as string[]).sort();
    if (!days.length) return 0;
    let streak = 1;
    for (let i = days.length - 1; i > 0; i--) {
      const a = new Date(`${days[i]}T00:00:00Z`).getTime();
      const b = new Date(`${days[i - 1]}T00:00:00Z`).getTime();
      if (a - b === 86400000) streak += 1;
      else break;
    }
    return streak;
  } catch {
    return 0;
  }
}

export function todayActivity() {
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const events = readEvents().filter((e) => (e as { at?: number }).at && (e as { at: number }).at >= dayStart.getTime());
  const completed = events.filter((e) => e.name === "processing_completed").length;
  const usage = usageSnapshot();
  return { completed, remaining: usage.remaining, max: usage.max };
}
