import Link from "next/link";
import { PrivacyPills } from "@/components/chrome/privacy";
import { buttonVariants } from "@/components/ui/button";
import type { CategoryDefinition } from "@/lib/tools/types";
import { cn } from "@/lib/utils";

const STORIES: Record<string, { capability: string; workflow: string[]; benefit: string; start: string }> = {
  "organize-pdf": {
    capability: "Merge, split, rotate, extract and reorder pages in the same tab.",
    workflow: ["Drop the packet", "Keep only the pages you need", "Number or merge the rest"],
    benefit: "Organization never needs a server. The workspace holds the result for the next honest step.",
    start: "/merge-pdf",
  },
  "convert-pdf": {
    capability: "Move between PDF, images and office files without a mystery upload.",
    workflow: ["Convert the source", "Compress if email limits bite", "Protect before you send"],
    benefit: "Each conversion page says exactly what you will get — layout-perfect or readable, never faked.",
    start: "/jpg-to-pdf",
  },
  "compress-pdf": {
    capability: "See the new size before you download. Shrink for portals, school uploads and email.",
    workflow: ["Compress", "Protect", "Sign if it is leaving the building"],
    benefit: "Raster work stays in the browser. You keep the original until you choose to replace it.",
    start: "/compress-pdf",
  },
  "edit-pdf": {
    capability: "Stamp text, images, ink, watermarks and page furniture onto a live preview.",
    workflow: ["Place the mark", "Watermark the packet", "Protect the finished file"],
    benefit: "Edits are local. Nothing is published at a guessable URL.",
    start: "/edit-pdf",
  },
  "pdf-security": {
    capability: "Real passwords, real encryption, unlock only when you already know the key.",
    workflow: ["Protect", "Sign", "Keep a workspace copy for two hours"],
    benefit: "We will not brute-force a lock or pretend a file was encrypted.",
    start: "/protect-pdf",
  },
  "pdf-forms": {
    capability: "Fill AcroForm fields — including checkboxes — or add a simple name and email form.",
    workflow: ["Inspect fields", "Fill on-device", "Protect the signed copy"],
    benefit: "Detected fields are the real ones in the file, not a screenshot overlay.",
    start: "/fill-pdf",
  },
  "ocr-pdf": {
    capability: "Read scans on this device, then extract, summarize or ask follow-up questions.",
    workflow: ["OCR the scan", "Extract text", "Summarize or export"],
    benefit: "Optical character recognition does not require an account. Generative extras wait for a real key.",
    start: "/ocr-pdf",
  },
  "ai-pdf-tools": {
    capability: "Extractive summaries always work. Translation waits for a provider and will not fake success.",
    workflow: ["Summarize", "Ask the PDF", "Compare two drafts"],
    benefit: "Intelligence tools are labeled honestly so you never download a hollow result.",
    start: "/pdf-summarizer",
  },
  "image-tools": {
    capability: "Build a PDF from photos, or export every page as an image.",
    workflow: ["Images to PDF", "Merge extras", "Compress for sending"],
    benefit: "Photo conversion stays in the browser with a live preview of what you dropped.",
    start: "/jpg-to-pdf",
  },
  "document-tools": {
    capability: "Word, Excel and PowerPoint paths that prioritize readable content over pixel-perfect layout.",
    workflow: ["Convert", "Compress", "Protect"],
    benefit: "Each page explains the fidelity you should expect before you start.",
    start: "/word-to-pdf",
  },
  "business-tools": {
    capability: "Office sequences — watermark, sign, protect — without an account wall.",
    workflow: ["Watermark", "Sign", "Protect"],
    benefit: "Stay in flow: the workspace keeps the file so the next person in the chain is you.",
    start: "/watermark-pdf",
  },
  "pdf-tools": {
    capability: "Every working tool in one catalog — compress, convert, edit, protect, OCR and more.",
    workflow: ["Pick a job", "Process locally", "Chain the next action"],
    benefit: "This is not a teaser directory. Every card below runs today.",
    start: "/compress-pdf",
  },
};

export function CategoryStory({ category, count }: { category: CategoryDefinition; count: number }) {
  const story = STORIES[category.slug] ?? STORIES["pdf-tools"];
  return (
    <div className="glass hairline overflow-hidden rounded-[2rem] p-6 sm:p-8">
      <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Category</p>
      <h1 className="font-heading mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">{category.h1}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{category.description}</p>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{story.capability}</p>
      <div className="mt-6">
        <PrivacyPills />
      </div>
      <ol className="mt-8 grid gap-3 sm:grid-cols-3">
        {story.workflow.map((step, i) => (
          <li key={step} className="rounded-2xl border bg-background/70 p-4">
            <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">Step {i + 1}</p>
            <p className="mt-1 font-medium">{step}</p>
          </li>
        ))}
      </ol>
      <p className="mt-6 max-w-2xl text-sm text-muted-foreground">{story.benefit}</p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link href={story.start} className={cn(buttonVariants())}>
          Start with a live tool
        </Link>
        <p className="text-xs text-muted-foreground">{count} working tools in this category</p>
      </div>
    </div>
  );
}
