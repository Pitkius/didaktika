import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getDashboardPath } from "@/lib/auth/roles";
import { lt } from "@/lib/i18n";
import { UserRole } from "@prisma/client";

const navLinks = [
  { href: "/features", label: lt.common.features },
  { href: "/for-students", label: lt.nav.public.forStudents },
  { href: "/for-teachers", label: lt.nav.public.forTeachers },
  { href: "/for-schools", label: lt.nav.public.forSchools },
  { href: "/pricing", label: lt.common.pricing },
];

export async function PublicHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold text-brand-900">
          {siteConfig.name}
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {session?.user ? (
            <Button asChild size="sm">
              <Link href={getDashboardPath(session.user.role as UserRole)}>
                {lt.common.dashboard}
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">{lt.common.login}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">{lt.common.getStarted}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  const p = lt.public;
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-semibold text-brand-900">{siteConfig.name}</p>
            <p className="mt-2 text-sm text-neutral-500">{siteConfig.tagline}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900">{p.footerProduct}</p>
            <ul className="mt-3 space-y-2 text-sm text-neutral-500">
              <li><Link href="/features" className="hover:text-neutral-900">{lt.common.features}</Link></li>
              <li><Link href="/pricing" className="hover:text-neutral-900">{lt.common.pricing}</Link></li>
              <li><Link href="/for-students" className="hover:text-neutral-900">{lt.nav.public.forStudents}</Link></li>
              <li><Link href="/for-teachers" className="hover:text-neutral-900">{lt.nav.public.forTeachers}</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900">{p.footerCompany}</p>
            <ul className="mt-3 space-y-2 text-sm text-neutral-500">
              <li><Link href="/about" className="hover:text-neutral-900">{lt.common.about}</Link></li>
              <li><Link href="/contact" className="hover:text-neutral-900">{lt.common.contact}</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900">{p.footerLegal}</p>
            <ul className="mt-3 space-y-2 text-sm text-neutral-500">
              <li><Link href="/privacy" className="hover:text-neutral-900">{lt.common.privacy}</Link></li>
              <li><Link href="/terms" className="hover:text-neutral-900">{lt.common.terms}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-neutral-200 pt-8 text-sm text-neutral-400">
          © {new Date().getFullYear()} {siteConfig.company}. {p.allRights}
        </div>
      </div>
    </footer>
  );
}
