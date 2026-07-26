import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Karex — نقشه راه شغلی شما",
  description:
    "ارزیابی هوشمند علایق و توانمندی‌ها برای ترسیم دقیق‌ترین مسیر شغلی، از کشف استعداد تا آغاز یادگیری.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${plexArabic.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
