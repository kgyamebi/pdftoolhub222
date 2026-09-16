import { DropAnywhere } from "@/components/layout/drop-anywhere";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { CommandPalette } from "@/components/chrome/command-palette";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <DropAnywhere>
      <div className="flex min-h-full flex-col">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <Header />
        <main id="content" className="flex-1">
          {children}
        </main>
        <Footer />
        <CommandPalette />
      </div>
    </DropAnywhere>
  );
}
