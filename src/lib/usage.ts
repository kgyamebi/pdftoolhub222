import { LIMITS, STORAGE_PREFIX } from "@/lib/config";

const KEY = `${STORAGE_PREFIX}:usage`;
const PREMIUM_KEY = `${STORAGE_PREFIX}:plan`;

type UsageState = { day: string; count: number };

function today() {
  return new Date().toISOString().slice(0, 10);
}

function read(): UsageState {
  if (typeof window === "undefined") return { day: today(), count: 0 };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { day: today(), count: 0 };
    const parsed = JSON.parse(raw) as UsageState;
    if (parsed.day !== today()) return { day: today(), count: 0 };
    return parsed;
  } catch {
    return { day: today(), count: 0 };
  }
}

export function getPlan(): "free" | "premium" {
  if (typeof window === "undefined") return "free";
  return localStorage.getItem(PREMIUM_KEY) === "premium" ? "premium" : "free";
}

export function setPlan(plan: "free" | "premium") {
  localStorage.setItem(PREMIUM_KEY, plan);
}

export function usageSnapshot() {
  const state = read();
  const plan = getPlan();
  const max = plan === "premium" ? LIMITS.maxOpsPerDayPremium : LIMITS.maxOpsPerDayFree;
  return { ...state, plan, max, remaining: Math.max(0, max - state.count) };
}

export function assertCanProcess() {
  const snap = usageSnapshot();
  if (snap.remaining <= 0) {
    const error = new Error("You've used today's free operations.");
    (error as Error & { code: string }).code = "limit";
    throw error;
  }
}

export function recordOperation() {
  const state = read();
  const next = { day: today(), count: state.count + 1 };
  localStorage.setItem(KEY, JSON.stringify(next));
  return usageSnapshot();
}

export function maxBytes() {
  return getPlan() === "premium" ? LIMITS.maxFileBytesPremium : LIMITS.maxFileBytesFree;
}

export function maxFiles() {
  return getPlan() === "premium" ? LIMITS.maxFilesPerBatchPremium : LIMITS.maxFilesPerBatchFree;
}
