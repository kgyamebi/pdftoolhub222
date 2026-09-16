/**
 * Relational models for when a database is attached.
 * Binary PDFs are never stored in these tables — only object-storage keys.
 */

export type User = {
  id: string;
  email: string;
  name?: string;
  plan: "free" | "premium" | "business";
  createdAt: string;
};

export type Session = {
  id: string;
  userId?: string;
  expiresAt: string;
};

export type DocumentRecord = {
  id: string;
  userId?: string;
  storageKey: string;
  originalName: string;
  mime: string;
  bytes: number;
  expiresAt: string;
};

export type ProcessingJob = {
  id: string;
  tool: string;
  status: "queued" | "running" | "succeeded" | "failed" | "cancelled";
  documentId?: string;
  errorCode?: string;
  createdAt: string;
  finishedAt?: string;
};

export type ToolUsage = {
  id: string;
  tool: string;
  userId?: string;
  day: string;
  count: number;
};

export type WorkflowRecord = {
  id: string;
  userId: string;
  name: string;
  steps: string[];
};

export type Favorite = { userId: string; tool: string };
export type Subscription = { id: string; userId: string; plan: string; status: string; provider: string };
export type Payment = { id: string; userId: string; amount: number; currency: string; status: string; provider: string };
export type CreditLedger = { id: string; userId: string; delta: number; reason: string };
export type UsageLimit = { plan: string; maxOpsPerDay: number; maxFileBytes: number; maxBatch: number };
export type ApiKey = { id: string; userId: string; hashedKey: string; name: string };
export type AuditLog = { id: string; actor: string; action: string; at: string };
export type Announcement = { id: string; title: string; body: string; published: boolean };
