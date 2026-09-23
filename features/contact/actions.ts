"use server";

import { auditService } from "@/services/audit/audit-service";
import { lt } from "@/lib/i18n";
import { contactSchema } from "@/lib/validations/contact";
import { getZodErrorMessage } from "@/lib/validations/utils";
import { rateLimit } from "@/lib/security/rate-limit";
import { headers } from "next/headers";

export type ContactFormState = {
  success?: boolean;
  error?: string;
  message?: string;
};

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    organization: formData.get("organization") || undefined,
    role: formData.get("role") || undefined,
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { error: getZodErrorMessage(parsed.error) };
  }

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const limited = rateLimit(`contact:${parsed.data.email}:${ip}`, 5, 60 * 60 * 1000);
  if (!limited.ok) return { error: lt.auth.tooManyAttempts };

  try {
    await auditService.log({
      action: "contact_form_submitted",
      targetType: "contact",
      metadata: {
        name: parsed.data.name,
        email: parsed.data.email,
        organization: parsed.data.organization,
        role: parsed.data.role,
        message: parsed.data.message,
      },
    });

    return {
      success: true,
      message: lt.contact.success,
    };
  } catch {
    return { error: lt.contact.error };
  }
}
