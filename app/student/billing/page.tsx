import Link from "next/link";
import { requireStudent } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { entitlementService } from "@/services/entitlements/entitlement-service";
import { billingService } from "@/services/billing/billing-service";
import { getPlanDefinition, formatPlanPrice } from "@/config/plans";
import { RedeemLicenseKeyForm } from "@/features/license/redeem-form";
import { lt, tStatus } from "@/lib/i18n";

const metricLabels: Record<string, string> = {
  AI_TEACHER_MESSAGES: "DI mokytojas",
  AI_QUESTION_GENERATION: "Klausimų generavimas",
  AI_STUDY_PLANS: "Studijų planai",
};

export default async function StudentBillingPage() {
  const session = await requireStudent();
  const ctx = {
    userId: session.user.id,
    role: session.user.role as "STUDENT",
    schoolId: session.user.schoolId,
  };
  const summary = await entitlementService.getUsageSummary(ctx);
  const subscription = await billingService.getUserSubscription(session.user.id);
  const plan = getPlanDefinition(summary.plan);

  return (
    <AppShell area="student" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">{lt.billing.manageBilling}</h1>
          <p className="mt-1 text-neutral-500">{lt.billing.individualTitle}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{lt.billing.currentPlan}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <p className="text-2xl font-semibold">{plan.name}</p>
                <Badge variant="secondary">{tStatus(summary.plan)}</Badge>
              </div>
              <p className="text-neutral-500">
                {formatPlanPrice(plan)}
                {plan.priceCents > 0 ? lt.public.perMonth : ""}
              </p>
              <p className="text-sm text-neutral-500">{plan.description}</p>
              {subscription?.status && (
                <p className="text-sm text-neutral-500">
                  Būsena: {tStatus(subscription.status)}
                </p>
              )}
              <p className="text-sm text-neutral-500">{lt.billing.paymentsUnavailable}</p>
              <Button asChild variant="ghost">
                <Link href="/pricing">{lt.billing.manageBilling}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{lt.billing.redeemKey}</CardTitle>
            </CardHeader>
            <CardContent>
              <RedeemLicenseKeyForm returnPath="/student/billing" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{lt.billing.usageThisMonth}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {summary.items.map((item) => {
                const pct =
                  item.limit > 0 && item.limit < 1_000_000
                    ? Math.min(100, Math.round((item.used / item.limit) * 100))
                    : 0;
                return (
                  <div key={item.metric}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{metricLabels[item.metric] ?? item.metric}</span>
                      <span className="font-medium">
                        {item.used} / {item.limit >= 1_000_000 ? "∞" : item.limit}
                      </span>
                    </div>
                    <Progress value={pct} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
