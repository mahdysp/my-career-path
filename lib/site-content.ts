import { getSupabaseAdmin } from "./supabase-admin";

/**
 * محتوای قابل ویرایش صفحه‌ی اصلی.
 *
 * طراحی: به‌جای ستون‌های ثابت در دیتابیس، یک انبار کلید/JSON. اضافه کردن
 * یک بخش جدید به سایت فقط یک کلید تازه اینجا می‌خواهد، نه مهاجرت دیتابیس.
 *
 * همیشه یک مقدار پیش‌فرض وجود دارد، پس اگر دیتابیس خالی یا در دسترس نبود
 * سایت با محتوای پیش‌فرض بالا می‌آید و هیچ‌وقت خراب دیده نمی‌شود.
 */

export type ShowcaseSlide = {
  id: string;
  /** آدرس فایل — خالی یعنی جای‌گیر نمایش داده شود */
  src: string;
  video: boolean;
  alt: string;
  eyebrow: string;
  title: string;
  body: string;
  /** نوشته‌ی نوار بالای پنجره‌ی مانیتور */
  label: string;
};

export type AboutValue = { id: string; title: string; body: string };
export type ContactChannel = {
  id: string;
  /** نوع کانال — آیکن و رفتار لینک از همین می‌آید */
  kind: "email" | "telegram" | "instagram" | "phone" | "address" | "link";
  label: string;
  value: string;
  /** خالی بگذارید تا خودکار از kind و value ساخته شود */
  href: string;
};

export type SiteContent = {
  showcase: { slides: ShowcaseSlide[] };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
  exploded: { eyebrow: string; title: string; subtitle: string };
  about: {
    /** پیام کوتاه بالای صفحه */
    eyebrow: string;
    title: string;
    lede: string;
    /** داستان ما — هر بند یک پاراگراف */
    story: string[];
    /** ارزش‌ها یا اصول کاری */
    values: AboutValue[];
    /** متن بالای بخش تماس */
    contactTitle: string;
    contactBody: string;
    channels: ContactChannel[];
    /** زمان پاسخ‌گویی — خالی یعنی نمایش داده نشود */
    responseTime: string;
  };
  flags: {
    /** بخش نمایشگر روی صفحه‌ی اصلی دیده شود */
    showcaseVisible: boolean;
    /** بخش نمای انفجاری دیده شود */
    explodedVisible: boolean;
    /** ثبت‌نام کاربر جدید باز است */
    registrationOpen: boolean;
    /** صفحه‌ی درباره‌ی ما در منو و فوتر دیده شود */
    aboutVisible: boolean;
    /** پیام نواری بالای سایت — خالی یعنی نمایش داده نشود */
    banner: string;
  };
};

export const DEFAULT_CONTENT: SiteContent = {
  showcase: {
    slides: [
      {
        id: "result",
        src: "",
        video: false,
        alt: "نتیجه‌ی آزمون شخصیت شغلی",
        eyebrow: "نتیجه‌ی آزمون",
        title: "تصویری که از خودتان نداشتید",
        body: "پس از آزمون، شش بُعد شخصیت شغلی‌تان روی یک نمودار می‌نشیند و می‌بینید کدام مسیرها با شما هم‌جهت‌اند و کدام‌ها نه.",
        label: "karex.ir/result",
      },
      {
        id: "dashboard",
        src: "",
        video: false,
        alt: "داشبورد پیشرفت",
        eyebrow: "داشبورد",
        title: "مسیرتان را دنبال کنید",
        body: "هر آزمون ثبت می‌شود. تغییر علاقه‌ها در طول زمان، شغل‌های پیشنهادی و کارهایی که باید بعد انجام دهید — همه یک‌جا.",
        label: "karex.ir/dashboard",
      },
      {
        id: "careers",
        src: "",
        video: false,
        alt: "مقایسه‌ی مشاغل",
        eyebrow: "مقایسه‌ی مشاغل",
        title: "بر پایه‌ی داده، نه حدس",
        body: "درصد تطابق از داده‌های رسمی O*NET محاسبه می‌شود؛ حقوق، چشم‌انداز رشد و مهارت‌های لازم هر شغل کنار هم.",
        label: "karex.ir/careers",
      },
    ],
  },
  hero: {
    eyebrow: "",
    title: "",
    subtitle: "",
    primaryCta: "",
    secondaryCta: "",
  },
  exploded: {
    eyebrow: "پروفایل شغلی",
    title: "شش قطعه، یک تصویر کامل",
    subtitle:
      "شخصیت شغلی شما از شش بُعد ساخته شده است. آزمون Karex این قطعات را کنار هم می‌گذارد تا ببینید کدام مسیر واقعاً به شما می‌آید.",
  },
  about: {
    eyebrow: "درباره‌ی ما",
    title: "چرا Karex را ساختیم",
    lede:
      "انتخاب مسیر شغلی در ایران بیشتر بر پایه‌ی حرف اطرافیان و حدس و گمان است تا داده. Karex تلاشی است برای اینکه این تصمیم دست‌کم یک نقطه‌ی شروع روشن داشته باشد.",
    story: [
      "خیلی از ما رشته و شغلمان را بر اساس رتبه‌ی کنکور، توصیه‌ی خانواده، یا صرفاً چیزی که در دسترس بود انتخاب کردیم. سال‌ها بعد تازه می‌فهمیم که آن انتخاب چقدر با آنچه واقعاً به ما انرژی می‌دهد فاصله داشته.",
      "Karex ادعا نمی‌کند این مسئله را حل می‌کند. کاری که می‌کند ساده‌تر است: با یک چارچوب استاندارد و داده‌ی واقعی، به شما نشان می‌دهد چه نوع کاری با علاقه‌هایتان هم‌جهت است — تا دست‌کم بدانید کجا را باید بیشتر بگردید.",
      "همه‌چیز را باز گذاشته‌ایم: فرمول محاسبه، منبع داده‌ها، نقش هوش مصنوعی، و محدودیت‌هایی که این روش دارد. اگر ابزاری محدودیت‌هایش را نگوید، قابل اعتماد نیست.",
    ],
    values: [
      {
        id: "honest",
        title: "صداقت بر بازاریابی",
        body: "اگر عددی پشتوانه‌ی محکم ندارد، می‌نویسیم. محدودیت‌های آزمون را به‌اندازه‌ی نقاط قوتش برجسته کرده‌ایم.",
      },
      {
        id: "data",
        title: "داده به‌جای حدس",
        body: "نمره‌های شغلی مستقیماً از پایگاه رسمی O*NET می‌آید و درصد تطابق با فرمول ثابت حساب می‌شود، نه با حدس مدل زبانی.",
      },
      {
        id: "light",
        title: "سبک و در دسترس",
        body: "سایت طوری ساخته شده که روی اینترنت کند هم باز شود. استفاده از آزمون رایگان است.",
      },
      {
        id: "privacy",
        title: "داده‌ی شما مال شماست",
        body: "نتایج فقط در حساب خودتان ذخیره می‌شود و هر زمان بخواهید می‌توانید حذفش کنید.",
      },
    ],
    contactTitle: "راه‌های ارتباطی",
    contactBody:
      "اگر پیشنهادی دارید، ایرادی دیدید، یا ادعایی در سایت بدون منبع بود — حتماً بگویید. پیام‌ها را می‌خوانیم.",
    channels: [
      {
        id: "email",
        kind: "email",
        label: "ایمیل",
        value: "hello@mykarex.ir",
        href: "",
      },
      {
        id: "telegram",
        kind: "telegram",
        label: "تلگرام",
        value: "@mykarex",
        href: "",
      },
    ],
    responseTime: "معمولاً ظرف ۲ روز کاری پاسخ می‌دهیم.",
  },
  flags: {
    showcaseVisible: true,
    explodedVisible: true,
    registrationOpen: true,
    aboutVisible: true,
    banner: "",
  },
};

export type ContentKey = keyof SiteContent;

/** ادغام کم‌عمق با پیش‌فرض تا کلیدهای تازه در رکوردهای قدیمی گم نشوند */
function merge<K extends ContentKey>(key: K, value: unknown): SiteContent[K] {
  const base = DEFAULT_CONTENT[key];
  if (!value || typeof value !== "object") return base;
  return { ...base, ...(value as object) } as SiteContent[K];
}

/**
 * کل محتوای سایت را می‌خواند.
 *
 * هرگز throw نمی‌کند — اگر دیتابیس در دسترس نبود، پیش‌فرض برمی‌گردد و
 * صفحه‌ی اصلی سالم بالا می‌آید.
 */
export async function getSiteContent(): Promise<SiteContent> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("site_content")
      .select("key, value");

    if (error) {
      console.error("[site-content] read failed:", error.message);
      return DEFAULT_CONTENT;
    }

    const out = { ...DEFAULT_CONTENT };
    for (const row of data ?? []) {
      const k = row.key as ContentKey;
      if (k in DEFAULT_CONTENT) {
        // @ts-expect-error — کلید در زمان اجرا بررسی شد
        out[k] = merge(k, row.value);
      }
    }
    return out;
  } catch (e) {
    console.error("[site-content] read threw:", e);
    return DEFAULT_CONTENT;
  }
}

/** یک کلید را می‌خواند */
export async function getContentKey<K extends ContentKey>(
  key: K
): Promise<SiteContent[K]> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("site_content")
      .select("value")
      .eq("key", key)
      .maybeSingle();

    if (error || !data) return DEFAULT_CONTENT[key];
    return merge(key, data.value);
  } catch {
    return DEFAULT_CONTENT[key];
  }
}

/** یک کلید را می‌نویسد */
export async function setContentKey<K extends ContentKey>(
  key: K,
  value: SiteContent[K],
  actorId: string
) {
  const { error } = await getSupabaseAdmin()
    .from("site_content")
    .upsert(
      {
        key,
        value: value as unknown as Record<string, unknown>,
        updated_at: new Date().toISOString(),
        updated_by: actorId,
      },
      { onConflict: "key" }
    );

  if (error) throw new Error(error.message);
}
