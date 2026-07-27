import type { Metadata } from "next";
import MethodClient from "./MethodClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mykarex.ir";

export const metadata: Metadata = {
  title: "روش کار — Karex",
  description:
    "شش مرحله از انتخاب حوزه تا نتیجه: سؤال‌ها چطور ساخته می‌شوند، پروفایل RIASEC چطور شکل می‌گیرد و درصد تطابق چطور محاسبه می‌شود.",
  alternates: { canonical: `${SITE_URL}/how-it-works` },
  openGraph: {
    title: "روش کار — Karex",
    description:
      "از یک کلمه تا نقشه‌ی مسیر — شش مرحله‌ی آزمون مسیریابی شغلی Karex بدون جعبه‌ی سیاه.",
    url: `${SITE_URL}/how-it-works`,
    type: "article",
  },
};

export default function HowItWorksPage() {
  return <MethodClient />;
}
