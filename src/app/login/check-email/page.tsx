"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CheckEmailPage() {
  const [email, setEmail] = useState("");
  const [preview, setPreview] = useState("");

  useEffect(() => {
    setEmail(sessionStorage.getItem("pth:magic-email") || "");
    setPreview(sessionStorage.getItem("pth:magic-preview") || "");
  }, []);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Check your inbox</p>
      <h1 className="font-heading mt-2 text-3xl font-semibold tracking-tight">We sent a sign-in link.</h1>
      <p className="mt-3 text-muted-foreground">
        {email ? `Look for a message to ${email}.` : "Look for a message from PDF Tools Hub."} The link expires in 20
        minutes. We do not attach your documents.
      </p>
      {preview && (
        <p className="mt-6 rounded-2xl border bg-card p-4 text-sm">
          Email is in console/mock mode, so you can open the link here:{" "}
          <a className="text-primary underline-offset-4 hover:underline" href={preview}>
            Continue locally
          </a>
        </p>
      )}
      <Link href="/login" className={cn(buttonVariants({ variant: "outline", className: "mt-8" }))}>
        Use a different email
      </Link>
    </div>
  );
}
