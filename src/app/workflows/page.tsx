import Link from "next/link";
import { getTool } from "@/lib/tools/registry";
import { WORKFLOWS } from "@/lib/workflows";

export const metadata = {
  title: "Document workflows",
  description: "Prebuilt chains for applications, assignments and business packets — never intrusive, always optional.",
};

export default function WorkflowsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Workflows</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Suggested sequences for jobs people already have. Each step is a real tool. Skip any step you do not need.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {WORKFLOWS.map((flow) => (
          <Link key={flow.slug} href={`/workflows/${flow.slug}`} className="glass hairline rounded-2xl p-6 transition-transform hover:-translate-y-0.5">
            <p className="text-xs tracking-wide text-primary uppercase">{flow.audience}</p>
            <h2 className="mt-1 text-xl font-medium">{flow.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{flow.description}</p>
            <ol className="mt-4 space-y-1 text-sm">
              {flow.steps.map((step, i) => (
                <li key={step.tool}>
                  {i + 1}. {getTool(step.tool)?.name ?? step.label}
                </li>
              ))}
            </ol>
          </Link>
        ))}
      </div>
    </div>
  );
}
