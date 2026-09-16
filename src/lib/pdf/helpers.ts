import { PDFDocument, PDFPage, StandardFonts, rgb, degrees, type PDFFont } from "pdf-lib";
import { PdfHubError } from "@/lib/pdf/errors";

export async function loadPdf(bytes: Uint8Array, password?: string): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(bytes, {
      ignoreEncryption: !password,
      updateMetadata: false,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "load failed";
    if (/password|encrypt/i.test(message)) {
      throw new PdfHubError(
        "encrypted",
        "This PDF is password-protected.",
        "Enter the password, or use Unlock PDF first.",
      );
    }
    throw new PdfHubError(
      "corrupt",
      "We couldn't open this PDF.",
      "The file may be damaged. Try Repair PDF or a fresh export.",
    );
  }
}

export async function bytesOf(file: File | Blob): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

export function parsePageRange(input: string, pageCount: number): number[] {
  const trimmed = input.trim();
  if (!trimmed) return Array.from({ length: pageCount }, (_, i) => i);
  const pages = new Set<number>();
  for (const part of trimmed.split(/[, ]+/).filter(Boolean)) {
    const range = part.split("-").map((n) => Number.parseInt(n, 10));
    if (range.some((n) => Number.isNaN(n))) {
      throw new PdfHubError("invalid_range", "Page range isn't valid.", 'Use formats like "1-3,5,8".');
    }
    if (range.length === 1) {
      const n = range[0];
      if (n < 1 || n > pageCount) {
        throw new PdfHubError("invalid_range", `Page ${n} is outside this document.`, `This file has ${pageCount} pages.`);
      }
      pages.add(n - 1);
    } else {
      const [start, end] = range[0] <= range[1] ? [range[0], range[1]] : [range[1], range[0]];
      for (let n = start; n <= end; n++) {
        if (n < 1 || n > pageCount) continue;
        pages.add(n - 1);
      }
    }
  }
  return [...pages].sort((a, b) => a - b);
}

export function parseOrder(input: string, pageCount: number): number[] {
  const trimmed = input.trim();
  if (!trimmed) return Array.from({ length: pageCount }, (_, i) => i);
  const parts = trimmed.split(/[, ]+/).filter(Boolean).map((n) => Number.parseInt(n, 10));
  if (parts.some((n) => Number.isNaN(n) || n < 1 || n > pageCount)) {
    throw new PdfHubError(
      "invalid_order",
      "Page order isn't valid.",
      `List every page from 1 to ${pageCount}, separated by commas.`,
    );
  }
  return parts.map((n) => n - 1);
}

export function stampName(original: string, suffix: string, ext = "pdf"): string {
  const base = original.replace(/\.[^.]+$/, "") || "document";
  return `${base}-${suffix}.${ext}`;
}

export async function copyPages(source: PDFDocument, indices: number[]): Promise<PDFDocument> {
  const out = await PDFDocument.create();
  const copied = await out.copyPages(source, indices);
  copied.forEach((page) => out.addPage(page));
  return out;
}

export async function savePdf(doc: PDFDocument): Promise<Uint8Array> {
  return doc.save({ useObjectStreams: true });
}

export type WrapFont = { font: PDFFont; size: number };

export function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const paragraphs = text.replace(/\r/g, "").split("\n");
  const lines: string[] = [];
  for (const para of paragraphs) {
    if (!para.trim()) {
      lines.push("");
      continue;
    }
    const words = para.split(/\s+/);
    let current = "";
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) <= maxWidth) {
        current = next;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

export function drawWrappedText(
  page: PDFPage,
  text: string,
  opts: { x: number; y: number; maxWidth: number; font: PDFFont; size: number; lineHeight?: number; color?: ReturnType<typeof rgb> },
): number {
  const lines = wrapText(text, opts.font, opts.size, opts.maxWidth);
  const lh = opts.lineHeight ?? opts.size * 1.35;
  let y = opts.y;
  for (const line of lines) {
    if (y < 48) break;
    if (line) {
      page.drawText(line, {
        x: opts.x,
        y,
        size: opts.size,
        font: opts.font,
        color: opts.color ?? rgb(0.12, 0.14, 0.18),
      });
    }
    y -= lh;
  }
  return y;
}

export async function textDocument(title: string, body: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  let page = doc.addPage([612, 792]);
  let y = 740;
  page.drawText(title.slice(0, 90), { x: 54, y, size: 16, font: bold, color: rgb(0.12, 0.14, 0.18) });
  y -= 28;
  const lines = wrapText(body, font, 11, 504);
  for (const line of lines) {
    if (y < 54) {
      page = doc.addPage([612, 792]);
      y = 740;
    }
    if (line) page.drawText(line, { x: 54, y, size: 11, font, color: rgb(0.12, 0.14, 0.18) });
    y -= 15;
  }
  return savePdf(doc);
}

function decodeHtml(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export async function htmlDocument(title: string, html: string): Promise<Uint8Array> {
  const blocks = [...html.matchAll(/<(h[1-3]|p|li)[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => ({
    tag: m[1].toLowerCase(),
    text: decodeHtml(m[2]),
  })).filter((b) => b.text);
  if (!blocks.length) return textDocument(title, decodeHtml(html) || "Empty document");
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  let page = doc.addPage([612, 792]);
  let y = 740;
  page.drawText(title.slice(0, 90), { x: 54, y, size: 16, font: bold, color: rgb(0.12, 0.14, 0.18) });
  y -= 26;
  for (const block of blocks) {
    const heading = block.tag.startsWith("h");
    const size = block.tag === "h1" ? 16 : block.tag === "h2" ? 13 : block.tag === "h3" ? 12 : 11;
    const used = heading ? bold : font;
    const lines = wrapText(block.text, used, size, 504);
    if (heading) y -= 8;
    for (const line of lines) {
      if (y < 54) {
        page = doc.addPage([612, 792]);
        y = 740;
      }
      page.drawText(line, { x: 54, y, size, font: used, color: rgb(0.12, 0.14, 0.18) });
      y -= size + 4;
    }
    y -= 4;
  }
  return savePdf(doc);
}

export { StandardFonts, rgb, degrees, PDFDocument };
