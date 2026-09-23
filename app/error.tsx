"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { lt } from "@/lib/i18n";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-start justify-center gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold">{lt.common.error}</h1>
      <p className="text-neutral-600">{lt.common.unexpectedError}</p>
      <Button type="button" onClick={() => reset()}>
        {lt.common.tryAgain}
      </Button>
    </div>
  );
}
