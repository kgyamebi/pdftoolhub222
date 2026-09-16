import { NextResponse } from "next/server";

export async function POST() {
  if (!process.env.AI_API_KEY) {
    return NextResponse.json(
      {
        ok: false,
        message: "Translation and generative summaries need AI_API_KEY. On-device extractive tools still work.",
      },
      { status: 501 },
    );
  }
  return NextResponse.json({ ok: false, message: "Provider adapter not fully configured." }, { status: 501 });
}
