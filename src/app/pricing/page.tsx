import { PRICING } from "@/lib/config";

export const metadata = {
  title: "Pricing",
  description: "Free core tools in the browser. Premium raises local limits. Business is for teams when you are ready.",
};

export default function PricingPage() {
  const plans = [PRICING.free, PRICING.premium, PRICING.business];
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Pricing</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Core tools stay free and do not hide behind a signup wall. Amounts live in configuration — they are not hardcoded into each tool.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.id} className="rounded-2xl border bg-card p-6">
            <h2 className="text-xl font-medium">{plan.name}</h2>
            <p className="mt-2 text-3xl font-semibold">
              {plan.priceMonthly === 0 ? "Free" : `$${plan.priceMonthly}`}
              {plan.priceMonthly > 0 && <span className="text-base font-normal text-muted-foreground"> / month</span>}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{plan.blurb}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {plan.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <p className="mt-8 max-w-2xl text-sm text-muted-foreground">
        Checkout uses a payment provider interface (Stripe, Paystack, Flutterwave). Without keys, checkout stays in mock mode so you can still review the flow. Payments are never trusted from the browser alone.
      </p>
    </div>
  );
}
