import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  Brain,
  Building2,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  Layers,
  Shield,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Section, SectionHeader } from "@/components/marketing/section";
import { CtaSection } from "@/components/marketing/cta-section";
import { siteConfig } from "@/config/site";
import {
  formatPlanPrice,
  formatSeatsLabel,
  getHomepagePlans,
} from "@/config/plans";
import { lt } from "@/lib/i18n";

export default function HomePage() {
  const p = lt.public;
  const h = lt.home;

  const faqItems = [
    { question: h.faq1q, answer: h.faq1a },
    { question: h.faq2q, answer: h.faq2a },
    { question: h.faq3q, answer: h.faq3a },
    { question: h.faq4q, answer: h.faq4a },
    { question: h.faq5q, answer: h.faq5a },
  ];

  const testimonials = [
    { quote: h.testimonial1Quote, name: "Emilija V.", role: h.testimonial1Role },
    { quote: h.testimonial2Quote, name: "Dr. Markus Weber", role: h.testimonial2Role },
    { quote: h.testimonial3Quote, name: "Ingrid Larsen", role: h.testimonial3Role },
  ];

  return (
    <>
      <Section className="border-b border-neutral-200 bg-white pt-20 pb-16 sm:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Badge className="mb-4">{p.heroBadge}</Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
              {siteConfig.tagline}
            </h1>
            <p className="mt-5 text-lg text-neutral-600 leading-relaxed">
              {siteConfig.description} {p.heroExtra}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/register">
                  {p.ctaPrimary}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/contact">{p.bookDemo}</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-neutral-500">{p.trialNote}</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-le bg-white p-4 shadow-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50">
                  <Bot className="h-4 w-4 text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">{h.demoAiTutor}</p>
                  <p className="mt-1 text-sm text-neutral-600">{h.demoAiTutorQuote}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-le bg-white p-4 shadow-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50">
                  <Target className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">{h.demoAdaptive}</p>
                  <p className="mt-1 text-sm text-neutral-600">{h.demoAdaptiveDesc}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-le bg-white p-4 shadow-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50">
                  <BarChart3 className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">{h.demoInsight}</p>
                  <p className="mt-1 text-sm text-neutral-600">{h.demoInsightDesc}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section className="bg-neutral-50">
        <SectionHeader badge={h.problemBadge} title={h.problemTitle} description={h.problemDesc} />
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { title: h.problemTeachers, description: h.problemTeachersDesc },
            { title: h.problemStudents, description: h.problemStudentsDesc },
            { title: h.problemSchools, description: h.problemSchoolsDesc },
          ].map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle className="text-base">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-600 leading-relaxed">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader badge={p.howItWorks} title={h.howTitle} description={h.howDesc} />
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { step: "01", title: h.howStep1Title, description: h.howStep1Desc, icon: Brain },
            { step: "02", title: h.howStep2Title, description: h.howStep2Desc, icon: Sparkles },
            { step: "03", title: h.howStep3Title, description: h.howStep3Desc, icon: BarChart3 },
          ].map((item) => (
            <div key={item.step} className="relative">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-le bg-brand-50">
                <item.icon className="h-5 w-5 text-brand-600" />
              </div>
              <p className="text-xs font-medium text-brand-600">{item.step}</p>
              <h3 className="mt-1 text-lg font-semibold text-neutral-900">{item.title}</h3>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-brand-50">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader
              badge={p.aiSecondTeacher}
              title={h.aiTutorTitle}
              description={h.aiTutorDesc}
              alien="left"
            />
            <ul className="space-y-3">
              {[h.aiTutorBullet1, h.aiTutorBullet2, h.aiTutorBullet3, h.aiTutorBullet4].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-neutral-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{h.sampleAiTitle}</CardTitle>
              <CardDescription>{h.sampleAiDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-le bg-neutral-50 p-3">
                <p className="font-medium text-neutral-900">{h.sampleStudent}</p>
                <p className="mt-1 text-neutral-600">{h.sampleStudentMsg}</p>
              </div>
              <div className="rounded-le bg-brand-50 p-3">
                <p className="font-medium text-brand-900">Didaktika DI</p>
                <p className="mt-1 text-neutral-700">{h.sampleAiMsg}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">{h.skillAlgebra}</span>
                      <span className="font-medium text-green-600">92%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-neutral-100">
                      <div className="h-2 w-[92%] rounded-full bg-green-500" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">{h.skillLinear}</span>
                      <span className="font-medium text-brand-600">74%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-neutral-100">
                      <div className="h-2 w-[74%] rounded-full bg-brand-600" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">{h.skillWord}</span>
                      <span className="font-medium text-amber-600">58%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-neutral-100">
                      <div className="h-2 w-[58%] rounded-full bg-amber-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="order-1 lg:order-2">
            <SectionHeader
              badge={p.personalizedLearning}
              title={h.personalTitle}
              description={h.personalDesc}
              alien="left"
            />
            <ul className="space-y-3">
              {[h.personalBullet1, h.personalBullet2, h.personalBullet3, h.personalBullet4].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-neutral-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section className="bg-neutral-50">
        <SectionHeader badge={p.adaptiveExercises} title={h.adaptiveTitle} description={h.adaptiveDesc} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Layers, title: h.adaptiveDynamic, desc: h.adaptiveDynamicDesc },
            { icon: BookOpen, title: h.adaptiveCurriculum, desc: h.adaptiveCurriculumDesc },
            { icon: Target, title: h.adaptiveGaps, desc: h.adaptiveGapsDesc },
            { icon: GraduationCap, title: h.adaptiveExam, desc: h.adaptiveExamDesc },
          ].map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-le bg-white">
                  <item.icon className="h-4 w-4 text-brand-600" />
                </div>
                <CardTitle className="text-base">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-600">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader
              badge={p.teacherAnalytics}
              title={h.analyticsTitle}
              description={h.analyticsDesc}
              alien="left"
            />
            <ul className="space-y-3">
              {[h.analyticsBullet1, h.analyticsBullet2, h.analyticsBullet3, h.analyticsBullet4].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-neutral-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{h.classSample}</CardTitle>
              <CardDescription>{h.last7Days}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Emilija V.", status: h.statusOnTrack, variant: "success" as const },
                { name: "Jonas M.", status: h.statusNeedsSupport, variant: "warning" as const },
                { name: "Sofia K.", status: h.statusOnTrack, variant: "success" as const },
                { name: "Lukas P.", status: h.statusAtRisk, variant: "danger" as const },
              ].map((student) => (
                <div key={student.name} className="flex items-center justify-between rounded-le bg-neutral-50 px-3 py-2">
                  <span className="text-sm text-neutral-900">{student.name}</span>
                  <Badge variant={student.variant}>{student.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section className="bg-neutral-50">
        <SectionHeader badge={p.schoolManagement} title={h.schoolMgmtTitle} description={h.schoolMgmtDesc} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Building2, title: h.schoolMulti, description: h.schoolMultiDesc },
            { icon: Users, title: h.schoolRoles, description: h.schoolRolesDesc },
            { icon: Shield, title: h.schoolCompliance, description: h.schoolComplianceDesc },
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

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Card className="border-brand-200 bg-brand-50">
            <CardHeader>
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-le bg-white">
                <Shield className="h-4 w-4 text-brand-600" />
              </div>
              <CardTitle>{h.integrityCardTitle}</CardTitle>
              <CardDescription>{h.integrityCardDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-neutral-700">
              <p>{h.integrityLog}</p>
              <p>{h.integrityFilter}</p>
              <p>{h.integrityMisuse}</p>
            </CardContent>
          </Card>
          <div>
            <SectionHeader
              badge={p.aiIntegrity}
              title={h.integrityTitle}
              description={h.integrityDesc}
              alien="left"
            />
            <ul className="space-y-3">
              {[h.integrityBullet1, h.integrityBullet2, h.integrityBullet3, h.integrityBullet4].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-neutral-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section className="bg-neutral-50">
        <SectionHeader badge={p.testimonials} title={h.testimonialsTitle} description={h.testimonialsDesc} />
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name}>
              <CardContent className="p-6">
                <p className="text-sm text-neutral-700 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-4 border-t border-neutral-100 pt-4">
                  <p className="text-sm font-medium text-neutral-900">{t.name}</p>
                  <p className="text-xs text-neutral-500">{t.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader badge={lt.common.pricing} title={h.pricingPreviewTitle} description={h.pricingPreviewDesc} />
        <div className="grid gap-6 md:grid-cols-3">
          {getHomepagePlans().map((plan) => {
            const highlighted = plan.code === "SCHOOL";
            const price = formatPlanPrice(plan);
            return (
              <Card
                key={plan.code}
                className={highlighted ? "border-brand-600 ring-1 ring-brand-600" : undefined}
              >
                <CardHeader>
                  {highlighted && <Badge className="mb-2 w-fit">{p.mostPopular}</Badge>}
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-semibold text-neutral-900">{price}</span>
                    {plan.priceBasis !== "custom" && plan.priceCents > 0 && (
                      <span className="text-sm text-neutral-500">{p.perMonth}</span>
                    )}
                    <p className="mt-1 text-sm font-medium text-neutral-700">{plan.intendedFor}</p>
                    <p className="mt-1 text-sm text-neutral-500">{formatSeatsLabel(plan)}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.highlights.slice(0, 4).map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-neutral-600">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-600" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link href="/pricing">
              {p.viewFullPricing}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Section>

      <Section className="bg-neutral-50">
        <SectionHeader badge={p.faq} title={h.faqTitle} description={h.faqDesc} />
        <div className="mx-auto max-w-2xl divide-y divide-neutral-200 rounded-le border border-neutral-200 bg-white">
          {faqItems.map((item) => (
            <details key={item.question} className="eroup px-6 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-neutral-900">
                {item.question}
                <ChevronDown className="h-4 w-4 text-neutral-400 transition-transform eroup-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm text-neutral-600 leading-relaxed">{item.answer}</p>
            </details>
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
