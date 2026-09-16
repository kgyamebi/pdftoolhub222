# Architecture

PDF Tools Hub is a modular document OS with a single tool registry feeding SEO pages, search, recommendations and the processor.

```
Discover → Upload → Validate → Process → Preview/result → Download → Next action → Workspace
```

## Layers

| Layer | Location | Notes |
| --- | --- | --- |
| Frontend | `src/app`, `src/components` | App Router, SEO-first tool URLs |
| Tool catalog | `src/lib/tools/registry.ts` | Add a tool here; `[slug]` picks it up |
| PDF engine | `src/lib/pdf/processor.ts` | Browser-first; no silent fake success |
| Workspace | `src/lib/workspace/store.ts` | IndexedDB, TTL, user delete |
| Usage / plans | `src/lib/usage.ts`, `src/lib/config.ts` | Limits not hardcoded per tool |
| Payments | `src/lib/payments` | Stripe / Paystack / Flutterwave-shaped interface |
| Auth | `src/lib/auth` + `/login` | Google, Microsoft 365, email magic link — optional |
| Email | `src/lib/email` | Resend or console; welcome, magic link, verify, new sign-in, quota |
| AI | `src/lib/pdf/processor.ts` + `src/app/api/ai` | Extractive on-device; remote needs `AI_API_KEY` |
| Analytics | `src/lib/analytics.ts` + `/api/v1/analytics` | Event names only, no document text |
| Admin | `src/app/admin` | Flags, limits, catalog |
| SEO/content | registry + `src/lib/content/guides.ts` | Unique titles, FAQs, HowTo JSON-LD |
| DB models | `src/lib/db/schema.ts` | Ready for Postgres/SQLite; no blobs in SQL |

## Adding a tool

1. Append a `ToolDefinition` in the registry (copy, FAQs, related tools, phrases).
2. Add a `case` in `processTool` that actually produces bytes.
3. Link related tools so the internal graph stays useful.

Do not add a URL that only renders a mock download.

## Processing queue (server path)

The intended worker pipeline is:

`UPLOAD → JOB → QUEUE → WORKER → RESULT → SIGNED DOWNLOAD → DELETE`

This slice executes equivalent jobs in the browser so the product works without Redis or object storage. Job monitoring, retry and timeout still belong on the worker when you attach one.

## Internationalization

UI strings live in `src/lib/i18n.ts`. Do not auto-translate catalogs. Localized URLs can wrap `[slug]` later (`/es/comprimir-pdf`) without changing the processor.

## Ads

`src/lib/ads.ts` defines slots that stay away from Download. They are off unless `NEXT_PUBLIC_ADS_ENABLED=true`.
