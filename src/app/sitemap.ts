import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";
import { GUIDES } from "@/lib/content/guides";
import { allSlugs } from "@/lib/tools/registry";
import { WORKFLOWS } from "@/lib/workflows";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/workspace", "/workflows", "/pricing", "/privacy", "/security", "/terms", "/resources", "/account", "/login", "/search"];
  const slugs = allSlugs().map((s) => `/${s}`);
  const guides = GUIDES.map((g) => `/resources/${g.slug}`);
  const flows = WORKFLOWS.map((w) => `/workflows/${w.slug}`);
  return [...staticPaths, ...slugs, ...guides, ...flows].map((path) => ({
    url: `${SITE_URL}${path || "/"}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : path.includes("compress") || path.includes("merge") ? 0.9 : 0.6,
  }));
}
