import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ساخت حساب کاربری",
  description: "حساب رایگان بسازید و مسیر شغلی متناسب با علایق و مهارت‌هایتان را کشف کنید.",
  openGraph: {
    title: "ساخت حساب کاربری | Karex",
    description: "حساب رایگان بسازید و مسیر شغلی متناسب با علایق و مهارت‌هایتان را کشف کنید.",
    type: "website",
  },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
