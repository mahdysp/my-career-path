import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DataClient from "./DataClient";
import { getSiteContent } from "@/lib/site-content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mykarex.ir";

export const metadata: Metadata = {
  title: "داده و یکپارچگی — Karex",
  description:
    "Karex روی چه چیزی ساخته شده: پایگاه O*NET، مدل RIASEC هالند، آمار بازار کار، و نقش دقیق هوش مصنوعی.",
  alternates: { canonical: `${SITE_URL}/data` },
  openGraph: {
    title: "داده و یکپارچگی — Karex",
    description: "منابع داده، چارچوب سنجش و زیرساخت فنی Karex.",
    url: `${SITE_URL}/data`,
    type: "article",
  },
};

export const revalidate = 60;

export default async function DataPage() {
  const content = await getSiteContent();
  if (!content.flags.integrationsVisible) notFound();

  return <DataClient integrations={content.integrations} />;
}
