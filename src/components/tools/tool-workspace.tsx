"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MobileDock } from "@/components/chrome/mobile-dock";
import { PrivacyRail } from "@/components/chrome/privacy";
import { ToolIcon } from "@/components/tools/tool-card";
import { buttonVariants } from "@/components/ui/button";
import { recentTools } from "@/lib/analytics";
import { formatBytes } from "@/lib/format";
import { nextActionsFor } from "@/lib/tools/recommendations";
import { getTool, type ToolDefinition } from "@/lib/tools/registry";
import { getCurrentDoc, type WorkspaceDoc } from "@/lib/workspace/store";
import { cn } from "@/lib/utils";

export function ToolWorkspace({
  tool,
  categoryName,
  children,
}: {
  tool: ToolDefinition;
  categoryName?: string;
  children: React.ReactNode;
}) {
  const [doc, setDoc] = useState<WorkspaceDoc | undefined>();
  const [recent, setRecent] = useState<string[]>([]);
  const next = nextActionsFor(tool.slug, doc?.name);

  useEffect(() => {
    getCurrentDoc().then(setDoc);
    setRecent(recentTools(5));
  }, [tool.slug]);

  return (
    <div className="mx-auto max-w-[88rem] px-4 pt-6 pb-24 sm:px-6 lg:pb-10">
      <div className="mb-6">
        <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">{categoryName ?? "PDF tool"}</p>
        <h1 className="font-heading mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{tool.h1}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{tool.description}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[15rem_minmax(0,1fr)_16rem] lg:items-start">
        <aside className="hidden space-y-3 lg:block">
          <div className="glass hairline rounded-2xl p-4">
            <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">This session</p>
            {doc ? (
              <div className="mt-3">
                <p className="truncate text-sm font-medium">{doc.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(doc.size)} · {doc.sourceTool ?? "upload"}
                </p>
                <Link href="/workspace" className="mt-2 inline-block text-xs text-primary hover:underline">
                  Open workspace
                </Link>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Drop a file on this page. It stays in the browser.</p>
            )}
          </div>
          {recent.length > 0 && (
            <div className="glass hairline rounded-2xl p-4">
              <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Recent tools</p>
              <ul className="mt-3 space-y-1">
                {recent.map((slug) => {
                  const item = getTool(slug);
                  if (!item) return null;
                  return (
                    <li key={slug}>
                      <Link href={`/${slug}`} className="flex items-center gap-2 rounded-lg px-1 py-1.5 text-sm hover:bg-muted">
                        <ToolIcon name={item.icon} className="size-3.5 text-primary" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </aside>
        <div className="min-w-0">{children}</div>
        <aside className="space-y-3">
          <PrivacyRail local={tool.local} />
          {next.length > 0 && (
            <div className="glass hairline rounded-2xl p-4">
              <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Then keep going</p>
              <ul className="mt-3 space-y-2">
                {next.map((item) => (
                  <li key={item.slug}>
                    <Link href={`/${item.slug}?from=workspace`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full justify-start")}>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
      <MobileDock next={next} local={tool.local} />
    </div>
  );
}
