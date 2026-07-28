import { RIASEC_AXES, RiasecKey } from "./onet-profiles";

/**
 * محاسبه‌ی تطابق شغلی بر پایه مدل RIASEC (هالند).
 *
 * چرا این فایل وجود دارد: قبلاً درصد تطابق را مستقیماً هوش مصنوعی «حدس» می‌زد.
 * آن عدد نه قابل تکرار بود (temperature > 0) و نه تعریف مشخصی داشت. اینجا عدد
 * با فرمول ثابت از پاسخ‌های خود کاربر محاسبه می‌شود، پس همیشه یکسان و
 * قابل‌توضیح است.
 *
 * روش:
 *   ۱. هر سوال به یکی از شش بُعد RIASEC برچسب خورده است.
 *   ۲. پاسخ‌ها به عدد ۰..۱۰۰ تبدیل و برای هر بُعد میانگین گرفته می‌شود
 *      → «پروفایل علاقه‌ی کاربر».
 *   ۳. تطابق با هر شغل = شباهت کسینوسی بین بردار کاربر و بردار شغل.
 *      شباهت کسینوسی به جای فاصله انتخاب شد چون به «شکل» پروفایل اهمیت
 *      می‌دهد نه شدت پاسخ‌دهی؛ کاربری که همه‌جا نمره‌ی بالا می‌دهد نباید
 *      با همه‌ی مشاغل ۱۰۰٪ تطابق بگیرد.
 */

export const RIASEC_KEYS: RiasecKey[] = ["R", "I", "A", "S", "E", "C"];

export type RiasecVector = Record<RiasecKey, number>;

export type ScoredQuestion = {
  id: number;
  type: "multiple_choice" | "likert";
  /** بُعد RIASEC که این سوال می‌سنجد */
  dimension?: string;
  options?: string[];
  scale?: { min: number; max: number };
};

export type GivenAnswer = { questionId: number; answer: string | number };

function emptyVector(): RiasecVector {
  return { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
}

function normalizeKey(d?: string): RiasecKey | null {
  if (!d) return null;
  const k = d.trim().charAt(0).toUpperCase() as RiasecKey;
  return RIASEC_KEYS.includes(k) ? k : null;
}

/**
 * پاسخ یک سوال را به عدد ۰..۱۰۰ تبدیل می‌کند.
 *  • لیکرت: موقعیت روی طیف (۱..۵ → ۰..۱۰۰)
 *  • چندگزینه‌ای: جایگاه گزینه در فهرست؛ گزینه‌های بالاتر = علاقه‌ی بیشتر
 */
function answerToScore(q: ScoredQuestion, raw: string | number): number | null {
  if (q.type === "likert") {
    const min = q.scale?.min ?? 1;
    const max = q.scale?.max ?? 5;
    const v = Number(raw);
    if (Number.isNaN(v) || max === min) return null;
    return ((v - min) / (max - min)) * 100;
  }

  const opts = q.options ?? [];
  if (!opts.length) return null;
  const idx = opts.indexOf(String(raw));
  if (idx < 0) return null;
  if (opts.length === 1) return 100;
  // گزینه‌ی اول = بیشترین همسویی با آن بُعد
  return ((opts.length - 1 - idx) / (opts.length - 1)) * 100;
}

/** پروفایل RIASEC کاربر را از پاسخ‌هایش می‌سازد. */
export function buildUserVector(
  questions: ScoredQuestion[],
  answers: GivenAnswer[]
): { vector: RiasecVector; covered: RiasecKey[] } {
  const sums = emptyVector();
  const counts = emptyVector();

  const byId = new Map(answers.map((a) => [a.questionId, a.answer]));

  for (const q of questions) {
    const key = normalizeKey(q.dimension);
    if (!key) continue;
    if (!byId.has(q.id)) continue;

    const score = answerToScore(q, byId.get(q.id)!);
    if (score === null) continue;

    sums[key] += score;
    counts[key] += 1;
  }

  const vector = emptyVector();
  const covered: RiasecKey[] = [];
  for (const k of RIASEC_KEYS) {
    if (counts[k] > 0) {
      vector[k] = Math.round(sums[k] / counts[k]);
      covered.push(k);
    }
  }

  return { vector, covered };
}

/** شباهت کسینوسی دو بردار، نرمال‌شده به ۰..۱ */
function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/**
 * کد هالند (مثل "IRC") را به بردار وزن‌دار تبدیل می‌کند.
 * حرف اول مهم‌ترین است، پس وزن بیشتری می‌گیرد.
 */
export function hollandCodeToVector(code: string): RiasecVector | null {
  const letters = (code || "")
    .toUpperCase()
    .split("")
    .filter((c) => RIASEC_KEYS.includes(c as RiasecKey)) as RiasecKey[];

  if (!letters.length) return null;

  const weights = [100, 70, 45];
  const v = emptyVector();
  letters.slice(0, 3).forEach((k, i) => {
    v[k] = Math.max(v[k], weights[i] ?? 30);
  });
  return v;
}

/**
 * درصد تطابق کاربر با یک پروفایل شغلی.
 *
 * شباهت کسینوسی معمولاً بین ۰٫۵ تا ۱ می‌افتد (چون همه‌ی مقادیر مثبت‌اند)،
 * پس آن بازه به ۰..۱۰۰ کشیده می‌شود تا اعداد معنادار و متمایز باشند.
 */
export function matchPercent(user: RiasecVector, target: RiasecVector): number {
  const a = RIASEC_KEYS.map((k) => user[k]);
  const b = RIASEC_KEYS.map((k) => target[k]);

  const sim = cosine(a, b);
  if (sim <= 0) return 0;

  /* بازه‌ی واقعی شباهت بین بردارهای مثبت تقریباً ۰٫۳ تا ۱ است.
     آن را به ۲۵..۹۸ نگاشت می‌کنیم: کف ۲۵ چون «هیچ تطابقی ندارد» برای یک
     پیشنهاد شغلی گمراه‌کننده است، و سقف زیر ۱۰۰ چون هیچ تطابقی کامل نیست. */
  const clamped = Math.max(0.3, Math.min(1, sim));
  const scaled = 25 + ((clamped - 0.3) / 0.7) * 73;
  return Math.round(scaled);
}

/** آیا پاسخ‌ها آن‌قدر هستند که محاسبه معنا داشته باشد؟ */
export function hasEnoughSignal(covered: RiasecKey[]): boolean {
  return covered.length >= 3;
}

/** توضیح کوتاه فارسی از سه بُعد غالب کاربر */
export function describeTopDimensions(v: RiasecVector, n = 3): string[] {
  return [...RIASEC_KEYS]
    .sort((x, y) => v[y] - v[x])
    .slice(0, n)
    .map((k) => RIASEC_AXES.find((a) => a.key === k)?.label ?? k);
}
