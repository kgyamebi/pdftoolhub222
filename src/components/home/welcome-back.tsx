"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { recentTools } from "@/lib/analytics";
import { getTool } from "@/lib/tools/registry";

export function WelcomeBack() {
  const [slugs, setSlugs] = useState<string[]>([]);
  useEffect(() => {
    setSlugs(recentTools(4));
  }, []);
  if (!slugs.length) return null;
  return (
    <section className="border-b bg-card">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <p className="text-sm font-medium">Welcome back. Continue where you left off.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {slugs.map((slug) => {
            const tool = getTool(slug);
            if (!tool) return null;
            return (
              <Link key={slug} href={`/${slug}`} className="rounded-full border bg-background px-3 py-1.5 text-sm hover:border-primary">
                {tool.name}
              </Link>
            );
          })}
          <Link href="/workspace" className="rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">
            Workspace
          </Link>
        </div>
      </div>
    </section>
  );
}
