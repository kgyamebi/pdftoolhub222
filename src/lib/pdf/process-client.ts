"use client";

import { PdfHubError } from "@/lib/pdf/errors";
import { processTool, type ProcessRequest, type ProcessResult } from "@/lib/pdf/processor";

const DOM_TOOLS = new Set([
  "compress-pdf",
  "reduce-pdf-size",
  "optimize-pdf",
  "webp-to-pdf",
  "pdf-to-jpg",
  "pdf-to-png",
  "pdf-to-webp",
  "pdf-to-powerpoint",
  "ocr-pdf",
  "extract-images",
  "extract-text",
  "pdf-to-text",
  "pdf-summarizer",
  "ask-pdf",
  "compare-pdfs",
  "translate-pdf",
]);

type WorkerFile = { name: string; mime: string; buffer: ArrayBuffer };

function canUseWorker(tool: string) {
  return typeof Worker !== "undefined" && !DOM_TOOLS.has(tool);
}

export async function processToolClient(req: ProcessRequest): Promise<ProcessResult> {
  if (!canUseWorker(req.tool)) {
    return processTool(req);
  }
  try {
    return await processInWorker(req);
  } catch (error) {
    if (req.signal?.aborted) throw error;
    return processTool(req);
  }
}

async function processInWorker(req: ProcessRequest): Promise<ProcessResult> {
  const worker = new Worker(new URL("./process.worker.ts", import.meta.url), { type: "module" });
  const files: WorkerFile[] = await Promise.all(
    req.files.map(async (file) => ({
      name: file.name,
      mime: file.type || "application/octet-stream",
      buffer: await file.arrayBuffer(),
    })),
  );
  const extras: WorkerFile[] = await Promise.all(
    (req.extras ?? []).map(async (file) => ({
      name: file.name,
      mime: file.type || "application/octet-stream",
      buffer: await file.arrayBuffer(),
    })),
  );

  return new Promise((resolve, reject) => {
    const onAbort = () => {
      worker.postMessage({ kind: "abort" });
      worker.terminate();
      reject(new PdfHubError("cancelled", "Processing was cancelled.", "Your original file is unchanged."));
    };
    req.signal?.addEventListener("abort", onAbort, { once: true });

    worker.onmessage = (event: MessageEvent) => {
      const data = event.data as
        | { kind: "progress"; stage: string; percent: number }
        | {
            kind: "done";
            result: Omit<ProcessResult, "files"> & { files: WorkerFile[] };
          }
        | { kind: "error"; code: string; message: string; hint: string };
      if (data.kind === "progress") {
        req.onProgress?.(data);
        return;
      }
      req.signal?.removeEventListener("abort", onAbort);
      worker.terminate();
      if (data.kind === "error") {
        reject(new PdfHubError(data.code, data.message, data.hint));
        return;
      }
      resolve({
        ...data.result,
        files: data.result.files.map(
          (file) =>
            ({
              name: file.name,
              mime: file.mime,
              blob: new Blob([file.buffer], { type: file.mime }),
            }) satisfies ProcessResult["files"][number],
        ),
      });
    };
    worker.onerror = (event) => {
      req.signal?.removeEventListener("abort", onAbort);
      worker.terminate();
      reject(event.error ?? new Error(event.message || "Worker failed"));
    };
    worker.postMessage({ kind: "run", tool: req.tool, files, extras, settings: req.settings });
  });
}
