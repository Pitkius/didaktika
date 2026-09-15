export type CheckoutParams = {
  plan: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  customerId?: string;
  metadata?: Record<string, string>;
};

export type BillingProvider = {
  name: string;
  isConfigured(): boolean;
  createCheckoutSession(params: CheckoutParams): Promise<{ url: string; sessionId: string }>;
  createCustomerPortal(customerId: string, returnUrl: string): Promise<{ url: string }>;
  cancelSubscription(stripeSubId: string): Promise<void>;
};

export class MockBillingProvider implements BillingProvider {
  name = "mock";

  isConfigured() {
    return true;
  }

  async createCheckoutSession(params: CheckoutParams) {
    const sessionId = `mock_cs_${Date.now()}`;
    const url = `${params.successUrl}${params.successUrl.includes("?") ? "&" : "?"}session_id=${sessionId}&plan=${params.plan}&mock=1`;
    return { url, sessionId };
  }

  async createCustomerPortal(_customerId: string, returnUrl: string) {
    return { url: returnUrl };
  }

  async cancelSubscription(_stripeSubId: string) {
    return;
  }
}

export class StripeBillingProvider implements BillingProvider {
  name = "stripe";

  isConfigured() {
    return !!process.env.STRIPE_SECRET_KEY;
  }

  async createCheckoutSession(params: CheckoutParams): Promise<{ url: string; sessionId: string }> {
    if (!this.isConfigured()) {
      throw new Error("Stripe is not configured");
    }
    void params;
    // Stripe SDK wired when STRIPE_SECRET_KEY is set; until then fail loudly.
    throw new Error(
      "Stripe checkout requires the stripe package and price IDs. Use MockBillingProvider in development."
    );
  }

  async createCustomerPortal(_customerId: string, _returnUrl: string): Promise<{ url: string }> {
    throw new Error("Stripe customer portal requires Stripe configuration.");
  }

  async cancelSubscription(_stripeSubId: string): Promise<void> {
    throw new Error("Stripe cancellation requires Stripe configuration.");
  }
}

export function getBillingProvider(): BillingProvider {
  if (process.env.FEATURE_BILLING === "true" && process.env.STRIPE_SECRET_KEY) {
    return new StripeBillingProvider();
  }
  return new MockBillingProvider();
}
