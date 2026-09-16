import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES, getGuide } from "@/lib/content/guides";
import { getTool } from "@/lib/tools/registry";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return { title: "Guide" };
  return { title: guide.title, description: guide.description };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">{guide.title}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{guide.description}</p>
      {guide.sections.map((section) => (
        <section key={section.heading} className="mt-8">
          <h2 className="text-xl font-medium">{section.heading}</h2>
          <p className="mt-2 text-muted-foreground">{section.body}</p>
        </section>
      ))}
      <h2 className="mt-10 text-xl font-medium">Related tools</h2>
      <ul className="mt-3 space-y-2">
        {guide.relatedTools.map((slug) => {
          const tool = getTool(slug);
          return (
            <li key={slug}>
              <Link href={`/${slug}`} className="text-primary hover:underline">
                {tool?.name ?? slug}
              </Link>
              {tool ? ` — ${tool.tagline}` : null}
            </li>
          );
        })}
      </ul>
    </article>
  );
}
