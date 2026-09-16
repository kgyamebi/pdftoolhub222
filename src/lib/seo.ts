import type { Metadata } from "next";
import { APP_NAME, APP_DESCRIPTION, SITE_URL } from "@/lib/config";
import type { ToolDefinition } from "@/lib/tools/types";
import type { CategoryDefinition } from "@/lib/tools/types";

export function absUrl(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function toolMetadata(tool: ToolDefinition): Metadata {
  const title = `${tool.h1} — ${APP_NAME}`;
  const description = tool.tagline;
  const url = absUrl(`/${tool.slug}`);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: APP_NAME,
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

export function categoryMetadata(category: CategoryDefinition): Metadata {
  const title = `${category.h1} — ${APP_NAME}`;
  const url = absUrl(`/${category.slug}`);
  return {
    title,
    description: category.tagline,
    alternates: { canonical: url },
    openGraph: { title, description: category.tagline, url, siteName: APP_NAME, type: "website" },
  };
}

export function defaultMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${APP_NAME} — ${APP_DESCRIPTION.split("—")[0].trim()}`,
      template: `%s — ${APP_NAME}`,
    },
    description: APP_DESCRIPTION,
    applicationName: APP_NAME,
    keywords: ["PDF tools", "compress PDF", "merge PDF", "JPG to PDF", "PDF to Word", "edit PDF"],
    openGraph: {
      title: APP_NAME,
      description: APP_DESCRIPTION,
      siteName: APP_NAME,
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export function softwareAppJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: APP_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: APP_DESCRIPTION,
    url: SITE_URL,
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absUrl(item.href),
    })),
  };
}

export function howToJsonLd(name: string, steps: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    step: steps.map((text, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text,
    })),
  };
}
