"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AlertCircleIcon, CheckCircle2Icon, DownloadIcon, SparklesIcon } from "lucide-react";
import { ProcessTheater } from "@/components/chrome/process-theater";
import { ClickPlacePreview, PageBoard } from "@/components/tools/page-board";
import { InkBoard } from "@/components/tools/ink-board";
import { SignaturePad } from "@/components/tools/signature-pad";
import { FileUploader } from "@/components/tools/uploader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { track } from "@/lib/analytics";
import { formatBytes } from "@/lib/format";
import { PdfHubError } from "@/lib/pdf/errors";
import { bytesOf } from "@/lib/pdf/helpers";
import { listFormFields, type FormFieldInfo } from "@/lib/pdf/inspect";
import { processToolClient } from "@/lib/pdf/process-client";
import type { ProcessFile, ProcessResult } from "@/lib/pdf/processor";
import { nextActionsFor } from "@/lib/tools/recommendations";
import {
  CLICK_PLACE_TOOLS,
  INK_TOOLS,
  PAGE_REORDER_TOOLS,
  PAGE_SELECT_TOOLS,
  PASSWORD_CONFIRM_TOOLS,
  SIGNATURE_TOOLS,
} from "@/lib/tools/guess";
import type { ToolDefinition } from "@/lib/tools/types";
import { assertCanProcess, maxBytes, maxFiles, recordOperation, usageSnapshot } from "@/lib/usage";
import { validateFiles } from "@/lib/security/validate";
import { saveWorkspaceDoc } from "@/lib/workspace/store";
import { cn } from "@/lib/utils";

type Stage = "idle" | "ready" | "working" | "done" | "error";

function parseNums(value: string): number[] {
  return value
    .split(/[, ]+/)
    .map((n) => Number.parseInt(n, 10))
    .filter((n) => n > 0);
}

export function ToolRunner({ tool, initialFiles }: { tool: ToolDefinition; initialFiles?: File[] }) {
  const [files, setFiles] = useState<File[]>(initialFiles ?? []);
  const [settings, setSettings] = useState<Record<string, string>>(() =>
    Object.fromEntries(tool.settings.map((s) => [s.key, s.defaultValue ?? ""])),
  );
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formFields, setFormFields] = useState<FormFieldInfo[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [stage, setStage] = useState<Stage>(initialFiles?.length ? "ready" : "idle");
  const [progress, setProgress] = useState({ stage: "", percent: 0 });
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<{ title: string; hint: string } | null>(null);
  const [usage, setUsage] = useState({ remaining: 10, max: 10 });
  const abort = useRef<AbortController | null>(null);
  const pdfFile = files.find((f) => f.name.toLowerCase().endsWith(".pdf")) ?? files[0];

  useEffect(() => {
    setUsage(usageSnapshot());
    track({ name: "tool_viewed", tool: tool.slug });
  }, [tool.slug]);

  useEffect(() => {
    if (tool.slug !== "fill-pdf" || !pdfFile) return;
    bytesOf(pdfFile)
      .then(listFormFields)
      .then((fields) => {
        setFormFields(fields);
        setFieldValues(Object.fromEntries(fields.map((f) => [f.name, ""])));
      })
      .catch(() => setFormFields([]));
  }, [pdfFile, tool.slug]);

  const next = useMemo(() => nextActionsFor(tool.slug, files[0]?.name), [tool.slug, files]);
  const selectedPages = PAGE_REORDER_TOOLS.has(tool.slug)
    ? parseNums(settings.order || "")
    : parseNums(settings.pages || "");

  function onFiles(nextFiles: File[]) {
    setFiles(nextFiles);
    setResult(null);
    setError(null);
    setStage(nextFiles.length ? "ready" : "idle");
    if (nextFiles.length) track({ name: "upload_completed", tool: tool.slug });
  }

  async function run() {
    if (PASSWORD_CONFIRM_TOOLS.has(tool.slug) && settings.password !== confirmPassword) {
      setError({ title: "Passwords don’t match.", hint: "Type the same password in both fields. We cannot recover it later." });
      setStage("error");
      return;
    }
    const check = validateFiles(files, tool.accepts, {
      maxBytes: maxBytes(),
      maxFiles: maxFiles(),
      minFiles: tool.minFiles ?? 1,
    });
    if (!check.ok) {
      setError({ title: check.message, hint: check.hint });
      setStage("error");
      return;
    }
    try {
      assertCanProcess();
    } catch {
      setError({
        title: "You've used today's free operations.",
        hint: "Come back tomorrow, or enable Premium in Account for a higher local limit.",
      });
      setStage("error");
      return;
    }
    abort.current?.abort();
    abort.current = new AbortController();
    setStage("working");
    setError(null);
    setProgress({ stage: "Starting…", percent: 4 });
    track({ name: "processing_started", tool: tool.slug });
    try {
      const output = await processToolClient({
        tool: tool.slug,
        files,
        settings: {
          ...settings,
          fields: JSON.stringify(fieldValues),
        },
        signal: abort.current.signal,
        onProgress: (p) => setProgress(p),
      });
      setResult(output);
      setStage("done");
      recordOperation();
      setUsage(usageSnapshot());
      track({ name: "processing_completed", tool: tool.slug, ok: true });
      toast.success("Your file is ready.");
      const first = output.files[0];
      if (first?.mime === "application/pdf") {
        await saveWorkspaceDoc({
          name: first.name,
          mime: first.mime,
          size: first.blob.size,
          blob: first.blob,
          sourceTool: tool.slug,
        });
      }
    } catch (err) {
      const mapped =
        err instanceof PdfHubError
          ? { title: err.message, hint: err.hint }
          : { title: "We couldn't process this file.", hint: "Try another file, or retry. If it's a scan, OCR the page first." };
      setError(mapped);
      setStage("error");
      track({ name: "error", tool: tool.slug, extra: mapped.title });
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && stage !== "working" && files.length) {
        e.preventDefault();
        void run();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, files, settings, fieldValues, confirmPassword]);

  function download(file: ProcessFile) {
    const url = URL.createObjectURL(file.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
    track({ name: "download_completed", tool: tool.slug });
  }

  const outSize = result?.files[0]?.blob.size ?? 0;
  const inSize = result?.originalBytes ?? 0;
  const saved = inSize > 0 && outSize > 0 && outSize < inSize;

  return (
    <section className="rounded-2xl border bg-card/90 p-4 shadow-[var(--shadow-lift)] sm:p-6" aria-labelledby="tool-panel">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 id="tool-panel" className="font-heading text-lg font-medium">
          {tool.name}
        </h2>
        <p className="text-xs text-muted-foreground">
          {tool.local ? "Processed on your device" : "Needs a configured AI provider"} · {usage.remaining}/{usage.max} left today
        </p>
      </div>

      <FileUploader files={files} onChange={onFiles} accepts={tool.accepts} multiple={tool.multiple} disabled={stage === "working"} />
      {files.length === 0 && (
        <p className="mt-3 text-sm text-muted-foreground">
          {tool.howTo[0] ?? "Drop a file to get a real result — nothing is faked."}
        </p>
      )}

      {pdfFile && PAGE_SELECT_TOOLS.has(tool.slug) && (
        <PageBoard
          file={pdfFile}
          mode="select"
          selected={selectedPages}
          defaultAll={["rotate-pdf", "watermark-pdf", "split-pdf"].includes(tool.slug)}
          defaultLast={SIGNATURE_TOOLS.has(tool.slug)}
          onChange={(pages) => setSettings((s) => ({ ...s, pages: pages.join(",") }))}
        />
      )}
      {pdfFile && PAGE_REORDER_TOOLS.has(tool.slug) && (
        <PageBoard
          file={pdfFile}
          mode="reorder"
          selected={selectedPages}
          defaultAll
          onChange={(pages) => setSettings((s) => ({ ...s, order: pages.join(",") }))}
        />
      )}
      {SIGNATURE_TOOLS.has(tool.slug) && (
        <SignaturePad value={settings.signature || ""} onChange={(signature) => setSettings((s) => ({ ...s, signature }))} />
      )}
      {pdfFile && INK_TOOLS.has(tool.slug) && (
        <InkBoard file={pdfFile} value={settings.strokes || ""} onChange={(strokes) => setSettings((s) => ({ ...s, strokes }))} />
      )}
      {pdfFile && CLICK_PLACE_TOOLS.has(tool.slug) && (
        <ClickPlacePreview
          file={pdfFile}
          x={Number(settings.x || (SIGNATURE_TOOLS.has(tool.slug) ? 62 : 12))}
          y={Number(settings.y || (SIGNATURE_TOOLS.has(tool.slug) ? 10 : 88))}
          marker={SIGNATURE_TOOLS.has(tool.slug) ? settings.signature : undefined}
          label={
            SIGNATURE_TOOLS.has(tool.slug)
              ? "Click the page to place the signature"
              : tool.slug === "add-image"
                ? "Click the page to place the image"
                : "Click the page to place the mark"
          }
          page={selectedPages[0] ?? 1}
          onPlace={(x, y) => setSettings((s) => ({ ...s, x: String(Math.round(x)), y: String(Math.round(y)) }))}
        />
      )}
      {tool.slug === "fill-pdf" && formFields.length > 0 && (
        <div className="mt-5 space-y-3">
          <p className="text-sm font-medium">Detected fields</p>
          {formFields.map((field) => (
            <div key={field.name}>
              {field.kind === "checkbox" ? (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={["true", "yes", "on", "1"].includes((fieldValues[field.name] ?? "").toLowerCase())}
                    onChange={(e) => setFieldValues((v) => ({ ...v, [field.name]: e.target.checked ? "true" : "false" }))}
                  />
                  {field.name}
                </label>
              ) : (
                <>
                  <Label htmlFor={`f-${field.name}`}>
                    {field.name} <span className="font-normal text-muted-foreground">({field.kind})</span>
                  </Label>
                  <Input
                    id={`f-${field.name}`}
                    className="mt-1.5 h-9"
                    value={fieldValues[field.name] ?? ""}
                    onChange={(e) => setFieldValues((v) => ({ ...v, [field.name]: e.target.value }))}
                  />
                </>
              )}
            </div>
          ))}
        </div>
      )}
      {tool.slug === "fill-pdf" && pdfFile && formFields.length === 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          No fillable fields found. This file is probably a flat scan — use Add Text instead.
        </p>
      )}

      {tool.settings.length > 0 && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {tool.settings.map((setting) => {
            if ((PAGE_SELECT_TOOLS.has(tool.slug) || PAGE_REORDER_TOOLS.has(tool.slug)) && (setting.key === "pages" || setting.key === "order")) {
              return null;
            }
            if (CLICK_PLACE_TOOLS.has(tool.slug) && (setting.key === "x" || setting.key === "y")) return null;
            if (setting.key === "strokes" || setting.key === "signature") return null;
            if (tool.slug === "fill-pdf" && formFields.length && setting.key === "value") return null;
            return (
              <div key={setting.key} className={setting.type === "textarea" ? "sm:col-span-2" : undefined}>
                <Label htmlFor={`s-${setting.key}`}>{setting.label}</Label>
                {setting.type === "textarea" ? (
                  <Textarea
                    id={`s-${setting.key}`}
                    className="mt-1.5"
                    value={settings[setting.key] ?? ""}
                    placeholder={setting.placeholder}
                    onChange={(e) => setSettings((s) => ({ ...s, [setting.key]: e.target.value }))}
                  />
                ) : setting.type === "select" ? (
                  <select
                    id={`s-${setting.key}`}
                    className="mt-1.5 h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                    value={settings[setting.key] ?? setting.defaultValue}
                    onChange={(e) => setSettings((s) => ({ ...s, [setting.key]: e.target.value }))}
                  >
                    {setting.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id={`s-${setting.key}`}
                    className="mt-1.5 h-9"
                    type={setting.type === "password" ? "password" : setting.type === "number" ? "number" : "text"}
                    value={settings[setting.key] ?? ""}
                    placeholder={setting.placeholder}
                    onChange={(e) => setSettings((s) => ({ ...s, [setting.key]: e.target.value }))}
                  />
                )}
                {setting.help && <p className="mt-1 text-xs text-muted-foreground">{setting.help}</p>}
                {setting.type === "password" && PASSWORD_CONFIRM_TOOLS.has(tool.slug) && (
                  <div className="mt-3">
                    <Label htmlFor="confirm-password">Confirm password</Label>
                    <Input
                      id="confirm-password"
                      className="mt-1.5 h-9"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button type="button" size="lg" onClick={run} disabled={stage === "working" || files.length === 0} className="min-w-36">
          {stage === "working" ? "Working on this device…" : "Process"}
        </Button>
        {stage === "working" && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => {
              abort.current?.abort();
              setStage("error");
              setError({ title: "Processing was cancelled.", hint: "Your original file is unchanged." });
            }}
          >
            Cancel
          </Button>
        )}
        <p className="text-xs text-muted-foreground">Ctrl or ⌘ + Enter</p>
      </div>

      {stage === "working" && <ProcessTheater tool={tool.slug} stage={progress.stage} percent={progress.percent} />}

      {error && (
        <Alert variant="destructive" className="mt-5">
          <AlertCircleIcon />
          <AlertTitle>{error.title}</AlertTitle>
          <AlertDescription>
            {error.hint}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={run}>
                Try again
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => onFiles([])}>
                Choose another file
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {stage === "done" && result && (
        <div className="mt-6 rounded-xl border bg-background p-4 shadow-[var(--shadow-lift)]">
          <div className="flex items-start gap-2">
            <CheckCircle2Icon className="mt-0.5 size-5 text-[color:var(--trust)]" />
            <div>
              <p className="font-medium">Your file is ready.</p>
              <p className="text-sm text-muted-foreground">Download, then keep going — this PDF stays in your workspace for about two hours.</p>
            </div>
          </div>
          {inSize > 0 && outSize > 0 && (
            <p className="mt-3 text-sm">
              {formatBytes(inSize)} → {formatBytes(outSize)}
              {saved ? ` (${Math.round((1 - outSize / inSize) * 100)}% smaller)` : outSize > inSize ? " (larger than the original)" : " (same size)"}
            </p>
          )}
          {result.warnings?.map((w) => (
            <p key={w} className="mt-3 text-sm text-muted-foreground">
              {w}
            </p>
          ))}
          {result.text && (
            <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-muted p-3 text-xs whitespace-pre-wrap">{result.text}</pre>
          )}
          <ul className="mt-4 space-y-2">
            {result.files.map((file) => (
              <li key={file.name} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2">
                <span className="text-sm">
                  {file.name} · {formatBytes(file.blob.size)}
                </span>
                <Button type="button" onClick={() => download(file)}>
                  <DownloadIcon /> Download
                </Button>
              </li>
            ))}
          </ul>
          <Link href="/workspace" className={cn(buttonVariants({ variant: "outline", size: "sm", className: "mt-4" }))}>
            Open workspace
          </Link>
          {next.length > 0 && (
            <div className="mt-5">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <SparklesIcon className="size-4 text-primary" /> You might also want to
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {next.map((item) => (
                  <Link key={item.slug} href={`/${item.slug}?from=workspace`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
