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

/* قالب‌بندی از lib/format.ts می‌آید تا کل سایت یک قاعده داشته باشد:
   ارقام لاتین، تقویم شمسی. اینجا فقط دوباره صادر می‌شوند. */
export {
  dateFa as faDate,
  dateTimeFa as faDateTime,
  agoFa as faAgo,
  num as faNum,
  fileSize,
} from "@/lib/format";
