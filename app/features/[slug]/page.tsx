import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FeatureClient from "../FeatureClient";
import { FEATURE_PAGES, FEATURE_SLUGS } from "@/lib/feature-content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mykarex.ir";

/* هر چهار صفحه در زمان بیلد ساخته می‌شوند — محتوا ثابت است و نیازی به
   رندر در زمان درخواست ندارد. */
export function generateStaticParams() {
  return FEATURE_SLUGS.map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = FEATURE_PAGES[slug];
  if (!page) return {};

  return {
    title: `${page.eyebrow} — Karex`,
    description: page.lede.slice(0, 155),
    alternates: { canonical: `${SITE_URL}/features/${slug}` },
    openGraph: {
      title: `${page.eyebrow} — Karex`,
      description: page.lede.slice(0, 155),
      url: `${SITE_URL}/features/${slug}`,
      type: "article",
    },
  };
}

export default async function FeaturePageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = FEATURE_PAGES[slug];
  if (!page) notFound();

  return <FeatureClient page={page} />;
}
