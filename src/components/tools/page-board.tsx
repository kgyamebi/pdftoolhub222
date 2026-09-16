"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bytesOf } from "@/lib/pdf/helpers";
import { renderThumbnails, type Thumb } from "@/lib/pdf/inspect";
import { renderPageCanvas } from "@/lib/pdf/pdfjs";
import { moveIndex } from "@/lib/pdf/reorder";
import { cn } from "@/lib/utils";

export function PageBoard({
  file,
  mode,
  selected,
  onChange,
  defaultAll = false,
  defaultLast = false,
}: {
  file: File;
  mode: "select" | "reorder";
  selected: number[];
  onChange: (pages: number[]) => void;
  defaultAll?: boolean;
  defaultLast?: boolean;
}) {
  const [thumbs, setThumbs] = useState<Thumb[]>([]);
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState("Reading pages…");
  const dragFrom = useRef<number | null>(null);

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
        } else if (!selected.length && defaultLast && result.pageCount) {
          onChange([result.pageCount]);
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
    onChange(moveIndex(selected, index, index + dir));
  }

  const shown = mode === "reorder" ? selected : thumbs.map((t) => t.page);

  return (
    <div className="mt-5">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">
          {mode === "reorder" ? "Drag pages to set the order" : "Click pages to include"}
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
            <li
              key={`${page}-${index}`}
              className="relative"
              draggable={mode === "reorder"}
              onDragStart={() => {
                dragFrom.current = index;
              }}
              onDragOver={(e) => {
                if (mode === "reorder") e.preventDefault();
              }}
              onDrop={() => {
                if (mode !== "reorder" || dragFrom.current == null) return;
                onChange(moveIndex(selected, dragFrom.current, index));
                dragFrom.current = null;
              }}
            >
              <button
                type="button"
                onClick={() => toggle(page)}
                className={cn(
                  "block w-full overflow-hidden rounded-lg border bg-background text-left ring-offset-2 focus-visible:ring-3 focus-visible:ring-ring/50",
                  active ? "border-primary ring-1 ring-primary/40" : "opacity-50",
                  mode === "reorder" && "cursor-grab active:cursor-grabbing",
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
  label = "Click the page to place the mark",
  marker,
  page = 1,
}: {
  file: File;
  x: number;
  y: number;
  onPlace: (x: number, y: number) => void;
  label?: string;
  marker?: string;
  page?: number;
}) {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    let live = true;
    bytesOf(file)
      .then((bytes) => renderPageCanvas(bytes, Math.max(1, page), 0.95))
      .then((canvas) => {
        if (live) setUrl(canvas.toDataURL("image/jpeg", 0.72));
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [file, page]);
  if (!url) {
    return <p className="mt-4 text-sm text-muted-foreground">Preparing a page preview…</p>;
  }
  return (
    <div className="mt-4">
      <p className="mb-2 text-sm font-medium">{label}</p>
      <button
        type="button"
        className="relative block w-full overflow-hidden rounded-xl border"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          onPlace(((e.clientX - rect.left) / rect.width) * 100, (1 - (e.clientY - rect.top) / rect.height) * 100);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="Page preview" className="w-full" />
        {marker ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={marker}
            alt=""
            className="pointer-events-none absolute h-12 w-auto -translate-x-1/2 translate-y-1/2"
            style={{ left: `${x}%`, bottom: `${y}%` }}
          />
        ) : (
          <span
            className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-2 ring-white"
            style={{ left: `${x}%`, bottom: `${y}%` }}
          />
        )}
      </button>
    </div>
  );
}
