import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ورود به حساب کاربری",
  description: "برای ادامه مسیر شغلی‌تان وارد حساب کاربری Karex شوید.",
  openGraph: {
    title: "ورود به حساب کاربری | Karex",
    description: "برای ادامه مسیر شغلی‌تان وارد حساب کاربری Karex شوید.",
    type: "website",
  },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
