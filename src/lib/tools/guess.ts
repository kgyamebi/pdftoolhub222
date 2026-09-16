export function guessTool(file: File): string {
  const n = file.name.toLowerCase();
  if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "jpg-to-pdf";
  if (n.endsWith(".png")) return "png-to-pdf";
  if (n.endsWith(".webp")) return "webp-to-pdf";
  if (n.endsWith(".docx") || n.endsWith(".doc")) return "word-to-pdf";
  if (n.endsWith(".xlsx") || n.endsWith(".xls")) return "excel-to-pdf";
  if (n.endsWith(".pptx") || n.endsWith(".ppt")) return "powerpoint-to-pdf";
  return "compress-pdf";
}

export const PAGE_SELECT_TOOLS = new Set([
  "extract-pdf-pages",
  "delete-pdf-pages",
  "split-pdf",
  "duplicate-pdf-pages",
  "rotate-pdf",
  "ocr-pdf",
  "add-text",
  "highlight-pdf",
  "watermark-pdf",
  "sign-pdf",
  "add-signature",
]);

export const PAGE_REORDER_TOOLS = new Set(["rearrange-pdf-pages"]);

export const SIGNATURE_TOOLS = new Set(["sign-pdf", "add-signature"]);
export const PASSWORD_CONFIRM_TOOLS = new Set(["protect-pdf", "encrypt-pdf", "add-password"]);
export const CLICK_PLACE_TOOLS = new Set([
  "add-text",
  "edit-pdf",
  "highlight-pdf",
  "sign-pdf",
  "add-signature",
  "add-image",
]);
export const INK_TOOLS = new Set(["draw-on-pdf"]);
