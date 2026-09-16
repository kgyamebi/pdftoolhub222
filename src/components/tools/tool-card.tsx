import Link from "next/link";
import {
  Combine,
  Scissors,
  FileOutput,
  FileX,
  ArrowLeftRight,
  RotateCw,
  Copy,
  ArrowDownUp,
  Hash,
  Minimize2,
  Gauge,
  Sparkle,
  Image,
  ImagePlus,
  Images,
  FileImage,
  FileType,
  Sheet,
  Table,
  Presentation,
  Projector,
  FileText,
  PenLine,
  Type,
  Pencil,
  Highlighter,
  Square,
  Signature,
  PenTool,
  Stamp,
  PanelTop,
  PanelBottom,
  Lock,
  KeyRound,
  LockKeyhole,
  Unlock,
  ShieldOff,
  Unlink,
  ClipboardPen,
  ListChecks,
  ScanText,
  TextCursor,
  Table2,
  Sparkles,
  MessageCircle,
  Languages,
  GitCompare,
  Wrench,
  LayoutGrid,
  Layers,
  RefreshCw,
  Shield,
  ClipboardList,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ToolDefinition } from "@/lib/tools/types";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  Combine,
  Scissors,
  FileOutput,
  FileX,
  ArrowLeftRight,
  RotateCw,
  Copy,
  ArrowDownUp,
  Hash,
  Minimize2,
  Gauge,
  Sparkle,
  Image,
  ImagePlus,
  Images,
  FileImage,
  FileType,
  FileType2: FileType,
  Sheet,
  Table,
  Presentation,
  Projector,
  FileText,
  PenLine,
  Type,
  Pencil,
  Highlighter,
  Square,
  Signature,
  PenTool,
  Stamp,
  PanelTop,
  PanelBottom,
  Lock,
  KeyRound,
  LockKeyhole,
  Unlock,
  ShieldOff,
  Unlink,
  ClipboardPen,
  ListChecks,
  ScanText,
  TextSelect: TextCursor,
  Table2,
  Sparkles,
  MessageCircleQuestion: MessageCircle,
  Languages,
  GitCompare,
  Wrench,
  LayoutGrid,
  Layers,
  RefreshCw,
  Shield,
  ClipboardList,
  Briefcase,
};

export function ToolIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? FileText;
  return <Icon className={className} aria-hidden />;
}

export function ToolCard({ tool }: { tool: ToolDefinition }) {
  return (
    <Link href={`/${tool.slug}`} className="group block h-full rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50">
      <Card className="h-full border-transparent shadow-[var(--shadow-lift)] transition-transform group-hover:-translate-y-0.5 group-hover:ring-1 group-hover:ring-foreground/15">
        <CardContent className="flex h-full flex-col gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ToolIcon name={tool.icon} className="size-5" />
          </span>
          <div>
            <h3 className="font-medium">{tool.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{tool.tagline}</p>
          </div>
          <p className="mt-auto text-xs text-muted-foreground">
            {tool.local ? "Runs in your browser" : "Needs a configured provider"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function ToolCardRow({ tools, className }: { tools: ToolDefinition[]; className?: string }) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {tools.map((tool) => (
        <ToolCard key={tool.slug} tool={tool} />
      ))}
    </div>
  );
}
