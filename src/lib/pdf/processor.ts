import {
  Document,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import JSZip from "jszip";
import mammoth from "mammoth";
import {
  PDFDocument,
  StandardFonts,
  degrees,
  rgb,
} from "pdf-lib";
import * as XLSX from "xlsx";
import { PdfHubError } from "@/lib/pdf/errors";
import {
  bytesOf,
  copyPages,
  drawWrappedText,
  loadPdf,
  parseOrder,
  parsePageRange,
  savePdf,
  stampName,
  textDocument,
  wrapText,
} from "@/lib/pdf/helpers";
import { extractPdfText, getPdfJs, renderPageCanvas } from "@/lib/pdf/pdfjs";
import { imagesToPptx, pptxToText } from "@/lib/pdf/pptx";

export type ProgressFn = (state: { stage: string; percent: number }) => void;

export type ProcessFile = {
  name: string;
  blob: Blob;
  mime: string;
};

export type ProcessResult = {
  files: ProcessFile[];
  text?: string;
  warnings?: string[];
  local: boolean;
  pageCount?: number;
};

export type ProcessRequest = {
  tool: string;
  files: File[];
  settings: Record<string, string | number | boolean>;
  extras?: File[];
  onProgress?: ProgressFn;
  signal?: AbortSignal;
};

function assertNotAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new PdfHubError("cancelled", "Processing was cancelled.", "Choose a file and try again.");
  }
}

function progress(onProgress: ProgressFn | undefined, stage: string, percent: number) {
  onProgress?.({ stage, percent: Math.max(0, Math.min(100, Math.round(percent))) });
}

function downloadBlob(bytes: Uint8Array, type: string): Blob {
  return new Blob([bytes as BlobPart], { type });
}

async function canvasToBytes(canvas: HTMLCanvasElement, mime: string, quality = 0.86): Promise<Uint8Array> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), mime, quality);
  });
  return bytesOf(blob);
}

async function embedRaster(doc: PDFDocument, file: File): Promise<{ width: number; height: number; draw: (page: ReturnType<PDFDocument["addPage"]>) => void }> {
  const bytes = await bytesOf(file);
  const type = file.type || "";
  const name = file.name.toLowerCase();
  if (type === "image/png" || name.endsWith(".png")) {
    const img = await doc.embedPng(bytes);
    return {
      width: img.width,
      height: img.height,
      draw: (page) => page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height }),
    };
  }
  if (type === "image/jpeg" || name.endsWith(".jpg") || name.endsWith(".jpeg")) {
    const img = await doc.embedJpg(bytes);
    return {
      width: img.width,
      height: img.height,
      draw: (page) => page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height }),
    };
  }
  if (typeof createImageBitmap === "undefined") {
    throw new PdfHubError("unsupported", "This image type needs the browser.", "Use JPG or PNG, or open the tool in your browser.");
  }
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new PdfHubError("image", "Couldn't read this image.", "Try exporting it as PNG or JPG.");
  ctx.drawImage(bitmap, 0, 0);
  const jpg = await canvasToBytes(canvas, "image/jpeg", 0.92);
  const img = await doc.embedJpg(jpg);
  return {
    width: img.width,
    height: img.height,
    draw: (page) => page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height }),
  };
}

async function imagesToPdf(files: File[], onProgress?: ProgressFn): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < files.length; i++) {
    progress(onProgress, `Adding ${files[i].name}`, 10 + (i / files.length) * 80);
    const embedded = await embedRaster(doc, files[i]);
    const page = doc.addPage([embedded.width, embedded.height]);
    embedded.draw(page);
  }
  return savePdf(doc);
}

async function pdfPagesToImages(
  file: File,
  mime: "image/jpeg" | "image/png" | "image/webp",
  onProgress?: ProgressFn,
  signal?: AbortSignal,
): Promise<ProcessFile[]> {
  const bytes = await bytesOf(file);
  const pdfjs = await getPdfJs();
  const pdf = await pdfjs.getDocument({ data: bytes.slice() }).promise;
  const out: ProcessFile[] = [];
  const ext = mime === "image/jpeg" ? "jpg" : mime === "image/webp" ? "webp" : "png";
  for (let i = 1; i <= pdf.numPages; i++) {
    assertNotAborted(signal);
    progress(onProgress, `Rendering page ${i} of ${pdf.numPages}`, (i / pdf.numPages) * 90);
    const canvas = await renderPageCanvas(bytes, i, 2);
    const imgBytes = await canvasToBytes(canvas, mime, 0.88);
    out.push({
      name: stampName(file.name, `page-${i}`, ext),
      blob: downloadBlob(imgBytes, mime),
      mime,
    });
  }
  await pdf.cleanup();
  return out;
}

async function zipFiles(files: ProcessFile[], zipName: string): Promise<ProcessFile> {
  if (files.length === 1) return files[0];
  const zip = new JSZip();
  for (const file of files) zip.file(file.name, await file.blob.arrayBuffer());
  const bytes = await zip.generateAsync({ type: "uint8array" });
  return { name: zipName, blob: downloadBlob(bytes, "application/zip"), mime: "application/zip" };
}

async function compressPdf(file: File, quality: "low" | "medium" | "high", targetKb: number | undefined, onProgress?: ProgressFn, signal?: AbortSignal): Promise<Uint8Array> {
  const original = await bytesOf(file);
  const rewritten = await savePdf(await loadPdf(original));
  if (typeof window === "undefined") return rewritten;

  const scale = quality === "low" ? 1.05 : quality === "high" ? 1.7 : 1.35;
  const q = quality === "low" ? 0.42 : quality === "high" ? 0.78 : 0.6;
  const pdfjs = await getPdfJs();
  const src = await pdfjs.getDocument({ data: original.slice() }).promise;
  const qualities = targetKb ? [0.72, 0.58, 0.46, 0.34] : [q];

  let best = rewritten;
  for (const jpegQ of qualities) {
    assertNotAborted(signal);
    const out = await PDFDocument.create();
    for (let i = 1; i <= src.numPages; i++) {
      progress(onProgress, `Compressing page ${i} of ${src.numPages}`, (i / src.numPages) * 90);
      const page = await src.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      await page.render({ canvasContext: ctx, viewport, canvas } as never).promise;
      const jpg = await canvasToBytes(canvas, "image/jpeg", jpegQ);
      const img = await out.embedJpg(jpg);
      const p = out.addPage([img.width, img.height]);
      p.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }
    const candidate = await savePdf(out);
    if (candidate.byteLength < best.byteLength) best = candidate;
    if (targetKb && candidate.byteLength <= targetKb * 1024) {
      best = candidate;
      break;
    }
  }
  await src.cleanup();
  return best;
}

async function overlayOnPages(
  file: File,
  settings: ProcessRequest["settings"],
  draw: (page: ReturnType<PDFDocument["getPage"]>, width: number, height: number) => void | Promise<void>,
): Promise<Uint8Array> {
  const doc = await loadPdf(await bytesOf(file));
  const pages = doc.getPages();
  const indices = parsePageRange(String(settings.pages || ""), pages.length);
  for (const i of indices) {
    const page = pages[i];
    const { width, height } = page.getSize();
    await draw(page, width, height);
  }
  return savePdf(doc);
}

async function protectPdf(file: File, password: string): Promise<Uint8Array> {
  if (!password || password.length < 4) {
    throw new PdfHubError("password", "Choose a password of at least 4 characters.", "Use a password you can remember — we cannot recover it.");
  }
  const cantoo = await import("@cantoo/pdf-lib");
  const src = await cantoo.PDFDocument.load(await bytesOf(file), { ignoreEncryption: true });
  const out = await cantoo.PDFDocument.create();
  const copied = await out.copyPages(src, src.getPageIndices());
  copied.forEach((p) => out.addPage(p));
  out.encrypt({
    userPassword: password,
    ownerPassword: password,
    permissions: { printing: "highResolution", copying: false, modifying: false },
  });
  return out.save({ useObjectStreams: true });
}

async function unlockPdf(file: File, password: string): Promise<Uint8Array> {
  const cantoo = await import("@cantoo/pdf-lib");
  try {
    const doc = await cantoo.PDFDocument.load(await bytesOf(file), { password, ignoreEncryption: false });
    const out = await cantoo.PDFDocument.create();
    const copied = await out.copyPages(doc, doc.getPageIndices());
    copied.forEach((p) => out.addPage(p));
    return out.save({ useObjectStreams: true });
  } catch {
    throw new PdfHubError(
      "encrypted",
      "That password didn't unlock this PDF.",
      "Use the password that opens the file. We only remove protection when you provide it.",
    );
  }
}

function extractiveSummary(text: string, maxSentences = 8): string {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 40);
  if (sentences.length <= maxSentences) return sentences.join(" ") || text.slice(0, 1200);
  const stop = new Set(["the", "and", "for", "that", "with", "this", "from", "are", "was", "were", "have", "has", "not", "but", "you", "your", "our", "their"]);
  const freq = new Map<string, number>();
  for (const word of text.toLowerCase().match(/[a-z]{3,}/g) ?? []) {
    if (stop.has(word)) continue;
    freq.set(word, (freq.get(word) ?? 0) + 1);
  }
  const scored = sentences.map((s, i) => {
    const score =
      [...s.toLowerCase().matchAll(/[a-z]{3,}/g)].reduce((n, m) => n + (freq.get(m[0]) ?? 0), 0) /
        Math.sqrt(s.length) +
      (i < 3 ? 8 : 0);
    return { s, score };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .map((x) => x.s)
    .join(" ");
}

function answerFromText(text: string, question: string): string {
  const terms = question.toLowerCase().match(/[a-z0-9]{3,}/g) ?? [];
  const sentences = text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  const ranked = sentences
    .map((s) => ({
      s,
      n: terms.reduce((acc, t) => acc + (s.toLowerCase().includes(t) ? 1 : 0), 0),
    }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 5)
    .map((x) => x.s);
  if (!ranked.length) {
    return "No sentence in this PDF clearly matches that question. Try a more specific phrase from the document.";
  }
  return ranked.join(" ");
}

async function handleTool(req: ProcessRequest): Promise<ProcessResult> {
  const { tool, files, settings, extras = [], onProgress, signal } = req;
  const primary = files[0];
  if (!primary) throw new PdfHubError("empty", "Add a file to continue.", "Drop a file onto the page or choose one from your device.");
  progress(onProgress, "Reading file", 8);
  assertNotAborted(signal);

  switch (tool) {
    case "merge-pdf": {
      if (files.length < 2) throw new PdfHubError("min_files", "Merge needs at least two PDFs.", "Add another file, then process.");
      const out = await PDFDocument.create();
      for (let i = 0; i < files.length; i++) {
        progress(onProgress, `Adding ${files[i].name}`, 10 + (i / files.length) * 80);
        const src = await loadPdf(await bytesOf(files[i]));
        const copied = await out.copyPages(src, src.getPageIndices());
        copied.forEach((p) => out.addPage(p));
      }
      const bytes = await savePdf(out);
      return { local: true, files: [{ name: "merged.pdf", blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }], pageCount: out.getPageCount() };
    }
    case "split-pdf": {
      const src = await loadPdf(await bytesOf(primary));
      const mode = String(settings.mode || "range");
      const results: ProcessFile[] = [];
      if (mode === "each") {
        for (let i = 0; i < src.getPageCount(); i++) {
          progress(onProgress, `Splitting page ${i + 1}`, ((i + 1) / src.getPageCount()) * 90);
          const part = await copyPages(src, [i]);
          const bytes = await savePdf(part);
          results.push({ name: stampName(primary.name, `page-${i + 1}`), blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" });
        }
        return { local: true, files: [await zipFiles(results, stampName(primary.name, "split", "zip"))], pageCount: src.getPageCount() };
      }
      const range = parsePageRange(String(settings.pages || "1"), src.getPageCount());
      const part = await copyPages(src, range);
      const bytes = await savePdf(part);
      return { local: true, files: [{ name: stampName(primary.name, "split"), blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }], pageCount: part.getPageCount() };
    }
    case "extract-pdf-pages": {
      const src = await loadPdf(await bytesOf(primary));
      const range = parsePageRange(String(settings.pages || "1"), src.getPageCount());
      if (!range.length) throw new PdfHubError("invalid_range", "Select at least one page.", "Example: 1-3,5");
      const part = await copyPages(src, range);
      const bytes = await savePdf(part);
      return { local: true, files: [{ name: stampName(primary.name, "extracted"), blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }], pageCount: part.getPageCount() };
    }
    case "delete-pdf-pages": {
      const src = await loadPdf(await bytesOf(primary));
      const remove = new Set(parsePageRange(String(settings.pages || ""), src.getPageCount()));
      const keep = src.getPageIndices().filter((i) => !remove.has(i));
      if (!keep.length) throw new PdfHubError("empty", "That would delete every page.", "Keep at least one page.");
      const part = await copyPages(src, keep);
      const bytes = await savePdf(part);
      return { local: true, files: [{ name: stampName(primary.name, "pages-removed"), blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }], pageCount: part.getPageCount() };
    }
    case "rearrange-pdf-pages": {
      const src = await loadPdf(await bytesOf(primary));
      const order = parseOrder(String(settings.order || ""), src.getPageCount());
      const part = await copyPages(src, order);
      const bytes = await savePdf(part);
      return { local: true, files: [{ name: stampName(primary.name, "rearranged"), blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }], pageCount: part.getPageCount() };
    }
    case "rotate-pdf": {
      const src = await loadPdf(await bytesOf(primary));
      const angle = Number(settings.angle || 90);
      const pages = parsePageRange(String(settings.pages || ""), src.getPageCount());
      for (const i of pages) {
        const page = src.getPage(i);
        page.setRotation(degrees(((page.getRotation().angle + angle) % 360 + 360) % 360));
      }
      const bytes = await savePdf(src);
      return { local: true, files: [{ name: stampName(primary.name, "rotated"), blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }], pageCount: src.getPageCount() };
    }
    case "duplicate-pdf-pages": {
      const src = await loadPdf(await bytesOf(primary));
      const dup = parsePageRange(String(settings.pages || "1"), src.getPageCount());
      const out = await PDFDocument.create();
      const all = await out.copyPages(src, src.getPageIndices());
      all.forEach((p) => out.addPage(p));
      const extra = await out.copyPages(src, dup);
      extra.forEach((p) => out.addPage(p));
      const bytes = await savePdf(out);
      return { local: true, files: [{ name: stampName(primary.name, "duplicated"), blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }], pageCount: out.getPageCount() };
    }
    case "reverse-pdf-pages": {
      const src = await loadPdf(await bytesOf(primary));
      const order = [...src.getPageIndices()].reverse();
      const part = await copyPages(src, order);
      const bytes = await savePdf(part);
      return { local: true, files: [{ name: stampName(primary.name, "reversed"), blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }], pageCount: part.getPageCount() };
    }
    case "pdf-page-numbering":
    case "add-page-numbers": {
      const src = await loadPdf(await bytesOf(primary));
      const font = await src.embedFont(StandardFonts.Helvetica);
      const position = String(settings.position || "bottom-center");
      const start = Number(settings.start || 1);
      src.getPages().forEach((page, i) => {
        const { width, height } = page.getSize();
        const label = String(start + i);
        const tw = font.widthOfTextAtSize(label, 10);
        const x = position.includes("left") ? 28 : position.includes("right") ? width - 28 - tw : (width - tw) / 2;
        const y = position.includes("top") ? height - 28 : 22;
        page.drawText(label, { x, y, size: 10, font, color: rgb(0.25, 0.27, 0.32) });
      });
      const bytes = await savePdf(src);
      return { local: true, files: [{ name: stampName(primary.name, "numbered"), blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }], pageCount: src.getPageCount() };
    }
    case "compress-pdf":
    case "reduce-pdf-size":
    case "optimize-pdf": {
      const quality = (String(settings.quality || "medium") as "low" | "medium" | "high");
      const target = settings.targetKb ? Number(settings.targetKb) : undefined;
      const bytes = await compressPdf(primary, quality, target, onProgress, signal);
      const original = primary.size;
      const warning =
        bytes.byteLength >= original
          ? "This PDF was already compact. Compression didn't reduce the size — text-only files often won't shrink."
          : undefined;
      return {
        local: true,
        warnings: warning ? [warning] : undefined,
        files: [{ name: stampName(primary.name, "compressed"), blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }],
      };
    }
    case "jpg-to-pdf":
    case "png-to-pdf":
    case "webp-to-pdf": {
      const bytes = await imagesToPdf(files, onProgress);
      return { local: true, files: [{ name: stampName(primary.name, "converted"), blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }] };
    }
    case "pdf-to-jpg":
    case "pdf-to-png":
    case "pdf-to-webp": {
      const mime = tool === "pdf-to-jpg" ? "image/jpeg" : tool === "pdf-to-webp" ? "image/webp" : "image/png";
      const images = await pdfPagesToImages(primary, mime, onProgress, signal);
      return { local: true, files: [await zipFiles(images, stampName(primary.name, "pages", "zip"))] };
    }
    case "word-to-pdf": {
      progress(onProgress, "Reading Word document", 20);
      const result = await mammoth.extractRawText({ arrayBuffer: await primary.arrayBuffer() });
      const bytes = await textDocument(primary.name.replace(/\.[^.]+$/, ""), result.value || "Empty document");
      return { local: true, files: [{ name: stampName(primary.name, "from-word"), blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }], warnings: ["Layout, fonts and images from Word are simplified into a clean text PDF."] };
    }
    case "pdf-to-word": {
      progress(onProgress, "Extracting text", 30);
      const text = await extractPdfText(await bytesOf(primary));
      const doc = new Document({
        sections: [
          {
            children: (text || "No extractable text.").split("\n").map(
              (line) => new Paragraph({ children: [new TextRun({ text: line, font: "Calibri", size: 22 })] }),
            ),
          },
        ],
      });
      const buf = await Packer.toBlob(doc);
      return { local: true, files: [{ name: stampName(primary.name, "text", "docx"), blob: buf, mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }], warnings: ["This creates an editable text document, not a pixel-perfect replica of the PDF layout."] };
    }
    case "excel-to-pdf": {
      progress(onProgress, "Reading spreadsheet", 20);
      const wb = XLSX.read(await primary.arrayBuffer(), { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, { header: 1 }) as (string | number)[][];
      const pdf = await PDFDocument.create();
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
      let page = pdf.addPage([792, 612]);
      let y = 580;
      page.drawText(wb.SheetNames[0], { x: 24, y, size: 12, font: bold });
      y -= 18;
      for (const row of rows.slice(0, 80)) {
        const line = row.map((c) => String(c ?? "")).join("   ");
        const wrapped = wrapText(line, font, 8, 744);
        for (const part of wrapped) {
          if (y < 28) {
            page = pdf.addPage([792, 612]);
            y = 580;
          }
          page.drawText(part, { x: 24, y, size: 8, font, color: rgb(0.12, 0.14, 0.18) });
          y -= 11;
        }
      }
      const bytes = await savePdf(pdf);
      return { local: true, files: [{ name: stampName(primary.name, "from-excel"), blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }] };
    }
    case "pdf-to-excel":
    case "extract-tables": {
      const text = await extractPdfText(await bytesOf(primary));
      const wb = XLSX.utils.book_new();
      const rows = text.split("\n").map((line) => {
        if (line.includes("\t")) return line.split("\t");
        const parts = line.trim().split(/\s{2,}/);
        return parts.length > 1 ? parts : [line];
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), "Extract");
      const out = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
      return { local: true, files: [{ name: stampName(primary.name, "tables", "xlsx"), blob: downloadBlob(new Uint8Array(out), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"), mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }], warnings: ["Table detection is heuristic. Check columns before relying on the spreadsheet."] };
    }
    case "powerpoint-to-pdf": {
      progress(onProgress, "Reading slides", 20);
      const text = await pptxToText(await bytesOf(primary));
      const bytes = await textDocument(primary.name.replace(/\.[^.]+$/, ""), text || "No extractable slide text.");
      return { local: true, files: [{ name: stampName(primary.name, "from-pptx"), blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }], warnings: ["Slide design is not preserved. This exports readable slide text into a PDF."] };
    }
    case "pdf-to-powerpoint": {
      const images = await pdfPagesToImages(primary, "image/png", onProgress, signal);
      const slides = [];
      for (const img of images) slides.push({ name: img.name, bytes: await bytesOf(img.blob) });
      const bytes = await imagesToPptx(slides);
      return { local: true, files: [{ name: stampName(primary.name, "slides", "pptx"), blob: downloadBlob(bytes, "application/vnd.openxmlformats-officedocument.presentationml.presentation"), mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation" }] };
    }
    case "pdf-to-text":
    case "extract-text": {
      const text = await extractPdfText(await bytesOf(primary));
      const blob = new Blob([text || "No extractable text."], { type: "text/plain" });
      return { local: true, text, files: [{ name: stampName(primary.name, "text", "txt"), blob, mime: "text/plain" }] };
    }
    case "watermark-pdf": {
      const text = String(settings.text || "CONFIDENTIAL");
      const opacity = Number(settings.opacity || 0.22);
      const bytes = await overlayOnPages(primary, settings, (page, width, height) => {
        page.drawText(text, {
          x: width * 0.18,
          y: height * 0.42,
          size: Math.min(48, width / 8),
          rotate: degrees(-32),
          color: rgb(0.55, 0.22, 0.12),
          opacity: Math.min(0.5, Math.max(0.08, opacity)),
        });
      });
      return { local: true, files: [{ name: stampName(primary.name, "watermarked"), blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }] };
    }
    case "add-header":
    case "add-footer": {
      const text = String(settings.text || (tool === "add-header" ? "Document" : "Page"));
      const bytes = await overlayOnPages(primary, { ...settings, pages: "" }, async (page, width, height) => {
        const font = await page.doc.embedFont(StandardFonts.Helvetica);
        const y = tool === "add-header" ? height - 28 : 22;
        const tw = font.widthOfTextAtSize(text, 10);
        page.drawText(text, { x: (width - tw) / 2, y, size: 10, font, color: rgb(0.25, 0.27, 0.32) });
      });
      return { local: true, files: [{ name: stampName(primary.name, tool === "add-header" ? "header" : "footer"), blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }] };
    }
    case "add-text":
    case "edit-pdf": {
      const text = String(settings.text || "");
      if (!text && tool === "add-text") throw new PdfHubError("text", "Enter the text to add.", "Type a short line, then process.");
      if (!text) {
        const src = await loadPdf(await bytesOf(primary));
        const bytes = await savePdf(src);
        return { local: true, files: [{ name: stampName(primary.name, "edited"), blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }], warnings: ["No overlay text was added. Use Add Text, Watermark, or Signature for edits."] };
      }
      const bytes = await overlayOnPages(primary, settings, async (page, width, height) => {
        const font = await page.doc.embedFont(StandardFonts.Helvetica);
        const xPct = Number(settings.x ?? 12);
        const yPct = Number(settings.y ?? 88);
        drawWrappedText(page, text, {
          x: (width * xPct) / 100,
          y: (height * yPct) / 100,
          maxWidth: width * 0.76,
          font,
          size: Number(settings.size || 14),
        });
      });
      return { local: true, files: [{ name: stampName(primary.name, "text"), blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }] };
    }
    case "add-image":
      return stampImage(req);
    case "highlight-pdf": {
      const bytes = await overlayOnPages(primary, settings, (page, width, height) => {
        const yPct = Number(settings.y ?? 70);
        page.drawRectangle({
          x: width * 0.1,
          y: (height * yPct) / 100 - 8,
          width: width * 0.8,
          height: 18,
          color: rgb(1, 0.9, 0.2),
          opacity: 0.35,
        });
      });
      return { local: true, files: [{ name: stampName(primary.name, "highlighted"), blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }] };
    }
    case "add-shapes":
    case "draw-on-pdf": {
      const bytes = await overlayOnPages(primary, settings, (page, width, height) => {
        page.drawRectangle({
          x: width * 0.12,
          y: height * 0.18,
          width: width * 0.76,
          height: height * 0.22,
          borderColor: rgb(0.7, 0.33, 0.16),
          borderWidth: 2,
        });
      });
      return { local: true, files: [{ name: stampName(primary.name, "shapes"), blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }] };
    }
    case "sign-pdf":
    case "add-signature": {
      const text = String(settings.text || "Signed");
      const bytes = await overlayOnPages(primary, settings, async (page, width) => {
        const font = await page.doc.embedFont(StandardFonts.TimesRomanItalic);
        page.drawText(text, { x: width - 220, y: 48, size: 18, font, color: rgb(0.15, 0.2, 0.45) });
        page.drawLine({ start: { x: width - 220, y: 42 }, end: { x: width - 48, y: 42 }, thickness: 1, color: rgb(0.15, 0.2, 0.45) });
      });
      return { local: true, files: [{ name: stampName(primary.name, "signed"), blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }] };
    }
    case "protect-pdf":
    case "encrypt-pdf":
    case "add-password": {
      const bytes = await protectPdf(primary, String(settings.password || ""));
      return { local: true, files: [{ name: stampName(primary.name, "protected"), blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }] };
    }
    case "unlock-pdf":
    case "decrypt-pdf":
    case "remove-password": {
      const bytes = await unlockPdf(primary, String(settings.password || ""));
      return { local: true, files: [{ name: stampName(primary.name, "unlocked"), blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }] };
    }
    case "fill-pdf": {
      const doc = await loadPdf(await bytesOf(primary));
      const form = doc.getForm();
      const fields = form.getFields();
      if (!fields.length) {
        throw new PdfHubError("no_fields", "This PDF has no fillable form fields.", "Use Create PDF Form to add fields, or Add Text for a visual overlay.");
      }
      const value = String(settings.value || "");
      for (const field of fields) {
        try {
          const textField = form.getTextField(field.getName());
          textField.setText(value || " ");
        } catch {
          /* not a text field */
        }
      }
      form.flatten();
      const bytes = await savePdf(doc);
      return { local: true, files: [{ name: stampName(primary.name, "filled"), blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }], warnings: value ? undefined : ["Empty values were written so you can inspect field names. Enter text to fill them."] };
    }
    case "create-pdf-form": {
      const doc = files[0]?.name.toLowerCase().endsWith(".pdf") ? await loadPdf(await bytesOf(primary)) : await PDFDocument.create();
      if (doc.getPageCount() === 0) doc.addPage([612, 792]);
      const form = doc.getForm();
      const page = doc.getPages()[0];
      const { height } = page.getSize();
      const font = await doc.embedFont(StandardFonts.Helvetica);
      page.drawText("Name", { x: 48, y: height - 90, size: 11, font });
      const name = form.createTextField("name");
      name.addToPage(page, { x: 48, y: height - 118, width: 280, height: 22 });
      page.drawText("Email", { x: 48, y: height - 150, size: 11, font });
      const email = form.createTextField("email");
      email.addToPage(page, { x: 48, y: height - 178, width: 280, height: 22 });
      const bytes = await savePdf(doc);
      return { local: true, files: [{ name: stampName(primary.name, "form"), blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }] };
    }
    case "ocr-pdf": {
      progress(onProgress, "Loading OCR engine", 12);
      const Tesseract = await import("tesseract.js");
      const src = await loadPdf(await bytesOf(primary));
      const pages = parsePageRange(String(settings.pages || "1"), src.getPageCount());
      const chunks: string[] = [];
      for (let n = 0; n < pages.length; n++) {
        progress(onProgress, `Reading page ${pages[n] + 1}`, 15 + (n / pages.length) * 75);
        const canvas = await renderPageCanvas(await bytesOf(primary), pages[n] + 1, 2);
        const result = await Tesseract.recognize(canvas, "eng");
        chunks.push(result.data.text.trim());
      }
      const text = chunks.join("\n\n");
      const bytes = await textDocument("OCR result", text || "No text detected.");
      return { local: true, text, files: [{ name: stampName(primary.name, "ocr"), blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }], warnings: ["OCR is best-effort and can misread handwriting, low-resolution scans, or unusual fonts."] };
    }
    case "extract-images": {
      const images = await pdfPagesToImages(primary, "image/png", onProgress, signal);
      return { local: true, files: [await zipFiles(images, stampName(primary.name, "images", "zip"))], warnings: ["Each page is exported as an image. Embedded photo extraction from mixed PDFs is page-based in this version."] };
    }
    case "pdf-summarizer":
    case "ask-pdf":
    case "translate-pdf":
    case "compare-pdfs": {
      progress(onProgress, "Extracting text", 25);
      const text = await extractPdfText(await bytesOf(primary));
      if (tool === "pdf-summarizer") {
        const summary = extractiveSummary(text);
        const bytes = await textDocument("Summary (AI-assisted, extractive)", `${summary}\n\nThis summary is generated from the document text on your device. It is not guaranteed to be complete or accurate.`);
        return { local: true, text: summary, files: [{ name: stampName(primary.name, "summary"), blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }], warnings: ["This is an extractive on-device summary, not a generative model. Configure an AI provider for richer summaries."] };
      }
      if (tool === "ask-pdf") {
        const question = String(settings.question || "");
        if (!question) throw new PdfHubError("question", "Ask a question about this PDF.", "Example: What is the payment deadline?");
        const answer = answerFromText(text, question);
        const bytes = await textDocument("Answer (from document text)", `Question: ${question}\n\n${answer}\n\nThis answer is retrieved from matching sentences. It is not guaranteed accurate.`);
        return { local: true, text: answer, files: [{ name: stampName(primary.name, "answer"), blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }] };
      }
      if (tool === "translate-pdf") {
        if (!process.env.NEXT_PUBLIC_AI_ENABLED) {
          throw new PdfHubError(
            "ai_unavailable",
            "Translation needs an AI provider key.",
            "Set AI_API_KEY on the server. Until then, extract text and translate it in your preferred tool.",
          );
        }
        throw new PdfHubError("ai_unavailable", "Remote translation isn't configured.", "Add AI_API_KEY to enable this tool.");
      }
      const second = files[1];
      if (!second) throw new PdfHubError("min_files", "Compare needs two PDFs.", "Add the second document.");
      const textB = await extractPdfText(await bytesOf(second));
      const a = new Set(text.split(/\s+/).filter(Boolean));
      const b = new Set(textB.split(/\s+/).filter(Boolean));
      const onlyA = [...a].filter((w) => !b.has(w)).slice(0, 80).join(", ");
      const onlyB = [...b].filter((w) => !a.has(w)).slice(0, 80).join(", ");
      const report = `Words only in ${primary.name}:\n${onlyA || "(none)"}\n\nWords only in ${second.name}:\n${onlyB || "(none)"}`;
      const bytes = await textDocument("PDF comparison", report);
      return { local: true, text: report, files: [{ name: "comparison.pdf", blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }], warnings: ["This is a word-level text comparison, not a visual pixel diff."] };
    }
    case "repair-pdf": {
      const doc = await PDFDocument.load(await bytesOf(primary), {
        ignoreEncryption: true,
        throwOnInvalidObject: false,
        updateMetadata: false,
      });
      const out = await copyPages(doc, doc.getPageIndices());
      const bytes = await savePdf(out);
      return { local: true, files: [{ name: stampName(primary.name, "repaired"), blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }], warnings: ["Repair rebuilds the page tree. It cannot recover a file that is completely unreadable."] };
    }
    default:
      throw new PdfHubError("unknown_tool", "This tool isn't implemented yet.", "Pick another tool from the catalog.");
  }
}

async function stampImage(req: ProcessRequest): Promise<ProcessResult> {
  const pdfFile = req.files.find((f) => f.name.toLowerCase().endsWith(".pdf")) || req.files[0];
  const image = req.extras?.[0] || req.files.find((f) => !f.name.toLowerCase().endsWith(".pdf"));
  if (!image) throw new PdfHubError("image", "Add an image to place on the PDF.", "PNG and JPG work best.");
  const doc = await loadPdf(await bytesOf(pdfFile));
  const bytesImg = await bytesOf(image);
  let img;
  try {
    img = image.type === "image/png" || image.name.toLowerCase().endsWith(".png") ? await doc.embedPng(bytesImg) : await doc.embedJpg(bytesImg);
  } catch {
    throw new PdfHubError("image", "Couldn't read that image.", "Export it as PNG or JPG and try again.");
  }
  const pages = parsePageRange(String(req.settings.pages || "1"), doc.getPageCount());
  for (const i of pages) {
    const page = doc.getPage(i);
    const { width, height } = page.getSize();
    const w = Math.min(img.width, width * 0.4);
    const h = (img.height / img.width) * w;
    page.drawImage(img, { x: Number(req.settings.x || 36), y: height - h - Number(req.settings.y || 36), width: w, height: h });
  }
  const bytes = await savePdf(doc);
  return { local: true, files: [{ name: stampName(pdfFile.name, "image"), blob: downloadBlob(bytes, "application/pdf"), mime: "application/pdf" }] };
}

export async function processTool(req: ProcessRequest): Promise<ProcessResult> {
  try {
    if (req.tool === "add-image") return await stampImage(req);
    const result = await handleTool(req);
    req.onProgress?.({ stage: "Your file is ready.", percent: 100 });
    return result;
  } catch (error) {
    if (error instanceof PdfHubError) throw error;
    const { toUserError } = await import("@/lib/pdf/errors");
    throw toUserError(error);
  }
}
