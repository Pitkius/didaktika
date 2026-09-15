import { requireSuperAdmin } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { licenseKeyService } from "@/services/license/license-key-service";
import {
  generateLicenseKeysAction,
  revokeLicenseKeyAction,
} from "@/features/license/actions";
import { PLAN_DEFINITIONS, getPlanDefinition } from "@/config/plans";
import { lt, tStatus } from "@/lib/i18n";

export default async function AdminLicenseKeysPage() {
  const session = await requireSuperAdmin();
  const keys = await licenseKeyService.listKeys(150);
  const plans = PLAN_DEFINITIONS.filter((p) => p.code !== "FREE");

  return (
    <AppShell area="admin" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">{lt.admin.keysTitle}</h1>
          <p className="text-neutral-500">{lt.admin.keysDesc}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{lt.admin.generateKeys}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={generateLicenseKeysAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium">{lt.billing.plan}</label>
                <select
                  name="plan"
                  required
                  className="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm"
                  defaultValue="PLUS"
                >
                  {plans.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">{lt.admin.keyCount}</label>
                <Input name="count" type="number" min={1} max={50} defaultValue={1} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">{lt.admin.maxRedemptions}</label>
                <Input name="maxRedemptions" type="number" min={1} max={10000} defaultValue={1} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">{lt.admin.durationDays}</label>
                <Input
                  name="durationDays"
                  type="number"
                  min={1}
                  placeholder={lt.admin.durationUnlimited}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">{lt.admin.keyExpiresAt}</label>
                <Input name="expiresAt" type="date" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">{lt.common.description}</label>
                <Input name="note" placeholder={lt.admin.keyNotePlaceholder} />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <Button type="submit">{lt.admin.generateKeys}</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h2 className="text-lg font-medium">{lt.admin.existingKeys}</h2>
          {keys.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-neutral-500">
                {lt.admin.noKeys}
              </CardContent>
            </Card>
          ) : (
            keys.map((key) => {
              const plan = getPlanDefinition(key.plan);
              return (
                <Card key={key.id}>
                  <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="font-mono text-sm font-semibold tracking-wide">{key.code}</p>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
                        <Badge variant="secondary">{plan.name}</Badge>
                        <Badge
                          variant={
                            key.status === "ACTIVE"
                              ? "success"
                              : key.status === "REVOKED"
                                ? "danger"
                                : "warning"
                          }
                        >
                          {tStatus(key.status)}
                        </Badge>
                        <span>
                          {key.redemptionCount}/{key.maxRedemptions} {lt.admin.redemptions}
                        </span>
                        {key.durationDays != null && (
                          <span>
                            {key.durationDays} {lt.common.days}
                          </span>
                        )}
                        {key.note && <span>· {key.note}</span>}
                      </div>
                      <p className="text-xs text-neutral-400">
                        {key.createdBy.firstName} {key.createdBy.lastName} ·{" "}
                        {new Date(key.createdAt).toLocaleString("lt-LT")}
                        {key.expiresAt &&
                          ` · ${lt.common.expires} ${new Date(key.expiresAt).toLocaleDateString("lt-LT")}`}
                      </p>
                    </div>
                    {key.status === "ACTIVE" && (
                      <form action={revokeLicenseKeyAction}>
                        <input type="hidden" name="keyId" value={key.id} />
                        <Button type="submit" size="sm" variant="outline">
                          {lt.common.revoke}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
