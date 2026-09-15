import { NextRequest, NextResponse } from "next/server";
import { billingService } from "@/services/billing/billing-service";
import type { SubscriptionPlan } from "@prisma/client";

/**
 * Stripe webhook endpoint.
 * In production: verify Stripe-Signature and sync subscription status.
 * Mock mode accepts a simple JSON payload for local testing.
 */
export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");

  try {
    if (signature && process.env.STRIPE_WEBHOOK_SECRET) {
      // Real Stripe verification would go here once stripe SDK is installed.
      return NextResponse.json(
        { error: "Stripe webhook handler requires stripe SDK configuration." },
        { status: 501 }
      );
    }

    const body = (await req.json()) as {
      type?: string;
      plan?: SubscriptionPlan;
      userId?: string;
      schoolId?: string;
    };

    if (body.type === "checkout.session.completed" && body.plan) {
      await billingService.applyPlanChange({
        plan: body.plan,
        userId: body.userId,
        schoolId: body.schoolId,
        eventType: "WEBHOOK_CHECKOUT_COMPLETED",
      });
      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true, ignored: true });
  } catch (error) {
    console.error("Billing webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 400 });
  }
}
