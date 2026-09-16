"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ToolRunner } from "@/components/tools/tool-runner";
import type { ToolDefinition } from "@/lib/tools/types";
import { blobToFile, getCurrentDoc } from "@/lib/workspace/store";

export function ToolRunnerGate({ tool }: { tool: ToolDefinition }) {
  const params = useSearchParams();
  const [initial, setInitial] = useState<File[] | undefined>(undefined);
  const [ready, setReady] = useState(params.get("from") !== "workspace");

  useEffect(() => {
    if (params.get("from") !== "workspace") return;
    getCurrentDoc().then((doc) => {
      if (doc) setInitial([blobToFile(doc)]);
      setReady(true);
    });
  }, [params]);

  if (!ready) {
    return <div className="rounded-2xl border bg-card p-8 text-sm text-muted-foreground">Loading your document…</div>;
  }
  return <ToolRunner tool={tool} initialFiles={initial} />;
}
