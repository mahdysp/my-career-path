import { NextRequest, NextResponse } from "next/server";

/**
 * محدودکننده نرخ ساده و درون‌حافظه‌ای.
 *
 * هدف: جلوگیری از سوءاستفاده از مسیرهایی که به سرویس پولی (Groq) وصل می‌شوند.
 *
 * محدودیت: حافظه بین instanceهای serverless مشترک نیست، پس این یک سد کامل
 * نیست ولی جلوی اسکریپت‌های ساده و درخواست‌های پشت‌سرهم را می‌گیرد. برای
 * محافظت جدی‌تر باید از Upstash Redis یا Vercel KV استفاده شود.
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/** پاک‌سازی دوره‌ای تا حافظه رشد نکند */
function sweep(now: number) {
  if (buckets.size < 500) return;
  for (const [k, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(k);
  }
}

export function clientKey(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  // کاربر واردشده را جدا از IP حساب می‌کنیم تا شبکه‌های مشترک قربانی نشوند
  const token = req.cookies.get("sb-access-token")?.value;
  return token ? `u:${token.slice(-24)}` : `ip:${ip}`;
}

/**
 * اگر از حد مجاز عبور شده باشد یک NextResponse با کد 429 برمی‌گرداند،
 * در غیر این صورت null.
 */
export function checkRateLimit(
  req: NextRequest,
  opts: { name: string; limit: number; windowMs: number }
): NextResponse | null {
  const now = Date.now();
  sweep(now);

  const key = `${opts.name}:${clientKey(req)}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return null;
  }

  bucket.count += 1;

  if (bucket.count > opts.limit) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return NextResponse.json(
      {
        message: `درخواست‌های شما بیش از حد مجاز است. لطفاً ${retryAfter} ثانیه دیگر تلاش کنید.`,
        code: "RATE_LIMITED",
      },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  return null;
}
