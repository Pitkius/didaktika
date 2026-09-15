import { db } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";
import { NextResponse } from "next/server";

export async function GET() {
  let database: "ok" | "error" = "ok";
  let dbDetail = "reachable";

  try {
    await db.$queryRaw`SELECT 1`;
  } catch (err) {
    database = "error";
    dbDetail = err instanceof Error ? err.message : "unreachable";
  }

  const body = {
    status: database === "ok" ? "healthy" : "degraded",
    checks: {
      database: { status: database, detail: dbDetail },
      auth: {
        status: process.env.AUTH_SECRET ? "ok" : "missing",
      },
      billing: {
        status: featureFlags.BILLING_ENABLED ? "enabled" : "disabled",
        provider: process.env.STRIPE_SECRET_KEY ? "stripe" : "mock",
      },
      email: {
        provider: process.env.EMAIL_PROVIDER ?? "console",
      },
      ai: {
        provider: process.env.AI_PROVIDER ?? "mock",
      },
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(body, {
    status: database === "ok" ? 200 : 503,
  });
}
