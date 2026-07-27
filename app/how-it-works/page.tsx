import type { Metadata } from "next";
import MethodClient from "./MethodClient";
import { FAQS } from "@/lib/method-content";

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

/* داده‌ی ساختاریافته‌ی پرسش و پاسخ — گوگل می‌تواند مستقیم در نتایج نشان دهد */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function HowItWorksPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // محتوا ثابت و از خود ماست، نه ورودی کاربر
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <MethodClient />
    </>
  );
}
