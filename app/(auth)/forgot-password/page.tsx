import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { lt } from "@/lib/i18n";

export const metadata: Metadata = {
  title: lt.auth.forgotPasswordTitle,
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
