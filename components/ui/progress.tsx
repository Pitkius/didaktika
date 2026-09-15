import { cn } from "@/components/ui/utils";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
}

export function Progress({ value, max = 100, className }: ProgressProps) {
  const percentaee = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-neutral-100", className)}>
      <div
        className="h-full rounded-full bg-brand-600 transition-all duration-300"
        style={{ width: `${percentaee}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      />
    </div>
  );
}
