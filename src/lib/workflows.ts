export type WorkflowStep = { tool: string; label: string };

export type Workflow = {
  slug: string;
  name: string;
  audience: string;
  description: string;
  steps: WorkflowStep[];
};

export const WORKFLOWS: Workflow[] = [
  {
    slug: "application-packet",
    name: "Application packet",
    audience: "Job seekers & students",
    description: "Photos of documents become one compressed PDF you can upload to a portal.",
    steps: [
      { tool: "jpg-to-pdf", label: "Convert images" },
      { tool: "merge-pdf", label: "Merge into one file" },
      { tool: "compress-pdf", label: "Compress for the size cap" },
      { tool: "pdf-page-numbering", label: "Add page numbers" },
    ],
  },
  {
    slug: "student-assignment",
    name: "Student assignment",
    audience: "Students",
    description: "Word to PDF, then compress and number pages before the LMS deadline.",
    steps: [
      { tool: "word-to-pdf", label: "Word to PDF" },
      { tool: "compress-pdf", label: "Compress" },
      { tool: "pdf-page-numbering", label: "Page numbers" },
    ],
  },
  {
    slug: "business-document",
    name: "Business document",
    audience: "Teams",
    description: "Watermark, sign and password-protect a file before it leaves the laptop.",
    steps: [
      { tool: "watermark-pdf", label: "Watermark" },
      { tool: "sign-pdf", label: "Sign" },
      { tool: "protect-pdf", label: "Protect" },
    ],
  },
  {
    slug: "job-application",
    name: "Job application",
    audience: "Job seekers",
    description: "Resume plus supporting pages, compressed for ATS portals.",
    steps: [
      { tool: "word-to-pdf", label: "Resume to PDF" },
      { tool: "merge-pdf", label: "Merge supporting docs" },
      { tool: "compress-pdf", label: "Final compress" },
    ],
  },
  {
    slug: "building-document",
    name: "Building document",
    audience: "Offices",
    description: "Many PDFs become one ordered, numbered, watermarked packet.",
    steps: [
      { tool: "merge-pdf", label: "Merge" },
      { tool: "rearrange-pdf-pages", label: "Rearrange" },
      { tool: "watermark-pdf", label: "Watermark" },
      { tool: "pdf-page-numbering", label: "Number pages" },
      { tool: "compress-pdf", label: "Compress" },
    ],
  },
];

export function getWorkflow(slug: string) {
  return WORKFLOWS.find((w) => w.slug === slug);
}
