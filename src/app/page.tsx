import Link from "next/link";
import { HomeHero } from "@/components/home/hero";
import { WelcomeBack } from "@/components/home/welcome-back";
import { ToolCardRow } from "@/components/tools/tool-card";
import { JsonLd } from "@/components/tools/tool-article";
import { buttonVariants } from "@/components/ui/button";
import { WORKFLOWS } from "@/lib/workflows";
import { CATEGORIES, toolsInCategory } from "@/lib/tools/registry";
import { softwareAppJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <>
      <JsonLd data={softwareAppJsonLd()} />
      <WelcomeBack />
      <HomeHero />
      <section className="border-b bg-background">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 text-sm sm:grid-cols-3 sm:px-6">
          <p><strong className="font-medium">No account required.</strong> Compress, merge and convert without signing up.</p>
          <p><strong className="font-medium">Files stay on this device.</strong> Core tools never upload your PDF.</p>
          <p><strong className="font-medium">Then keep going.</strong> Results land in a session workspace with a useful next step.</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="font-heading text-2xl font-semibold">Browse by job</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Pick a category, land on a working tool, then follow the next useful step. No account required for the basics.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.filter((c) => c.slug !== "pdf-tools").map((c) => (
            <Link key={c.slug} href={`/${c.slug}`} className="rounded-2xl border bg-card p-5 hover:ring-1 hover:ring-foreground/15">
              <h3 className="font-medium">{c.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.tagline}</p>
              <p className="mt-3 text-xs text-muted-foreground">{toolsInCategory(c.slug).length} tools</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="border-y bg-card">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="font-heading text-2xl font-semibold">Workflows, not dead ends</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Google search → useful tool → result → what next → another result. Save the chain when you want to come back.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {WORKFLOWS.map((flow) => (
              <Link key={flow.slug} href={`/workflows/${flow.slug}`} className="rounded-2xl border bg-background p-5 hover:ring-1 hover:ring-foreground/15">
                <p className="text-xs tracking-wide text-primary uppercase">{flow.audience}</p>
                <h3 className="mt-1 font-medium">{flow.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{flow.description}</p>
                <p className="mt-3 text-xs text-muted-foreground">{flow.steps.map((s) => s.label).join(" → ")}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="font-heading text-2xl font-semibold">Organize, then send</h2>
        <p className="mt-2 text-muted-foreground">A sample of tools that stay useful after the first download.</p>
        <ToolCardRow className="mt-5" tools={toolsInCategory("organize-pdf").slice(0, 4)} />
        <div className="mt-8">
          <Link href="/pdf-tools" className={cn(buttonVariants({ variant: "outline" }))}>
            View every tool
          </Link>
        </div>
      </section>
    </>
  );
}
