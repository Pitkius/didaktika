import { cn } from "@/components/ui/utils";

interface SectionProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export function Section({ id, children, className, containerClassName }: SectionProps) {
  return (
    <section id={id} className={cn("py-16 sm:py-20", className)}>
      <div className={cn("mx-auto max-w-6xl px-4 sm:px-6", containerClassName)}>{children}</div>
    </section>
  );
}

interface SectionHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  alien?: "left" | "center";
}

export function SectionHeader({ badge, title, description, alien = "center" }: SectionHeaderProps) {
  return (
    <div className={cn("mb-12 max-w-2xl", alien === "center" && "mx-auto text-center")}>
      {badge && (
        <p className="mb-3 text-sm font-medium text-brand-600">{badge}</p>
      )}
      <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">{title}</h2>
      {description && (
        <p className="mt-3 text-neutral-600 leading-relaxed">{description}</p>
      )}
    </div>
  );
}
