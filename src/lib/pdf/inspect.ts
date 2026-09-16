import { loadPdf } from "@/lib/pdf/helpers";
import { getPdfJs } from "@/lib/pdf/pdfjs";

export type Thumb = { page: number; url: string };

export async function renderThumbnails(
  bytes: Uint8Array,
  options?: { max?: number; scale?: number },
): Promise<{ pageCount: number; thumbs: Thumb[] }> {
  const pdfjs = await getPdfJs();
  const pdf = await pdfjs.getDocument({ data: bytes.slice() }).promise;
  const max = Math.min(pdf.numPages, options?.max ?? 40);
  const thumbs: Thumb[] = [];
  for (let i = 1; i <= max; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: options?.scale ?? 0.28 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;
    await page.render({ canvasContext: ctx, viewport, canvas } as never).promise;
    thumbs.push({ page: i, url: canvas.toDataURL("image/jpeg", 0.62) });
  }
  const pageCount = pdf.numPages;
  await pdf.cleanup();
  return { pageCount, thumbs };
}

export type FormFieldInfo = {
  name: string;
  kind: "text" | "checkbox" | "dropdown" | "radio" | "other";
};

export async function listFormFields(bytes: Uint8Array): Promise<FormFieldInfo[]> {
  const doc = await loadPdf(bytes);
  return doc.getForm().getFields().map((field) => {
    const ctor = field.constructor.name;
    const kind: FormFieldInfo["kind"] = /CheckBox/i.test(ctor)
      ? "checkbox"
      : /Radio/i.test(ctor)
        ? "radio"
        : /Dropdown|OptionList/i.test(ctor)
          ? "dropdown"
          : /TextField/i.test(ctor)
            ? "text"
            : "other";
    return { name: field.getName(), kind };
  });
}
