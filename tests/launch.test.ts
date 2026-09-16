import assert from "node:assert/strict";
import { test } from "node:test";
import { canonicalToolSlug } from "../src/lib/tools/aliases.ts";
import { guessTool } from "../src/lib/tools/guess.ts";
import { parseStrokes } from "../src/lib/pdf/strokes.ts";
import { moveIndex } from "../src/lib/pdf/reorder.ts";
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

test("fill-pdf checks named checkboxes", async () => {
  const src = await PDFDocument.create();
  const page = src.addPage([400, 400]);
  const form = src.getForm();
  const box = form.createCheckBox("agree");
  box.addToPage(page, { x: 20, y: 300, width: 16, height: 16 });
  const file = new File([await src.save()] as BlobPart[], "check.pdf", { type: "application/pdf" });
  const result = await processTool({
    tool: "fill-pdf",
    files: [file],
    settings: { fields: JSON.stringify({ agree: "true" }) },
  });
  assert.equal(result.files.length, 1);
});

test("sign without a page range uses the last page", async () => {
  const src = await PDFDocument.create();
  src.addPage([400, 400]);
  src.addPage([400, 400]);
  const file = new File([await src.save()] as BlobPart[], "two.pdf", { type: "application/pdf" });
  const result = await processTool({
    tool: "sign-pdf",
    files: [file],
    settings: { text: "Ada" },
  });
  assert.equal(result.files.length, 1);
  const out = await PDFDocument.load(await result.files[0].blob.arrayBuffer());
  assert.equal(out.getPageCount(), 2);
});

test("draw-on-pdf stamps freehand strokes", async () => {
  const src = await PDFDocument.create();
  src.addPage([400, 400]);
  const file = new File([await src.save()] as BlobPart[], "blank.pdf", { type: "application/pdf" });
  const result = await processTool({
    tool: "draw-on-pdf",
    files: [file],
    settings: { strokes: JSON.stringify([{ points: [{ x: 10, y: 10 }, { x: 40, y: 50 }, { x: 70, y: 20 }] }]) },
  });
  assert.equal(result.files.length, 1);
  assert.ok(result.files[0].blob.size > file.size);
});

test("parseStrokes ignores junk", () => {
  assert.equal(parseStrokes("nope").length, 0);
  assert.equal(parseStrokes(JSON.stringify([{ points: [{ x: 1, y: 1 }, { x: 2, y: 2 }] }])).length, 1);
});

test("moveIndex reorders a list", () => {
  assert.deepEqual(moveIndex(["a", "b", "c"], 0, 2), ["b", "c", "a"]);
  assert.deepEqual(moveIndex(["a", "b"], 1, 1), ["a", "b"]);
});
