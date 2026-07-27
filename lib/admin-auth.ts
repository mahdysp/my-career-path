import { NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { getSession } from "./session";
import { getSupabaseAdmin } from "./supabase-admin";

/**
 * تشخیص و اجبار دسترسی ادمین.
 *
 * دو مسیر مستقل — عمداً:
 *   ۱. ستون `role` در جدول profiles. مسیر اصلی؛ از خود پنل قابل تغییر است.
 *   ۲. متغیر محیطی ADMIN_EMAILS. در پشتی امن برای وقتی که به‌اشتباه نقش
 *      خودتان را برداشتید یا دیتابیس در دسترس نیست. بدون این، یک خطای
 *      کوچک می‌تواند شما را برای همیشه از پنل بیرون بگذارد.
 */

export type AdminIdentity = {
  user: User;
  email: string;
  /** از کجا تأیید شد — برای نمایش در پنل و ثبت در لاگ */
  via: "role" | "env";
};

/** ایمیل‌های همیشه-ادمین از متغیر محیطی */
function envAdmins(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export type AdminCheck =
  | { ok: true; admin: AdminIdentity; applyCookies: (r: NextResponse) => NextResponse }
  | { ok: false; status: 401 | 403; message: string };

/**
 * بررسی می‌کند درخواست از طرف یک ادمین آمده است یا نه.
 *
 * وضعیت‌ها عمداً تفکیک شده‌اند:
 *   ۴۰۱ = اصلاً وارد نشده
 *   ۴۰۳ = وارد شده ولی ادمین نیست
 */
export async function checkAdmin(req: NextRequest): Promise<AdminCheck> {
  const { user, applyCookies } = await getSession(req);

  if (!user) {
    return { ok: false, status: 401, message: "برای دسترسی باید وارد شوید." };
  }

  const email = (user.email ?? "").toLowerCase();

  // مسیر ۲ — در پشتی محیطی
  if (email && envAdmins().includes(email)) {
    return { ok: true, admin: { user, email, via: "env" }, applyCookies };
  }

  // مسیر ۱ — ستون role
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("profiles")
      .select("role, banned_at")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[admin-auth] role lookup failed:", error.message);
      return { ok: false, status: 403, message: "بررسی دسترسی ممکن نشد." };
    }

    if (data?.banned_at) {
      return { ok: false, status: 403, message: "حساب شما مسدود شده است." };
    }

    if (data?.role === "admin") {
      return { ok: true, admin: { user, email, via: "role" }, applyCookies };
    }
  } catch (e) {
    console.error("[admin-auth] role lookup threw:", e);
    return { ok: false, status: 403, message: "بررسی دسترسی ممکن نشد." };
  }

  return { ok: false, status: 403, message: "شما به این بخش دسترسی ندارید." };
}

/** پاسخ استاندارد رد دسترسی */
export function denied(check: Extract<AdminCheck, { ok: false }>) {
  return NextResponse.json(
    { error: check.message },
    { status: check.status }
  );
}

/**
 * ثبت یک عمل در دفتر رویدادها.
 *
 * عمداً هیچ‌وقت throw نمی‌کند: اگر ثبت لاگ شکست بخورد نباید خودِ عملیات
 * را از کار بیندازد. شکست فقط در کنسول سرور دیده می‌شود.
 */
export async function audit(
  admin: AdminIdentity,
  action: string,
  opts: {
    targetType?: string;
    targetId?: string;
    detail?: unknown;
    req?: NextRequest;
  } = {}
) {
  try {
    await getSupabaseAdmin().from("admin_audit_log").insert({
      actor_id: admin.user.id,
      actor_email: admin.email,
      action,
      target_type: opts.targetType ?? null,
      target_id: opts.targetId ?? null,
      detail: opts.detail ?? null,
      ip:
        opts.req?.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
        opts.req?.headers.get("x-real-ip") ??
        null,
    });
  } catch (e) {
    console.error("[audit] write failed:", e);
  }
}
