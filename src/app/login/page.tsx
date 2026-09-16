import { PrivacyPills } from "@/components/chrome/privacy";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign in",
  description: "Optional Google, Microsoft 365, or email sign-in. PDF tools still run in your browser without an account.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_24rem]">
      <div>
        <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Optional account</p>
        <h1 className="font-heading mt-2 text-4xl font-semibold tracking-tight">Continue — without uploading your files.</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Sign in to keep favorites and a named account. Compress, merge, sign and protect still run on this device with no account at all.
        </p>
        <div className="mt-6">
          <PrivacyPills />
        </div>
        <ul className="mt-8 space-y-2 text-sm text-muted-foreground">
          <li>Google — personal Gmail and Workspace.</li>
          <li>Microsoft — Outlook, Microsoft 365, and university Azure AD accounts.</li>
          <li>Email — a one-time link. We never attach PDFs to mail.</li>
        </ul>
      </div>
      <div className="glass hairline rounded-3xl p-6">
        <h2 className="font-heading text-xl font-semibold">Sign in</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose a provider. Core tools stay free either way.</p>
        <div className="mt-6">
          <LoginForm error={error} />
        </div>
      </div>
    </div>
  );
}
