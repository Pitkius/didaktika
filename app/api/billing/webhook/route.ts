import { NextResponse } from "next/server";

/**
 * Card billing is disabled until Stripe signature verification is implemented.
 * Unsigned JSON must never change a subscription.
 */
export async function POST() {
  return NextResponse.json({ error: "Billing webhook is disabled" }, { status: 503 });
}
