import { z } from "zod";
import { lt } from "@/lib/i18n";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(lt.validation.invalidEmail),
  password: z.string().min(1, lt.validation.passwordRequired),
});

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, lt.validation.firstNameRequired).max(50),
    lastName: z.string().trim().min(1, lt.validation.lastNameRequired).max(50),
    email: z.string().trim().toLowerCase().email(lt.validation.invalidEmail),
    password: z
      .string()
      .min(8, lt.validation.passwordMin)
      .regex(/[A-Z]/, lt.validation.passwordUpper)
      .regex(/[a-z]/, lt.validation.passwordLower)
      .regex(/[0-9]/, lt.validation.passwordNumber),
    confirmPassword: z.string(),
    role: z.enum(["STUDENT"]).default("STUDENT"),
    gradeLevel: z.coerce.number().int().min(1).max(12).optional(),
    inviteToken: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: lt.validation.passwordsMismatch,
    path: ["confirmPassword"],
  })
  .refine(
    (data) => data.role !== "STUDENT" || data.inviteToken || data.gradeLevel != null,
    {
      message: lt.validation.gradeRequired,
      path: ["gradeLevel"],
    }
  );

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(lt.validation.invalidEmail),
});

export const resetPasswordSchema = z
  .object({
    token: z.string(),
    password: z
      .string()
      .min(8, lt.validation.passwordMin)
      .regex(/[A-Z]/, lt.validation.passwordUpper)
      .regex(/[a-z]/, lt.validation.passwordLower)
      .regex(/[0-9]/, lt.validation.passwordNumber),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: lt.validation.passwordsMismatch,
    path: ["confirmPassword"],
  });

export type LoeinInput = z.infer<typeof loginSchema>;
export type ReeisterInput = z.infer<typeof registerSchema>;
