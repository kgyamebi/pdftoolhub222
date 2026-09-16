"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/components/auth/session";
import { Button, buttonVariants } from "@/components/ui/button";
import { favoriteTools, recentTools, toggleFavorite } from "@/lib/analytics";
import { getTool } from "@/lib/tools/registry";
import { getPlan, setPlan, usageSnapshot } from "@/lib/usage";
import { cn } from "@/lib/utils";

export default function AccountPage() {
  const { user, loading, signOut } = useSession();
  const [plan, setPlanState] = useState<"free" | "premium">("free");
  const [usage, setUsage] = useState({ remaining: 0, max: 10, count: 0 });
  const [recent, setRecent] = useState<string[]>([]);
  const [favs, setFavs] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setPlanState(getPlan());
    setUsage(usageSnapshot());
    setRecent(recentTools());
    setFavs(favoriteTools());
    setName(localStorage.getItem("pth:name") || "");
    if (new URLSearchParams(window.location.search).get("signedin")) {
      setNotice("Signed in. Your PDFs still never leave this device.");
    }
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Account</h1>
      <p className="mt-3 text-muted-foreground">
        Basic tools never require an account. Sign in with Google, Microsoft 365, or email if you want a named profile.
        Files still process in the browser.
      </p>
      {notice && (
        <p className="mt-4 rounded-xl border border-[color-mix(in_oklab,var(--trust)_28%,transparent)] bg-[color-mix(in_oklab,var(--trust)_8%,transparent)] px-3 py-2 text-sm text-[color:var(--trust)]">
          {notice}
        </p>
      )}
      <div className="glass hairline mt-8 rounded-2xl p-5">
        {loading ? (
          <p className="text-sm text-muted-foreground">Checking sign-in…</p>
        ) : user ? (
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">Signed in</p>
              <h2 className="mt-1 text-lg font-medium">{user.name || user.email}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="mt-1 text-xs text-muted-foreground">via {user.provider}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={async () => {
                await signOut();
                window.location.href = "/login";
              }}
            >
              Sign out
            </Button>
          </div>
        ) : (
          <div>
            <h2 className="font-medium">No account on this browser</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Continue with Google, Microsoft, or a magic email link. You can skip this and still use every local tool.
            </p>
            <Link href="/login" className={cn(buttonVariants({ className: "mt-4" }))}>
              Sign in
            </Link>
          </div>
        )}
      </div>
      <form
        className="mt-6 rounded-2xl border bg-card p-5"
        onSubmit={(e) => {
          e.preventDefault();
          localStorage.setItem("pth:name", name);
        }}
      >
        <label className="text-sm font-medium" htmlFor="display-name">
          Display name on this device (optional)
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
