"use client";

import { useMemo, useState } from "react";
import { ToolSearch } from "@/components/search/tool-search";
import { ToolCardRow } from "@/components/tools/tool-card";
import { searchTools } from "@/lib/tools/search";
import { popularTools } from "@/lib/tools/registry";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const results = useMemo(() => (q.trim() ? searchTools(q, 16) : popularTools()), [q]);
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Search tools</h1>
      <p className="mt-2 text-muted-foreground">
        Natural phrases work: “make my PDF smaller”, “combine these files”, “turn this picture into a PDF”.
      </p>
      <div className="mt-6">
        <ToolSearch />
      </div>
      <label className="mt-6 block text-sm font-medium" htmlFor="q">
        Filter results
      </label>
      <input
        id="q"
        className="mt-1.5 h-10 w-full rounded-lg border px-3 text-sm"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Type to filter the grid"
      />
      <ToolCardRow className="mt-6" tools={results} />
    </div>
  );
}
