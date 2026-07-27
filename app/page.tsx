import HomeClient from "./HomeClient";
import { getSiteContent } from "@/lib/site-content";

/**
 * صفحه‌ی اصلی — یک لایه‌ی سروری نازک روی HomeClient.
 *
 * چرا جدا شد: محتوای بخش نمایشگر و متن‌های صفحه از دیتابیس می‌آیند تا در
 * پنل مدیریت قابل ویرایش باشند. خواندن دیتابیس فقط سمت سرور ممکن است.
 *
 * اگر دیتابیس در دسترس نباشد، getSiteContent مقدار پیش‌فرض برمی‌گرداند و
 * صفحه سالم بالا می‌آید — هیچ‌وقت به‌خاطر پنل، صفحه‌ی اصلی نمی‌شکند.
 */

/* محتوا از پنل تغییر می‌کند، پس نباید در زمان بیلد ثابت شود.
   بازاعتبارسنجی هر ۶۰ ثانیه: هم تغییرات سریع دیده می‌شوند، هم هر بازدید
   یک کوئری به دیتابیس نمی‌زند. */
export const revalidate = 60;

export default async function Page() {
  const content = await getSiteContent();

  /* داده‌ی ساختاریافته‌ی پرسش و پاسخ — گوگل می‌تواند پاسخ‌ها را مستقیم
     در نتایج نشان دهد. محتوا از پنل خودمان می‌آید، نه ورودی عمومی. */
  const faqJsonLd =
    content.flags.faqVisible && content.faq.items.length
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: content.faq.items.map((i) => ({
            "@type": "Question",
            name: i.q,
            acceptedAnswer: { "@type": "Answer", text: i.a },
          })),
        }
      : null;

  return (
    <>
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <HomeClient content={content} />
    </>
  );
}
