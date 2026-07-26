import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "انتخاب حوزه تخصصی",
  description: "حوزه تخصصی‌ات را انتخاب کن و با ارزیابی هوشمند مهارت، شایستگی‌هایت را بسنج.",
  openGraph: {
    title: "انتخاب حوزه تخصصی | Karex",
    description: "حوزه تخصصی‌ات را انتخاب کن و با ارزیابی هوشمند مهارت، شایستگی‌هایت را بسنج.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
