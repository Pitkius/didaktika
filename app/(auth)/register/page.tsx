import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/components/register-form";
import { lt } from "@/lib/i18n";

export const metadata: Metadata = {
  title: lt.auth.createAccountTitle,
};

type RegisterPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;

  return <RegisterForm inviteToken={params.token} />;
}
