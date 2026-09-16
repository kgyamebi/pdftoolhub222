"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { recentTools } from "@/lib/analytics";
import { recordVisit, todayActivity, visitStreak } from "@/lib/retention";
import { getTool } from "@/lib/tools/registry";

export function WelcomeBack() {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [activity, setActivity] = useState({ completed: 0, remaining: 10, max: 10 });

  useEffect(() => {
    recordVisit();
    setSlugs(recentTools(4));
    setStreak(visitStreak());
    setActivity(todayActivity());
  }, []);

  if (!slugs.length && !activity.completed) return null;

  return (
    <section className="border-b">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-sm font-medium">Continue where you left off.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {streak > 1 ? `${streak}-day streak. ` : ""}
            {activity.remaining}/{activity.max} local operations left today.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {slugs.map((slug) => {
            const tool = getTool(slug);
            if (!tool) return null;
            return (
              <Link key={slug} href={`/${slug}`} className="rounded-full border bg-card px-3 py-1.5 text-sm hover:border-primary">
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
