"use client";

/** ابزارهای مشترک سمت کلاینت پنل مدیریت */

export class AdminError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * فراخوانی API پنل با مدیریت یکنواخت خطا.
 *
 * ۴۰۱ و ۴۰۳ عمداً تفکیک می‌شوند: اولی یعنی وارد نشده‌اید (باید به صفحه‌ی
 * ورود بروید)، دومی یعنی وارد شده‌اید ولی ادمین نیستید.
 */
export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: "same-origin", ...init });

  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    /* پاسخ بدنه‌ی JSON نداشت */
  }

  if (!res.ok) {
    const msg =
      (payload as { error?: string; message?: string } | null)?.error ??
      (payload as { message?: string } | null)?.message ??
      "خطای غیرمنتظره‌ای رخ داد.";
    throw new AdminError(msg, res.status);
  }

  return payload as T;
}

/** تاریخ شمسی خوانا — «یکشنبه ۴ مرداد ۱۴۰۵» */
export function faDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  try {
    const parts = new Intl.DateTimeFormat("fa-IR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).formatToParts(d);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    return `${get("weekday")} ${get("day")} ${get("month")} ${get("year")}`;
  } catch {
    return d.toLocaleDateString("fa-IR");
  }
}

/** تاریخ کوتاه با ساعت — برای جدول‌ها */
export function faDateTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return d.toLocaleString("fa-IR");
  }
}

/** «۳ روز پیش» */
export function faAgo(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "—";
  const s = Math.round((Date.now() - d) / 1000);
  if (s < 60) return "همین حالا";
  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "minute"],
    [3600, "hour"],
    [86400, "day"],
    [2592000, "month"],
    [31536000, "year"],
  ];
  let value = s;
  let unit: Intl.RelativeTimeFormatUnit = "second";
  for (const [div, u] of units) {
    if (s >= div) {
      value = Math.floor(s / div);
      unit = u;
    }
  }
  try {
    return new Intl.RelativeTimeFormat("fa-IR", { numeric: "auto" }).format(-value, unit);
  } catch {
    return `${value} ${unit}`;
  }
}

/** عدد فارسی با جداکننده */
export const faNum = (n: number) => n.toLocaleString("fa-IR");

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
