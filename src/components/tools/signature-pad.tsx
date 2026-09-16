"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function SignaturePad({ value, onChange }: { value: string; onChange: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(!value);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fffdf8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1c2430";
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = value;
    }
  }, [value]);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  return (
    <div className="mt-4">
      <p className="mb-2 text-sm font-medium">Draw your signature</p>
      <canvas
        ref={canvasRef}
        width={560}
        height={180}
        className="h-36 w-full touch-none rounded-xl border bg-background"
        onPointerDown={(e) => {
          drawing.current = true;
          const ctx = canvasRef.current?.getContext("2d");
          const p = pos(e);
          ctx?.beginPath();
          ctx?.moveTo(p.x, p.y);
          (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const ctx = canvasRef.current?.getContext("2d");
          const p = pos(e);
          ctx?.lineTo(p.x, p.y);
          ctx?.stroke();
          setEmpty(false);
        }}
        onPointerUp={() => {
          drawing.current = false;
          const canvas = canvasRef.current;
          if (canvas) onChange(canvas.toDataURL("image/png"));
        }}
      />
      <div className="mt-2 flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext("2d");
            if (!canvas || !ctx) return;
            ctx.fillStyle = "#fffdf8";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            setEmpty(true);
            onChange("");
          }}
        >
          Clear
        </Button>
        <p className="self-center text-xs text-muted-foreground">{empty ? "Or type a name below for a printed signature." : "Signature captured."}</p>
      </div>
    </div>
  );
}
