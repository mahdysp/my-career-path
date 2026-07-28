import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "داشبورد",
  description: "پروفایل شغلی، تاریخچه آزمون‌ها و مسیرهای پیشنهادی شما در یک نگاه.",
  openGraph: {
    title: "داشبورد | Karex",
    description: "پروفایل شغلی، تاریخچه آزمون‌ها و مسیرهای پیشنهادی شما در یک نگاه.",
    type: "website",
  },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
