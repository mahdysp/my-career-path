import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { handleRouteError } from "@/lib/route-error";

export const dynamic = "force-dynamic";

/**
 * گرفتن یک آزمون ذخیره‌شده با شناسه.
 * امنیت: کلاینت با توکن خود کاربر ساخته می‌شود و کوئری روی user_id فیلتر است.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ message: "شناسه آزمون ارسال نشده است." }, { status: 400 });
    }

    const { user, supabase, applyCookies } = await getSession(req);

    if (!user || !supabase) {
      return applyCookies(
        NextResponse.json(
          { message: "برای دیدن این نتیجه ابتدا وارد حساب خود شوید." },
          { status: 401 }
        )
      );
    }

    const { data: attempt, error } = await supabase
      .from("quiz_attempts")
      .select("id, created_at, query, result_summary, result_data")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Attempt fetch error:", error);
      return NextResponse.json({ message: "خطا در دریافت نتیجه." }, { status: 500 });
    }

    if (!attempt) {
      return NextResponse.json({ message: "این نتیجه پیدا نشد." }, { status: 404 });
    }

    return applyCookies(NextResponse.json({ attempt }));
  } catch (err) {
    return handleRouteError(err);
  }
}
