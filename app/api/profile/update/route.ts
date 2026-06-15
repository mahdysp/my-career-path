import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const accessToken = req.cookies.get("sb-access-token")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "لطفاً ابتدا وارد حساب خود شوید." }, { status: 401 });
    }

    const { firstName, lastName, education } = await req.json();

    if (!firstName || !lastName || !education) {
      return NextResponse.json({ message: "لطفاً همه فیلدها را تکمیل کنید." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !userData.user) {
      return NextResponse.json({ message: "نشست شما منقضی شده است. لطفاً دوباره وارد شوید." }, { status: 401 });
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        education,
      })
      .eq("id", userData.user.id);

    if (updateError) {
      console.error("Profile update error:", updateError);
      return NextResponse.json({ message: "خطا در به‌روزرسانی اطلاعات." }, { status: 500 });
    }

    return NextResponse.json({ message: "اطلاعات با موفقیت به‌روزرسانی شد." });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "خطای سرور." }, { status: 500 });
  }
}
