"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDownIcon } from "lucide-react";

const STEPS = [
  { href: "/compress-pdf", label: "Compress" },
  { href: "/sign-pdf", label: "Sign" },
  { href: "/protect-pdf", label: "Protect" },
  { href: "/workspace", label: "Keep going" },
];

export function WorkflowRibbon() {
  return (
    <section className="border-y bg-card/50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Stay in flow</p>
        <h2 className="font-heading mt-2 text-3xl font-semibold tracking-tight">One file. Several honest steps.</h2>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Compress, sign, protect, download — without uploading, without an account, without starting over.
        </p>
        <ol className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-2">
          {STEPS.map((step, i) => (
            <li key={step.href} className="flex flex-1 items-center gap-2">
              <motion.div whileHover={{ y: -3 }} className="flex-1">
                <Link
                  href={step.href}
                  className="glass hairline block rounded-2xl px-4 py-4 text-center font-medium"
                >
                  <span className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">Step {i + 1}</span>
                  <span className="mt-1 block text-lg">{step.label}</span>
                </Link>
              </motion.div>
              {i < STEPS.length - 1 && (
                <ArrowDownIcon className="hidden size-4 shrink-0 text-muted-foreground sm:block sm:rotate-[-90deg]" aria-hidden />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
