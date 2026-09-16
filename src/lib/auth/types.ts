export type AuthProviderId = "google" | "microsoft" | "email";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  image?: string;
  providers: AuthProviderId[];
  plan: "free" | "premium" | "business";
  createdAt: string;
  lastLoginAt: string;
  welcomeSentAt?: string;
};

export type SessionUser = {
  id: string;
  email: string;
  name?: string;
  image?: string;
  provider: AuthProviderId;
  plan: AuthUser["plan"];
};
