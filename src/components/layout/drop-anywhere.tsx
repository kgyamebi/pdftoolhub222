"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { saveWorkspaceDoc } from "@/lib/workspace/store";
import { guessTool } from "@/lib/tools/guess";

export function DropAnywhere({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false);
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    function hasFiles(e: DragEvent) {
      return e.dataTransfer?.types?.includes("Files");
    }
    function onOver(e: DragEvent) {
      if (!hasFiles(e)) return;
      e.preventDefault();
      setActive(true);
    }
    function onLeave(e: DragEvent) {
      if (e.relatedTarget === null) setActive(false);
    }
    async function onDrop(e: DragEvent) {
      if (!hasFiles(e)) return;
      e.preventDefault();
      setActive(false);
      const target = e.target as HTMLElement | null;
      if (target?.closest("[data-dropzone]")) return;
      const file = e.dataTransfer?.files?.[0];
      if (!file) return;
      await saveWorkspaceDoc({
        name: file.name,
        mime: file.type || "application/pdf",
        size: file.size,
        blob: file,
        sourceTool: "drop",
      });
      const dest = `/${guessTool(file)}?from=workspace`;
      if (path === `/${guessTool(file)}`) router.replace(dest);
      else router.push(dest);
    }
    window.addEventListener("dragover", onOver);
    window.addEventListener("dragleave", onLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragover", onOver);
      window.removeEventListener("dragleave", onLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, [path, router]);

  return (
    <>
      {children}
      {active && (
        <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center bg-[color-mix(in_oklab,var(--foreground)_45%,transparent)] backdrop-blur-sm">
          <p className="rounded-3xl bg-primary px-8 py-5 text-xl font-medium text-primary-foreground shadow-[var(--shadow-lift)]">
            Drop to open a local tool
          </p>
        </div>
      )}
    </>
  );
}
