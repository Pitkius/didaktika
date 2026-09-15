import type { AuthActionState } from "@/features/auth/types";
import { lt } from "@/lib/i18n";

export function FormMessage({ state }: { state: AuthActionState }) {
  if (!state?.error && !state?.success) return null;

  if (state.error) {
    return (
      <div
        role="alert"
        className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {state.error}
      </div>
    );
  }

  return (
    <div
      role="status"
      className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
    >
      {state.message ?? lt.common.success}
    </div>
  );
}
