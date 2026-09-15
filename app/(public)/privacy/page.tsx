import { siteConfig } from "@/config/site";
import { lt } from "@/lib/i18n";

export default function PrivacyPage() {
  const p = lt.public;
  const pr = lt.privacyPage;

  return (
    <div className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h1 className="text-3xl font-semibold text-neutral-900">{p.privacyTitle}</h1>
        <p className="mt-2 text-sm text-neutral-400">{p.lastUpdated}</p>
        <div className="mt-8 space-y-6 text-neutral-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-neutral-900">{pr.s1Title}</h2>
            <p className="mt-2">
              {pr.s1Body
                .replace("{company}", siteConfig.company)
                .replace("{name}", siteConfig.name)}
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-neutral-900">{pr.s2Title}</h2>
            <p className="mt-2">{pr.s2Body}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-neutral-900">{pr.s3Title}</h2>
            <p className="mt-2">{pr.s3Body}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-neutral-900">{pr.s4Title}</h2>
            <p className="mt-2">{pr.s4Body.replace("{email}", siteConfig.contactEmail)}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-neutral-900">{pr.s5Title}</h2>
            <p className="mt-2">{pr.s5Body.replace("{email}", siteConfig.contactEmail)}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
