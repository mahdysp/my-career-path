import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AboutClient from "./AboutClient";
import { getSiteContent } from "@/lib/site-content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mykarex.ir";

export const metadata: Metadata = {
  title: "درباره‌ی ما — Karex",
  description:
    "چرا Karex ساخته شد، چه اصولی را رعایت می‌کنیم، و چطور می‌توانید با ما در تماس باشید.",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "درباره‌ی ما — Karex",
    description: "داستان Karex، اصول کاری، و راه‌های ارتباطی.",
    url: `${SITE_URL}/about`,
    type: "article",
  },
};

/* محتوا از پنل ادمین می‌آید، پس نباید در زمان بیلد ثابت شود */
export const revalidate = 60;

export default async function AboutPage() {
  const content = await getSiteContent();

  /* اگر ادمین این صفحه را خاموش کرده باشد، ۴۰۴ بدهیم نه صفحه‌ی خالی */
  if (!content.flags.aboutVisible) notFound();

  return <AboutClient about={content.about} />;
}
