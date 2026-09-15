import { siteConfig } from "@/config/site";
import { lt } from "@/lib/i18n";

export default function AboutPage() {
  const p = lt.public;
  const a = lt.aboutPage;

  return (
    <div className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h1 className="text-3xl font-semibold text-neutral-900">
          {p.aboutTitle.replace("{name}", siteConfig.name)}
        </h1>
        <div className="mt-8 space-y-6 text-neutral-600 leading-relaxed">
          <p>{a.p1.replaceAll("{name}", siteConfig.name)}</p>
          <p>{a.p2}</p>
          <p>{a.p3}</p>
          <h2 className="text-xl font-semibold text-neutral-900 pt-4">{p.aboutMission}</h2>
          <p>{a.mission}</p>
        </div>
      </div>
    </div>
  );
}
