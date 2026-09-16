import type { AcceptKind } from "@/lib/security/validate";

export type ToolSetting = {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "number" | "password";
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string;
  help?: string;
};

export type Faq = { q: string; a: string };

export type ToolDefinition = {
  slug: string;
  name: string;
  h1: string;
  tagline: string;
  description: string;
  category: string;
  icon: string;
  accepts: AcceptKind[];
  multiple: boolean;
  minFiles?: number;
  extraImage?: boolean;
  output: "pdf" | "zip" | "text" | "office";
  popular?: boolean;
  premium?: boolean;
  local: boolean;
  settings: ToolSetting[];
  related: string[];
  nextActions: string[];
  phrases: string[];
  howTo: string[];
  faqs: Faq[];
  guide: { title: string; paragraphs: string[] };
};

export type CategoryDefinition = {
  slug: string;
  name: string;
  h1: string;
  tagline: string;
  description: string;
  icon: string;
};

export const CATEGORIES: CategoryDefinition[] = [
  {
    slug: "pdf-tools",
    name: "All PDF tools",
    h1: "All PDF tools",
    tagline: "Every document tool in one place.",
    description: "Browse convert, compress, organize, edit, protect, form and intelligence tools. Each page is a working tool — not a teaser.",
    icon: "LayoutGrid",
  },
  {
    slug: "organize-pdf",
    name: "Organize PDF",
    h1: "Organize PDF pages",
    tagline: "Merge, split, rotate, reorder and extract pages.",
    description: "Put pages in the right order without sending files to a mystery server. Organization tools run in your browser.",
    icon: "Layers",
  },
  {
    slug: "convert-pdf",
    name: "Convert PDF",
    h1: "Convert PDF files",
    tagline: "Move between PDF, images and office documents.",
    description: "Turn pictures into PDFs, export pages as images, or pull text into Word and Excel. Conversions that need layout fidelity are labeled honestly.",
    icon: "RefreshCw",
  },
  {
    slug: "compress-pdf",
    name: "Compress PDF",
    h1: "Compress and reduce PDF size",
    tagline: "Make PDFs smaller for email, portals and uploads.",
    description: "Shrink large PDFs for job portals, school uploads and email limits. You see the new size before you download.",
    icon: "Minimize2",
  },
  {
    slug: "edit-pdf",
    name: "Edit PDF",
    h1: "Edit PDF files",
    tagline: "Add text, images, marks and page furniture.",
    description: "Stamp text, images, highlights, headers and signatures onto a PDF without installing desktop software.",
    icon: "PenLine",
  },
  {
    slug: "pdf-security",
    name: "PDF security",
    h1: "Protect and unlock PDFs",
    tagline: "Passwords, signatures and authorized decryption.",
    description: "Encrypt a PDF with a real password, or remove protection when you already know it. Files are not published at a guessable URL.",
    icon: "Shield",
  },
  {
    slug: "pdf-forms",
    name: "PDF forms",
    h1: "Fill and create PDF forms",
    tagline: "Work with fillable fields.",
    description: "Fill existing AcroForm fields or add a simple name and email form to a page.",
    icon: "ClipboardList",
  },
  {
    slug: "ocr-pdf",
    name: "OCR PDF",
    h1: "OCR and document intelligence",
    tagline: "Read scans, extract text and ask questions.",
    description: "Optical character recognition runs on your device. Summaries that don't need a cloud key are extractive and labeled as such.",
    icon: "ScanText",
  },
  {
    slug: "ai-pdf-tools",
    name: "AI PDF tools",
    h1: "AI PDF tools",
    tagline: "Summarize, ask, compare — with honest limits.",
    description: "On-device extractive summaries always work. Generative translation waits for an AI provider key and will not pretend to succeed without one.",
    icon: "Sparkles",
  },
  {
    slug: "image-tools",
    name: "Image tools",
    h1: "Image to PDF and back",
    tagline: "JPG, PNG and WebP conversions.",
    description: "Build a PDF from photos, or export each PDF page as an image. Processing stays in the browser.",
    icon: "Image",
  },
  {
    slug: "document-tools",
    name: "Document tools",
    h1: "Office document tools",
    tagline: "Word, Excel and PowerPoint paths into and out of PDF.",
    description: "These conversions prioritize readable content over pixel-perfect layout. Each tool page explains what you will get.",
    icon: "FileType",
  },
  {
    slug: "business-tools",
    name: "Business tools",
    h1: "Business document workflows",
    tagline: "Watermark, sign, protect and send.",
    description: "Common office sequences — watermark then sign then protect — without trapping you in an account wall.",
    icon: "Briefcase",
  },
];
