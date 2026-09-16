"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { favoriteTools, recentTools, toggleFavorite } from "@/lib/analytics";
import { getTool } from "@/lib/tools/registry";
import { getPlan, setPlan, usageSnapshot } from "@/lib/usage";
import { cn } from "@/lib/utils";

export default function AccountPage() {
  const [plan, setPlanState] = useState<"free" | "premium">("free");
  const [usage, setUsage] = useState({ remaining: 0, max: 10, count: 0 });
  const [recent, setRecent] = useState<string[]>([]);
  const [favs, setFavs] = useState<string[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    setPlanState(getPlan());
    setUsage(usageSnapshot());
    setRecent(recentTools());
    setFavs(favoriteTools());
    setName(localStorage.getItem("pth:name") || "");
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Account</h1>
      <p className="mt-3 text-muted-foreground">
        Basic tools never require an account. This page stores preferences in your browser so you can favorite tools and see usage. Server accounts can be wired later without changing the tool engine.
      </p>
      <form
        className="mt-8 rounded-2xl border bg-card p-5"
        onSubmit={(e) => {
          e.preventDefault();
          localStorage.setItem("pth:name", name);
        }}
      >
        <label className="text-sm font-medium" htmlFor="display-name">
          Display name (optional)
        </label>
        <input
          id="display-name"
          className="mt-1.5 h-9 w-full rounded-lg border border-input px-2.5 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit" className="mt-3" size="sm">
          Save locally
        </Button>
      </form>
      <div className="mt-6 rounded-2xl border bg-card p-5">
        <h2 className="font-medium">Usage today</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {usage.count} of {usage.max} operations on the {plan} plan. {usage.remaining} remaining.
        </p>
        <div className="mt-3 flex gap-2">
          <Button
            type="button"
            variant={plan === "free" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setPlan("free");
              setPlanState("free");
              setUsage(usageSnapshot());
            }}
          >
            Free
          </Button>
          <Button
            type="button"
            variant={plan === "premium" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setPlan("premium");
              setPlanState("premium");
              setUsage(usageSnapshot());
            }}
          >
            Preview Premium limits
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Premium preview only raises local limits. Real billing needs a payment provider key.</p>
      </div>
      <section className="mt-8">
        <h2 className="font-medium">Quick tools</h2>
        <p className="mt-1 text-sm text-muted-foreground">{recent.length ? "Continue where you left off." : "Use a tool and it will appear here."}</p>
        <ul className="mt-3 space-y-2">
          {recent.map((slug) => {
            const tool = getTool(slug);
            if (!tool) return null;
            return (
              <li key={slug} className="flex items-center justify-between rounded-xl border bg-card px-3 py-2">
                <Link href={`/${slug}`} className="text-sm hover:underline">
                  {tool.name}
                </Link>
                <Button type="button" size="sm" variant="ghost" onClick={() => setFavs(toggleFavorite(slug))}>
                  {favs.includes(slug) ? "Unfavorite" : "Favorite"}
                </Button>
              </li>
            );
          })}
        </ul>
      </section>
      <Link href="/account/onboarding" className={cn(buttonVariants({ variant: "outline", className: "mt-8" }))}>
        Optional onboarding
      </Link>
    </div>
  );
}
