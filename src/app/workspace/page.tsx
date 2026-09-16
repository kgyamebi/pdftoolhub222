"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatBytes } from "@/lib/format";
import { clearWorkspace, deleteWorkspaceDoc, getCurrentDoc, listRecentDocs, type WorkspaceDoc } from "@/lib/workspace/store";
import { cn } from "@/lib/utils";

export default function WorkspacePage() {
  const [current, setCurrent] = useState<WorkspaceDoc | undefined>();
  const [recent, setRecent] = useState<WorkspaceDoc[]>([]);

  async function refresh() {
    setCurrent(await getCurrentDoc());
    setRecent(await listRecentDocs());
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Your document</h1>
      <p className="mt-3 text-muted-foreground">
        After each successful PDF operation, the result stays here for about two hours so you can chain tools without starting over. Files live in this browser only.
      </p>
      {!current && (
        <div className="mt-8 rounded-2xl border bg-card p-8">
          <p className="font-medium">No recent documents yet.</p>
          <p className="mt-2 text-sm text-muted-foreground">Upload your first PDF to get started.</p>
          <Link href="/compress-pdf" className={cn(buttonVariants({ className: "mt-4" }))}>
            Upload a PDF
          </Link>
        </div>
      )}
      {current && (
        <div className="mt-8 rounded-2xl border bg-card p-5">
          <p className="text-xs tracking-wide text-primary uppercase">Current file</p>
          <h2 className="mt-1 text-lg font-medium">{current.name}</h2>
          <p className="text-sm text-muted-foreground">
            {formatBytes(current.size)} · last tool: {current.sourceTool ?? "upload"}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/compress-pdf?from=workspace" className={cn(buttonVariants({ size: "sm" }))}>
              Compress
            </Link>
            <Link href="/sign-pdf?from=workspace" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              Sign
            </Link>
            <Link href="/protect-pdf?from=workspace" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              Protect
            </Link>
            <Link href="/watermark-pdf?from=workspace" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              Watermark
            </Link>
          </div>
        </div>
      )}
      {recent.length > 0 && (
        <ul className="mt-8 space-y-2">
          {recent.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
              <div>
                <p className="text-sm font-medium">{doc.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(doc.size)}</p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => deleteWorkspaceDoc(doc.id).then(refresh)}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
      {(current || recent.length > 0) && (
        <Button type="button" variant="outline" className="mt-6" onClick={() => clearWorkspace().then(refresh)}>
          Delete all local files
        </Button>
      )}
    </div>
  );
}
