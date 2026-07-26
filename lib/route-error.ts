import { NextResponse } from "next/server";
import { SupabaseConfigError } from "./supabase-env";

/**
 * تبدیل خطاهای غیرمنتظره‌ی Route Handler به پاسخ فارسی مناسب کاربر.
 *
 * سه دسته خطا از هم تفکیک می‌شود تا کاربر پیام گمراه‌کننده نبیند:
 *  ۱. پیکربندی ناقص سرور (متغیر محیطی نیست)  → 503
 *  ۲. عدم دسترسی شبکه به Supabase             → 503
 *  ۳. سایر خطاها                               → 500
 */
export function handleRouteError(
  err: unknown,
  /** پیام و وضعیت جایگزین برای خطاهایی که شبکه‌ای/پیکربندی نیستند */
  fallback?: { message: string; status?: number }
): NextResponse {
  // ۱. متغیرهای محیطی تنظیم نشده‌اند
  if (err instanceof SupabaseConfigError) {
    console.error("[config]", err.message);
    return NextResponse.json(
      {
        message:
          "سرویس در حال حاضر پیکربندی نشده است. لطفاً کمی بعد دوباره تلاش کنید.",
        code: "SERVICE_UNCONFIGURED",
      },
      { status: 503 }
    );
  }

  // ۲. خطای شبکه (پروژه Supabase خوابیده، فیلترینگ، DNS و…)
  const raw = err instanceof Error ? `${err.message} ${err.cause ?? ""}` : String(err);
  const isNetwork =
    /fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN|network|socket hang up|UND_ERR/i.test(
      raw
    );

  if (isNetwork) {
    console.error("[network]", raw);
    return NextResponse.json(
      {
        message:
          "ارتباط با سرور برقرار نشد. لطفاً چند لحظه بعد دوباره تلاش کنید.",
        code: "UPSTREAM_UNREACHABLE",
      },
      { status: 503 }
    );
  }

  // ۳. بقیه خطاها
  console.error(err);
  if (fallback) {
    return NextResponse.json({ message: fallback.message }, { status: fallback.status ?? 400 });
  }
  return NextResponse.json(
    { message: "خطای غیرمنتظره‌ای رخ داد. لطفاً دوباره تلاش کنید.", code: "INTERNAL" },
    { status: 500 }
  );
}
