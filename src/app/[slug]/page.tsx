import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { canonicalToolSlug } from "@/lib/tools/aliases";
import type { Metadata } from "next";
import { JsonLd, relatedTools, ToolArticle } from "@/components/tools/tool-article";
import { ToolRunnerGate } from "@/components/tools/tool-runner-gate";
import { ToolCardRow } from "@/components/tools/tool-card";
import { ToolWorkspace } from "@/components/tools/tool-workspace";
import { CategoryStory } from "@/components/chrome/category-story";
import { allSlugs, getCategory, getTool, toolsInCategory } from "@/lib/tools/registry";
import { breadcrumbJsonLd, categoryMetadata, faqJsonLd, howToJsonLd, toolMetadata } from "@/lib/seo";

export function generateStaticParams() {
  const seen = new Set<string>();
  return allSlugs()
    .filter((slug) => {
      if (seen.has(slug)) return false;
      seen.add(slug);
      return true;
    })
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const aliased = canonicalToolSlug(slug);
  const tool = getTool(aliased ?? slug);
  if (tool) return toolMetadata(tool);
  const category = getCategory(slug);
  if (category) return categoryMetadata(category);
  return { title: "Tools" };
}

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const aliased = canonicalToolSlug(slug);
  if (aliased) redirect(`/${aliased}`);
  const tool = getTool(slug);
  const category = getCategory(slug);

  if (tool) {
    const related = relatedTools(tool);
    const siblings = category ? toolsInCategory(category.slug).filter((t) => t.slug !== tool.slug).slice(0, 8) : [];
    return (
      <>
        <JsonLd data={faqJsonLd(tool.faqs)} />
        <JsonLd data={howToJsonLd(tool.guide.title, tool.howTo)} />
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: category?.name ?? "Tools", href: `/${category?.slug ?? "pdf-tools"}` },
            { name: tool.name, href: `/${tool.slug}` },
          ])}
        />
        <ToolWorkspace tool={tool} categoryName={category?.name}>
          <Suspense fallback={<div className="rounded-2xl border bg-card p-8 text-sm text-muted-foreground">Loading tool…</div>}>
            <ToolRunnerGate tool={tool} />
          </Suspense>
        </ToolWorkspace>
        <ToolArticle tool={tool} related={related} />
        {siblings.length > 0 && (
          <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
            <h2 className="font-heading text-2xl font-semibold">More in {category?.name}</h2>
            <ToolCardRow className="mt-4" tools={siblings} />
          </div>
        )}
      </>
    );
  }

  if (category) {
    const tools = toolsInCategory(category.slug);
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: category.name, href: `/${category.slug}` },
          ])}
        />
        <CategoryStory category={category} count={tools.length} />
        <h2 className="font-heading mt-10 text-2xl font-semibold tracking-tight">Every live tool</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {category.tagline} Cards below are working destinations, not teasers.
        </p>
        <ToolCardRow className="mt-6" tools={tools} />
      </div>
    );
  }

  notFound();
}
