import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { CATEGORIES } from "@/lib/tools/registry";

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Convert, compress, edit and protect documents in the browser. Your files stay on your device whenever the tool allows it.
          </p>
        </div>
        <div>
          <p className="text-sm font-medium">Tools</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {CATEGORIES.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link className="hover:text-foreground" href={`/${c.slug}`}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium">Learn</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link className="hover:text-foreground" href="/resources">
                Guides
              </Link>
            </li>
            <li>
              <Link className="hover:text-foreground" href="/workflows">
                Workflows
              </Link>
            </li>
            <li>
              <Link className="hover:text-foreground" href="/workspace">
                Workspace
              </Link>
            </li>
            <li>
              <Link className="hover:text-foreground" href="/pricing">
                Pricing
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium">Trust</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link className="hover:text-foreground" href="/privacy">
                Privacy
              </Link>
            </li>
            <li>
              <Link className="hover:text-foreground" href="/security">
                Security
              </Link>
            </li>
            <li>
              <Link className="hover:text-foreground" href="/terms">
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © 2026 PDF Tools Hub. Built for everyday document work.
      </div>
    </footer>
  );
}
