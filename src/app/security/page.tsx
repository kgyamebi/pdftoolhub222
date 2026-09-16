export const metadata = {
  title: "Security",
  description: "How PDF Tools Hub treats uploads, encryption, rate limits and secrets.",
};

export default function SecurityPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Security</h1>
      <div className="mt-8 space-y-4 text-muted-foreground">
        <p>Serve the site over HTTPS in production. Local processing avoids sending files at all for supported tools.</p>
        <p>Uploads are validated by extension and size before processing. Password protection uses AES-256 via a PDF encryption library. Unlock requires the existing password.</p>
        <p>Temporary files, when a server worker is enabled, use random IDs, access-controlled downloads, and scheduled deletion. Predictable filenames are not used.</p>
        <p>API keys never ship in frontend bundles. Payment confirmation is verified server-side. Admin routes require a configured secret.</p>
        <p>This page is not a penetration-test report. See SECURITY.md in the repository for operational guidance.</p>
      </div>
    </article>
  );
}
