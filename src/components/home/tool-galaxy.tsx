"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { getTool } from "@/lib/tools/registry";
import { ToolIcon } from "@/components/tools/tool-card";

const CLUSTERS = [
  { name: "Organize", tools: ["merge-pdf", "split-pdf", "extract-pdf-pages", "rearrange-pdf-pages"] },
  { name: "Convert", tools: ["jpg-to-pdf", "word-to-pdf", "pdf-to-jpg", "excel-to-pdf"] },
  { name: "Edit", tools: ["edit-pdf", "watermark-pdf", "add-text", "draw-on-pdf"] },
  { name: "Sign", tools: ["sign-pdf", "add-signature"] },
  { name: "Protect", tools: ["protect-pdf", "unlock-pdf", "encrypt-pdf"] },
  { name: "Forms", tools: ["fill-pdf", "create-pdf-form"] },
  { name: "OCR", tools: ["ocr-pdf", "extract-text"] },
  { name: "AI helpers", tools: ["pdf-summarizer", "ask-pdf", "compare-pdfs"] },
] as const;

export function ToolGalaxy() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Discover</p>
      <h2 className="font-heading mt-2 text-3xl font-semibold tracking-tight">A galaxy of jobs, not a dump of links.</h2>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Hover a cluster. Every node is a working tool — local when it can be, honest when it cannot.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {CLUSTERS.map((cluster, i) => (
          <motion.div
            key={cluster.name}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.04, duration: 0.4 }}
            className="glass hairline rounded-3xl p-5"
          >
            <h3 className="text-sm font-medium tracking-wide uppercase">{cluster.name}</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {cluster.tools.map((slug) => {
                const tool = getTool(slug);
                if (!tool) return null;
                return (
                  <Link
                    key={slug}
                    href={`/${slug}`}
                    className="group inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-2 text-sm transition-transform hover:-translate-y-0.5 hover:border-primary/40"
                  >
                    <ToolIcon name={tool.icon} className="size-4 text-primary" />
                    {tool.name}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
