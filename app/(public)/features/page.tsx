import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  Bot,
  Brain,
  Building2,
  Layers,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { Section, SectionHeader } from "@/components/marketing/section";
import { CtaSection } from "@/components/marketing/cta-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { lt } from "@/lib/i18n";

const fp = lt.featuresPage;

export const metadata: Metadata = {
  title: fp.metaTitle,
  description: fp.metaDesc,
};

const features = [
  { icon: Bot, title: fp.f1Title, description: fp.f1Desc, href: "/for-students" },
  { icon: Brain, title: fp.f2Title, description: fp.f2Desc, href: "/for-students" },
  { icon: Layers, title: fp.f3Title, description: fp.f3Desc, href: "/for-students" },
  { icon: BarChart3, title: fp.f4Title, description: fp.f4Desc, href: "/for-teachers" },
  { icon: Building2, title: fp.f5Title, description: fp.f5Desc, href: "/for-schools" },
  { icon: Shield, title: fp.f6Title, description: fp.f6Desc, href: "/for-teachers" },
  { icon: Sparkles, title: fp.f7Title, description: fp.f7Desc, href: "/for-teachers" },
  { icon: Users, title: fp.f8Title, description: fp.f8Desc, href: "/for-schools" },
];

export default function FeaturesPage() {
  const p = lt.public;

  return (
    <>
      <PageHero
        badge={fp.badge}
        title={fp.title}
        description={fp.desc}
        primaryCta={{ label: p.ctaPrimary, href: "/register" }}
        secondaryCta={{ label: p.seePricing, href: "/pricing" }}
      />

      <Section>
        <SectionHeader title={fp.sectionTitle} description={fp.sectionDesc} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="flex flex-col">
              <CardHeader>
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-le bg-brand-50">
                  <feature.icon className="h-4 w-4 text-brand-600" />
                </div>
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <CardDescription className="flex-1 leading-relaxed">
                  {feature.description}
                </CardDescription>
                <Button asChild variant="link" className="mt-4 h-auto p-0 justify-start">
                  <Link href={feature.href}>{p.learnMore}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="bg-neutral-50">
        <SectionHeader title={fp.integrationsTitle} description={fp.integrationsDesc} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["Google Workspace", "Microsoft Entra ID", "Moodle", "Itslearning"].map((tool) => (
            <div
              key={tool}
              className="rounded-le border border-neutral-200 bg-white px-4 py-3 text-center text-sm font-medium text-neutral-700"
            >
              {tool}
            </div>
          ))}
        </div>
      </Section>

      <CtaSection
        title={p.ctaTitle}
        description={p.ctaDesc}
        primaryLabel={p.ctaPrimary}
        secondaryLabel={p.ctaSecondary}
      />
    </>
  );
}
