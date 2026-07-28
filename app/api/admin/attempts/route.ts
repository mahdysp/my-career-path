import { NextRequest, NextResponse } from "next/server";
import { audit, checkAdmin, denied } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { handleRouteError } from "@/lib/route-error";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

/** فهرست آزمون‌های انجام‌شده */
export async function GET(req: NextRequest) {
  const check = await checkAdmin(req);
  if (!check.ok) return denied(check);

  try {
    const sp = req.nextUrl.searchParams;
    const page = Math.max(0, Number(sp.get("page") ?? 0) || 0);
    const q = (sp.get("q") ?? "").trim();
    const userId = sp.get("user") ?? "";

    let query = getSupabaseAdmin()
      .from("quiz_attempts")
      .select("id, user_id, query, result_summary, created_at", { count: "exact" });

    if (q) query = query.ilike("query", `%${q.replace(/[,%]/g, " ")}%`);
    if (userId) query = query.eq("user_id", userId);

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (error) throw new Error(error.message);

    /* ایمیل صاحب هر آزمون — یک کوئری برای کل صفحه */
    const ids = [...new Set((data ?? []).map((a) => a.user_id).filter(Boolean))];
    const owners = new Map<string, string>();
    if (ids.length) {
      const { data: rows } = await getSupabaseAdmin()
        .from("profiles")
        .select("id, email")
        .in("id", ids as string[]);
      for (const r of rows ?? []) owners.set(r.id as string, r.email as string);
    }

    return check.applyCookies(
      NextResponse.json({
        attempts: (data ?? []).map((a) => ({
          id: a.id,
          userId: a.user_id,
          email: owners.get(a.user_id as string) ?? "—",
          query: a.query,
          summary: a.result_summary,
          createdAt: a.created_at,
        })),
        total: count ?? 0,
        page,
        pageSize: PAGE_SIZE,
      })
    );
  } catch (e) {
    return handleRouteError(e);
  }
}

/** حذف یک آزمون */
export async function DELETE(req: NextRequest) {
  const check = await checkAdmin(req);
  if (!check.ok) return denied(check);

  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ message: "شناسه لازم است." }, { status: 400 });

    const { error } = await getSupabaseAdmin().from("quiz_attempts").delete().eq("id", id);
    if (error) throw new Error(error.message);

    await audit(check.admin, "attempt.delete", {
      targetType: "attempt",
      targetId: id,
      req,
    });

    return check.applyCookies(NextResponse.json({ ok: true }));
  } catch (e) {
    return handleRouteError(e);
  }
}
