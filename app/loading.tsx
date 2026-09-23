import { lt } from "@/lib/i18n";

export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[40vh] max-w-lg items-center px-6 py-16 text-neutral-500">
      {lt.common.loading}
    </div>
  );
}
