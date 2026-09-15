import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";
import { lt } from "@/lib/i18n";

export const metadata: Metadata = {
  title: lt.auth.signInTitle,
};

type LoginPageProps = {
  searchParams: Promise<{ registered?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const registered = params.registered === "true";

  return <LoginForm registered={registered} />;
}
