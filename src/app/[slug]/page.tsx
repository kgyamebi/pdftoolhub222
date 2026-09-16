import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd, relatedTools, ToolArticle } from "@/components/tools/tool-article";
import { ToolRunnerGate } from "@/components/tools/tool-runner-gate";
import { ToolCardRow } from "@/components/tools/tool-card";
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
  const tool = getTool(slug);
  if (tool) return toolMetadata(tool);
  const category = getCategory(slug);
  if (category) return categoryMetadata(category);
  return { title: "Tools" };
}

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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
        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
          <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">{category?.name ?? "PDF tool"}</p>
          <h1 className="font-heading mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{tool.h1}</h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{tool.description}</p>
          <div className="mt-8">
            <Suspense fallback={<div className="rounded-2xl border bg-card p-8 text-sm text-muted-foreground">Loading tool…</div>}>
              <ToolRunnerGate tool={tool} />
            </Suspense>
          </div>
        </div>
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
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: category.name, href: `/${category.slug}` },
          ])}
        />
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{category.h1}</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{category.description}</p>
        <ToolCardRow className="mt-8" tools={tools} />
      </div>
    );
  }

  notFound();
}
