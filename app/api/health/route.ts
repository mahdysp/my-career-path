import { NextResponse } from "next/server";
import {
  getSupabaseAnonKey,
  getSupabaseServiceKey,
  getSupabaseUrl,
} from "@/lib/supabase-env";

/** همیشه در زمان اجرا اجرا شود، نه در build */
export const dynamic = "force-dynamic";

/**
 * بررسی سلامت پیکربندی.
 *   GET /api/health
 *
 * فقط می‌گوید هر متغیر «هست یا نیست» و طولش چقدر است — هیچ مقدار محرمانه‌ای
 * برگردانده نمی‌شود. برای عیب‌یابی سریع روی Vercel.
 */
export async function GET() {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  const serviceKey = getSupabaseServiceKey();

  const env = {
    NEXT_PUBLIC_SUPABASE_URL: url ? `set (${url.length} chars)` : "MISSING",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey ? `set (${anonKey.length} chars)` : "MISSING",
    SUPABASE_SERVICE_ROLE_KEY: serviceKey ? `set (${serviceKey.length} chars)` : "MISSING",
  };

  const configured = !!url && !!anonKey;

  // اگر پیکربندی کامل است، دسترسی شبکه‌ای به Supabase را هم تست کن
  let reachable: string;
  if (!configured) {
    reachable = "skipped (not configured)";
  } else {
    try {
      const res = await fetch(`${url!.replace(/\/$/, "")}/auth/v1/health`, {
        headers: { apikey: anonKey! },
        cache: "no-store",
        signal: AbortSignal.timeout(6000),
      });
      reachable = res.ok ? "ok" : `http ${res.status}`;
    } catch (e) {
      reachable = `unreachable: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  return NextResponse.json(
    {
      configured,
      env,
      supabase: reachable,
      vercelEnv: process.env.VERCEL_ENV ?? "local",
      time: new Date().toISOString(),
    },
    { status: configured ? 200 : 503 }
  );
}
