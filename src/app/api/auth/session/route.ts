import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth/session";
import { oauthConfigured } from "@/lib/auth/oauth";

export const runtime = "nodejs";

export async function GET() {
  const user = await readSession();
  return NextResponse.json({
    user,
    providers: {
      google: oauthConfigured("google"),
      microsoft: oauthConfigured("microsoft"),
      email: true,
    },
  });
}
