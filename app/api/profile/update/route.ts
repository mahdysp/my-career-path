import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { handleRouteError } from "@/lib/route-error";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { user, supabase, applyCookies } = await getSession(req);

    if (!user || !supabase) {
      return applyCookies(
        NextResponse.json({ message: "لطفاً ابتدا وارد حساب خود شوید." }, { status: 401 })
      );
    }

    const { firstName, lastName, education } = await req.json();

    if (!firstName || !lastName || !education) {
      return NextResponse.json({ message: "لطفاً همه فیلدها را تکمیل کنید." }, { status: 400 });
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        education,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Profile update error:", error);
      return NextResponse.json(
        { message: "خطا در ذخیره اطلاعات. لطفاً دوباره تلاش کنید." },
        { status: 500 }
      );
    }

    return applyCookies(
      NextResponse.json({ message: "اطلاعات با موفقیت به‌روزرسانی شد." })
    );
  } catch (err) {
    return handleRouteError(err);
  }
}
