export const metadata = {
  title: "Terms",
  description: "Terms of use for PDF Tools Hub.",
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Terms</h1>
      <div className="mt-8 space-y-4 text-muted-foreground">
        <p>PDF Tools Hub is provided as a productivity service. You are responsible for having the right to process the files you open in it.</p>
        <p>Do not use Unlock or Decrypt on files you are not authorized to open. The product will not help bypass unknown passwords.</p>
        <p>AI-assisted summaries and answers are not guaranteed accurate. Do not rely on them as legal, medical or financial advice.</p>
        <p>Free usage may be rate-limited to keep the product usable. Premium limits are configured, not baked into each tool.</p>
        <p>Software is provided as-is. We aim for correctness, not miracle recovery of destroyed files.</p>
      </div>
    </article>
  );
}
