# Deployment

## Build

```bash
npm ci
npm run build
npm start -- --port 43127 --hostname 0.0.0.0
```

Set `NEXT_PUBLIC_APP_URL` to the public origin so sitemap, robots, canonicals and Open Graph URLs are correct.

## Storage

When you add a server worker:

- `uploads/` incoming
- `temporary/` in-flight
- `processed/` results with random keys and TTL

Use S3-compatible object storage. Do not put PDF bytes in Postgres.

## Workers and cleanup

Run a cron/worker every few minutes to delete expired objects. The browser workspace already self-expires; server objects must too.

## Payments

1. Set `PAYMENT_PROVIDER` to `stripe`, `paystack` or `flutterwave`.
2. Add the matching secret key.
3. Point the provider webhook at `/api/webhooks/payments`.
4. Keep `mock` in development.

Regional methods (including mobile money where the provider supports them) belong in the provider adapter, not in tool UI.

## AI

Set `AI_API_KEY` and `NEXT_PUBLIC_AI_ENABLED=true` only when the adapter is implemented. Translate PDF refuses to run without a key.

## SEO

- `sitemap.xml` and `robots.txt` are generated.
- Tool copy lives in the registry so editors can later move it to a CMS without route rewrites.
- Do not mass-generate thin pages.

## PWA

`manifest.webmanifest` is generated. Add a service worker only after caching strategy is reviewed — do not cache processed documents.
