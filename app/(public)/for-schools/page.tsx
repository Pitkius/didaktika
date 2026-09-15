import type { Metadata } from "next";
import { Building2, Globe, Lock, Shield, Users, Zap } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { Section, SectionHeader } from "@/components/marketing/section";
import { CtaSection } from "@/components/marketing/cta-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { lt } from "@/lib/i18n";

const fs = lt.forSchools;

export const metadata: Metadata = {
  title: fs.metaTitle,
  description: fs.metaDesc,
};

export default function ForSchoolsPage() {
  const p = lt.public;

  return (
    <>
      <PageHero
        badge={fs.badge}
        title={fs.title}
        description={fs.desc}
        primaryCta={{ label: p.requestDemo, href: "/contact" }}
        secondaryCta={{ label: p.viewPricing, href: "/pricing" }}
      />

      <Section>
        <SectionHeader title={fs.sectionTitle} description={fs.sectionDesc} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Building2, title: fs.f1Title, description: fs.f1Desc },
            { icon: Lock, title: fs.f2Title, description: fs.f2Desc },
            { icon: Shield, title: fs.f3Title, description: fs.f3Desc },
            { icon: Users, title: fs.f4Title, description: fs.f4Desc },
            { icon: Globe, title: fs.f5Title, description: fs.f5Desc },
            { icon: Zap, title: fs.f6Title, description: fs.f6Desc },
          ].map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-le bg-brand-50">
                  <item.icon className="h-4 w-4 text-brand-600" />
                </div>
                <CardTitle className="text-base">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-600 leading-relaxed">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="bg-neutral-50">
        <SectionHeader title={fs.implTitle} description={fs.implDesc} />
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { step: "1", title: fs.step1Title, desc: fs.step1Desc },
            { step: "2", title: fs.step2Title, desc: fs.step2Desc },
            { step: "3", title: fs.step3Title, desc: fs.step3Desc },
            { step: "4", title: fs.step4Title, desc: fs.step4Desc },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                {item.step}
              </div>
              <h3 className="mt-4 font-semibold text-neutral-900">{item.title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <CtaSection
        title={fs.ctaTitle}
        description={fs.ctaDesc}
        primaryLabel={p.contactSales}
        primaryHref="/contact"
        secondaryLabel={p.downloadOverview}
        secondaryHref="/features"
      />
    </>
  );
}
