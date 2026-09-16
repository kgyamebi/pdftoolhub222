import { sendNewSignin, sendWelcome } from "@/lib/email";
import { getUserByEmail, markWelcomeSent, upsertUser } from "@/lib/auth/users";
import { createSession } from "@/lib/auth/session";
import type { AuthProviderId } from "@/lib/auth/types";

export async function completeSignIn(input: {
  email: string;
  name?: string;
  image?: string;
  provider: AuthProviderId;
}) {
  const previous = getUserByEmail(input.email);
  const linkingNewProvider = Boolean(previous && !previous.providers.includes(input.provider));
  const { user, created } = upsertUser(input);
  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    provider: input.provider,
    plan: user.plan,
  });
  try {
    if (created && !user.welcomeSentAt) {
      await sendWelcome(user.email, { name: user.name });
      markWelcomeSent(user.email);
    } else if (linkingNewProvider) {
      const label = input.provider === "email" ? "email" : input.provider === "google" ? "Google" : "Microsoft";
      await sendNewSignin(user.email, {
        name: user.name,
        provider: label,
        at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error("auth email failed", err);
  }
  return { user, created };
}
