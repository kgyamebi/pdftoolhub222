"use client";

import { useCallback, useId, useRef, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, FileIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/format";
import { moveIndex } from "@/lib/pdf/reorder";
import { acceptAttribute, isAllowedFile, type AcceptKind } from "@/lib/security/validate";
import { cn } from "@/lib/utils";

export function FileUploader({
  files,
  onChange,
  accepts,
  multiple,
  disabled,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  accepts: AcceptKind[];
  multiple: boolean;
  disabled?: boolean;
}) {
  const id = useId();
  const [drag, setDrag] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const dragFrom = useRef<number | null>(null);

  const add = useCallback(
    (incoming: FileList | File[]) => {
      const next = [...incoming];
      const valid = next.filter((f) => isAllowedFile(f, accepts));
      const rejected = next.filter((f) => !isAllowedFile(f, accepts));
      if (rejected.length) {
        setMessage(`Skipped ${rejected.map((f) => f.name).join(", ")} — type not supported.`);
      } else {
        setMessage(null);
      }
      onChange(multiple ? [...files, ...valid] : valid.slice(0, 1));
    },
    [accepts, files, multiple, onChange],
  );

  return (
    <div data-dropzone>
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (!disabled) add(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-2xl border-2 border-dashed bg-card px-4 py-10 text-center transition-colors",
          drag ? "border-primary bg-primary/5" : "border-border",
          disabled && "opacity-60",
        )}
      >
        <UploadIcon className="mx-auto size-8 text-primary" />
        <p className="mt-3 font-medium">Drop files here</p>
        <p className="mt-1 text-sm text-muted-foreground">
          or{" "}
          <label htmlFor={id} className="cursor-pointer text-primary underline-offset-4 hover:underline">
            choose from your device
          </label>
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {acceptAttribute(accepts).replaceAll(".", "").toUpperCase()} ·{" "}
          {multiple ? "multiple files allowed" : "one file"}
        </p>
        <input
          id={id}
          type="file"
          className="sr-only"
          multiple={multiple}
          accept={acceptAttribute(accepts)}
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files) add(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {message && (
        <p className="mt-2 text-sm text-destructive" role="status">
          {message}
        </p>
      )}
      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${index}`}
              className="flex items-center gap-3 rounded-xl border bg-card px-3 py-2"
              draggable={multiple}
              onDragStart={() => {
                dragFrom.current = index;
              }}
              onDragOver={(e) => {
                if (multiple) e.preventDefault();
              }}
              onDrop={() => {
                if (!multiple || dragFrom.current == null) return;
                onChange(moveIndex(files, dragFrom.current, index));
                dragFrom.current = null;
              }}
            >
              <FileIcon className="size-4 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(file.size)} · {file.type || "file"}
                </p>
              </div>
              {multiple && (
                <div className="flex flex-col">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Move up"
                    disabled={index === 0}
                    onClick={() => {
                      const next = [...files];
                      [next[index - 1], next[index]] = [next[index], next[index - 1]];
                      onChange(next);
                    }}
                  >
                    <ChevronUpIcon />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Move down"
                    disabled={index === files.length - 1}
                    onClick={() => {
                      const next = [...files];
                      [next[index + 1], next[index]] = [next[index], next[index + 1]];
                      onChange(next);
                    }}
                  >
                    <ChevronDownIcon />
                  </Button>
                </div>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove ${file.name}`}
                onClick={() => onChange(files.filter((_, i) => i !== index))}
              >
                <Trash2Icon />
              </Button>
            </li>
          ))}
        </ul>
      )}
      {files.length > 0 && multiple && (
        <div className="mt-2 flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onChange([])}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
