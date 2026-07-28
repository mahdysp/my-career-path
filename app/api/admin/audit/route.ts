import { NextRequest, NextResponse } from "next/server";
import { checkAdmin, denied } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { handleRouteError } from "@/lib/route-error";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 40;

/** دفتر رویدادهای ادمین */
export async function GET(req: NextRequest) {
  const check = await checkAdmin(req);
  if (!check.ok) return denied(check);

  try {
    const page = Math.max(0, Number(req.nextUrl.searchParams.get("page") ?? 0) || 0);

    const { data, count, error } = await getSupabaseAdmin()
      .from("admin_audit_log")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (error) {
      const missing = /does not exist|relation/i.test(error.message);
      return NextResponse.json(
        {
          entries: [],
          total: 0,
          page: 0,
          pageSize: PAGE_SIZE,
          error: missing
            ? "جدول رویدادها وجود ندارد. فایل supabase/admin-setup.sql را اجرا کنید."
            : error.message,
        },
        { status: 200 }
      );
    }

    return check.applyCookies(
      NextResponse.json({
        entries: data ?? [],
        total: count ?? 0,
        page,
        pageSize: PAGE_SIZE,
      })
    );
  } catch (e) {
    return handleRouteError(e);
  }
}
