import type { Metadata } from "next";
import { BarChart3, Bell, ClipboardCheck, Clock, Sparkles, Users } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { Section, SectionHeader } from "@/components/marketing/section";
import { CtaSection } from "@/components/marketing/cta-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { lt } from "@/lib/i18n";

const ft = lt.forTeachers;

export const metadata: Metadata = {
  title: ft.metaTitle,
  description: ft.metaDesc,
};

export default function ForTeachersPage() {
  const p = lt.public;

  return (
    <>
      <PageHero
        badge={ft.badge}
        title={ft.title}
        description={ft.desc}
        primaryCta={{ label: p.ctaPrimary, href: "/register" }}
        secondaryCta={{ label: p.bookDemo, href: "/contact" }}
      />

      <Section>
        <SectionHeader title={ft.sectionTitle} description={ft.sectionDesc} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: BarChart3, title: ft.f1Title, description: ft.f1Desc },
            { icon: Bell, title: ft.f2Title, description: ft.f2Desc },
            { icon: ClipboardCheck, title: ft.f3Title, description: ft.f3Desc },
            { icon: Sparkles, title: ft.f4Title, description: ft.f4Desc },
            { icon: Clock, title: ft.f5Title, description: ft.f5Desc },
            { icon: Users, title: ft.f6Title, description: ft.f6Desc },
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
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader
              badge={ft.controlBadge}
              title={ft.controlTitle}
              description={ft.controlDesc}
              alien="left"
            />
          </div>
          <Card>
            <CardContent className="space-y-4 p-6">
              {[ft.control1, ft.control2, ft.control3, ft.control4].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-le bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
                  <div className="h-2 w-2 rounded-full bg-brand-600" />
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </Section>

      <CtaSection
        title={ft.ctaTitle}
        description={ft.ctaDesc}
        primaryLabel={p.createTeacherAccount}
        primaryHref="/register"
      />
    </>
  );
}
