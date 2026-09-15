import { requireSuperAdmin } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { featureFlags } from "@/config/feature-flags";
import { siteConfig } from "@/config/site";
import { lt } from "@/lib/i18n";

export default async function AdminSettingsPage() {
  const session = await requireSuperAdmin();
  const a = lt.admin;

  const flags = Object.entries(featureFlags).map(([key, enabled]) => ({
    name: key,
    enabled,
  }));

  return (
    <AppShell area="admin" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{a.platformSettings}</h1>
          <p className="text-neutral-500">{a.settingsDesc}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{a.application}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">{a.productName}</span>
              <span className="font-medium">{siteConfig.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">{a.appUrl}</span>
              <span className="font-medium">{siteConfig.url}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">{a.aiProvider}</span>
              <Badge variant="secondary">{process.env.AI_PROVIDER ?? a.mock}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">{a.aiModel}</span>
              <span className="font-medium">{process.env.AI_MODEL ?? a.naMock}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{a.featureFlags}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {flags.map((flag) => (
                <li key={flag.name} className="flex items-center justify-between text-sm">
                  <span>{flag.name.replace(/_/g, " ")}</span>
                  <Badge variant={flag.enabled ? "success" : "secondary"}>
                    {flag.enabled ? lt.common.enabled : lt.common.disabled}
                  </Badge>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-neutral-400">{a.configureViaEnv}</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
