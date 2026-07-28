import type { Metadata } from "next";
import ScienceClient from "./ScienceClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mykarex.ir";

export const metadata: Metadata = {
  title: "پشتوانه‌ی علمی — Karex",
  description:
    "مدل RIASEC هالند، داده‌های O*NET وزارت کار آمریکا، روش دقیق محاسبه‌ی درصد تطابق، و محدودیت‌های این آزمون — با ارجاع به منابع داوری‌شده.",
  alternates: { canonical: `${SITE_URL}/science` },
  openGraph: {
    title: "پشتوانه‌ی علمی — Karex",
    description:
      "این آزمون بر چه چیزی استوار است؟ مدل RIASEC، داده‌های O*NET، فرمول محاسبه و محدودیت‌ها.",
    url: `${SITE_URL}/science`,
    type: "article",
  },
};

export default function SciencePage() {
  return <ScienceClient />;
}
