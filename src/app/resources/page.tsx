import Link from "next/link";
import { GUIDES } from "@/lib/content/guides";
import { getTool } from "@/lib/tools/registry";

export const metadata = {
  title: "Resources",
  description: "Practical guides for compressing, merging and converting documents.",
};

export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Resources</h1>
      <p className="mt-3 text-muted-foreground">Short guides written around real tasks — not thin pages generated to game search.</p>
      <ul className="mt-8 space-y-4">
        {GUIDES.map((guide) => (
          <li key={guide.slug} className="rounded-2xl border bg-card p-5">
            <h2 className="font-medium">
              <Link href={`/resources/${guide.slug}`} className="hover:underline">
                {guide.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{guide.description}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Related: {guide.relatedTools.map((s) => getTool(s)?.name ?? s).join(" · ")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
