import type { Metadata } from "next";
import { Fraunces, Figtree } from "next/font/google";
import { SiteShell } from "@/components/layout/site-shell";
import { Providers } from "@/components/providers";
import { defaultMetadata } from "@/lib/seo";
import { APP_NAME } from "@/lib/config";
import "./globals.css";

const heading = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const sans = Figtree({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  ...defaultMetadata(),
  title: {
    default: `${APP_NAME} — Everything you need to work with PDFs`,
    template: `%s — ${APP_NAME}`,
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${heading.variable} ${sans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}
