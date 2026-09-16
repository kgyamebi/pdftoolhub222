import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    time: new Date().toISOString(),
    processing: "browser-first",
    auth: {
      google: Boolean(process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID),
      microsoft: Boolean(process.env.MICROSOFT_CLIENT_ID || process.env.AUTH_MICROSOFT_ID || process.env.AZURE_AD_CLIENT_ID),
      email: true,
    },
  });
}
