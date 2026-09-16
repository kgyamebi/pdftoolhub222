"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRightIcon, LockIcon, SmartphoneIcon, ZapIcon } from "lucide-react";
import { ToolSearch } from "@/components/search/tool-search";
import { FileUploader } from "@/components/tools/uploader";
import { buttonVariants } from "@/components/ui/button";
import { popularTools } from "@/lib/tools/registry";
import { ToolCardRow } from "@/components/tools/tool-card";
import { guessTool } from "@/lib/tools/guess";
import { saveWorkspaceDoc } from "@/lib/workspace/store";
import { cn } from "@/lib/utils";

export function HomeHero() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const popular = popularTools();

  async function continueWith(slug: string) {
    if (files[0]) {
      await saveWorkspaceDoc({
        name: files[0].name,
        mime: files[0].type || "application/pdf",
        size: files[0].size,
        blob: files[0],
        sourceTool: "home",
      });
    }
    router.push(`/${slug}?from=workspace`);
  }

  return (
    <section className="relative overflow-hidden border-b bg-[color:var(--paper)]">
      <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(180,83,42,0.12), transparent 40%), radial-gradient(circle at 80% 0%, rgba(47,111,78,0.08), transparent 35%)" }} />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">PDF Tools Hub</p>
          <h1 className="font-heading mt-3 max-w-xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Everything you need to work with PDFs.
          </h1>
          <p className="mt-4 max-w-lg text-lg text-muted-foreground">
            Convert, compress, edit, organize, protect and understand your documents — in the browser, without an account.
          </p>
          <div className="mt-6 max-w-lg">
            <ToolSearch />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/pdf-tools" className={cn(buttonVariants({ size: "lg" }))}>
              Explore all tools
            </Link>
            <Link href="/workflows" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
              See workflows
            </Link>
          </div>
          <ul className="mt-8 grid gap-3 text-sm sm:grid-cols-3">
            <li className="flex gap-2">
              <ZapIcon className="mt-0.5 size-4 text-primary" />
              Fast local processing
            </li>
            <li className="flex gap-2">
              <LockIcon className="mt-0.5 size-4 text-primary" />
              Files stay on your device
            </li>
            <li className="flex gap-2">
              <SmartphoneIcon className="mt-0.5 size-4 text-primary" />
              Built for phones too
            </li>
          </ul>
        </div>
        <div className="rounded-3xl border bg-card p-5 shadow-sm">
          <h2 className="font-medium">Upload a PDF</h2>
          <p className="mt-1 text-sm text-muted-foreground">Drop a file. We’ll keep it in your workspace and send you to a useful next step.</p>
          <div className="mt-4">
            <FileUploader files={files} onChange={setFiles} accepts={["any-doc"]} multiple />
          </div>
          {files.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className={cn(buttonVariants())} onClick={() => continueWith(guessTool(files[0]))}>
                Continue <ArrowRightIcon />
              </button>
              <button type="button" className={cn(buttonVariants({ variant: "outline" }))} onClick={() => continueWith("compress-pdf")}>
                Compress
              </button>
              <button type="button" className={cn(buttonVariants({ variant: "outline" }))} onClick={() => continueWith("merge-pdf")}>
                Merge
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="relative mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <h2 className="font-heading text-2xl font-semibold">Popular tools</h2>
        <p className="mt-1 text-sm text-muted-foreground">Start with the jobs people actually have.</p>
        <ToolCardRow className="mt-5" tools={popular} />
      </div>
    </section>
  );
}
