import { PdfHubError } from "@/lib/pdf/errors";

export async function getPdfJs() {
  if (typeof window === "undefined") {
    throw new PdfHubError(
      "browser_only",
      "This step needs to run in your browser.",
      "Open the tool on the website — preview and image conversion are local.",
    );
  }
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return pdfjs;
}

export async function renderPageCanvas(
  bytes: Uint8Array,
  pageNumber: number,
  scale = 1.5,
): Promise<HTMLCanvasElement> {
  const pdfjs = await getPdfJs();
  const task = pdfjs.getDocument({ data: bytes.slice() });
  const pdf = await task.promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new PdfHubError("preview", "Couldn't create a preview canvas.", "Try a smaller file.");
  const params = { canvasContext: ctx, viewport, canvas };
  await page.render(params as never).promise;
  await pdf.cleanup();
  return canvas;
}

export async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const pdfjs = await getPdfJs();
  const task = pdfjs.getDocument({ data: bytes.slice() });
  const pdf = await task.promise;
  const parts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    parts.push(line);
  }
  await pdf.cleanup();
  return parts.join("\n\n").replace(/[ \t]+/g, " ").trim();
}
