"use client";

import Link from "next/link";
import { CommandIcon, FolderOpenIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { openCommandPalette } from "@/components/chrome/command-palette";
import type { ToolDefinition } from "@/lib/tools/types";
import { cn } from "@/lib/utils";

export function MobileDock({ next, local }: { next: ToolDefinition[]; local: boolean; }) {
  const primary = next[0];
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 lg:hidden">
      <div className="pointer-events-auto mx-auto max-w-lg border-t bg-background/92 px-3 pt-2 pb-[max(0.65rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_-24px_rgba(18,21,26,0.45)] backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <p className="min-w-0 flex-1 truncate text-[11px] font-medium tracking-wide text-[color:var(--trust)] uppercase">
            {local ? "Local · no upload" : "Honest limits"}
          </p>
          <button
            type="button"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            onClick={openCommandPalette}
            aria-label="Open command palette"
          >
            <CommandIcon />
          </button>
          <Link href="/workspace" className={cn(buttonVariants({ variant: "outline", size: "sm" }))} aria-label="Open workspace">
            <FolderOpenIcon />
          </Link>
          {primary && (
            <Link href={`/${primary.slug}?from=workspace`} className={cn(buttonVariants({ size: "sm" }))}>
              {primary.name}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
