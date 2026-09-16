# Security

## Documents

- Treat every upload as sensitive.
- Prefer in-browser processing so bytes never leave the device.
- Validate extension, emptiness and size before work starts.
- Never log document contents or full file names in analytics payloads.
- Workspace IDs are random. Temporary files expire (~2 hours) and can be deleted immediately.

## Encryption

- Protect / encrypt / add-password use AES-256 via `@cantoo/pdf-lib`.
- Unlock / decrypt / remove-password require the user-supplied password. There is no cracker.

## Web

- HTTPS in production.
- CSRF: mutating API routes should be same-origin; add tokens when cookie auth ships.
- XSS: React escaping + no `dangerouslySetInnerHTML` except JSON-LD.
- SQL injection: parameterized queries only when a DB is attached (no string-built SQL).
- Secrets stay in environment variables. Never expose `AI_API_KEY` or payment secrets to the client.

## Abuse

Configurable in `src/lib/config.ts`:

- max file size
- max batch
- daily operations
- job timeout

Rate-limit `/api/*` at the reverse proxy. Admin is gated; tighten it with `ADMIN_PASSWORD` before exposing `/admin`.

## Payments

Never trust a frontend “paid” flag. Webhooks in `src/app/api/webhooks/payments` must verify signatures when a live provider is attached.
