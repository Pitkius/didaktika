import type { ZodError } from "zod";
import { lt } from "@/lib/i18n";

export function getZodErrorMessage(error: ZodError, fallback: string = lt.common.invalidInput): string {
  return error.issues[0]?.message ?? fallback;
}
