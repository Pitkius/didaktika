import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="mb-8 text-center">
        <Link href="/" className="text-2xl font-semibold tracking-tight text-brand-900">
          {siteConfig.name}
        </Link>
        <p className="mt-1.5 text-sm text-neutral-500">{siteConfig.tagline}</p>
      </div>
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-8 text-center text-xs text-neutral-400">
        © {new Date().getFullYear()} {siteConfig.company}
      </p>
    </div>
  );
}
