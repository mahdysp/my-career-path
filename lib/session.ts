import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { requirePublicConfig } from "./supabase-env";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  clearSessionCookies,
  setSessionCookies,
} from "./auth-cookies";

export type SessionResult = {
  user: User | null;
  /** کلاینت Supabase با هویت همین کاربر (برای رعایت RLS) */
  supabase: SupabaseClient | null;
  /** اگر نشست تازه شد، کوکی‌های جدید باید روی پاسخ نهایی نوشته شوند */
  applyCookies: (res: NextResponse) => NextResponse;
};

/**
 * درخواست‌ها نباید بی‌نهایت منتظر بمانند؛ اگر Supabase در دسترس نبود بهتر است
 * سریع شکست بخوریم تا کاربر پشت اسپینر گیر نکند.
 */
const TIMEOUT_MS = 8000;

const timedFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });

/**
 * supabase-js روی خطای شبکه چند بار تلاش مجدد می‌کند، پس timeout تک‌درخواست
 * کافی نیست. کل عملیات را هم محدود می‌کنیم.
 */
function withDeadline<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

function clientWithToken(url: string, anonKey: string, token: string) {
  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      headers: { Authorization: `Bearer ${token}` },
      fetch: timedFetch,
    },
  });
}

/**
 * کاربر جاری را برمی‌گرداند و در صورت نیاز نشست را تازه می‌کند.
 *
 * چرا لازم است: access token در Supabase یک‌ساعته است. قبلاً refresh token
 * ذخیره می‌شد ولی هیچ‌جا استفاده نمی‌شد، پس کاربر بعد از یک ساعت ناگهان
 * بیرون می‌افتاد. اینجا اگر access نامعتبر بود، با refresh نشست جدید گرفته
 * می‌شود و کوکی‌ها به‌روز می‌شوند.
 */
export async function getSession(req: NextRequest): Promise<SessionResult> {
  const accessToken = req.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;

  const none: SessionResult = { user: null, supabase: null, applyCookies: (r) => r };
  if (!accessToken && !refreshToken) return none;

  const { url, anonKey } = requirePublicConfig();

  // ۱) تلاش با access token فعلی
  if (accessToken) {
    try {
      const supabase = clientWithToken(url, anonKey, accessToken);
      const { data, error } = await withDeadline(
        supabase.auth.getUser(accessToken),
        TIMEOUT_MS,
        "getUser"
      );
      if (!error && data.user) {
        return { user: data.user, supabase, applyCookies: (r) => r };
      }
    } catch (e) {
      // خطای شبکه — کوکی‌ها را پاک نکن، ممکن است توکن سالم باشد
      console.error("[session] getUser failed:", e);
      return none;
    }
  }

  // ۲) access منقضی/نامعتبر → تازه‌سازی با refresh token
  if (refreshToken) {
    try {
      const plain = createClient(url, anonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
        global: { fetch: timedFetch },
      });
      const { data, error } = await withDeadline(
        plain.auth.refreshSession({ refresh_token: refreshToken }),
        TIMEOUT_MS,
        "refreshSession"
      );

      if (!error && data.session?.access_token && data.user) {
        const session = data.session;
        return {
          user: data.user,
          supabase: clientWithToken(url, anonKey, session.access_token),
          applyCookies: (res) =>
            setSessionCookies(res, {
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_in: session.expires_in,
            }),
        };
      }
    } catch (e) {
      console.error("[session] refresh failed:", e);
      return none;
    }
  }

  // ۳) هیچ‌کدام کار نکرد → کوکی‌های بی‌مصرف پاک شوند
  return { user: null, supabase: null, applyCookies: (res) => clearSessionCookies(res) };
}
