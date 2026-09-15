import type { Metadata } from "next";
import { BookOpen, Bot, Clock, Target, Trophy } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { Section, SectionHeader } from "@/components/marketing/section";
import { CtaSection } from "@/components/marketing/cta-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { lt } from "@/lib/i18n";

const fs = lt.forStudents;

export const metadata: Metadata = {
  title: fs.metaTitle,
  description: fs.metaDesc,
};

export default function ForStudentsPage() {
  const p = lt.public;

  return (
    <>
      <PageHero
        badge={fs.badge}
        title={fs.title}
        description={fs.desc}
        primaryCta={{ label: p.createFreeAccount, href: "/register" }}
      />

      <Section>
        <SectionHeader title={fs.sectionTitle} description={fs.sectionDesc} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Bot, title: fs.f1Title, description: fs.f1Desc },
            { icon: Target, title: fs.f2Title, description: fs.f2Desc },
            { icon: BookOpen, title: fs.f3Title, description: fs.f3Desc },
            { icon: Clock, title: fs.f4Title, description: fs.f4Desc },
            { icon: Trophy, title: fs.f5Title, description: fs.f5Desc },
            { icon: Target, title: fs.f6Title, description: fs.f6Desc },
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
        <SectionHeader title={fs.sayTitle} description={fs.sayDesc} />
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-neutral-700 leading-relaxed">&ldquo;{fs.quote}&rdquo;</p>
              <p className="mt-4 text-sm font-medium text-neutral-900">{fs.quoteName}</p>
              <p className="text-xs text-neutral-500">{fs.quotePlace}</p>
            </CardContent>
          </Card>
        </div>
      </Section>

      <CtaSection
        title={fs.ctaTitle}
        description={fs.ctaDesc}
        primaryLabel={p.signUpFree}
        primaryHref="/register"
      />
    </>
  );
}
