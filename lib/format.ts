/**
 * قالب‌بندی اعداد و تاریخ در سراسر سایت.
 *
 * قاعده‌ی واحد: **ارقام همیشه لاتین‌اند** (۰۱۲۳ ← 0123)، ولی تقویم شمسی و
 * نام ماه‌های فارسی حفظ می‌شود.
 *
 * چطور: زیرتگ یونیکد `-u-nu-latn` روی `fa-IR`. این کار فقط سیستم عددی را
 * عوض می‌کند، نه تقویم و نه زبان را. جایگزین‌های دیگر بدترند:
 *   • `en-US` → تقویم میلادی می‌دهد، ماه‌ها انگلیسی می‌شوند.
 *   • جایگزینی دستی رقم‌ها → جداکننده‌ی هزارگان فارسی (٬) باقی می‌ماند.
 */

/** لوکال پایه — همه‌جا از همین استفاده شود */
export const LOCALE = "fa-IR-u-nu-latn";

/** هر رقم فارسی/عربی را به لاتین تبدیل می‌کند — تور ایمنی برای متن‌های آماده */
export function toLatinDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/٬/g, ",")
    .replace(/٫/g, ".");
}

/** عدد با جداکننده‌ی هزارگان — «۱۲٬۳۴۵» ← «12,345» */
export function num(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return toLatinDigits(n.toLocaleString(LOCALE));
}

/** درصد — همیشه با علامت ٪ بعد از عدد */
export const pct = (n: number) => `${num(Math.round(n))}٪`;

type DateInput = string | number | Date | null | undefined;

function asDate(v: DateInput): Date | null {
  if (v === null || v === undefined || v === "") return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * تاریخ شمسی با ترتیب طبیعی فارسی.
 *
 * چرا formatToParts: خروجی پیش‌فرض `fa-IR` ترتیب نامتعارف
 * «۱۴۰۵ مرداد ۴, یکشنبه» می‌دهد. با چیدن دستی اجزا به
 * «یکشنبه 4 مرداد 1405» می‌رسیم.
 */
export function dateFa(v: DateInput, opts: { weekday?: boolean } = {}): string {
  const d = asDate(v);
  if (!d) return "—";
  try {
    const parts = new Intl.DateTimeFormat(LOCALE, {
      ...(opts.weekday ? { weekday: "long" as const } : {}),
      day: "numeric",
      month: "long",
      year: "numeric",
    }).formatToParts(d);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    const head = opts.weekday ? `${get("weekday")} ` : "";
    return toLatinDigits(`${head}${get("day")} ${get("month")} ${get("year")}`);
  } catch {
    return toLatinDigits(d.toLocaleDateString(LOCALE));
  }
}

/** تاریخ کوتاه همراه ساعت — مناسب جدول‌ها */
export function dateTimeFa(v: DateInput): string {
  const d = asDate(v);
  if (!d) return "—";
  try {
    const date = new Intl.DateTimeFormat(LOCALE, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
    const time = new Intl.DateTimeFormat(LOCALE, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
    return toLatinDigits(`${date} — ${time}`);
  } catch {
    return toLatinDigits(d.toLocaleString(LOCALE));
  }
}

/** فقط ساعت */
export function timeFa(v: DateInput): string {
  const d = asDate(v);
  if (!d) return "—";
  try {
    return toLatinDigits(
      new Intl.DateTimeFormat(LOCALE, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(d)
    );
  } catch {
    return "—";
  }
}

/** نام ماه شمسی */
export function monthFa(v: DateInput): string {
  const d = asDate(v);
  if (!d) return "";
  try {
    return new Intl.DateTimeFormat(LOCALE, { month: "long" }).format(d);
  } catch {
    return "";
  }
}

/** «3 روز پیش» */
export function agoFa(v: DateInput): string {
  const d = asDate(v);
  if (!d) return "—";
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 45) return "همین حالا";

  const steps: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "minute"],
    [3600, "hour"],
    [86400, "day"],
    [2592000, "month"],
    [31536000, "year"],
  ];
  let value = s;
  let unit: Intl.RelativeTimeFormatUnit = "second";
  for (const [div, u] of steps) {
    if (s >= div) {
      value = Math.floor(s / div);
      unit = u;
    }
  }
  try {
    return toLatinDigits(
      new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" }).format(-value, unit)
    );
  } catch {
    return `${num(value)} پیش`;
  }
}

/** حجم فایل خوانا */
export function fileSize(bytes: number): string {
  if (!bytes) return "—";
  const u = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < u.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${u[i]}`;
}
