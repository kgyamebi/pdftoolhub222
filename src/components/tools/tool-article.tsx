import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ToolCardRow } from "@/components/tools/tool-card";
import { getCategory, getTool } from "@/lib/tools/registry";
import type { ToolDefinition } from "@/lib/tools/types";

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function ToolArticle({ tool, related }: { tool: ToolDefinition; related: ToolDefinition[] }) {
  const category = getCategory(tool.category);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link href="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {category && (
            <>
              <BreadcrumbItem>
                <Link href={`/${category.slug}`} className="transition-colors hover:text-foreground">
                  {category.name}
                </Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbPage>{tool.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <section className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 className="font-heading text-2xl font-semibold">{tool.guide.title}</h2>
          {tool.guide.paragraphs.map((p) => (
            <p key={p.slice(0, 40)} className="mt-3 text-muted-foreground">
              {p}
            </p>
          ))}
          <h3 className="mt-8 text-lg font-medium">How it works</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-muted-foreground">
            {tool.howTo.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
        <aside className="rounded-2xl border bg-card p-5">
          <h2 className="font-medium">Privacy for this tool</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {tool.local
              ? "This operation runs in your browser. We do not receive a copy of the file for this tool."
              : "This tool needs a configured AI provider. Until a key is set, it will not pretend to succeed."}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Workspace copies live in this browser for about two hours, then expire. You can delete them anytime on the workspace page.
          </p>
        </aside>
      </section>

      {tool.faqs.length > 0 && (
        <section className="mt-12">
          <h2 className="font-heading text-2xl font-semibold">Frequently asked questions</h2>
          <Accordion className="mt-4" multiple>
            {tool.faqs.map((faq, i) => (
              <AccordionItem key={faq.q} value={`faq-${i}`}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="font-heading text-2xl font-semibold">Related tools</h2>
          <p className="mt-2 text-sm text-muted-foreground">Natural next steps after {tool.name.toLowerCase()}.</p>
          <ToolCardRow className="mt-4" tools={related} />
        </section>
      )}
    </div>
  );
}

export function relatedTools(tool: ToolDefinition): ToolDefinition[] {
  return tool.related
    .map((slug) => getTool(slug))
    .filter((item): item is ToolDefinition => item != null && item.slug !== tool.slug);
}
