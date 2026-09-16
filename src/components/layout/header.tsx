"use client";

import Link from "next/link";
import { MenuIcon, SearchIcon } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { openCommandPalette } from "@/components/chrome/command-palette";
import { ToolSearch } from "@/components/search/tool-search";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/tools/registry";

const NAV = [
  { href: "/pdf-tools", label: "All tools" },
  { href: "/compress-pdf", label: "Compress" },
  { href: "/merge-pdf", label: "Merge" },
  { href: "/convert-pdf", label: "Convert" },
  { href: "/workflows", label: "Workflows" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="shrink-0 rounded-md focus-visible:ring-3 focus-visible:ring-ring/50">
          <Logo />
        </Link>
        <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mx-auto hidden min-w-0 flex-1 justify-center px-4 md:flex">
          <ToolSearch />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "lg:hidden")}
            onClick={openCommandPalette}
            aria-label="Search tools"
          >
            <SearchIcon />
          </button>
          <button
            type="button"
            className="hidden rounded-lg border px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted lg:inline-flex"
            onClick={openCommandPalette}
            aria-label="Open command palette"
          >
            <kbd className="font-sans">⌘K</kbd>
          </button>
          <Link href="/pricing" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}>
            Pricing
          </Link>
          <Link href="/account" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "hidden sm:inline-flex")}>
            Account
          </Link>
          <Sheet>
            <SheetTrigger
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "lg:hidden")}
              aria-label="Open menu"
            >
              <MenuIcon />
              <span className="sr-only">Open menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100%,22rem)]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 px-4 pb-6">
                <div className="mb-3 md:hidden">
                  <ToolSearch compact />
                </div>
                {NAV.map((item) => (
                  <Link key={item.href} href={item.href} className="rounded-lg px-2 py-2 text-sm hover:bg-muted">
                    {item.label}
                  </Link>
                ))}
                <p className="mt-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">Categories</p>
                {CATEGORIES.map((c) => (
                  <Link key={c.slug} href={`/${c.slug}`} className="rounded-lg px-2 py-2 text-sm hover:bg-muted">
                    {c.name}
                  </Link>
                ))}
                <Link href="/account" className="mt-2 rounded-lg px-2 py-2 text-sm hover:bg-muted">
                  Account
                </Link>
                <Link href="/pricing" className="rounded-lg px-2 py-2 text-sm hover:bg-muted">
                  Pricing
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
