export type Money = { amount: number; currency: string };

export type PaymentProviderId = "stripe" | "paystack" | "flutterwave" | "mock";

export type CheckoutInput = {
  planId: string;
  interval: "month" | "year";
  provider?: PaymentProviderId;
  customerEmail?: string;
};

export interface PaymentProvider {
  id: PaymentProviderId;
  createCheckout(input: CheckoutInput): Promise<{ url: string; id: string }>;
  verifyWebhook(payload: string, signature: string): Promise<{ ok: boolean; event: string }>;
}

class MockProvider implements PaymentProvider {
  id: PaymentProviderId = "mock";
  async createCheckout(input: CheckoutInput) {
    return { url: `/pricing?checkout=mock&plan=${input.planId}&interval=${input.interval}`, id: `mock_${Date.now()}` };
  }
  async verifyWebhook() {
    return { ok: true, event: "mock.verified" };
  }
}

export function getPaymentProvider(): PaymentProvider {
  const name = (process.env.PAYMENT_PROVIDER || "mock") as PaymentProviderId;
  if (name === "stripe" && !process.env.STRIPE_SECRET_KEY) return new MockProvider();
  if (name === "paystack" && !process.env.PAYSTACK_SECRET_KEY) return new MockProvider();
  if (name === "flutterwave" && !process.env.FLUTTERWAVE_SECRET_KEY) return new MockProvider();
  return new MockProvider();
}
