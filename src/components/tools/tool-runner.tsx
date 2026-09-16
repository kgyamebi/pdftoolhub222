"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircleIcon, CheckCircle2Icon, DownloadIcon, Loader2Icon, SparklesIcon } from "lucide-react";
import { FileUploader } from "@/components/tools/uploader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { track } from "@/lib/analytics";
import { formatBytes } from "@/lib/format";
import { PdfHubError } from "@/lib/pdf/errors";
import { processTool, type ProcessFile } from "@/lib/pdf/processor";
import { nextActionsFor } from "@/lib/tools/recommendations";
import type { ToolDefinition } from "@/lib/tools/types";
import { assertCanProcess, maxBytes, maxFiles, recordOperation, usageSnapshot } from "@/lib/usage";
import { validateFiles } from "@/lib/security/validate";
import { saveWorkspaceDoc } from "@/lib/workspace/store";
import { cn } from "@/lib/utils";

type Stage = "idle" | "ready" | "working" | "done" | "error";

export function ToolRunner({ tool, initialFiles }: { tool: ToolDefinition; initialFiles?: File[] }) {
  const [files, setFiles] = useState<File[]>(initialFiles ?? []);
  const [settings, setSettings] = useState<Record<string, string>>(() =>
    Object.fromEntries(tool.settings.map((s) => [s.key, s.defaultValue ?? ""])),
  );
  const [stage, setStage] = useState<Stage>(initialFiles?.length ? "ready" : "idle");
  const [progress, setProgress] = useState({ stage: "", percent: 0 });
  const [result, setResult] = useState<ProcessFile[] | null>(null);
  const [text, setText] = useState<string>();
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<{ title: string; hint: string } | null>(null);
  const [usage, setUsage] = useState({ remaining: 10, max: 10 });
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    setUsage(usageSnapshot());
    track({ name: "tool_viewed", tool: tool.slug });
  }, [tool.slug]);

  const next = useMemo(() => nextActionsFor(tool.slug, files[0]?.name), [tool.slug, files]);

  function onFiles(nextFiles: File[]) {
    setFiles(nextFiles);
    setResult(null);
    setError(null);
    setStage(nextFiles.length ? "ready" : "idle");
    if (nextFiles.length) track({ name: "upload_completed", tool: tool.slug });
  }

  async function run() {
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
      const output = await processTool({
        tool: tool.slug,
        files,
        settings,
        signal: abort.current.signal,
        onProgress: (p) => setProgress(p),
      });
      setResult(output.files);
      setText(output.text);
      setWarnings(output.warnings ?? []);
      setStage("done");
      recordOperation();
      setUsage(usageSnapshot());
      track({ name: "processing_completed", tool: tool.slug, ok: true });
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

  function download(file: ProcessFile) {
    const url = URL.createObjectURL(file.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
    track({ name: "download_completed", tool: tool.slug });
  }

  return (
    <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6" aria-labelledby="tool-panel">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 id="tool-panel" className="font-heading text-lg font-medium">
          {tool.name}
        </h2>
        <p className="text-xs text-muted-foreground">
          {tool.local ? "Processed on your device" : "Needs a configured AI provider"} · {usage.remaining}/{usage.max} operations left today
        </p>
      </div>

      <FileUploader files={files} onChange={onFiles} accepts={tool.accepts} multiple={tool.multiple} disabled={stage === "working"} />

      {tool.settings.length > 0 && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {tool.settings.map((setting) => (
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
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="button" size="lg" onClick={run} disabled={stage === "working" || files.length === 0} className="min-w-36">
          {stage === "working" ? (
            <>
              <Loader2Icon className="animate-spin" /> Processing
            </>
          ) : (
            "Process"
          )}
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
      </div>

      {stage === "working" && (
        <div className="mt-5">
          <Progress value={progress.percent}>
            <ProgressLabel>{progress.stage || "Working…"}</ProgressLabel>
            <ProgressValue />
          </Progress>
        </div>
      )}

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
        <div className="mt-6 rounded-xl border bg-background p-4">
          <div className="flex items-start gap-2">
            <CheckCircle2Icon className="mt-0.5 size-5 text-emerald-700" />
            <div>
              <p className="font-medium">Your file is ready.</p>
              <p className="text-sm text-muted-foreground">Download it, then keep going — the workspace remembers this PDF for this session.</p>
            </div>
          </div>
          {warnings.map((w) => (
            <p key={w} className="mt-3 text-sm text-muted-foreground">
              {w}
            </p>
          ))}
          {text && (
            <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-muted p-3 text-xs whitespace-pre-wrap">{text}</pre>
          )}
          <ul className="mt-4 space-y-2">
            {result.map((file) => (
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
          {next.length > 0 && (
            <div className="mt-5">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <SparklesIcon className="size-4 text-primary" /> You might also want to
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {next.map((item) => (
                  <Link key={item.slug} href={`/${item.slug}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
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
