import { describe, it, expect } from "vitest";
import { MockBillingProvider, getBillingProvider } from "@/services/billing/providers";
import {
  ConsoleEmailProvider,
  createEmailProvider,
  EmailService,
} from "@/services/email/email-service";
import { roleDashboardPaths } from "@/lib/auth/roles";

describe("Mock billing provider", () => {
  it("creates checkout URL with plan metadata", async () => {
    const mock = new MockBillingProvider();
    const session = await mock.createCheckoutSession({
      plan: "PLUS",
      customerEmail: "student@example.com",
      successUrl: "http://localhost:3000/student/billing",
      cancelUrl: "http://localhost:3000/student/billing",
    });
    expect(session.sessionId).toMatch(/^mock_cs_/);
    expect(session.url).toContain("plan=PLUS");
    expect(session.url).toContain("mock=1");
  });

  it("defaults to mock when Stripe key missing", () => {
    const prevBilling = process.env.FEATURE_BILLING;
    const prevKey = process.env.STRIPE_SECRET_KEY;
    process.env.FEATURE_BILLING = "true";
    delete process.env.STRIPE_SECRET_KEY;
    expect(getBillingProvider().name).toBe("mock");
    process.env.FEATURE_BILLING = prevBilling;
    process.env.STRIPE_SECRET_KEY = prevKey;
  });
});

describe("Email providers", () => {
  it("console provider returns an id", async () => {
    const provider = new ConsoleEmailProvider();
    const result = await provider.send({
      to: "a@b.c",
      subject: "Test",
      html: "<p>Hi</p>",
    });
    expect(result.id).toMatch(/^console_/);
  });

  it("createEmailProvider falls back to console", () => {
    const prev = process.env.EMAIL_PROVIDER;
    process.env.EMAIL_PROVIDER = "console";
    expect(createEmailProvider().name).toBe("console");
    const service = new EmailService();
    expect(service.providerName).toBe("console");
    process.env.EMAIL_PROVIDER = prev;
  });
});

describe("Role dashboard paths", () => {
  it("maps each role to its area", () => {
    expect(roleDashboardPaths.STUDENT).toBe("/student");
    expect(roleDashboardPaths.TEACHER).toBe("/teacher");
    expect(roleDashboardPaths.SCHOOL_ADMIN).toBe("/school-admin");
    expect(roleDashboardPaths.SUPER_ADMIN).toBe("/admin");
  });
});
