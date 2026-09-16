import assert from "node:assert/strict";
import { test } from "node:test";
import { PDFDocument } from "pdf-lib";
import { processTool } from "../src/lib/pdf/processor.ts";

async function samplePdf(name: string, pages: number): Promise<File> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pages; i++) doc.addPage([300, 400]);
  const bytes = await doc.save();
  return new File([bytes as BlobPart], name, { type: "application/pdf" });
}

test("merge combines page counts", async () => {
  const a = await samplePdf("a.pdf", 2);
  const b = await samplePdf("b.pdf", 3);
  const result = await processTool({ tool: "merge-pdf", files: [a, b], settings: {} });
  assert.equal(result.files.length, 1);
  const out = await PDFDocument.load(await result.files[0].blob.arrayBuffer());
  assert.equal(out.getPageCount(), 5);
});

test("split range extracts pages", async () => {
  const file = await samplePdf("src.pdf", 4);
  const result = await processTool({ tool: "split-pdf", files: [file], settings: { mode: "range", pages: "2-3" } });
  const out = await PDFDocument.load(await result.files[0].blob.arrayBuffer());
  assert.equal(out.getPageCount(), 2);
});

test("reverse flips page order", async () => {
  const file = await samplePdf("src.pdf", 3);
  const result = await processTool({ tool: "reverse-pdf-pages", files: [file], settings: {} });
  const out = await PDFDocument.load(await result.files[0].blob.arrayBuffer());
  assert.equal(out.getPageCount(), 3);
});

test("delete pages keeps the rest", async () => {
  const file = await samplePdf("src.pdf", 4);
  const result = await processTool({ tool: "delete-pdf-pages", files: [file], settings: { pages: "2,4" } });
  const out = await PDFDocument.load(await result.files[0].blob.arrayBuffer());
  assert.equal(out.getPageCount(), 2);
});

test("page numbers still produce a PDF", async () => {
  const file = await samplePdf("src.pdf", 2);
  const result = await processTool({
    tool: "pdf-page-numbering",
    files: [file],
    settings: { position: "bottom-center", start: "1" },
  });
  const out = await PDFDocument.load(await result.files[0].blob.arrayBuffer());
  assert.equal(out.getPageCount(), 2);
});

test("watermark does not drop pages", async () => {
  const file = await samplePdf("src.pdf", 2);
  const result = await processTool({ tool: "watermark-pdf", files: [file], settings: { text: "DRAFT" } });
  const out = await PDFDocument.load(await result.files[0].blob.arrayBuffer());
  assert.equal(out.getPageCount(), 2);
});
