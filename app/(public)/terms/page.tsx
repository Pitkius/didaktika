import { siteConfig } from "@/config/site";
import { lt } from "@/lib/i18n";

export default function TermsPage() {
  const p = lt.public;
  const t = lt.termsPage;

  return (
    <div className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h1 className="text-3xl font-semibold text-neutral-900">{p.termsTitle}</h1>
        <p className="mt-2 text-sm text-neutral-400">{p.lastUpdated}</p>
        <div className="mt-8 space-y-6 text-neutral-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-neutral-900">{t.s1Title}</h2>
            <p className="mt-2">{t.s1Body.replace("{name}", siteConfig.name)}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-neutral-900">{t.s2Title}</h2>
            <p className="mt-2">{t.s2Body.replace("{name}", siteConfig.name)}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-neutral-900">{t.s3Title}</h2>
            <p className="mt-2">{t.s3Body}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-neutral-900">{t.s4Title}</h2>
            <p className="mt-2">{t.s4Body}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-neutral-900">{t.s5Title}</h2>
            <p className="mt-2">{t.s5Body.replace("{email}", siteConfig.contactEmail)}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
