"use client";

import { deleteDB, openDB, type IDBPDatabase } from "idb";
import { LIMITS, STORAGE_PREFIX } from "@/lib/config";

const DB_NAME = `${STORAGE_PREFIX}-workspace`;
const STORE = "documents";

export type WorkspaceDoc = {
  id: string;
  name: string;
  mime: string;
  size: number;
  updatedAt: number;
  sourceTool?: string;
  blob: Blob;
};

let dbPromise: Promise<IDBPDatabase> | null = null;

function db() {
  if (typeof window === "undefined") {
    throw new Error("workspace is browser-only");
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(database) {
        database.createObjectStore(STORE);
      },
    });
  }
  return dbPromise;
}

export async function saveWorkspaceDoc(doc: Omit<WorkspaceDoc, "id" | "updatedAt"> & { id?: string }): Promise<WorkspaceDoc> {
  const record: WorkspaceDoc = {
    ...doc,
    id: doc.id ?? crypto.randomUUID(),
    updatedAt: Date.now(),
  };
  const database = await db();
  await database.put(STORE, record, "current");
  await database.put(STORE, record, record.id);
  pruneExpired().catch(() => undefined);
  return record;
}

export async function getCurrentDoc(): Promise<WorkspaceDoc | undefined> {
  const database = await db();
  const current = (await database.get(STORE, "current")) as WorkspaceDoc | undefined;
  if (!current) return undefined;
  if (Date.now() - current.updatedAt > LIMITS.workspaceTtlMs) {
    await clearWorkspace();
    return undefined;
  }
  return current;
}

export async function listRecentDocs(): Promise<WorkspaceDoc[]> {
  const database = await db();
  const keys = await database.getAllKeys(STORE);
  const docs: WorkspaceDoc[] = [];
  for (const key of keys) {
    if (key === "current") continue;
    const value = (await database.get(STORE, key)) as WorkspaceDoc | undefined;
    if (value && Date.now() - value.updatedAt <= LIMITS.workspaceTtlMs) docs.push(value);
  }
  return docs.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 8);
}

export async function clearWorkspace() {
  const database = await db();
  await database.clear(STORE);
}

export async function deleteWorkspaceDoc(id: string) {
  const database = await db();
  await database.delete(STORE, id);
  const current = (await database.get(STORE, "current")) as WorkspaceDoc | undefined;
  if (current?.id === id) await database.delete(STORE, "current");
}

async function pruneExpired() {
  const database = await db();
  const keys = await database.getAllKeys(STORE);
  for (const key of keys) {
    const value = (await database.get(STORE, key)) as WorkspaceDoc | undefined;
    if (value && Date.now() - value.updatedAt > LIMITS.workspaceTtlMs) await database.delete(STORE, key);
  }
}

export async function destroyWorkspaceDb() {
  dbPromise = null;
  await deleteDB(DB_NAME);
}

export function blobToFile(doc: WorkspaceDoc): File {
  return new File([doc.blob], doc.name, { type: doc.mime });
}
