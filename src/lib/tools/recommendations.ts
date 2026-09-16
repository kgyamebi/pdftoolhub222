import { getTool, type ToolDefinition } from "@/lib/tools/registry";

export function nextActionsFor(slug: string, fileName?: string): ToolDefinition[] {
  const tool = getTool(slug);
  const fromTool = (tool?.nextActions ?? []).map((id) => getTool(id)).filter((x): x is ToolDefinition => Boolean(x));
  const extra: string[] = [];
  const lower = fileName?.toLowerCase() ?? "";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png")) extra.push("jpg-to-pdf", "merge-pdf");
  if (lower.endsWith(".docx")) extra.push("word-to-pdf", "compress-pdf");
  if (slug === "jpg-to-pdf" || slug === "png-to-pdf") extra.push("merge-pdf", "compress-pdf", "pdf-page-numbering");
  if (slug === "merge-pdf") extra.push("compress-pdf", "watermark-pdf", "protect-pdf");
  if (slug === "compress-pdf") extra.push("protect-pdf", "sign-pdf");
  const seen = new Set<string>();
  const out: ToolDefinition[] = [];
  for (const item of [...fromTool, ...extra.map((id) => getTool(id)).filter((x): x is ToolDefinition => Boolean(x))]) {
    if (item.slug === slug || seen.has(item.slug)) continue;
    seen.add(item.slug);
    out.push(item);
  }
  return out.slice(0, 5);
}
