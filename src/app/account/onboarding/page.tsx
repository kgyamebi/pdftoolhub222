"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { popularTools } from "@/lib/tools/registry";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const [picked, setPicked] = useState<string[]>([]);
  const tools = popularTools();
  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Welcome</h1>
      <p className="mt-3 text-muted-foreground">Choose interests to pin on your dashboard. You can skip this entirely.</p>
      <ul className="mt-6 space-y-2">
        {tools.map((tool) => (
          <li key={tool.slug}>
            <label className="flex items-center gap-3 rounded-xl border bg-card px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={picked.includes(tool.slug)}
                onChange={() =>
                  setPicked((p) => (p.includes(tool.slug) ? p.filter((s) => s !== tool.slug) : [...p, tool.slug]))
                }
              />
              {tool.name}
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex gap-2">
        <Button
          type="button"
          onClick={() => {
            localStorage.setItem("pth:interests", JSON.stringify(picked));
          }}
        >
          Save
        </Button>
        <Link href="/account" className={cn(buttonVariants({ variant: "outline" }))}>
          Skip
        </Link>
      </div>
    </div>
  );
}
