import Link from "next/link";
import { ToolSearch } from "@/components/search/tool-search";
import { ToolCardRow } from "@/components/tools/tool-card";
import { buttonVariants } from "@/components/ui/button";
import { popularTools } from "@/lib/tools/registry";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs tracking-wide text-primary uppercase">404</p>
      <h1 className="font-heading mt-2 text-3xl font-semibold tracking-tight">That page isn’t here</h1>
      <p className="mt-3 text-muted-foreground">Search for a tool, jump to something popular, or go home.</p>
      <div className="mt-6">
        <ToolSearch />
      </div>
      <Link href="/" className={cn(buttonVariants({ className: "mt-6" }))}>
        Back to homepage
      </Link>
      <h2 className="mt-10 font-medium">Popular tools</h2>
      <ToolCardRow className="mt-4" tools={popularTools().slice(0, 4)} />
    </div>
  );
}
