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
- CSRF: mutating `/api/auth/email` is same-origin JSON; OAuth uses a signed `state` + PKCE.
- Session cookie `pth_session` is httpOnly, SameSite=Lax, HMAC-signed with `AUTH_SECRET`.
- XSS: React escaping + no `dangerouslySetInnerHTML` except JSON-LD.
- SQL injection: parameterized queries only when a DB is attached (no string-built SQL).
- Secrets stay in environment variables. Never expose `AI_API_KEY`, OAuth client secrets, or payment secrets to the client.

## Abuse

Configurable in `src/lib/config.ts`:

- max file size
- max batch
- daily operations
- job timeout

Rate-limit `/api/*` at the reverse proxy. Admin is gated; tighten it with `ADMIN_PASSWORD` before exposing `/admin`.

## Auth and email

Optional Google, Microsoft 365, and magic-link sign-in. Templates in `src/lib/email` never include document bytes.

## Payments

Never trust a frontend “paid” flag. Webhooks in `src/app/api/webhooks/payments` must verify signatures when a live provider is attached.
