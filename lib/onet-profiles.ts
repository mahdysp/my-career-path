/**
 * پروفایل‌های شغلی بر پایه داده‌های واقعی O*NET
 * ---------------------------------------------------------------------------
 * منبع: O*NET OnLine — پایگاه داده مشاغل وزارت کار ایالات متحده
 *   (U.S. Department of Labor, Employment and Training Administration)
 *   نسخه دیتابیس ۳۰.۰ — صفحات به‌روزرسانی‌شده ۲۰۲۶
 *   مجوز: Creative Commons Attribution 4.0 International (CC BY 4.0)
 *   https://www.onetonline.org/
 *
 * مقادیر «axes» نمره‌های «Career Interest Types» هستند؛ یعنی مدل شش‌ضلعی
 * RIASEC جان هالند (Holland Occupational Themes) که استاندارد جهانی سنجش
 * علاقه شغلی است. هر نمره عددی بین ۰ تا ۱۰۰ و مستقیماً از O*NET نقل شده —
 * هیچ عددی تخمینی یا دست‌ساز نیست.
 *
 * داده‌های دستمزد از Bureau of Labor Statistics (BLS) — داده‌های دستمزد ۲۰۲۵
 * و پیش‌بینی اشتغال ۲۰۲۴–۲۰۳۴، که O*NET منتشر می‌کند.
 */

export type RiasecKey = "R" | "I" | "A" | "S" | "E" | "C";

export interface RiasecAxis {
  key: RiasecKey;
  /** برچسب فارسی کوتاه برای نمایش روی نمودار */
  label: string;
  /** نام انگلیسی استاندارد هالند */
  english: string;
  /** توضیح یک‌خطی */
  hint: string;
}

/** شش تیپ هالند به ترتیب استاندارد RIASEC */
export const RIASEC_AXES: RiasecAxis[] = [
  { key: "R", label: "عمل‌گرا", english: "Realistic", hint: "ساختن، تعمیر و کار با ابزار و تجهیزات" },
  { key: "I", label: "پژوهشگر", english: "Investigative", hint: "تحلیل، پژوهش و حل مسائل پیچیده" },
  { key: "A", label: "هنرمند", english: "Artistic", hint: "خلاقیت، طراحی و بیان بصری" },
  { key: "S", label: "اجتماعی", english: "Social", hint: "آموزش، کمک و خدمت به دیگران" },
  { key: "E", label: "رهبر", english: "Enterprising", hint: "رهبری، مذاکره و توسعه کسب‌وکار" },
  { key: "C", label: "منظم", english: "Conventional", hint: "نظم، داده و کار مبتنی بر رویه‌های مشخص" },
];

export interface OnetProfile {
  /** کد استاندارد SOC در O*NET */
  code: string;
  /** عنوان رسمی انگلیسی شغل در O*NET */
  englishTitle: string;
  /** عنوان فارسی */
  role: string;
  /** کلیدواژه‌های فارسی که کاربر ممکن است جستجو کند */
  keywords: string[];
  /** نمرات RIASEC — عدد ۰ تا ۱۰۰، مستقیماً از O*NET */
  scores: Record<RiasecKey, number>;
  /** میانه دستمزد سالانه (دلار، BLS 2025) */
  medianWage: number;
  /** تعداد شاغلان (BLS 2024) */
  employment: number;
  /** فرصت‌های شغلی پیش‌بینی‌شده سالانه ۲۰۲۴–۲۰۳۴ */
  openings: number;
  /** چشم‌انداز رشد */
  outlook: string;
  /** لینک صفحه مرجع در O*NET */
  url: string;
}

export const ONET_PROFILES: OnetProfile[] = [
  {
    code: "15-1252.00",
    englishTitle: "Software Developers",
    role: "توسعه‌دهنده نرم‌افزار",
    keywords: ["برنامه‌نویسی", "برنامه نویسی", "نرم‌افزار", "نرم افزار", "کدنویسی", "توسعه‌دهنده", "developer", "programming"],
    scores: { R: 44, I: 84, A: 23, S: 14, E: 15, C: 77 },
    medianWage: 135980,
    employment: 1693800,
    openings: 115200,
    outlook: "بسیار سریع‌تر از میانگین",
    url: "https://www.onetonline.org/link/details/15-1252.00",
  },
  {
    code: "15-1255.00",
    englishTitle: "Web and Digital Interface Designers",
    role: "طراح رابط و تجربه کاربری",
    keywords: ["طراحی UI/UX", "طراحی", "رابط کاربری", "تجربه کاربری", "ui", "ux", "design"],
    scores: { R: 27, I: 65, A: 58, S: 20, E: 36, C: 57 },
    medianWage: 104000,
    employment: 128900,
    openings: 9100,
    outlook: "بسیار سریع‌تر از میانگین",
    url: "https://www.onetonline.org/link/details/15-1255.00",
  },
  {
    code: "11-2021.00",
    englishTitle: "Marketing Managers",
    role: "مدیر بازاریابی",
    keywords: ["بازاریابی", "مارکتینگ", "تبلیغات", "فروش", "marketing"],
    scores: { R: 0, I: 32, A: 24, S: 30, E: 100, C: 62 },
    medianWage: 166790,
    employment: 407000,
    openings: 34300,
    outlook: "بسیار سریع‌تر از میانگین",
    url: "https://www.onetonline.org/link/details/11-2021.00",
  },
  {
    code: "15-2051.00",
    englishTitle: "Data Scientists",
    role: "دانشمند داده",
    keywords: ["داده‌کاوی", "داده کاوی", "علم داده", "تحلیل داده", "دیتا", "data", "هوش مصنوعی"],
    scores: { R: 20, I: 100, A: 27, S: 11, E: 12, C: 73 },
    medianWage: 120230,
    employment: 245900,
    openings: 23400,
    outlook: "بسیار سریع‌تر از میانگین",
    url: "https://www.onetonline.org/link/details/15-2051.00",
  },
  {
    code: "11-3021.00",
    englishTitle: "Computer and Information Systems Managers",
    role: "مدیر محصول و سیستم‌های اطلاعاتی",
    keywords: ["مدیریت محصول", "مدیر محصول", "محصول", "مدیریت", "product", "پروداکت"],
    scores: { R: 28, I: 58, A: 8, S: 23, E: 68, C: 82 },
    medianWage: 175140,
    employment: 667100,
    openings: 55600,
    outlook: "بسیار سریع‌تر از میانگین",
    url: "https://www.onetonline.org/link/details/11-3021.00",
  },
];

/** پیدا کردن پروفایل بر اساس متن جستجوی کاربر */
export function matchProfile(query: string): OnetProfile | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  return (
    ONET_PROFILES.find((p) =>
      p.keywords.some((k) => {
        const kk = k.toLowerCase();
        return kk === q || kk.includes(q) || q.includes(kk);
      })
    ) ?? null
  );
}

/** بردار نمرات به ترتیب محورهای RIASEC */
export function scoreVector(p: OnetProfile): number[] {
  return RIASEC_AXES.map((a) => p.scores[a.key]);
}

/** سه تیپ غالب — «کد هالند» شغل (مثلاً IRC) */
export function hollandCode(p: OnetProfile): RiasecAxis[] {
  return [...RIASEC_AXES].sort((a, b) => p.scores[b.key] - p.scores[a.key]).slice(0, 3);
}
