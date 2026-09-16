import assert from "node:assert/strict";
import { test } from "node:test";
import { parseOrder, parsePageRange, stampName } from "../src/lib/pdf/helpers.ts";

test("parsePageRange understands lists and ranges", () => {
  assert.deepEqual(parsePageRange("1-3,5", 8), [0, 1, 2, 4]);
  assert.deepEqual(parsePageRange("", 3), [0, 1, 2]);
});

test("parsePageRange rejects pages outside the document", () => {
  assert.throws(() => parsePageRange("99", 3));
});

test("parseOrder keeps the given sequence", () => {
  assert.deepEqual(parseOrder("3,1,2", 3), [2, 0, 1]);
});

test("stampName preserves the base and suffix", () => {
  assert.equal(stampName("Contract.PDF", "merged"), "Contract-merged.pdf");
});
