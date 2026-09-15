import type { Metadata } from "next";
import Link from "next/link";
import { Mail, CheckCircle2, XCircle } from "lucide-react";
import { siteConfig } from "@/config/site";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { verifyEmailAction } from "@/features/auth/actions";
import { lt } from "@/lib/i18n";

export const metadata: Metadata = {
  title: lt.auth.verifyEmailTitle,
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const a = lt.auth;
  const { token } = await searchParams;

  if (token) {
    const result = await verifyEmailAction(token);
    const ok = Boolean(result.success);

    return (
      <Card>
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
            {ok ? (
              <CheckCircle2 className="h-6 w-6 text-brand-600" aria-hidden="true" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" aria-hidden="true" />
            )}
          </div>
          <CardTitle className="text-xl">
            {ok ? a.verifyEmailTitle : lt.common.error}
          </CardTitle>
          <CardDescription>
            {ok ? a.verifyEmailSuccess : result.error ?? a.verifyEmailFailed}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/login"
            className="inline-flex h-10 w-full items-center justify-center rounded-md border border-neutral-300 bg-white px-4 text-sm font-medium hover:bg-neutral-50"
          >
            {a.backToLogin}
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
          <Mail className="h-6 w-6 text-brand-600" aria-hidden="true" />
        </div>
        <CardTitle className="text-xl">{a.checkInbox}</CardTitle>
        <CardDescription>{a.checkInboxDesc}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
          <p>{a.verifyInstructions.replace("{name}", siteConfig.name)}</p>
        </div>
        <ul className="space-y-2 text-sm text-neutral-500">
          <li>{a.checkSpam}</li>
          <li>
            {a.needHelp}{" "}
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="font-medium text-brand-600 hover:underline"
            >
              {siteConfig.contactEmail}
            </a>
          </li>
        </ul>
        <Link
          href="/login"
          className="inline-flex h-10 w-full items-center justify-center rounded-md border border-neutral-300 bg-white px-4 text-sm font-medium hover:bg-neutral-50"
        >
          {a.backToLogin}
        </Link>
      </CardContent>
    </Card>
  );
}
