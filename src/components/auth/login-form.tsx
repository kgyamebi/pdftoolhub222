"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/components/auth/session";
import { cn } from "@/lib/utils";

const ERRORS: Record<string, string> = {
  expired: "That sign-in link expired. Request a new one.",
  denied: "Sign-in was cancelled.",
  google_not_configured: "Google sign-in needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
  microsoft_not_configured: "Microsoft sign-in needs MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET.",
  invalid_state: "Sign-in timed out. Try again.",
  oauth_failed: "The identity provider did not complete sign-in. Try email instead.",
  unknown_provider: "Unknown sign-in method.",
};

export function LoginForm({ error }: { error?: string }) {
  const router = useRouter();
  const { google, microsoft, user } = useSession();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(error ? ERRORS[error] || error : "");
  const [busy, setBusy] = useState(false);

  async function onEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string; previewUrl?: string };
      if (!res.ok || !data.ok) {
        setMessage(data.message || "Could not send the link.");
        return;
      }
      if (data.previewUrl) sessionStorage.setItem("pth:magic-preview", data.previewUrl);
      sessionStorage.setItem("pth:magic-email", email);
      router.push("/login/check-email");
    } finally {
      setBusy(false);
    }
  }

  if (user) {
    return (
      <div className="space-y-3">
        <p className="text-sm">You are signed in as {user.email}.</p>
        <a href="/account" className="text-sm text-primary underline-offset-4 hover:underline">
          Go to account
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {message && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
          {message}
        </p>
      )}
      <a
        href="/api/auth/oauth/google"
        className={cn(
          "flex h-11 w-full items-center justify-center gap-3 rounded-xl border bg-background text-sm font-medium hover:bg-muted",
          !google && "opacity-90",
        )}
      >
        <GoogleMark />
        Continue with Google
      </a>
      <a
        href="/api/auth/oauth/microsoft"
        className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border bg-background text-sm font-medium hover:bg-muted"
      >
        <MicrosoftMark />
        Continue with Microsoft
      </a>
      {!google || !microsoft ? (
        <p className="text-xs text-muted-foreground">
          {google ? "" : "Google is shown even before keys are set so the layout matches production. "}
          {microsoft ? "" : "Microsoft uses tenant “common” so school 365 accounts work when keys exist."}
        </p>
      ) : null}
      <div className="flex items-center gap-3 py-2">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs tracking-[0.16em] text-muted-foreground uppercase">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <form onSubmit={onEmail} className="space-y-3">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            className="mt-1.5 h-11"
            type="email"
            autoComplete="email"
            required
            placeholder="you@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button type="submit" size="lg" className="h-11 w-full" disabled={busy}>
          {busy ? "Sending link…" : "Continue with Email"}
        </Button>
      </form>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.2 2.8-2.5 3.6v3h4c2.3-2.1 3.5-5.3 3.5-8.7z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1 7.9-2.9l-4-3c-1.1.7-2.5 1.2-3.9 1.2-3 0-5.6-2-6.5-4.7H1.3v3.1C3.3 21.3 7.4 24 12 24z" />
      <path fill="#FBBC05" d="M5.5 14.6c-.2-.7-.4-1.4-.4-2.6s.1-1.9.4-2.6V6.3H1.3C.5 8 .1 9.9.1 12s.4 4 1.2 5.7l4.2-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.3 2.7 1.3 6.3l4.2 3.1C6.4 6.8 9 4.8 12 4.8z" />
    </svg>
  );
}

function MicrosoftMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#7FBA00" d="M13 1h10v10H13z" />
      <path fill="#00A4EF" d="M1 13h10v10H1z" />
      <path fill="#FFB900" d="M13 13h10v10H13z" />
    </svg>
  );
}
