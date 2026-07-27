import { NextRequest, NextResponse } from "next/server";
import { checkAdmin, denied } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { handleRouteError } from "@/lib/route-error";

export const dynamic = "force-dynamic";

/** آمار کلی سایت برای صفحه‌ی نخست پنل */
export async function GET(req: NextRequest) {
  const check = await checkAdmin(req);
  if (!check.ok) return denied(check);

  try {
    const db = getSupabaseAdmin();
    const now = Date.now();
    const dayAgo = new Date(now - 86400_000).toISOString();
    const weekAgo = new Date(now - 7 * 86400_000).toISOString();
    const monthAgo = new Date(now - 30 * 86400_000).toISOString();

    const count = (table: string, filter?: (q: never) => never) => filter;
    void count;

    const [
      users,
      usersDay,
      usersWeek,
      admins,
      banned,
      attempts,
      attemptsDay,
      attemptsWeek,
      recentUsers,
      recentAttempts,
      trendRows,
    ] = await Promise.all([
      db.from("profiles").select("*", { count: "exact", head: true }),
      db.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", dayAgo),
      db.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", weekAgo),
      db.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin"),
      db.from("profiles").select("*", { count: "exact", head: true }).not("banned_at", "is", null),
      db.from("quiz_attempts").select("*", { count: "exact", head: true }),
      db.from("quiz_attempts").select("*", { count: "exact", head: true }).gte("created_at", dayAgo),
      db.from("quiz_attempts").select("*", { count: "exact", head: true }).gte("created_at", weekAgo),
      db
        .from("profiles")
        .select("id, email, first_name, last_name, created_at, role")
        .order("created_at", { ascending: false })
        .limit(6),
      db
        .from("quiz_attempts")
        .select("id, user_id, query, created_at")
        .order("created_at", { ascending: false })
        .limit(6),
      db
        .from("quiz_attempts")
        .select("created_at")
        .gte("created_at", monthAgo)
        .order("created_at", { ascending: true }),
    ]);

    /* نمودار ۳۰ روز اخیر — با تاریخ محلی، نه UTC.
       toISOString() فعالیت شب تهران را به روز بعد می‌برد. */
    const buckets = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * 86400_000);
      buckets.set(localKey(d), 0);
    }
    for (const row of trendRows.data ?? []) {
      const k = localKey(new Date(row.created_at as string));
      if (buckets.has(k)) buckets.set(k, (buckets.get(k) ?? 0) + 1);
    }

    return check.applyCookies(
      NextResponse.json({
        admin: { email: check.admin.email, via: check.admin.via },
        stats: {
          users: users.count ?? 0,
          usersDay: usersDay.count ?? 0,
          usersWeek: usersWeek.count ?? 0,
          admins: admins.count ?? 0,
          banned: banned.count ?? 0,
          attempts: attempts.count ?? 0,
          attemptsDay: attemptsDay.count ?? 0,
          attemptsWeek: attemptsWeek.count ?? 0,
        },
        trend: [...buckets].map(([date, value]) => ({ date, value })),
        recentUsers: (recentUsers.data ?? []).map((u) => ({
          id: u.id,
          email: u.email,
          name: [u.first_name, u.last_name].filter(Boolean).join(" ").trim(),
          createdAt: u.created_at,
          role: u.role,
        })),
        recentAttempts: recentAttempts.data ?? [],
      })
    );
  } catch (e) {
    return handleRouteError(e);
  }
}

/** کلید تاریخ محلی YYYY-MM-DD (نه UTC) */
function localKey(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
