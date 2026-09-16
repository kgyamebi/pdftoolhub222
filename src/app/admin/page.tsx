"use client";

import { useEffect, useState } from "react";
import { LIMITS, PRICING } from "@/lib/config";
import { TOOLS } from "@/lib/tools/registry";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [secret, setSecret] = useState("");
  const [health, setHealth] = useState<string>("…");

  useEffect(() => {
    if (sessionStorage.getItem("pth:admin") === "1") setAuthed(true);
    fetch("/api/v1/health")
      .then((r) => r.json())
      .then((d) => setHealth(d.status ?? "ok"))
      .catch(() => setHealth("down"));
  }, []);

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="font-heading text-2xl font-semibold">Admin</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the admin secret from <code>ADMIN_PASSWORD</code>. In local development the default is empty — any non-empty value stored in this session is a demo gate only.
        </p>
        <input
          className="mt-4 h-9 w-full rounded-lg border px-2.5 text-sm"
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
        />
        <Button
          className="mt-3"
          type="button"
          onClick={() => {
            sessionStorage.setItem("pth:admin", "1");
            setAuthed(true);
          }}
        >
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold">Admin dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">System health: {health}. Limits and prices come from configuration, not from each tool.</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          ["Tools", String(TOOLS.length)],
          ["Free ops/day", String(LIMITS.maxOpsPerDayFree)],
          ["Premium monthly", `$${PRICING.premium.priceMonthly}`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">{k}</p>
            <p className="mt-1 text-2xl font-semibold">{v}</p>
          </div>
        ))}
      </div>
      <section className="mt-8 rounded-2xl border bg-card p-5">
        <h2 className="font-medium">Feature flags</h2>
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
          <li>Ads: {process.env.NEXT_PUBLIC_ADS_ENABLED === "true" ? "on" : "off"}</li>
          <li>Remote AI: {process.env.NEXT_PUBLIC_AI_ENABLED === "true" ? "on" : "off"}</li>
          <li>Payments: mock provider unless keys are set</li>
        </ul>
      </section>
      <section className="mt-6 rounded-2xl border bg-card p-5">
        <h2 className="font-medium">Registered tools</h2>
        <p className="mt-2 max-h-64 overflow-auto text-sm text-muted-foreground">{TOOLS.map((t) => t.slug).join(", ")}</p>
      </section>
    </div>
  );
}
