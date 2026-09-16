export type Guide = {
  slug: string;
  title: string;
  description: string;
  relatedTools: string[];
  sections: { heading: string; body: string }[];
};

export const GUIDES: Guide[] = [
  {
    slug: "how-to-compress-a-pdf",
    title: "How to compress a PDF",
    description: "Make a PDF small enough for email, job portals and school uploads without guessing which button is real.",
    relatedTools: ["compress-pdf", "reduce-pdf-size", "split-pdf"],
    sections: [
      {
        heading: "When compression helps",
        body: "Camera scans and photo-to-PDF files are usually too large for a 2 MB portal. Text PDFs exported from Word are often already small; compressing them may not help, and a good tool will tell you that.",
      },
      {
        heading: "Steps",
        body: "Open Compress PDF, drop the file, pick Balanced, and process on your device. If you are still over the limit, delete unused pages or use a stronger setting. Then download.",
      },
    ],
  },
  {
    slug: "how-to-merge-pdfs",
    title: "How to merge PDFs",
    description: "Combine a resume, certificates and a cover letter into one packet.",
    relatedTools: ["merge-pdf", "compress-pdf", "pdf-page-numbering"],
    sections: [
      {
        heading: "Order matters",
        body: "Add files in the order a reviewer should read them. Merge, then add page numbers so emails can cite “page 4”.",
      },
      {
        heading: "Size after merge",
        body: "Merged photo PDFs get big. Compress the result before you upload.",
      },
    ],
  },
  {
    slug: "how-to-convert-jpg-to-pdf",
    title: "How to convert JPG to PDF",
    description: "Turn phone photos of documents into a file that portals accept.",
    relatedTools: ["jpg-to-pdf", "merge-pdf", "compress-pdf"],
    sections: [
      {
        heading: "Typical workflow",
        body: "Convert each photo, merge if you have several, then compress. That sequence is the application-packet workflow on this site.",
      },
    ],
  },
  {
    slug: "how-to-convert-word-to-pdf",
    title: "How to convert Word to PDF",
    description: "Export an assignment or resume when the destination wants PDF.",
    relatedTools: ["word-to-pdf", "compress-pdf", "pdf-page-numbering"],
    sections: [
      {
        heading: "What you get here",
        body: "This converter keeps the words. It does not clone Word's layout engine. If the document is a designed flyer, print to PDF from Word, then use Hub for compress, merge and protect.",
      },
    ],
  },
  {
    slug: "how-to-extract-pages-from-pdf",
    title: "How to extract pages from a PDF",
    description: "Send only the pages a form asked for.",
    relatedTools: ["extract-pdf-pages", "split-pdf", "delete-pdf-pages"],
    sections: [
      {
        heading: "Extract vs split",
        body: "Extract builds one PDF from a range. Split can also emit one file per page in a ZIP. Use extract when a portal wants a single file.",
      },
    ],
  },
];

export function getGuide(slug: string) {
  return GUIDES.find((g) => g.slug === slug);
}
