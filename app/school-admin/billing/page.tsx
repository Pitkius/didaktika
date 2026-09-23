import Link from "next/link";
import { requireSchoolAdmin } from "@/lib/auth/session";
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

export default async function SchoolAdminBillingPage() {
  const session = await requireSchoolAdmin();
  const schoolId = session.user.schoolId!;
  const ctx = {
    userId: session.user.id,
    role: session.user.role as "SCHOOL_ADMIN",
    schoolId,
  };
  const summary = await entitlementService.getUsageSummary(ctx);
  const seats = await entitlementService.canAddStudent(ctx);
  const subscription = await billingService.getSchoolSubscription(schoolId);
  const plan = getPlanDefinition(summary.plan);

  return (
    <AppShell
      area="school-admin"
      userName={`${session.user.firstName} ${session.user.lastName}`}
    >
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">{lt.billing.manageBilling}</h1>
          <p className="mt-1 text-neutral-500">Mokyklos prenumerata ir limitai</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{lt.billing.currentPlan}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <p className="text-2xl font-semibold">{plan.name}</p>
                <Badge>{tStatus(summary.plan)}</Badge>
              </div>
              <p className="text-neutral-500">
                {formatPlanPrice(plan)}
                {plan.priceCents > 0 ? lt.public.perMonth : ""}
              </p>
              {subscription && (
                <p className="text-sm text-neutral-500">
                  Būsena: {tStatus(subscription.status)} · Vietos: {subscription.seatsLimit}
                </p>
              )}
              <p className="text-sm text-neutral-500">{lt.billing.paymentsUnavailable}</p>
              <Button asChild variant="outline">
                <Link href="/contact">{lt.billing.manageBilling}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{lt.billing.redeemKey}</CardTitle>
            </CardHeader>
            <CardContent>
              <RedeemLicenseKeyForm returnPath="/school-admin/billing" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mokinių vietos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {seats.used ?? 0} / {seats.limit ?? "∞"}
              </p>
              {seats.limit != null && (
                <Progress
                  className="mt-3"
                  value={Math.min(100, Math.round(((seats.used ?? 0) / seats.limit) * 100))}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
