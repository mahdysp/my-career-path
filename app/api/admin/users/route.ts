import { NextRequest, NextResponse } from "next/server";
import { audit, checkAdmin, denied } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { handleRouteError } from "@/lib/route-error";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

/** فهرست کاربران با جست‌وجو، فیلتر و صفحه‌بندی */
export async function GET(req: NextRequest) {
  const check = await checkAdmin(req);
  if (!check.ok) return denied(check);

  try {
    const sp = req.nextUrl.searchParams;
    const page = Math.max(0, Number(sp.get("page") ?? 0) || 0);
    const q = (sp.get("q") ?? "").trim();
    const role = sp.get("role") ?? "";
    const status = sp.get("status") ?? "";

    let query = getSupabaseAdmin()
      .from("profiles")
      .select("id, email, first_name, last_name, education, role, banned_at, notes, created_at", {
        count: "exact",
      });

    if (q) {
      // ویرگول در الگو باعث خرابی فیلتر or می‌شود
      const safe = q.replace(/[,%]/g, " ");
      query = query.or(
        `email.ilike.%${safe}%,first_name.ilike.%${safe}%,last_name.ilike.%${safe}%`
      );
    }
    if (role === "admin" || role === "user") query = query.eq("role", role);
    if (status === "banned") query = query.not("banned_at", "is", null);
    if (status === "active") query = query.is("banned_at", null);

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (error) throw new Error(error.message);

    /* تعداد آزمون هر کاربر — یک کوئری برای کل صفحه، نه یکی به‌ازای هر ردیف */
    const ids = (data ?? []).map((u) => u.id);
    const counts = new Map<string, number>();
    if (ids.length) {
      const { data: rows } = await getSupabaseAdmin()
        .from("quiz_attempts")
        .select("user_id")
        .in("user_id", ids);
      for (const r of rows ?? []) {
        const k = r.user_id as string;
        counts.set(k, (counts.get(k) ?? 0) + 1);
      }
    }

    return check.applyCookies(
      NextResponse.json({
        users: (data ?? []).map((u) => ({
          id: u.id,
          email: u.email,
          firstName: u.first_name ?? "",
          lastName: u.last_name ?? "",
          education: u.education ?? "",
          role: u.role ?? "user",
          bannedAt: u.banned_at,
          notes: u.notes ?? "",
          createdAt: u.created_at,
          attempts: counts.get(u.id) ?? 0,
        })),
        total: count ?? 0,
        page,
        pageSize: PAGE_SIZE,
        /** خود ادمین نباید بتواند نقش خودش را بردارد */
        selfId: check.admin.user.id,
      })
    );
  } catch (e) {
    return handleRouteError(e);
  }
}

/** تغییر نقش، مسدودسازی، یادداشت، یا حذف کامل */
export async function PATCH(req: NextRequest) {
  const check = await checkAdmin(req);
  if (!check.ok) return denied(check);

  try {
    const body = await req.json();
    const { id, action, value } = body as {
      id?: string;
      action?: string;
      value?: unknown;
    };

    if (!id || !action) {
      return NextResponse.json({ message: "درخواست ناقص است." }, { status: 400 });
    }

    /* محافظ خودزنی: ادمین نمی‌تواند خودش را حذف، مسدود یا خلع نقش کند.
       بدون این، یک کلیک اشتباه دسترسی را برای همیشه از بین می‌برد. */
    const isSelf = id === check.admin.user.id;
    if (isSelf && ["delete", "ban", "demote"].includes(action)) {
      return NextResponse.json(
        { message: "روی حساب خودتان نمی‌توانید این کار را انجام دهید." },
        { status: 400 }
      );
    }

    const db = getSupabaseAdmin();

    if (action === "delete") {
      // اول آزمون‌ها، بعد پروفایل، بعد حساب — ترتیب مهم است
      await db.from("quiz_attempts").delete().eq("user_id", id);
      await db.from("profiles").delete().eq("id", id);
      const { error } = await db.auth.admin.deleteUser(id);
      if (error) throw new Error(error.message);
      await audit(check.admin, "user.delete", { targetType: "user", targetId: id, req });
      return check.applyCookies(NextResponse.json({ ok: true }));
    }

    const patch: Record<string, unknown> = {};
    let logged = action;

    switch (action) {
      case "promote":
        patch.role = "admin";
        break;
      case "demote":
        patch.role = "user";
        break;
      case "ban":
        patch.banned_at = new Date().toISOString();
        break;
      case "unban":
        patch.banned_at = null;
        break;
      case "notes":
        patch.notes = typeof value === "string" ? value.slice(0, 2000) : "";
        logged = "user.notes";
        break;
      default:
        return NextResponse.json({ message: "عملیات نامعتبر است." }, { status: 400 });
    }

    const { error } = await db.from("profiles").update(patch).eq("id", id);
    if (error) throw new Error(error.message);

    await audit(check.admin, `user.${logged}`, {
      targetType: "user",
      targetId: id,
      detail: patch,
      req,
    });

    return check.applyCookies(NextResponse.json({ ok: true }));
  } catch (e) {
    return handleRouteError(e);
  }
}
