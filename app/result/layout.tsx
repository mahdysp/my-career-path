import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "نتیجه مسیریابی شغلی",
  description: "مسیرهای شغلی پیشنهادی، نقشه راه یادگیری و تحلیل ویژگی‌های شما.",
  openGraph: {
    title: "نتیجه مسیریابی شغلی | Karex",
    description: "مسیرهای شغلی پیشنهادی، نقشه راه یادگیری و تحلیل ویژگی‌های شما.",
    type: "website",
  },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
