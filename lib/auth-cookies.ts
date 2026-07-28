import { NextResponse } from "next/server";

/**
 * صفات کوکی‌های نشست — در ست‌کردن و پاک‌کردن باید یکسان باشند.
 *
 * نکته مهم: طبق استاندارد، مرورگر یک کوکی را با کوکی جدید فقط وقتی جایگزین
 * می‌کند که name/path/domain یکی باشد؛ و اگر کوکی اصلی httpOnly/secure بوده،
 * پاسخِ حذف هم باید همان صفات را داشته باشد وگرنه ممکن است حذف انجام نشود.
 * قبلاً logout بدون این صفات کوکی را پاک می‌کرد و کاربر عملاً خارج نمی‌شد.
 */
const BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export const ACCESS_COOKIE = "sb-access-token";
export const REFRESH_COOKIE = "sb-refresh-token";

/** ۳۰ روز — عمر کوکی refresh */
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

/**
 * کوکی access را کمی زودتر از انقضای واقعی توکن باطل می‌کنیم تا وقتی
 * درخواستی می‌رسد، هنوز فرصت تازه‌سازی وجود داشته باشد.
 */
export function accessMaxAge(expiresIn?: number | null) {
  const v = typeof expiresIn === "number" && expiresIn > 0 ? expiresIn : 3600;
  return Math.max(60, v - 60);
}

export function setSessionCookies(
  res: NextResponse,
  session: { access_token: string; refresh_token: string; expires_in?: number | null }
) {
  res.cookies.set(ACCESS_COOKIE, session.access_token, {
    ...BASE,
    maxAge: accessMaxAge(session.expires_in),
  });
  res.cookies.set(REFRESH_COOKIE, session.refresh_token, {
    ...BASE,
    maxAge: REFRESH_MAX_AGE,
  });
  return res;
}

export function clearSessionCookies(res: NextResponse) {
  // با همان صفات ست‌شدن، تا حذف قطعی باشد
  res.cookies.set(ACCESS_COOKIE, "", { ...BASE, maxAge: 0 });
  res.cookies.set(REFRESH_COOKIE, "", { ...BASE, maxAge: 0 });
  return res;
}
