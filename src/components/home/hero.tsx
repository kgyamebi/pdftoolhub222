"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";
import { ToolSearch } from "@/components/search/tool-search";
import { FileUploader } from "@/components/tools/uploader";
import { PrivacyPills } from "@/components/chrome/privacy";
import { buttonVariants } from "@/components/ui/button";
import { guessTool } from "@/lib/tools/guess";
import { saveWorkspaceDoc } from "@/lib/workspace/store";
import { cn } from "@/lib/utils";

export function HomeHero() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);

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
    <section className="relative overflow-hidden border-b">
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-primary uppercase">Browser-native documents</p>
          <h1 className="font-heading mt-4 max-w-xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            Your files never leave this device.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">
            Compress, merge, extract, sign and protect in the browser. No account. No mystery upload. Stay in flow from one tool to the next.
          </p>
          <div className="mt-6 max-w-lg">
            <ToolSearch />
            <p className="mt-2 text-xs text-muted-foreground">
              Try “make my PDF smaller”. Or press{" "}
              <kbd className="rounded border px-1.5 py-0.5 font-sans">⌘K</kbd> anywhere.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/pdf-tools" className={cn(buttonVariants({ size: "lg" }))}>
              Explore all tools
            </Link>
            <Link href="/workspace" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
              Open workspace
            </Link>
          </div>
          <div className="mt-8">
            <PrivacyPills />
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="glass hairline rounded-3xl p-5"
        >
          <h2 className="font-medium">Drop a document</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            It stays in this browser. We’ll route you to a useful tool and keep the result for two hours.
          </p>
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
        </motion.div>
      </div>
    </section>
  );
}
