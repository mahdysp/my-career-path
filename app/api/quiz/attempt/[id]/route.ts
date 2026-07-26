import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requirePublicConfig } from "@/lib/supabase-env";
import { handleRouteError } from "@/lib/route-error";

export const dynamic = "force-dynamic";

/**
 * گرفتن یک آزمون ذخیره‌شده با شناسه.
 *   GET /api/quiz/attempt/<id>
 *
 * امنیت: کلاینت با توکن خود کاربر ساخته می‌شود (نه service-role) و کوئری هم
 * روی user_id فیلتر می‌شود؛ پس کاربر فقط به آزمون‌های خودش دسترسی دارد.
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

    const accessToken = req.cookies.get("sb-access-token")?.value;
    if (!accessToken) {
      return NextResponse.json(
        { message: "برای دیدن این نتیجه ابتدا وارد حساب خود شوید." },
        { status: 401 }
      );
    }

    const { url, anonKey } = requirePublicConfig();
    const supabase = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !userData.user) {
      return NextResponse.json(
        { message: "نشست شما منقضی شده است. لطفاً دوباره وارد شوید." },
        { status: 401 }
      );
    }

    const { data: attempt, error } = await supabase
      .from("quiz_attempts")
      .select("id, created_at, query, result_summary, result_data")
      .eq("id", id)
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (error) {
      console.error("Attempt fetch error:", error);
      return NextResponse.json({ message: "خطا در دریافت نتیجه." }, { status: 500 });
    }

    if (!attempt) {
      return NextResponse.json({ message: "این نتیجه پیدا نشد." }, { status: 404 });
    }

    return NextResponse.json({ attempt });
  } catch (err) {
    return handleRouteError(err);
  }
}
