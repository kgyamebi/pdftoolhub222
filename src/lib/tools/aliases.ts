/** Public paths people type or bookmark that should land on a real tool. */
export const SLUG_ALIASES: Record<string, string> = {
  "extract-pages": "extract-pdf-pages",
  "extract-pdf": "extract-pdf-pages",
  "delete-pages": "delete-pdf-pages",
  "remove-pages": "delete-pdf-pages",
  "reorder-pdf": "rearrange-pdf-pages",
  "rearrange-pdf": "rearrange-pdf-pages",
  "rotate-pages": "rotate-pdf",
  sign: "sign-pdf",
  "e-sign": "sign-pdf",
  "esign-pdf": "sign-pdf",
  watermark: "watermark-pdf",
  unlock: "unlock-pdf",
  decrypt: "decrypt-pdf",
  protect: "protect-pdf",
  "password-protect-pdf": "protect-pdf",
  encrypt: "encrypt-pdf",
  ocr: "ocr-pdf",
  compress: "compress-pdf",
  merge: "merge-pdf",
  "combine-pdf": "merge-pdf",
  split: "split-pdf",
  jpg2pdf: "jpg-to-pdf",
  pdf2jpg: "pdf-to-jpg",
  word2pdf: "word-to-pdf",
  pdf2word: "pdf-to-word",
};

export function canonicalToolSlug(slug: string): string | undefined {
  return SLUG_ALIASES[slug];
}
