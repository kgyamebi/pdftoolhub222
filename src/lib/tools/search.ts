import { TOOLS, type ToolDefinition } from "@/lib/tools/registry";

const STOP = new Set(["a", "an", "the", "to", "my", "this", "these", "into", "of", "for", "and", "or", "pdf", "file", "files", "document", "please"]);

function tokens(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

export function searchTools(query: string, limit = 8): ToolDefinition[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const words = tokens(q);
  const scored = TOOLS.map((tool) => {
    let score = 0;
    const hay = `${tool.name} ${tool.slug} ${tool.tagline} ${tool.description} ${tool.phrases.join(" ")}`.toLowerCase();
    if (tool.slug === q || tool.name.toLowerCase() === q) score += 50;
    if (hay.includes(q)) score += 20;
    for (const word of words) {
      if (tool.slug.includes(word)) score += 8;
      if (tool.name.toLowerCase().includes(word)) score += 6;
      if (tool.phrases.some((p) => p.includes(word))) score += 5;
      if (hay.includes(word)) score += 2;
    }
    return { tool, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.tool);
}
