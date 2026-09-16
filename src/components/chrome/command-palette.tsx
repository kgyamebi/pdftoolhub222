"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { searchTools } from "@/lib/tools/search";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function openCommandPalette() {
  window.dispatchEvent(new Event("pdfhub:command"));
}

const HINTS = ["make PDF smaller", "remove pages", "need a signature", "merge files"];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const results = useMemo(() => searchTools(query || "pdf", 8), [query]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("pdfhub:command", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pdfhub:command", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => input.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  function go(slug: string) {
    track({ name: "search", extra: query, tool: slug });
    setOpen(false);
    router.push(`/${slug}`);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Command palette">
      <button type="button" className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative mx-auto mt-[12vh] w-[min(100%-1.5rem,36rem)] overflow-hidden rounded-2xl border bg-popover shadow-[var(--shadow-lift)]">
        <div className="flex items-center gap-2 border-b px-3">
          <SearchIcon className="size-4 text-muted-foreground" />
          <input
            ref={input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((i) => Math.min(results.length - 1, i + 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((i) => Math.max(0, i - 1));
              }
              if (e.key === "Enter" && results[active]) {
                e.preventDefault();
                go(results[active].slug);
              }
            }}
            placeholder="Make PDF smaller, remove pages, need signature…"
            className="h-12 w-full bg-transparent text-sm outline-none"
            aria-label="Search tools"
            aria-activedescendant={results[active] ? `cmd-${results[active].slug}` : undefined}
          />
          <kbd className="hidden rounded-md border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">esc</kbd>
        </div>
        {!query && (
          <p className="border-b px-4 py-2 text-xs text-muted-foreground">
            Try {HINTS.map((h) => `“${h}”`).join(" · ")}
          </p>
        )}
        <ul className="max-h-80 overflow-auto p-1" role="listbox">
          {results.map((tool, i) => (
            <li key={tool.slug}>
              <button
                type="button"
                id={`cmd-${tool.slug}`}
                role="option"
                aria-selected={i === active}
                className={cn("flex w-full flex-col rounded-xl px-3 py-2.5 text-left", i === active ? "bg-muted" : "hover:bg-muted/60")}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(tool.slug)}
              >
                <span className="text-sm font-medium">{tool.name}</span>
                <span className="text-xs text-muted-foreground">{tool.tagline}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
