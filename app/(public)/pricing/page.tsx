import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { billingService } from "@/services/billing/billing-service";
import {
  formatPlanPrice,
  formatSeatsLabel,
  getEducationPlans,
  getIndividualPlans,
  type PlanDefinition,
} from "@/config/plans";
import { lt } from "@/lib/i18n";

function PlanCard({
  plan,
  highlight,
}: {
  plan: PlanDefinition;
  highlight?: boolean;
}) {
  const p = lt.public;

  return (
    <Card className={highlight ? "border-brand-300 ring-1 ring-brand-200" : ""}>
      <CardHeader>
        {highlight && <Badge className="mb-2 w-fit">{p.mostPopular}</Badge>}
        <CardTitle className="text-base">{plan.name}</CardTitle>
        <p className="text-2xl font-semibold">
          {formatPlanPrice(plan)}
          {plan.priceBasis !== "custom" && plan.priceCents > 0 ? p.perMonth : ""}
        </p>
        <p className="text-sm font-medium text-neutral-700">{plan.intendedFor}</p>
        <p className="text-sm text-neutral-500">{plan.description}</p>
        <p className="mt-1 text-xs text-neutral-400">{formatSeatsLabel(plan)}</p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-neutral-600">
          {plan.highlights.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <span className="mt-0.5 text-brand-600">✓</span>
              {f}
            </li>
          ))}
        </ul>
        <Button asChild className="mt-6 w-full" variant={highlight ? "default" : "outline"}>
          <Link href={plan.priceBasis === "custom" ? "/contact" : "/register"}>
            {plan.priceBasis === "custom" ? p.contactSales : lt.common.getStarted}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function PricingPage() {
  const billingConfigured = billingService.isConfigured();
  const p = lt.public;
  const individual = getIndividualPlans();
  const education = getEducationPlans();

  return (
    <div className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-neutral-900">{p.pricingTitle}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-neutral-500">{p.pricingAllCore}</p>
          {!billingConfigured && (
            <Badge variant="secondary" className="mt-4">
              {p.billingNotConfigured}
            </Badge>
          )}
        </div>

        <section className="mt-14">
          <h2 className="text-xl font-semibold text-neutral-900">{lt.billing.individualTitle}</h2>
          <p className="mt-1 text-sm text-neutral-500">{lt.billing.individualSubtitle}</p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {individual.map((plan) => (
              <PlanCard key={plan.code} plan={plan} highlight={plan.code === "PLUS"} />
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-xl font-semibold text-neutral-900">{lt.billing.educationTitle}</h2>
          <p className="mt-1 text-sm text-neutral-500">{lt.billing.educationSubtitle}</p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {education.map((plan) => (
              <PlanCard key={plan.code} plan={plan} highlight={plan.code === "SCHOOL"} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
