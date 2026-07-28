import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "پنل مدیریت — Karex",
  description: "مدیریت کاربران، آزمون‌ها و محتوای سایت",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
