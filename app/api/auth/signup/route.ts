import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, education, email, password } = await req.json();

    if (!firstName || !lastName || !education || !email || !password) {
      return NextResponse.json(
        { message: "لطفاً همه فیلدها را تکمیل کنید." },
        { status: 400 }
      );
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
    });

    if (authError) {
      return NextResponse.json({ message: authError.message }, { status: 400 });
    }

    const userId = authData.user?.id;

    if (!userId) {
      return NextResponse.json(
        { message: "خطا در ایجاد حساب کاربری." },
        { status: 500 }
      );
    }

    // insert پروفایل با supabaseAdmin
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: userId,
      email: email.toLowerCase(),
      first_name: firstName,
      last_name: lastName,
      education,
    });

    if (profileError) {
      console.error("Profile insert error:", profileError);
      return NextResponse.json(
        { message: "حساب کاربری ساخته شد اما ذخیره اطلاعات با خطا مواجه شد." },
        { status: 500 }
      );
    }

    // چون Confirm Email خاموش است، session فوری برمی‌گردد
    // کوکی‌های session را ست می‌کنیم تا کاربر بلافاصله لاگین باشد
    if (authData.session) {
      const response = NextResponse.json({
        message: "ثبت‌نام با موفقیت انجام شد.",
        requiresEmailConfirmation: false,
      });

      response.cookies.set("sb-access-token", authData.session.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: authData.session.expires_in,
      });

      response.cookies.set("sb-refresh-token", authData.session.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });

      return response;
    }

    return NextResponse.json({
      message: "ثبت‌نام با موفقیت انجام شد.",
      requiresEmailConfirmation: false,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "خطای سرور." }, { status: 500 });
  }
}
