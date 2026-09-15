"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/button";
import { lt } from "@/lib/i18n";

export function SubmitButton({ children, ...props }: ButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full" {...props}>
      {pending ? lt.common.pleaseWait : children}
    </Button>
  );
}
