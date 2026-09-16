"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { PrivacyPills } from "@/components/chrome/privacy";
import { formatBytes } from "@/lib/format";
import { favoriteTools, recentTools } from "@/lib/analytics";
import { recordVisit, todayActivity, visitStreak } from "@/lib/retention";
import { getTool } from "@/lib/tools/registry";
import { clearWorkspace, deleteWorkspaceDoc, getCurrentDoc, listRecentDocs, type WorkspaceDoc } from "@/lib/workspace/store";
import { cn } from "@/lib/utils";

export default function WorkspacePage() {
  const [current, setCurrent] = useState<WorkspaceDoc | undefined>();
  const [recent, setRecent] = useState<WorkspaceDoc[]>([]);
  const [tools, setTools] = useState<string[]>([]);
  const [favs, setFavs] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [activity, setActivity] = useState({ completed: 0, remaining: 10, max: 10 });

  async function refresh() {
    setCurrent(await getCurrentDoc());
    setRecent(await listRecentDocs());
  }

  useEffect(() => {
    recordVisit();
    refresh();
    setTools(recentTools(6));
    setFavs(favoriteTools());
    setStreak(visitStreak());
    setActivity(todayActivity());
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Local workspace</p>
      <h1 className="font-heading mt-2 text-4xl font-semibold tracking-tight">Your document, on this device.</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        After each successful PDF operation, the result stays here for about two hours so you can chain tools without starting over.
      </p>
      <div className="mt-5">
        <PrivacyPills />
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="glass hairline rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">Today</p>
          <p className="mt-1 text-2xl font-medium">{activity.completed}</p>
          <p className="text-xs text-muted-foreground">completed operations</p>
        </div>
        <div className="glass hairline rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">Remaining</p>
          <p className="mt-1 text-2xl font-medium">
            {activity.remaining}/{activity.max}
          </p>
          <p className="text-xs text-muted-foreground">free local ops</p>
        </div>
        <div className="glass hairline rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">Streak</p>
          <p className="mt-1 text-2xl font-medium">{streak || 1}d</p>
          <p className="text-xs text-muted-foreground">visits in this browser</p>
        </div>
      </div>
      {!current && (
        <div className="glass hairline mt-8 rounded-3xl p-8">
          <p className="font-medium">No recent documents yet.</p>
          <p className="mt-2 text-sm text-muted-foreground">Upload your first PDF to get started. Nothing leaves this browser.</p>
          <Link href="/compress-pdf" className={cn(buttonVariants({ className: "mt-4" }))}>
            Compress a PDF
          </Link>
        </div>
      )}
      {current && (
        <div className="glass hairline mt-8 rounded-3xl p-6">
          <p className="text-xs tracking-wide text-primary uppercase">Continue last task</p>
          <h2 className="mt-1 text-xl font-medium">{current.name}</h2>
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
      {favs.length > 0 && (
        <div className="mt-10">
          <h2 className="font-heading text-xl font-semibold">Favorite tools</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {favs.map((slug) => {
              const tool = getTool(slug);
              if (!tool) return null;
              return (
                <Link key={slug} href={`/${slug}?from=workspace`} className="rounded-full border bg-card px-3 py-1.5 text-sm hover:border-primary">
                  {tool.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
      {tools.length > 0 && (
        <div className="mt-10">
          <h2 className="font-heading text-xl font-semibold">Suggested tools</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {tools.map((slug) => {
              const tool = getTool(slug);
              if (!tool) return null;
              return (
                <Link key={slug} href={`/${slug}?from=workspace`} className="rounded-full border bg-card px-3 py-1.5 text-sm hover:border-primary">
                  {tool.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
      {recent.length > 0 && (
        <ul className="mt-8 space-y-2">
          {recent.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3">
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
