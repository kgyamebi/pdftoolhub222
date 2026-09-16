import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";

export async function POST(request: Request) {
  const signature = request.headers.get("x-payment-signature") ?? "";
  const payload = await request.text();
  const provider = getPaymentProvider();
  const result = await provider.verifyWebhook(payload, signature);
  return NextResponse.json(result);
}
