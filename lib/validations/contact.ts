import { z } from "zod";
import { lt } from "@/lib/i18n";

export const contactSchema = z.object({
  name: z.string().min(1, lt.validation.nameRequired).max(100),
  email: z.string().email(lt.validation.invalidEmail),
  organization: z.string().max(150).optional(),
  role: z.enum(["student", "teacher", "school_admin", "other"]).optional(),
  message: z.string().min(10, lt.validation.messageMin).max(2000),
});

export type ContactFormData = z.infer<typeof contactSchema>;
