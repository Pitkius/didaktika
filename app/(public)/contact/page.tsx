import { PageHero } from "@/components/marketing/page-hero";
import { ContactForm } from "@/features/contact/contact-form";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { lt } from "@/lib/i18n";

export default function ContactPage() {
  const p = lt.public;

  return (
    <>
      <PageHero
        badge={p.contactBadge}
        title={p.contactUs}
        description={p.contactDesc}
      />
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <Card>
          <CardContent className="pt-6">
            <ContactForm />
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-sm text-neutral-500">
          {p.emailDirect}{" "}
          <a href={`mailto:${siteConfig.contactEmail}`} className="text-brand-600 hover:underline">
            {siteConfig.contactEmail}
          </a>
        </p>
      </div>
    </>
  );
}
