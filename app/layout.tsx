import type { Metadata, Viewport } from "next";
import { Vazirmatn, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { themeInitScript } from "./components/ThemeToggle";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mykarex.ir";
const DESCRIPTION =
  "ارزیابی هوشمند علایق و توانمندی‌ها برای ترسیم دقیق‌ترین مسیر شغلی، از کشف استعداد تا آغاز یادگیری.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Karex — نقشه راه شغلی شما",
    template: "%s | Karex",
  },
  description: DESCRIPTION,
  applicationName: "Karex",
  keywords: ["مسیر شغلی", "انتخاب شغل", "استعدادیابی", "مشاوره شغلی", "آزمون شغلی", "Karex"],
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: SITE_URL,
    siteName: "Karex",
    title: "Karex — نقشه راه شغلی شما",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Karex — نقشه راه شغلی شما",
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050506" },
    { media: "(prefers-color-scheme: light)", color: "#f7f8fc" },
  ],
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
      suppressHydrationWarning
      className={`${vazirmatn.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
