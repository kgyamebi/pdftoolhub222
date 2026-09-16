import { APP_NAME, SITE_URL } from "@/lib/config";

export function emailLayout({
  preheader,
  heading,
  bodyHtml,
  ctaLabel,
  ctaUrl,
}: {
  preheader: string;
  heading: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
}) {
  const button = ctaUrl
    ? `<p style="margin:28px 0 8px"><a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background:#9a3f1f;color:#fff8f2;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600">${escapeHtml(ctaLabel ?? "Continue")}</a></p>
       <p style="margin:12px 0 0;font-size:12px;line-height:1.5;color:#5a616b">If the button does not work, paste this URL into your browser:<br><a href="${escapeHtml(ctaUrl)}" style="color:#9a3f1f;word-break:break-all">${escapeHtml(ctaUrl)}</a></p>`
    : "";

  const html = `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:#f4f1ea;font-family:Inter,IBM Plex Sans,Helvetica,Arial,sans-serif;color:#12151a">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea;padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fffcf7;border-radius:24px;padding:32px 28px;border:1px solid rgba(18,21,26,0.08)">
        <tr><td>
          <p style="margin:0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#9a3f1f">${escapeHtml(APP_NAME)}</p>
          <p style="margin:6px 0 0;font-size:12px;color:#5a616b">Files stay on your device</p>
          <h1 style="margin:20px 0 12px;font-size:24px;line-height:1.25">${escapeHtml(heading)}</h1>
          <div style="font-size:15px;line-height:1.6;color:#3a414a">${bodyHtml}</div>
          ${button}
          <hr style="border:none;border-top:1px solid rgba(18,21,26,0.08);margin:28px 0 16px" />
          <p style="margin:0;font-size:12px;color:#5a616b">We never attach your PDFs to email. Processing stays in the browser unless you later enable a server worker.</p>
          <p style="margin:10px 0 0;font-size:12px;color:#5a616b">
            <a href="${SITE_URL}/privacy" style="color:#9a3f1f">Privacy</a> ·
            <a href="${SITE_URL}/security" style="color:#9a3f1f">Security</a> ·
            <a href="${SITE_URL}/account" style="color:#9a3f1f">Account</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return html;
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function stripHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
