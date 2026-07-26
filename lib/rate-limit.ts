import { NextRequest, NextResponse } from "next/server";

/**
 * محدودکننده نرخ با دو حالت:
 *
 *  ۱) توزیع‌شده (ترجیح داده می‌شود) — روی Upstash Redis از طریق REST API.
 *     فعال می‌شود اگر UPSTASH_REDIS_REST_URL و UPSTASH_REDIS_REST_TOKEN ست شده باشند.
 *     چون همه‌ی instanceهای serverless یک شمارنده‌ی مشترک دارند، محدودیت واقعی است.
 *
 *  ۲) درون‌حافظه‌ای (fallback) — وقتی Redis تنظیم نشده باشد. جلوی اسکریپت‌های
 *     ساده را می‌گیرد ولی بین instanceها مشترک نیست.
 *
 * از REST API با fetch استفاده می‌شود تا وابستگی جدیدی اضافه نشود و روی Edge هم کار کند.
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "");
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
export const isDistributed = Boolean(REDIS_URL && REDIS_TOKEN);

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

type Verdict = { ok: true } | { ok: false; retryAfter: number };

/** شمارش درون‌حافظه‌ای */
function memoryHit(key: string, limit: number, windowMs: number): Verdict {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  return { ok: true };
}

/**
 * شمارش روی Redis با الگوی INCR + EXPIRE.
 * از pipeline استفاده می‌شود تا هر دو دستور در یک رفت‌وبرگشت انجام شوند.
 */
async function redisHit(key: string, limit: number, windowMs: number): Promise<Verdict> {
  const windowSec = Math.ceil(windowMs / 1000);

  const res = await fetch(`${REDIS_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, String(windowSec), "NX"],
      ["TTL", key],
    ]),
    cache: "no-store",
    signal: AbortSignal.timeout(2500),
  });

  if (!res.ok) throw new Error(`upstash ${res.status}`);

  const out = (await res.json()) as { result?: number }[];
  const count = Number(out?.[0]?.result ?? 0);
  const ttl = Number(out?.[2]?.result ?? windowSec);

  if (count > limit) {
    return { ok: false, retryAfter: Math.max(1, ttl > 0 ? ttl : windowSec) };
  }
  return { ok: true };
}

function tooMany(retryAfter: number): NextResponse {
  return NextResponse.json(
    {
      message: `درخواست‌های شما بیش از حد مجاز است. لطفاً ${retryAfter} ثانیه دیگر تلاش کنید.`,
      code: "RATE_LIMITED",
    },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}

/**
 * نسخه‌ی همگام (درون‌حافظه‌ای) — برای سازگاری با کدهای موجود.
 * اگر از حد عبور شده باشد NextResponse با کد 429 برمی‌گرداند، وگرنه null.
 */
export function checkRateLimit(
  req: NextRequest,
  opts: { name: string; limit: number; windowMs: number }
): NextResponse | null {
  const verdict = memoryHit(`${opts.name}:${clientKey(req)}`, opts.limit, opts.windowMs);
  return verdict.ok ? null : tooMany(verdict.retryAfter);
}

/**
 * نسخه‌ی توزیع‌شده — اگر Redis تنظیم باشد از آن استفاده می‌کند،
 * در غیر این صورت (یا اگر Redis در دسترس نبود) به حافظه برمی‌گردد.
 */
export async function checkRateLimitAsync(
  req: NextRequest,
  opts: { name: string; limit: number; windowMs: number }
): Promise<NextResponse | null> {
  const key = `rl:${opts.name}:${clientKey(req)}`;

  if (isDistributed) {
    try {
      const verdict = await redisHit(key, opts.limit, opts.windowMs);
      return verdict.ok ? null : tooMany(verdict.retryAfter);
    } catch (err) {
      // Redis در دسترس نیست — سرویس نباید بخوابد، به حافظه برمی‌گردیم
      console.error("[rate-limit] redis unavailable, falling back:", err);
    }
  }

  const verdict = memoryHit(key, opts.limit, opts.windowMs);
  return verdict.ok ? null : tooMany(verdict.retryAfter);
}
