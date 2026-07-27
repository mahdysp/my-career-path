import { NextRequest, NextResponse } from "next/server";

/**
 * محافظت سمت سرور از مسیرهای خصوصی.
 *
 * قبلاً محافظت فقط سمت کلاینت بود؛ یعنی صفحه برای لحظه‌ای رندر می‌شد و بعد
 * ریدایرکت می‌خورد. اینجا قبل از رسیدن به صفحه تصمیم گرفته می‌شود.
 *
 * توجه: اینجا فقط «وجود کوکی» بررسی می‌شود (اعتبارسنجی کامل توکن در Edge
 * پرهزینه است). اعتبارسنجی واقعی همچنان در API Routeها انجام می‌شود، پس این
 * لایه صرفاً تجربه‌ی کاربری را درست می‌کند، نه جایگزین کنترل دسترسی.
 *
 * برای /admin هم همین‌طور: اینجا فقط مهمان‌ها رد می‌شوند. بررسی «ادمین بودن»
 * در lib/admin-auth.ts و داخل هر API Route انجام می‌شود.
 */

const PROTECTED = ["/dashboard", "/assessment", "/result", "/admin"];
const AUTH_PAGES = ["/auth", "/register"];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get("sb-access-token")?.value);

  // کاربر مهمان → صفحات خصوصی ممنوع
  if (!hasSession && PROTECTED.some((p) => pathname.startsWith(p))) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  // کاربر واردشده → صفحات ورود/ثبت‌نام بی‌معنی است
  if (hasSession && AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/assessment/:path*",
    "/result/:path*",
    "/admin/:path*",
    "/auth",
    "/register",
  ],
};
