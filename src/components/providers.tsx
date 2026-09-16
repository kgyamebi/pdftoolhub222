"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/auth/session";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TooltipProvider delay={200}>
        {children}
        <Toaster position="top-center" theme="light" />
      </TooltipProvider>
    </SessionProvider>
  );
}
