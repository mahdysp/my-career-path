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
  flags: {
    /** بخش نمایشگر روی صفحه‌ی اصلی دیده شود */
    showcaseVisible: boolean;
    /** بخش نمای انفجاری دیده شود */
    explodedVisible: boolean;
    /** ثبت‌نام کاربر جدید باز است */
    registrationOpen: boolean;
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
  flags: {
    showcaseVisible: true,
    explodedVisible: true,
    registrationOpen: true,
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
