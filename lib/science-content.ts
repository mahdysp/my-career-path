/**
 * محتوای صفحه‌ی «پشتوانه‌ی علمی».
 *
 * قاعده‌ی سخت‌گیرانه: **هر عدد روی این صفحه باید منبع داشته باشد.**
 * اگر عددی از پژوهش منتشرشده نیامده، یا اصلاً نوشته نمی‌شود یا صریحاً
 * به‌عنوان «انتخاب طراحی ما» علامت می‌خورد، نه یافته‌ی علمی.
 *
 * دلیل جدا بودن از کامپوننت: این داده‌ها ادعای واقعی درباره‌ی جهان‌اند و
 * باید بازبینی‌شان آسان باشد؛ قاطی JSX شدن این کار را سخت می‌کند.
 */

export type Citation = {
  id: string;
  authors: string;
  year: number;
  title: string;
  venue: string;
  /** شناسه‌ی دیجیتال یا نشانی پایدار */
  doi?: string;
  url: string;
};

/* ─────────────────────────────────────────────────────────
   منابع
   ───────────────────────────────────────────────────────── */

export const CITATIONS: Citation[] = [
  {
    id: "holland1959",
    authors: "Holland, J. L.",
    year: 1959,
    title: "A theory of vocational choice",
    venue: "Journal of Counseling Psychology, 6(1), 35–45",
    doi: "10.1037/h0040767",
    url: "https://doi.org/10.1037/h0040767",
  },
  {
    id: "holland1997",
    authors: "Holland, J. L.",
    year: 1997,
    title:
      "Making vocational choices: A theory of vocational personalities and work environments (3rd ed.)",
    venue: "Psychological Assessment Resources",
    url: "https://www.worldcat.org/title/36126503",
  },
  {
    id: "nye2012",
    authors: "Nye, C. D., Su, R., Rounds, J., & Drasgow, F.",
    year: 2012,
    title:
      "Vocational interests and performance: A quantitative summary of over 60 years of research",
    venue: "Perspectives on Psychological Science, 7(4), 384–403",
    doi: "10.1177/1745691612449021",
    url: "https://doi.org/10.1177/1745691612449021",
  },
  {
    id: "nye2017",
    authors: "Nye, C. D., Su, R., Rounds, J., & Drasgow, F.",
    year: 2017,
    title:
      "Interest congruence and performance: Revisiting recent meta-analytic findings",
    venue: "Journal of Vocational Behavior, 98, 138–151",
    doi: "10.1016/j.jvb.2016.11.002",
    url: "https://doi.org/10.1016/j.jvb.2016.11.002",
  },
  {
    id: "low2005",
    authors: "Low, K. S. D., Yoon, M., Roberts, B. W., & Rounds, J.",
    year: 2005,
    title:
      "The stability of vocational interests from early adolescence to middle adulthood: A quantitative review of longitudinal studies",
    venue: "Psychological Bulletin, 131(5), 713–737",
    doi: "10.1037/0033-2909.131.5.713",
    url: "https://doi.org/10.1037/0033-2909.131.5.713",
  },
  {
    id: "rounds1996",
    authors: "Rounds, J., & Tracey, T. J.",
    year: 1996,
    title: "Cross-cultural structural equivalence of RIASEC models and measures",
    venue: "Journal of Counseling Psychology, 43(3), 310–329",
    doi: "10.1037/0022-0167.43.3.310",
    url: "https://doi.org/10.1037/0022-0167.43.3.310",
  },
  {
    id: "tsabari2005",
    authors: "Tsabari, O., Tziner, A., & Meir, E. I.",
    year: 2005,
    title: "Updated meta-analysis on the relationship between congruence and satisfaction",
    venue: "Journal of Career Assessment, 13(2), 216–232",
    doi: "10.1177/1069072704273165",
    url: "https://doi.org/10.1177/1069072704273165",
  },
  {
    id: "su2009",
    authors: "Su, R., Rounds, J., & Armstrong, P. I.",
    year: 2009,
    title: "Men and things, women and people: A meta-analysis of sex differences in interests",
    venue: "Psychological Bulletin, 135(6), 859–884",
    doi: "10.1037/a0017364",
    url: "https://doi.org/10.1037/a0017364",
  },
  {
    id: "deng2007",
    authors: "Deng, C. P., Armstrong, P. I., & Rounds, J.",
    year: 2007,
    title: "The fit of Holland's RIASEC model to US occupations",
    venue: "Journal of Vocational Behavior, 71(1), 1–22",
    doi: "10.1016/j.jvb.2007.04.002",
    url: "https://doi.org/10.1016/j.jvb.2007.04.002",
  },
  {
    id: "nauta2010",
    authors: "Nauta, M. M.",
    year: 2010,
    title:
      "The development, evolution, and status of Holland's theory of vocational personalities",
    venue: "Journal of Counseling Psychology, 57(1), 11–22",
    doi: "10.1037/a0018213",
    url: "https://doi.org/10.1037/a0018213",
  },
  {
    id: "onet",
    authors: "U.S. Department of Labor, Employment and Training Administration",
    year: 2025,
    title: "O*NET Database 30.0 — Career Interest Types (RIASEC)",
    venue: "O*NET Resource Center — مجوز CC BY 4.0",
    url: "https://www.onetcenter.org/database.html",
  },
  {
    id: "onetip",
    authors: "Rounds, J., Su, R., Lewis, P., & Rivkin, D.",
    year: 2010,
    title: "O*NET Interest Profiler Short Form psychometric characteristics: Summary",
    venue: "National Center for O*NET Development",
    url: "https://www.onetcenter.org/reports/IPSF_Psychometric.html",
  },
];

export const cite = (id: string) => CITATIONS.find((c) => c.id === id)!;

/* ─────────────────────────────────────────────────────────
   یافته‌های عددی — هرکدام با منبع
   ───────────────────────────────────────────────────────── */

export type Finding = {
  /** عدد اصلی، همان‌طور که در مقاله آمده */
  value: string;
  label: string;
  detail: string;
  citationId: string;
};

export const FINDINGS: Finding[] = [
  {
    value: "r ≈ 0.32",
    label: "تطابق علاقه و عملکرد شغلی",
    detail:
      "فراتحلیل ۹۲ پژوهش و ۱٬۸۵۸ همبستگی: وقتی پروفایل علاقه‌ی فرد با شغلش هم‌خوان است، عملکردش بهتر پیش‌بینی می‌شود. همین رقم برای «نمره‌ی علاقه به‌تنهایی» فقط ۰٫۱۶ است — یعنی تطابق مهم‌تر از شدت علاقه است.",
    citationId: "nye2017",
  },
  {
    value: "r ≈ 0.36",
    label: "ماندگاری در شغل و رشته",
    detail:
      "فراتحلیل ۶۰ پژوهش از ۱۹۴۲ تا ۲۰۱۱ با ۱۵٬۳۰۱ شرکت‌کننده: کسانی که کارشان با علاقه‌شان هم‌خوان است، دیرتر رها می‌کنند و در تحصیل هم پایدارترند.",
    citationId: "nye2012",
  },
  {
    value: "r ≈ 0.65–0.77",
    label: "پایداری علاقه در بزرگسالی",
    detail:
      "فراتحلیل ۶۶ پژوهش طولی از ۱۲ تا ۴۰ سالگی: علاقه‌های شغلی از حدود ۱۸ تا ۲۲ سالگی تثبیت می‌شوند و بعد دو دهه تقریباً ثابت می‌مانند — حتی پایدارتر از صفات شخصیتی.",
    citationId: "low2005",
  },
  {
    value: "r ≈ 0.17",
    label: "تطابق و رضایت شغلی",
    detail:
      "فراتحلیل ۵۳ پژوهش. این رقم عمداً اینجا آمده چون کوچک است: تطابق علاقه، عملکرد و ماندگاری را بهتر از رضایت پیش‌بینی می‌کند. رضایت شغلی به حقوق، مدیر و شرایط کاری هم بستگی دارد که آزمون هیچ‌کدام را نمی‌سنجد.",
    citationId: "tsabari2005",
  },
];

/* ─────────────────────────────────────────────────────────
   شش بُعد — با نمونه‌ی مشاغل واقعی از O*NET
   ───────────────────────────────────────────────────────── */

export type Dimension = {
  key: string;
  fa: string;
  en: string;
  gist: string;
  /** فعالیت‌هایی که این بُعد را می‌سنجند */
  activities: string[];
  /** نمونه شغل واقعی از دیتابیس O*NET، با نمره‌ی همان بُعد */
  example: { role: string; code: string; score: number };
};

export const DIMENSIONS: Dimension[] = [
  {
    key: "R",
    fa: "عمل‌گرا",
    en: "Realistic",
    gist: "کار با اشیاء، ماشین‌آلات و ابزار؛ نتیجه‌ی ملموس و فیزیکی.",
    activities: ["ساختن و مونتاژ", "تعمیر و نگهداری", "کار با تجهیزات", "فعالیت بیرون از دفتر"],
    example: { role: "توسعه‌دهنده نرم‌افزار", code: "15-1252.00", score: 44 },
  },
  {
    key: "I",
    fa: "پژوهشگر",
    en: "Investigative",
    gist: "تحلیل، مشاهده و حل مسئله‌های پیچیده و انتزاعی.",
    activities: ["تحلیل داده", "پژوهش و آزمایش", "مدل‌سازی", "کشف علت پدیده‌ها"],
    example: { role: "دانشمند داده", code: "15-2051.00", score: 100 },
  },
  {
    key: "A",
    fa: "هنرمند",
    en: "Artistic",
    gist: "بیان خلاق، طراحی و کار در فضاهای بدون قاعده‌ی از پیش تعیین‌شده.",
    activities: ["طراحی بصری", "نوشتن و روایت", "ایده‌پردازی", "کار بدون دستورالعمل ثابت"],
    example: { role: "طراح رابط و تجربه کاربری", code: "15-1255.00", score: 58 },
  },
  {
    key: "S",
    fa: "اجتماعی",
    en: "Social",
    gist: "آموزش، مشاوره و کمک مستقیم به دیگران.",
    activities: ["آموزش دادن", "مشاوره و راهنمایی", "کار تیمی نزدیک", "حل تعارض بین افراد"],
    example: { role: "مدیر بازاریابی", code: "11-2021.00", score: 30 },
  },
  {
    key: "E",
    fa: "رهبر",
    en: "Enterprising",
    gist: "متقاعدسازی، رهبری و پذیرش ریسک برای رسیدن به هدف سازمانی.",
    activities: ["مذاکره و فروش", "هدایت تیم", "تصمیم‌گیری در شرایط ابهام", "توسعه‌ی کسب‌وکار"],
    example: { role: "مدیر بازاریابی", code: "11-2021.00", score: 100 },
  },
  {
    key: "C",
    fa: "منظم",
    en: "Conventional",
    gist: "کار با داده و رویه‌های مشخص؛ دقت و نظم بر ابهام ترجیح دارد.",
    activities: ["سازمان‌دهی اطلاعات", "کار با اعداد و سوابق", "پیروی از رویه", "کنترل کیفیت"],
    example: { role: "توسعه‌دهنده نرم‌افزار", code: "15-1252.00", score: 77 },
  },
];

/* ─────────────────────────────────────────────────────────
   محدودیت‌ها — صادقانه، نه دفاعی
   ───────────────────────────────────────────────────────── */

export type Limit = { title: string; body: string; citationId?: string };

export const LIMITS: Limit[] = [
  {
    title: "این آزمون توانایی شما را نمی‌سنجد",
    body:
      "RIASEC فقط علاقه را اندازه می‌گیرد، نه استعداد یا مهارت. علاقه‌ی زیاد به یک حوزه به معنای خوب بودن در آن نیست، و برعکس. برای سنجش توانایی به ابزارهای دیگری نیاز است.",
  },
  {
    title: "شش‌ضلعی منظم یک تقریب است، نه واقعیت",
    body:
      "مدل فرض می‌کند شش تیپ با فاصله‌ی مساوی روی یک دایره نشسته‌اند. پژوهش‌ها نشان داده ترتیب دایره‌ای درست است ولی فاصله‌ها دقیقاً برابر نیستند — به‌ویژه بین «عمل‌گرا» و «منظم».",
    citationId: "rounds1996",
  },
  {
    title: "اعتبار بین‌فرهنگی یکدست نیست",
    body:
      "ساختار مدل در نمونه‌های آمریکایی خوب برازش می‌کند ولی در فرهنگ‌های دیگر ناهمگون‌تر است. هیچ پژوهش معتبری که این مدل را روی جمعیت ایرانی اعتبارسنجی کرده باشد پیدا نکردیم — پس نتایج را با احتیاط بخوانید.",
    citationId: "rounds1996",
  },
  {
    title: "شش بُعد همه‌ی تنوع مشاغل را پوشش نمی‌دهد",
    body:
      "پژوهشی روی مشاغلی که ۸۵٪ بازار کار آمریکا را می‌سازند نشان داد RIASEC به‌تنهایی کافی نیست؛ دو عامل دیگر — پرستیژ شغلی و کلیشه‌ی جنسیتی — هم در انتخاب مردم اثر دارند که این مدل آن‌ها را نمی‌بیند.",
    citationId: "deng2007",
  },
  {
    title: "داده‌های بازار کار برای ایران نیست",
    body:
      "حقوق، تعداد شاغلان و چشم‌انداز رشد در پروفایل‌های ما از اداره‌ی آمار کار آمریکا می‌آید. این اعداد برای شناخت ساختار شغل مفیدند ولی مستقیماً به بازار کار ایران قابل تعمیم نیستند.",
    citationId: "onet",
  },
  {
    title: "تفاوت‌های جنسیتی در نمرات واقعی است",
    body:
      "فراتحلیل‌ها نشان می‌دهند میانگین نمره‌ی «عمل‌گرا» در مردان و «اجتماعی» در زنان بالاتر است. این یافته‌ی توصیفی است، نه تجویزی — نمره‌ی شما مال خودتان است، نه میانگین گروهتان.",
    citationId: "su2009",
  },
];

/* ─────────────────────────────────────────────────────────
   مراحل محاسبه — دقیقاً همان چیزی که در کد اتفاق می‌افتد
   ───────────────────────────────────────────────────────── */

export type Step = { n: string; title: string; body: string; formula?: string };

export const PIPELINE: Step[] = [
  {
    n: "01",
    title: "هر سؤال به یک بُعد برچسب می‌خورد",
    body:
      "هنگام ساخت آزمون، هر سؤال به یکی از شش بُعد RIASEC نسبت داده می‌شود و هر شش بُعد باید حداقل یک سؤال داشته باشند. سؤال بدون برچسب در محاسبه شرکت نمی‌کند.",
  },
  {
    n: "02",
    title: "پاسخ‌ها به عدد ۰ تا ۱۰۰ تبدیل می‌شوند",
    body:
      "در سؤال‌های طیفی، موقعیت روی طیف مستقیماً نگاشت می‌شود. در سؤال‌های چندگزینه‌ای، جایگاه گزینه در فهرست تعیین‌کننده است؛ گزینه‌ی نخست بیشترین همسویی با آن بُعد را دارد.",
    formula: "score = (value − min) / (max − min) × 100",
  },
  {
    n: "03",
    title: "میانگین هر بُعد، پروفایل شما را می‌سازد",
    body:
      "نمره‌های هر بُعد میانگین گرفته می‌شوند و نتیجه یک بردار شش‌تایی است — همان چیزی که روی نمودار رادار می‌بینید.",
    formula: "user = [R, I, A, S, E, C]",
  },
  {
    n: "04",
    title: "شباهت با هر شغل حساب می‌شود",
    body:
      "شباهت کسینوسی بین بردار شما و بردار همان شغل در O*NET. چرا کسینوس و نه فاصله: کسینوس به «شکل» پروفایل اهمیت می‌دهد نه شدت پاسخ‌دهی. کسی که به همه‌ی سؤال‌ها نمره‌ی بالا می‌دهد نباید با همه‌ی مشاغل صد درصد تطابق بگیرد.",
    formula: "sim = (u · v) / (‖u‖ × ‖v‖)",
  },
  {
    n: "05",
    title: "شباهت به درصد قابل‌خواندن تبدیل می‌شود",
    body:
      "چون همه‌ی مقادیر مثبت‌اند، شباهت کسینوسی عملاً بین ۰٫۳ تا ۱ می‌افتد. این بازه به ۲۵ تا ۹۸ کشیده می‌شود. سقف عمداً زیر صد است چون هیچ تطابقی کامل نیست، و کف ۲۵ چون نمایش «صفر درصد» برای یک پیشنهاد شغلی گمراه‌کننده است.",
    formula: "match = 25 + (sim − 0.3) / 0.7 × 73",
  },
  {
    n: "06",
    title: "اگر داده کافی نباشد، عددی نشان داده نمی‌شود",
    body:
      "اگر پاسخ‌های شما کمتر از سه بُعد را پوشش دهد، محاسبه معنا ندارد و درصد تطابق نمایش داده نمی‌شود. عدد نداشتن بهتر از عدد بی‌پایه است.",
  },
];

/* ─────────────────────────────────────────────────────────
   نقش هوش مصنوعی — شفاف
   ───────────────────────────────────────────────────────── */

export const AI_DOES = [
  "نوشتن متن سؤال‌ها متناسب با حوزه‌ی تخصصی که وارد می‌کنید",
  "برچسب‌گذاری اولیه‌ی هر سؤال به یکی از شش بُعد",
  "نوشتن توضیح متنی نتیجه به زبان قابل‌فهم",
];

export const AI_DOES_NOT = [
  "محاسبه‌ی درصد تطابق — این کار با فرمول ثابت در کد انجام می‌شود",
  "تعیین نمره‌ی RIASEC مشاغل — این اعداد مستقیماً از O*NET می‌آیند",
  "رتبه‌بندی مشاغل پیشنهادی — بر پایه‌ی همان محاسبه‌ی عددی است",
];
