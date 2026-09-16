import Link from "next/link";
import { HomeHero } from "@/components/home/hero";
import { WelcomeBack } from "@/components/home/welcome-back";
import { WorkflowRibbon } from "@/components/home/workflow-ribbon";
import { ToolGalaxy } from "@/components/home/tool-galaxy";
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
      <WorkflowRibbon />
      <ToolGalaxy />
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="font-heading text-3xl font-semibold tracking-tight">Browse by job</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Category pages are product stories, not directories. Each one still lists every working tool.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.filter((c) => c.slug !== "pdf-tools").map((c) => (
            <Link key={c.slug} href={`/${c.slug}`} className="glass hairline rounded-3xl p-5 transition-transform hover:-translate-y-0.5">
              <h3 className="font-medium">{c.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.tagline}</p>
              <p className="mt-3 text-xs text-muted-foreground">{toolsInCategory(c.slug).length} tools</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="border-y bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-heading text-3xl font-semibold tracking-tight">Workflows, not dead ends</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Google search → useful tool → result → what next. The workspace holds the file so you do not start over.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {WORKFLOWS.map((flow) => (
              <Link key={flow.slug} href={`/workflows/${flow.slug}`} className="glass hairline rounded-3xl p-5 hover:-translate-y-0.5">
                <p className="text-xs tracking-wide text-primary uppercase">{flow.audience}</p>
                <h3 className="mt-1 font-medium">{flow.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{flow.description}</p>
                <p className="mt-3 text-xs text-muted-foreground">{flow.steps.map((s) => s.label).join(" → ")}</p>
              </Link>
            ))}
          </div>
          <Link href="/pdf-tools" className={cn(buttonVariants({ variant: "outline", className: "mt-8" }))}>
            View every tool
          </Link>
        </div>
      </section>
    </>
  );
}
