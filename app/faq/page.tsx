import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FaqClient from "./FaqClient";
import { getSiteContent } from "@/lib/site-content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mykarex.ir";

export const metadata: Metadata = {
  title: "پرسش‌های متداول — Karex",
  description:
    "پاسخ سؤال‌های رایج درباره‌ی آزمون مسیریابی شغلی Karex: زمان، هزینه، حساب کاربری، اعتبار نتیجه و داده‌ها.",
  alternates: { canonical: `${SITE_URL}/faq` },
  openGraph: {
    title: "پرسش‌های متداول — Karex",
    description: "پاسخ سؤال‌های رایج درباره‌ی آزمون مسیریابی شغلی Karex.",
    url: `${SITE_URL}/faq`,
    type: "article",
  },
};

export const revalidate = 60;

export default async function FaqPage() {
  const content = await getSiteContent();
  if (!content.flags.faqVisible) notFound();

  /* داده‌ی ساختاریافته — گوگل می‌تواند پاسخ‌ها را مستقیم در نتایج نشان دهد */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faq.items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // محتوا از پنل خودمان می‌آید، نه ورودی عمومی کاربر
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FaqClient faq={content.faq} />
    </>
  );
}
