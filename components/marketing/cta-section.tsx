import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/marketing/section";
import { lt } from "@/lib/i18n";

interface CtaSectionProps {
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function CtaSection({
  title = lt.public.ctaTitle,
  description = lt.public.ctaDesc,
  primaryLabel = lt.public.ctaPrimary,
  primaryHref = "/register",
  secondaryLabel = lt.public.ctaSecondary,
  secondaryHref = "/contact",
}: CtaSectionProps) {
  return (
    <Section className="bg-brand-900 text-white">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-semibold sm:text-3xl">{title}</h2>
        <p className="mt-4 text-brand-100 leading-relaxed">{description}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="bg-white text-brand-900 hover:bg-neutral-100">
            <Link href={primaryHref}>{primaryLabel}</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
            <Link href={secondaryHref}>{secondaryLabel}</Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
