"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchTools } from "@/lib/tools/search";
import { track } from "@/lib/analytics";

export function ToolSearch({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const results = useMemo(() => searchTools(query, 8), [query]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={root} className={compact ? "relative w-full" : "relative w-full max-w-xl"}>
      <label className="sr-only" htmlFor="tool-search">
        Search tools
      </label>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id="tool-search"
        value={query}
        placeholder="Try “make my PDF smaller” or “combine files”"
        className="h-11 bg-card pl-9 text-sm"
        autoComplete="off"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      />
      {open && query.trim() && (
        <ul
          role="listbox"
          className="absolute z-40 mt-2 w-full overflow-hidden rounded-xl border bg-popover p-1 shadow-lg"
        >
          {results.length === 0 && (
            <li className="px-3 py-3 text-sm text-muted-foreground">No tools match that. Try “compress”, “merge”, or “jpg”.</li>
          )}
          {results.map((tool) => (
            <li key={tool.slug} role="option">
              <Link
                href={`/${tool.slug}`}
                className="block rounded-lg px-3 py-2 hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                onClick={() => {
                  track({ name: "search", extra: query, tool: tool.slug });
                  setOpen(false);
                }}
              >
                <div className="text-sm font-medium">{tool.name}</div>
                <div className="text-xs text-muted-foreground">{tool.tagline}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
