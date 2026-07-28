import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "آزمون مسیریابی شغلی",
  description: "به پرسش‌های کوتاه پاسخ دهید تا الگوی علاقه و مهارتتان مشخص شود.",
  openGraph: {
    title: "آزمون مسیریابی شغلی | Karex",
    description: "به پرسش‌های کوتاه پاسخ دهید تا الگوی علاقه و مهارتتان مشخص شود.",
    type: "website",
  },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
