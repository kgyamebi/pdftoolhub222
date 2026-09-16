import { LIMITS } from "@/lib/config";

export const MIME_BY_EXT: Record<string, string[]> = {
  pdf: ["application/pdf"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  png: ["image/png"],
  webp: ["image/webp"],
  gif: ["image/gif"],
  doc: ["application/msword"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  xls: ["application/vnd.ms-excel"],
  xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  ppt: ["application/vnd.ms-powerpoint"],
  pptx: ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  txt: ["text/plain"],
};

export type AcceptKind =
  | "pdf"
  | "image"
  | "jpg"
  | "png"
  | "webp"
  | "word"
  | "excel"
  | "ppt"
  | "any-doc";

const ACCEPT_EXTS: Record<AcceptKind, string[]> = {
  pdf: ["pdf"],
  image: ["jpg", "jpeg", "png", "webp"],
  jpg: ["jpg", "jpeg"],
  png: ["png"],
  webp: ["webp"],
  word: ["doc", "docx"],
  excel: ["xls", "xlsx"],
  ppt: ["ppt", "pptx"],
  "any-doc": ["pdf", "jpg", "jpeg", "png", "webp", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt"],
};

export function extOf(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

export function acceptAttribute(kinds: AcceptKind[]): string {
  const exts = new Set(kinds.flatMap((k) => ACCEPT_EXTS[k]));
  return [...exts].map((e) => `.${e}`).join(",");
}

export function isAllowedFile(file: File, kinds: AcceptKind[]): boolean {
  const ext = extOf(file.name);
  const allowed = new Set(kinds.flatMap((k) => ACCEPT_EXTS[k]));
  if (!allowed.has(ext)) return false;
  if (file.size <= 0) return false;
  return true;
}

export function validateFiles(
  files: File[],
  kinds: AcceptKind[],
  options: { maxBytes: number; maxFiles: number; minFiles?: number },
): { ok: true } | { ok: false; message: string; hint: string } {
  const min = options.minFiles ?? 1;
  if (files.length < min) {
    return {
      ok: false,
      message: min > 1 ? `This tool needs at least ${min} files.` : "Add a file to continue.",
      hint: "Use the picker or drop files onto the page.",
    };
  }
  if (files.length > options.maxFiles) {
    return {
      ok: false,
      message: `You can process up to ${options.maxFiles} files at once on this plan.`,
      hint: "Remove some files, or process them in smaller batches.",
    };
  }
  for (const file of files) {
    if (!isAllowedFile(file, kinds)) {
      return {
        ok: false,
        message: `"${file.name}" isn't a supported file type.`,
        hint: `Supported: ${acceptAttribute(kinds).replaceAll(".", "").replaceAll(",", ", ")}.`,
      };
    }
    if (file.size > options.maxBytes) {
      const mb = Math.round(options.maxBytes / 1024 / 1024);
      return {
        ok: false,
        message: `"${file.name}" is larger than the ${mb} MB limit.`,
        hint: "Compress it first, or split it into smaller files.",
      };
    }
  }
  return { ok: true };
}

export function sniffPdf(bytes: Uint8Array): boolean {
  if (bytes.length < 5) return false;
  return (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  );
}

export { LIMITS };
