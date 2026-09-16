"use client";

import { useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bytesOf } from "@/lib/pdf/helpers";
import { renderThumbnails, type Thumb } from "@/lib/pdf/inspect";
import { cn } from "@/lib/utils";

export function PageBoard({
  file,
  mode,
  selected,
  onChange,
  defaultAll = false,
}: {
  file: File;
  mode: "select" | "reorder";
  selected: number[];
  onChange: (pages: number[]) => void;
  defaultAll?: boolean;
}) {
  const [thumbs, setThumbs] = useState<Thumb[]>([]);
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState("Reading pages…");

  useEffect(() => {
    let live = true;
    setStatus("Reading pages…");
    bytesOf(file)
      .then((bytes) => renderThumbnails(bytes))
      .then((result) => {
        if (!live) return;
        setThumbs(result.thumbs);
        setCount(result.pageCount);
        setStatus("");
        if (!selected.length && (mode === "reorder" || defaultAll)) {
          onChange(Array.from({ length: result.pageCount }, (_, i) => i + 1));
        }
      })
      .catch(() => {
        if (live) setStatus("Couldn't preview this PDF. You can still type a page range below.");
      });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  function toggle(page: number) {
    if (mode !== "select") return;
    const next = selected.includes(page) ? selected.filter((p) => p !== page) : [...selected, page].sort((a, b) => a - b);
    onChange(next);
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...selected];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    onChange(next);
  }

  const shown = mode === "reorder" ? selected : thumbs.map((t) => t.page);

  return (
    <div className="mt-5">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">
          {mode === "reorder" ? "Drag order with the arrows" : "Click pages to include"}
        </p>
        {mode === "select" && (
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => onChange(thumbs.map((t) => t.page))}>
              Select all
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => onChange([])}>
              Clear
            </Button>
          </div>
        )}
      </div>
      {status && <p className="text-sm text-muted-foreground">{status}</p>}
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {shown.map((page, index) => {
          const thumb = thumbs.find((t) => t.page === page);
          const active = mode === "reorder" || selected.includes(page);
          return (
            <li key={`${page}-${index}`} className="relative">
              <button
                type="button"
                onClick={() => toggle(page)}
                className={cn(
                  "block w-full overflow-hidden rounded-lg border bg-background text-left ring-offset-2 focus-visible:ring-3 focus-visible:ring-ring/50",
                  active ? "border-primary ring-1 ring-primary/40" : "opacity-50",
                )}
              >
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb.url} alt={`Page ${page}`} className="h-28 w-full object-contain bg-muted" />
                ) : (
                  <div className="flex h-28 items-center justify-center text-xs text-muted-foreground">Page {page}</div>
                )}
                <span className="block px-2 py-1 text-xs">{page}</span>
              </button>
              {mode === "reorder" && (
                <div className="absolute top-1 right-1 flex gap-0.5">
                  <Button type="button" size="icon-xs" variant="secondary" aria-label="Move earlier" onClick={() => move(index, -1)}>
                    <ChevronLeftIcon />
                  </Button>
                  <Button type="button" size="icon-xs" variant="secondary" aria-label="Move later" onClick={() => move(index, 1)}>
                    <ChevronRightIcon />
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {count > thumbs.length && thumbs.length > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">Showing the first {thumbs.length} of {count} pages. Use a page range for the rest.</p>
      )}
    </div>
  );
}

export function ClickPlacePreview({
  file,
  x,
  y,
  onPlace,
}: {
  file: File;
  x: number;
  y: number;
  onPlace: (x: number, y: number) => void;
}) {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    let live = true;
    bytesOf(file)
      .then((bytes) => renderThumbnails(bytes, { max: 1, scale: 0.9 }))
      .then((result) => {
        if (live) setUrl(result.thumbs[0]?.url);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [file]);
  if (!url) return null;
  return (
    <div className="mt-4">
      <p className="mb-2 text-sm font-medium">Click the page to place text</p>
      <button
        type="button"
        className="relative block overflow-hidden rounded-xl border"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          onPlace(((e.clientX - rect.left) / rect.width) * 100, (1 - (e.clientY - rect.top) / rect.height) * 100);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="Page preview" className="w-full" />
        <span
          className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-2 ring-white"
          style={{ left: `${x}%`, bottom: `${y}%` }}
        />
      </button>
    </div>
  );
}
