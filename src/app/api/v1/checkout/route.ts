import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const provider = getPaymentProvider();
  const session = await provider.createCheckout({
    planId: body.planId ?? "premium",
    interval: body.interval ?? "month",
    customerEmail: body.email,
  });
  return NextResponse.json(session);
}
