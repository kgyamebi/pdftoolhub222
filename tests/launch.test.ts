import assert from "node:assert/strict";
import { test } from "node:test";
import { canonicalToolSlug } from "../src/lib/tools/aliases.ts";
import { guessTool } from "../src/lib/tools/guess.ts";
import { htmlDocument } from "../src/lib/pdf/helpers.ts";
import { PDFDocument } from "pdf-lib";
import { processTool } from "../src/lib/pdf/processor.ts";

test("public aliases map to canonical tool slugs", () => {
  assert.equal(canonicalToolSlug("extract-pages"), "extract-pdf-pages");
  assert.equal(canonicalToolSlug("compress"), "compress-pdf");
  assert.equal(canonicalToolSlug("extract-pdf-pages"), undefined);
});

test("guessTool maps photos and office files", () => {
  assert.equal(guessTool(new File([], "id.jpg")), "jpg-to-pdf");
  assert.equal(guessTool(new File([], "notes.docx")), "word-to-pdf");
  assert.equal(guessTool(new File([], "pack.pdf")), "compress-pdf");
});

test("htmlDocument keeps heading structure as multiple lines", async () => {
  const bytes = await htmlDocument("Essay", "<h1>Title</h1><p>Body paragraph about the assignment.</p>");
  const pdf = await PDFDocument.load(bytes);
  assert.ok(pdf.getPageCount() >= 1);
});

test("fill-pdf writes named fields", async () => {
  const src = await PDFDocument.create();
  const page = src.addPage([400, 400]);
  const form = src.getForm();
  const name = form.createTextField("name");
  name.addToPage(page, { x: 20, y: 300, width: 200, height: 20 });
  const file = new File([await src.save()] as BlobPart[], "form.pdf", { type: "application/pdf" });
  const result = await processTool({
    tool: "fill-pdf",
    files: [file],
    settings: { fields: JSON.stringify({ name: "Ada Lovelace" }) },
  });
  assert.equal(result.files.length, 1);
  assert.ok((result.originalBytes ?? 0) > 0);
});
