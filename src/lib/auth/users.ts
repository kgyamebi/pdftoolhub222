import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { randomToken } from "@/lib/auth/crypto";
import type { AuthProviderId, AuthUser } from "@/lib/auth/types";

const FILE = join(process.cwd(), "data", "users.json");
const memory: Store = { users: [] };

type Store = { users: AuthUser[] };

function readStore(): Store {
  try {
    const parsed = JSON.parse(readFileSync(FILE, "utf8")) as Store;
    memory.users = parsed.users;
    return parsed;
  } catch {
    return memory;
  }
}

function writeStore(store: Store) {
  memory.users = store.users;
  try {
    mkdirSync(dirname(FILE), { recursive: true });
    writeFileSync(FILE, JSON.stringify(store, null, 2));
  } catch {
    /* serverless / read-only — keep the in-memory copy for this instance */
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function upsertUser(input: {
  email: string;
  name?: string;
  image?: string;
  provider: AuthProviderId;
}): { user: AuthUser; created: boolean } {
  const email = normalizeEmail(input.email);
  const store = readStore();
  const now = new Date().toISOString();
  const existing = store.users.find((u) => u.email === email);
  if (!existing) {
    const user: AuthUser = {
      id: randomToken(12),
      email,
      name: input.name,
      image: input.image,
      providers: [input.provider],
      plan: "free",
      createdAt: now,
      lastLoginAt: now,
    };
    store.users.push(user);
    writeStore(store);
    return { user, created: true };
  }
  if (!existing.providers.includes(input.provider)) existing.providers.push(input.provider);
  if (input.name) existing.name = input.name;
  if (input.image) existing.image = input.image;
  existing.lastLoginAt = now;
  writeStore(store);
  return { user: existing, created: false };
}

export function markWelcomeSent(email: string) {
  const store = readStore();
  const user = store.users.find((u) => u.email === normalizeEmail(email));
  if (!user) return;
  user.welcomeSentAt = new Date().toISOString();
  writeStore(store);
}

export function getUserByEmail(email: string) {
  return readStore().users.find((u) => u.email === normalizeEmail(email));
}
