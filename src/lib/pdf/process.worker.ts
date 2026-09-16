import { PdfHubError } from "./errors";
import { processTool } from "./processor";

self.onmessage = async (event: MessageEvent) => {
  const abort = new AbortController();
  const data = event.data as
    | { kind: "abort" }
    | {
        kind: "run";
        tool: string;
        settings: Record<string, string | number | boolean>;
        files: { name: string; mime: string; buffer: ArrayBuffer }[];
        extras: { name: string; mime: string; buffer: ArrayBuffer }[];
      };
  if (data.kind === "abort") {
    abort.abort();
    return;
  }
  try {
    const files = data.files.map((file) => new File([file.buffer], file.name, { type: file.mime }));
    const extras = (data.extras ?? []).map((file) => new File([file.buffer], file.name, { type: file.mime }));
    const result = await processTool({
      tool: data.tool,
      files,
      extras,
      settings: data.settings,
      signal: abort.signal,
      onProgress: (state) => postMessage({ kind: "progress", ...state }),
    });
    const outFiles = await Promise.all(
      result.files.map(async (file) => ({
        name: file.name,
        mime: file.mime,
        buffer: await file.blob.arrayBuffer(),
      })),
    );
    postMessage({
      kind: "done",
      result: { ...result, files: outFiles },
    });
  } catch (error) {
    const mapped =
      error instanceof PdfHubError
        ? { code: error.code, message: error.message, hint: error.hint }
        : { code: "processing_failed", message: "We couldn't process this file.", hint: "Try another file, or retry." };
    postMessage({ kind: "error", ...mapped });
  }
};
