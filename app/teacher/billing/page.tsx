import Link from "next/link";
import { requireTeacher } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { entitlementService } from "@/services/entitlements/entitlement-service";
import { billingService } from "@/services/billing/billing-service";
import { getPlanDefinition, formatPlanPrice } from "@/config/plans";
import { startCheckoutAction } from "@/features/billing/actions";
import { RedeemLicenseKeyForm } from "@/features/license/redeem-form";
import { lt, tStatus } from "@/lib/i18n";

export default async function TeacherBillingPage() {
  const session = await requireTeacher();
  const ctx = {
    userId: session.user.id,
    role: session.user.role as "TEACHER",
    schoolId: session.user.schoolId,
  };
  const summary = await entitlementService.getUsageSummary(ctx);
  const seats = await entitlementService.canAddStudent(ctx);
  const schoolSub = session.user.schoolId
    ? await billingService.getSchoolSubscription(session.user.schoolId)
    : await billingService.getUserSubscription(session.user.id);
  const plan = getPlanDefinition(summary.plan);

  return (
    <AppShell area="teacher" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">{lt.billing.manageBilling}</h1>
          <p className="mt-1 text-neutral-500">{lt.billing.educationTitle}</p>
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
              {schoolSub && (
                <p className="text-sm text-neutral-500">Būsena: {tStatus(schoolSub.status)}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {summary.plan !== "TEACHER" && (
                  <form action={startCheckoutAction}>
                    <input type="hidden" name="plan" value="TEACHER" />
                    <input type="hidden" name="returnPath" value="/teacher/billing" />
                    <Button type="submit">{lt.billing.upgrade} → TEACHER</Button>
                  </form>
                )}
                <Button asChild variant="outline">
                  <Link href="/pricing">{lt.billing.manageBilling}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{lt.billing.redeemKey}</CardTitle>
            </CardHeader>
            <CardContent>
              <RedeemLicenseKeyForm returnPath="/teacher/billing" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mokinių vietos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-2xl font-semibold">
                {seats.used ?? 0} / {seats.limit ?? "∞"}
              </p>
              {seats.limit != null && seats.limit < 1_000_000 && (
                <Progress
                  value={Math.min(100, Math.round(((seats.used ?? 0) / seats.limit) * 100))}
                />
              )}
              {summary.items.map((item) => (
                <div key={item.metric} className="flex justify-between text-sm text-neutral-600">
                  <span>{item.metric.replace(/_/g, " ")}</span>
                  <span>
                    {item.used}/{item.limit >= 1_000_000 ? "∞" : item.limit}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
