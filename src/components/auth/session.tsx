"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { SessionUser } from "@/lib/auth/types";

type SessionState = {
  user: SessionUser | null;
  loading: boolean;
  google: boolean;
  microsoft: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionState>({
  user: null,
  loading: true,
  google: false,
  microsoft: false,
  refresh: async () => undefined,
  signOut: async () => undefined,
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [google, setGoogle] = useState(false);
  const [microsoft, setMicrosoft] = useState(false);

  async function refresh() {
    const res = await fetch("/api/auth/session", { credentials: "include" });
    const data = (await res.json()) as {
      user: SessionUser | null;
      providers?: { google?: boolean; microsoft?: boolean };
    };
    setUser(data.user);
    setGoogle(Boolean(data.providers?.google));
    setMicrosoft(Boolean(data.providers?.microsoft));
    setLoading(false);
  }

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST", credentials: "include" });
    setUser(null);
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <SessionContext.Provider value={{ user, loading, google, microsoft, refresh, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
