import { NextResponse } from "next/server";
import { LIMITS, PRICING } from "@/lib/config";
import { TOOLS } from "@/lib/tools/registry";

export async function GET() {
  return NextResponse.json({
    tools: TOOLS.map((t) => t.slug),
    limits: LIMITS,
    pricing: PRICING,
  });
}
