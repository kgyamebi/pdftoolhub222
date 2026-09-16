export const metadata = {
  title: "Privacy",
  description: "How PDF Tools Hub handles documents, logs and optional accounts.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Privacy</h1>
      <p className="mt-4 text-muted-foreground">Last updated 16 September 2026.</p>
      <div className="mt-8 space-y-4 text-muted-foreground">
        <p>
          Most tools on PDF Tools Hub run in your browser. Your document is not uploaded to our servers for those tools, and we do not log document contents.
        </p>
        <p>
          The session workspace stores a copy in IndexedDB on your device and expires after about two hours. You can delete it immediately from the workspace page.
        </p>
        <p>
          If you create an optional account, we store your email, display name, sign-in provider (Google, Microsoft, or email link) and usage counters — not the bytes of your PDFs. Magic-link messages and welcome mail never include document contents.
        </p>
        <p>
          Google and Microsoft only receive a sign-in request. We ask for email and profile. University Microsoft 365 / Azure AD accounts work through the common tenant. You can keep using every local tool without signing in.
        </p>
        <p>
          Product analytics record events such as tool viewed or download completed. They do not include file names by default and never include document text.
        </p>
        <p>
          AI features that call a remote provider only run when you trigger them and a key is configured. Those requests send extracted text, not a public URL to your file.
        </p>
      </div>
    </article>
  );
}
