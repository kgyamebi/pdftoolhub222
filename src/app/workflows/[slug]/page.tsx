import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { getTool } from "@/lib/tools/registry";
import { getWorkflow, WORKFLOWS } from "@/lib/workflows";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return WORKFLOWS.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const flow = getWorkflow(slug);
  if (!flow) return { title: "Workflow" };
  return { title: flow.name, description: flow.description };
}

export default async function WorkflowDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const flow = getWorkflow(slug);
  if (!flow) notFound();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs tracking-wide text-primary uppercase">{flow.audience}</p>
      <h1 className="font-heading mt-2 text-3xl font-semibold tracking-tight">{flow.name}</h1>
      <p className="mt-3 text-muted-foreground">{flow.description}</p>
      <ol className="mt-8 space-y-4">
        {flow.steps.map((step, i) => {
          const tool = getTool(step.tool);
          return (
            <li key={step.tool} className="rounded-2xl border bg-card p-5">
              <p className="text-xs text-muted-foreground">Step {i + 1}</p>
              <h2 className="mt-1 font-medium">{tool?.name ?? step.label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{tool?.tagline}</p>
              {tool && (
                <Link href={`/${tool.slug}`} className={cn(buttonVariants({ size: "sm", className: "mt-3" }))}>
                  Open {tool.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
