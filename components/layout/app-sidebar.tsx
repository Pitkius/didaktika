"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { lt } from "@/lib/i18n";
import { navMaps } from "@/lib/i18n/nav";
import { logoutAction } from "@/features/auth/actions";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  FileText,
  PenTool,
  Bot,
  TrendingUp,
  Library,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  CreditCard,
  CircleAlert,
  Map,
  CalendarDays,
  KeyRound,
  Shield,
  Activity,
  School,
} from "lucide-react";
import { useState } from "react";

const iconMaps = {
  student: [
    LayoutDashboard,
    BookOpen,
    ClipboardList,
    FileText,
    PenTool,
    Bot,
    CircleAlert,
    Map,
    CalendarDays,
    TrendingUp,
    Library,
    Bell,
    User,
    Settings,
    CreditCard,
  ],
  teacher: [
    LayoutDashboard,
    Library,
    User,
    ClipboardList,
    FileText,
    PenTool,
    BookOpen,
    Bot,
    TrendingUp,
    Shield,
    Bell,
    User,
    Settings,
    CreditCard,
  ],
  "school-admin": [
    LayoutDashboard,
    User,
    User,
    User,
    Library,
    BookOpen,
    TrendingUp,
    Bell,
    Settings,
    CreditCard,
    FileText,
  ],
  admin: [
    LayoutDashboard,
    School,
    User,
    CreditCard,
    KeyRound,
    Bot,
    Shield,
    FileText,
    Activity,
    FileText,
    Settings,
  ],
};

interface AppSidebarProps {
  area: keyof typeof navMaps;
  userName: string;
}

export function AppSidebar({ area, userName }: AppSidebarProps) {
  const pathname = usePathname();
  const nav = navMaps[area];
  const icons = iconMaps[area];
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <>
      <div className="flex h-14 items-center border-b border-neutral-200 px-4">
        <Link href="/" className="font-semibold text-brand-900">
          {siteConfig.name}
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {nav.map((item, i) => {
          const Icon = icons[i] ?? LayoutDashboard;
          const isActive =
            pathname === item.href ||
            (item.href !== `/${area}` && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-brand-50 text-brand-700 font-medium"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-neutral-200 p-3">
        <p className="truncate px-3 text-xs text-neutral-500">{userName}</p>
        <form action={logoutAction}>
          <button
            type="submit"
            className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
          >
            <LogOut className="h-4 w-4" />
            {lt.common.logout}
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      <button
        className="fixed left-4 top-4 z-50 rounded-md border border-neutral-200 bg-white p-2 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={lt.common.toggleMenu}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-neutral-200 bg-white transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NavContent />
      </aside>
    </>
  );
}

export function AppShell({
  area,
  userName,
  children,
}: {
  area: keyof typeof navMaps;
  userName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AppSidebar area={area} userName={userName} />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
