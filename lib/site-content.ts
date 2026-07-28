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

export type FaqItem = { id: string; q: string; a: string };

export type IntegrationItem = {
  id: string;
  title: string;
  body: string;
  /** برچسب‌های کوچک زیر متن — مثل نام سرویس‌ها */
  tags: string[];
};

export type TimelineStage = {
  id: string;
  /** بازه‌ی سنی — روی محور نمایش داده می‌شود */
  age: string;
  title: string;
  body: string;
  /** پایداری علاقه در این بازه، ۰ تا ۱۰۰ — ارتفاع ستون از این می‌آید */
  stability: number;
  /** آیا این نقطه‌ی عطف است (تثبیت علاقه) */
  peak?: boolean;
};

export type PillarItem = {
  id: string;
  title: string;
  body: string;
  /** برچسب‌های کوچک زیر متن */
  tags: string[];
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
  pillars: {
    eyebrow: string;
    title: string;
    /** لینک پایین بخش — خالی یعنی نمایش داده نشود */
    ctaLabel: string;
    ctaHref: string;
    items: PillarItem[];
  };
  timeline: {
    eyebrow: string;
    title: string;
    lede: string;
    stages: TimelineStage[];
    /** جمله‌ی پایانی زیر نمودار */
    footnote: string;
    /** منبع یافته */
    source: string;
    sourceHref: string;
  };
  faq: {
    eyebrow: string;
    title: string;
    lede: string;
    items: FaqItem[];
  };
  integrations: {
    eyebrow: string;
    title: string;
    lede: string;
    items: IntegrationItem[];
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
    /** بخش «بر چه چیزی ساخته شده» روی صفحه‌ی اصلی */
    pillarsVisible: boolean;
    /** بخش خط زمانی تثبیت علاقه روی صفحه‌ی اصلی */
    timelineVisible: boolean;
    /** صفحه‌ی پرسش‌های متداول */
    faqVisible: boolean;
    /** صفحه‌ی یکپارچه‌سازی و داده */
    integrationsVisible: boolean;
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
  pillars: {
    eyebrow: "پشتوانه",
    title: "روی داده ساخته شده، نه حدس",
    ctaLabel: "جزئیات کامل منابع",
    ctaHref: "/data",
    items: [
      {
        id: "p-onet",
        title: "داده‌ی رسمی مشاغل",
        body:
          "نمره‌ی شخصیتی هر شغل مستقیماً از پایگاه O*NET وزارت کار آمریکا نقل می‌شود. هیچ عددی را ما نساخته‌ایم و هرکدام با کد استاندارد شغل قابل بررسی است.",
        tags: ["O*NET 30.0", "CC BY 4.0"],
      },
      {
        id: "p-riasec",
        title: "چارچوب شش‌بُعدی هالند",
        body:
          "مدل RIASEC از سال ۱۹۵۹ توسعه یافته و بیش از شصت سال در پژوهش‌های روان‌شناسی شغلی آزموده شده است. همان چارچوبی که پایگاه‌های رسمی مشاغل هم بر آن استوارند.",
        tags: ["Holland 1959", "شش بُعد"],
      },
      {
        id: "p-formula",
        title: "محاسبه‌ی قابل تکرار",
        body:
          "درصد تطابق با شباهت کسینوسی بین پروفایل شما و بردار شغل حساب می‌شود — نه با حدس مدل زبانی. با پاسخ‌های یکسان، همیشه همان عدد در می‌آید.",
        tags: ["فرمول ثابت", "بدون دخالت AI"],
      },
    ],
  },
  timeline: {
    eyebrow: "زمان‌بندی",
    title: "چه وقتی برای این تصمیم درست است؟",
    lede:
      "علاقه‌های شغلی ثابت به دنیا نمی‌آیند — شکل می‌گیرند. فراتحلیل ۶۶ پژوهش طولی نشان می‌دهد این شکل‌گیری چه مسیری دارد و از کجا قابل اتکا می‌شود.",
    stages: [
      {
        id: "t-12",
        age: "۱۲–۱۴",
        title: "هنوز در حال شکل‌گیری",
        body: "علاقه‌ها بی‌ثبات‌اند و بیشتر بازتاب محیط‌اند تا خودِ فرد. آزمون در این سن بیشتر کنجکاوی است تا راهنما.",
        stability: 51,
      },
      {
        id: "t-15",
        age: "۱۵–۱۷",
        title: "الگوها پیدا می‌شوند",
        body: "ترجیح‌ها شروع به تکرار می‌کنند. نتیجه‌ی آزمون در این سن برای کشف گزینه‌ها مفید است، نه برای تصمیم قطعی.",
        stability: 58,
      },
      {
        id: "t-18",
        age: "۱۸–۲۲",
        title: "جهش تثبیت",
        body: "بیشترین تغییر همین‌جا رخ می‌دهد. پایداری علاقه‌ها به‌سرعت بالا می‌رود — دقیقاً همان سنی که بیشتر ما باید رشته و شغل را انتخاب کنیم.",
        stability: 72,
        peak: true,
      },
      {
        id: "t-23",
        age: "۲۳–۳۰",
        title: "قابل اتکا",
        body: "پروفایل شما به سطحی رسیده که می‌توان روی آن برنامه‌ریزی کرد. تغییرها از این به بعد تدریجی‌اند، نه بنیادی.",
        stability: 77,
      },
      {
        id: "t-31",
        age: "۳۱–۴۰",
        title: "پایدار",
        body: "علاقه‌ها تقریباً ثابت می‌مانند — حتی پایدارتر از صفات شخصیتی. تغییر مسیر ممکن است، ولی بر پایه‌ی همین علاقه‌ها.",
        stability: 74,
      },
    ],
    footnote:
      "اگر بین ۱۸ تا ۲۲ سالگی هستید، در بحرانی‌ترین بازه‌اید: تصمیم‌های بزرگ دقیقاً وقتی گرفته می‌شوند که پروفایل تازه دارد تثبیت می‌شود. یک سنجش استاندارد اینجا بیشترین ارزش را دارد.",
    source: "Low, Yoon, Roberts & Rounds (2005) — فراتحلیل ۶۶ پژوهش طولی",
    sourceHref: "/science#evidence",
  },
  faq: {
    eyebrow: "پرسش‌های متداول",
    title: "پاسخ سؤال‌هایتان",
    lede:
      "هرچه بیشتر پرسیده شده، بالاتر آمده. اگر جوابتان اینجا نبود، از صفحه‌ی درباره‌ی ما پیام بدهید.",
    items: [
      {
        id: "q-time",
        q: "آزمون چقدر طول می‌کشد؟",
        a: "بین ۵ تا ۱۰ دقیقه، بسته به اینکه ۱۰، ۱۵ یا ۲۰ سؤال را انتخاب کنید. تحلیل نتیجه چند ثانیه زمان می‌برد.",
      },
      {
        id: "q-free",
        q: "استفاده از Karex رایگان است؟",
        a: "بله. آزمون، دیدن نتیجه و داشبورد همگی رایگان‌اند و برای استفاده نیازی به پرداخت نیست.",
      },
      {
        id: "q-account",
        q: "آیا باید حساب بسازم؟",
        a: "برای شروع آزمون نه، ولی برای دیدن و ذخیره‌ی نتیجه بله. بدون حساب، نتیجه جایی برای ماندن ندارد و نمی‌توانید بعداً به آن برگردید.",
      },
      {
        id: "q-repeat",
        q: "اگر دو بار آزمون بدهم نتیجه فرق می‌کند؟",
        a: "سؤال‌ها هر بار متفاوت نوشته می‌شوند، پس اگر پاسخ‌هایتان فرق کند نتیجه هم فرق می‌کند. اما محاسبه‌ی درصد تطابق قطعی است: با پاسخ‌های یکسان به سؤال‌های یکسان، همیشه همان عدد در می‌آید.",
      },
      {
        id: "q-pause",
        q: "می‌توانم وسط آزمون بیرون بروم و برگردم؟",
        a: "نه. پاسخ‌ها فقط تا پایان جلسه در مرورگر نگه داشته می‌شوند و با بستن صفحه پاک می‌شوند. موقع خروج هشدار داده می‌شود.",
      },
      {
        id: "q-talent",
        q: "این آزمون استعداد من را می‌سنجد؟",
        a: "نه. فقط علاقه را می‌سنجد. علاقه‌ی زیاد به یک حوزه به معنای توانایی در آن نیست و برعکس. برای سنجش توانایی به ابزار دیگری نیاز دارید.",
      },
      {
        id: "q-ai",
        q: "درصد تطابق را هوش مصنوعی تعیین می‌کند؟",
        a: "نه. مدل زبانی فقط متن می‌نویسد. درصد تطابق با فرمول ثابت در کد حساب می‌شود و نمره‌های مشاغل مستقیماً از پایگاه رسمی O*NET می‌آید.",
      },
      {
        id: "q-data",
        q: "داده‌های من چه می‌شود؟",
        a: "پاسخ‌ها و نتیجه در حساب شما ذخیره می‌شوند تا در داشبورد ببینیدشان. هر آزمون را هر زمان بخواهید می‌توانید حذف کنید.",
      },
      {
        id: "q-count",
        q: "چند شغل در پایگاه شما هست؟",
        a: "در حال حاضر پنج پروفایل شغلی با داده‌ی کامل O*NET. در حال گسترش است — ترجیح می‌دهیم پنج پروفایل دقیق داشته باشیم تا هزار پروفایل حدسی.",
      },
      {
        id: "q-iran",
        q: "داده‌ها برای بازار کار ایران است؟",
        a: "نمره‌های شخصیتی مشاغل جهانی‌اند، ولی داده‌های حقوق و اشتغال از اداره‌ی آمار کار آمریکا می‌آید و مستقیماً به ایران قابل تعمیم نیست. این را در صفحه‌ی پشتوانه‌ی علمی هم صریح نوشته‌ایم.",
      },
    ],
  },
  integrations: {
    eyebrow: "داده و یکپارچگی",
    title: "روی چه چیزی ساخته شده‌ایم",
    lede:
      "Karex از صفر شروع نکرده. چارچوب سنجش، داده‌ی مشاغل و زیرساخت فنی همه از منابع شناخته‌شده می‌آیند — و همه‌شان اینجا فهرست شده‌اند.",
    items: [
      {
        id: "onet",
        title: "پایگاه داده‌ی O*NET",
        body:
          "نمره‌های شخصیتی هر شغل مستقیماً از پایگاه رسمی مشاغل وزارت کار آمریکا نقل می‌شود. هیچ عددی را ما نساخته‌ایم و هر کدام با کد استاندارد شغل قابل بررسی است.",
        tags: ["O*NET 30.0", "CC BY 4.0", "داده‌ی عمومی"],
      },
      {
        id: "riasec",
        title: "مدل RIASEC هالند",
        body:
          "چارچوب شش‌بُعدی سنجش علاقه‌ی شغلی که از ۱۹۵۹ توسعه یافته و بیش از شصت سال در پژوهش‌های روان‌شناسی شغلی آزموده شده است.",
        tags: ["Holland 1959", "شش بُعد", "استاندارد جهانی"],
      },
      {
        id: "bls",
        title: "آمار بازار کار",
        body:
          "میانه‌ی دستمزد، تعداد شاغلان و چشم‌انداز رشد هر شغل از اداره‌ی آمار کار آمریکا می‌آید. این اعداد برای شناخت ساختار شغل مفیدند، نه برای تعیین حقوق در ایران.",
        tags: ["BLS 2025", "پیش‌بینی تا ۲۰۳۴"],
      },
      {
        id: "ai",
        title: "مدل زبانی",
        body:
          "برای نوشتن سؤال‌های متناسب با حوزه‌ی شما و تفسیر متنی نتیجه استفاده می‌شود. هیچ عددی را تعیین نمی‌کند — محاسبه‌ی تطابق کاملاً با فرمول ثابت انجام می‌شود.",
        tags: ["فقط متن", "بدون دخالت در اعداد"],
      },
      {
        id: "infra",
        title: "زیرساخت و امنیت",
        body:
          "احراز هویت و ذخیره‌سازی روی Supabase با رمزگذاری استاندارد. نشست‌ها با کوکی امن مدیریت می‌شوند و داده‌ی هر کاربر فقط برای خودش قابل دسترسی است.",
        tags: ["Supabase", "کوکی امن", "HTTPS"],
      },
      {
        id: "export",
        title: "کنترل داده‌ی شما",
        body:
          "همه‌ی آزمون‌ها در داشبورد شماست و هر کدام را می‌توانید حذف کنید. داده‌ی شما فروخته یا با کسی به اشتراک گذاشته نمی‌شود.",
        tags: ["حذف در هر زمان", "بدون اشتراک‌گذاری"],
      },
    ],
  },
  flags: {
    showcaseVisible: true,
    explodedVisible: true,
    registrationOpen: true,
    aboutVisible: true,
    pillarsVisible: true,
    timelineVisible: true,
    faqVisible: true,
    integrationsVisible: true,
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
