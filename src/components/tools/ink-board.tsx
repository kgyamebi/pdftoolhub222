"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { bytesOf } from "@/lib/pdf/helpers";
import { renderThumbnails } from "@/lib/pdf/inspect";
import { stringifyStrokes, type Stroke } from "@/lib/pdf/strokes";

export function InkBoard({
  file,
  value,
  onChange,
}: {
  file: File;
  value: string;
  onChange: (strokesJson: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const strokes = useRef<Stroke[]>([]);
  const current = useRef<Stroke>({ points: [] });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let live = true;
    bytesOf(file)
      .then((bytes) => renderThumbnails(bytes, { max: 1, scale: 1.1 }))
      .then((result) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        const url = result.thumbs[0]?.url;
        if (!live || !canvas || !ctx || !url) return;
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          ctx.strokeStyle = "#b4532a";
          ctx.lineWidth = 2.2;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          setReady(true);
        };
        img.src = url;
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [file]);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      canvasX: ((e.clientX - rect.left) / rect.width) * canvas.width,
      canvasY: ((e.clientY - rect.top) / rect.height) * canvas.height,
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: (1 - (e.clientY - rect.top) / rect.height) * 100,
    };
  }

  return (
    <div className="mt-4">
      <p className="mb-2 text-sm font-medium">Draw on the page</p>
      <canvas
        ref={canvasRef}
        className="h-auto w-full touch-none rounded-xl border bg-muted"
        onPointerDown={(e) => {
          if (!ready) return;
          drawing.current = true;
          const p = pos(e);
          current.current = { points: [{ x: p.x, y: p.y }] };
          const ctx = canvasRef.current?.getContext("2d");
          ctx?.beginPath();
          ctx?.moveTo(p.canvasX, p.canvasY);
          (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const p = pos(e);
          current.current.points.push({ x: p.x, y: p.y });
          const ctx = canvasRef.current?.getContext("2d");
          ctx?.lineTo(p.canvasX, p.canvasY);
          ctx?.stroke();
        }}
        onPointerUp={() => {
          drawing.current = false;
          if (current.current.points.length >= 2) {
            strokes.current = [...strokes.current, current.current];
            onChange(stringifyStrokes(strokes.current));
          }
        }}
      />
      <div className="mt-2 flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            strokes.current = [];
            onChange("");
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext("2d");
            if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
            setReady(false);
            bytesOf(file)
              .then((bytes) => renderThumbnails(bytes, { max: 1, scale: 1.1 }))
              .then((result) => {
                const img = new Image();
                img.onload = () => {
                  if (!canvas || !ctx) return;
                  canvas.width = img.width;
                  canvas.height = img.height;
                  ctx.drawImage(img, 0, 0);
                  ctx.strokeStyle = "#b4532a";
                  ctx.lineWidth = 2.2;
                  ctx.lineCap = "round";
                  setReady(true);
                };
                img.src = result.thumbs[0]?.url ?? "";
              })
              .catch(() => undefined);
          }}
        >
          Clear drawing
        </Button>
        <p className="self-center text-xs text-muted-foreground">
          {value ? "Ink captured. Process to stamp it onto the PDF." : "Use a finger or mouse. This is a mark, not a certified signature."}
        </p>
      </div>
    </div>
  );
}
