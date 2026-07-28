"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import ThemeToggle from "@/app/components/ThemeToggle";
import { adminStyles } from "./adminStyles";

/**
 * پوسته‌ی مشترک پنل مدیریت — نوار کناری، ناوبری و هویت ادمین.
 *
 * دسترسی واقعی در هر API Route بررسی می‌شود؛ اینجا فقط چیدمان است.
 * هرگز نباید کنترل دسترسی را به کلاینت سپرد.
 */

type NavItem = { href: string; label: string; icon: ReactNode };

const I = {
  home: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" />
    </svg>
  ),
  users: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.4" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16.5 5.2a3.4 3.4 0 0 1 0 5.6M18 20a6.4 6.4 0 0 0-2-4.6" />
    </svg>
  ),
  quiz: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="2.5" /><path d="M8.5 8.5h7M8.5 12.5h7M8.5 16.5h4" />
    </svg>
  ),
  content: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="4" width="19" height="13" rx="2" /><path d="M8 21h8M12 17v4" />
    </svg>
  ),
  media: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" /><circle cx="8.5" cy="10" r="1.6" /><path d="m3.5 17 5-4.5 4 3.5 3-2.5 5 4" />
    </svg>
  ),
  settings: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3.2" /><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3" />
    </svg>
  ),
  audit: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5.2l3.2 2" />
    </svg>
  ),
  ai: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5.5" y="5.5" width="13" height="13" rx="3" /><rect x="9.75" y="9.75" width="4.5" height="4.5" rx="1" />
      <path d="M9.5 2.5v3M14.5 2.5v3M9.5 18.5v3M14.5 18.5v3M2.5 9.5h3M2.5 14.5h3M18.5 9.5h3M18.5 14.5h3" />
    </svg>
  ),
};

const NAV: NavItem[] = [
  { href: "/admin", label: "نمای کلی", icon: I.home },
  { href: "/admin/users", label: "کاربران", icon: I.users },
  { href: "/admin/attempts", label: "آزمون‌ها", icon: I.quiz },
  { href: "/admin/content", label: "محتوای سایت", icon: I.content },
  { href: "/admin/media", label: "رسانه", icon: I.media },
  { href: "/admin/ai", label: "هوش مصنوعی", icon: I.ai },
  { href: "/admin/settings", label: "تنظیمات", icon: I.settings },
  { href: "/admin/audit", label: "رویدادها", icon: I.audit },
];

export default function AdminShell({
  children,
  admin,
}: {
  children: ReactNode;
  admin?: { email: string; via: string } | null;
}) {
  const path = usePathname();
  const isOn = (href: string) =>
    href === "/admin" ? path === "/admin" : path.startsWith(href);

  return (
    <div dir="rtl" className="ad-shell">
      <style>{adminStyles}</style>

      <aside className="ad-side">
        <div className="ad-brand">
          <b>Karex</b>
          <span>ADMIN</span>
        </div>

        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={`ad-navlink ${isOn(n.href) ? "on" : ""}`}>
            {n.icon}
            {n.label}
          </Link>
        ))}

        <div className="ad-side-foot">
          {admin && (
            <div className="ad-who">
              <b>{admin.email}</b>
              <br />
              دسترسی از طریق {admin.via === "env" ? "متغیر محیطی" : "نقش کاربری"}
            </div>
          )}
          <div className="ad-row">
            <ThemeToggle />
            <Link href="/" className="ad-btn sm" style={{ textDecoration: "none" }}>
              بازگشت به سایت
            </Link>
          </div>
        </div>
      </aside>

      <nav className="ad-mobilebar">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={`ad-navlink ${isOn(n.href) ? "on" : ""}`}>
            {n.label}
          </Link>
        ))}
      </nav>

      <main className="ad-main">{children}</main>
    </div>
  );
}
