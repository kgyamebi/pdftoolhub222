import { cn } from "@/lib/utils";

export function Logo({ className, markOnly = false }: { className?: string; markOnly?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-foreground", className)}>
      <svg viewBox="0 0 40 40" className="size-8 shrink-0" aria-hidden="true">
        <rect x="4" y="6" width="22" height="28" rx="3" fill="currentColor" className="text-primary" />
        <rect x="14" y="6" width="22" height="28" rx="3" fill="#F6F3EC" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
        <circle cx="25" cy="20" r="4.5" fill="currentColor" className="text-primary" />
        <circle cx="25" cy="20" r="1.8" fill="#F6F3EC" />
      </svg>
      {!markOnly && (
        <span className="flex flex-col leading-none">
          <span className="font-heading text-[1.05rem] font-semibold tracking-tight">PDF Tools Hub</span>
          <span className="mt-0.5 text-[0.65rem] tracking-[0.14em] text-muted-foreground uppercase">Documents in good hands</span>
        </span>
      )}
    </span>
  );
}
