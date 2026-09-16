import assert from "node:assert/strict";
import { test } from "node:test";
import { searchTools } from "../src/lib/tools/search.ts";
import { nextActionsFor } from "../src/lib/tools/recommendations.ts";

test("natural language search finds compress", () => {
  const hits = searchTools("make my PDF smaller");
  assert.equal(hits[0]?.slug, "compress-pdf");
});

test("natural language search finds merge", () => {
  const hits = searchTools("combine these files");
  assert.equal(hits[0]?.slug, "merge-pdf");
});

test("natural language search finds jpg to pdf", () => {
  const hits = searchTools("turn this picture into a PDF");
  assert.ok(hits.some((h) => h.slug === "jpg-to-pdf"));
});

test("next actions after compress are contextual", () => {
  const next = nextActionsFor("compress-pdf");
  assert.ok(next.length > 0);
  assert.ok(next.every((t) => t.slug !== "compress-pdf"));
});
