"use client";

const VERBS: Record<string, string[]> = {
  "compress-pdf": ["Reading pages", "Analyzing images", "Optimizing", "Writing a smaller file"],
  "protect-pdf": ["Opening the PDF", "Applying encryption", "Locking the file"],
  "encrypt-pdf": ["Opening the PDF", "Applying encryption", "Locking the file"],
  "unlock-pdf": ["Checking the password", "Decrypting locally", "Writing an unlocked copy"],
  "ocr-pdf": ["Rendering pages", "Reading text on-device", "Assembling the result"],
  "extract-text": ["Opening pages", "Extracting text", "Copying into a result"],
  "sign-pdf": ["Placing the signature", "Stamping the page", "Saving a signed copy"],
  "merge-pdf": ["Collecting files", "Stitching pages", "Writing one PDF"],
  "split-pdf": ["Reading pages", "Cutting the range", "Packaging the output"],
  "watermark-pdf": ["Reading pages", "Stamping the mark", "Saving the overlay"],
};

export function ProcessTheater({
  tool,
  stage,
  percent,
}: {
  tool: string;
  stage: string;
  percent: number;
}) {
  const steps = VERBS[tool] ?? ["Keeping the file on this device", "Working in the browser", "Finishing"];
  const active = Math.min(steps.length - 1, Math.floor((Math.max(percent, 4) / 100) * steps.length));

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border bg-background p-4" role="status" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-medium tracking-[0.16em] text-[color:var(--trust)] uppercase">Local processing</p>
        <p className="text-xs tabular-nums text-muted-foreground">{Math.round(percent)}%</p>
      </div>
      <p className="mt-2 font-medium">{stage || steps[active]}</p>
      <p className="mt-1 text-sm text-muted-foreground">Nothing is uploaded. You can cancel and the original stays untouched.</p>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-[color:var(--trust)] transition-[width] duration-300"
          style={{ width: `${Math.min(100, Math.max(4, percent))}%` }}
        />
      </div>
      <ol className="mt-4 grid gap-1.5 sm:grid-cols-2">
        {steps.map((step, i) => (
          <li
            key={step}
            className={i <= active ? "text-sm text-foreground" : "text-sm text-muted-foreground"}
          >
            <span className="mr-2 inline-block size-1.5 rounded-full bg-current align-middle" aria-hidden />
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}
