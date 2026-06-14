import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "لطفاً ایمیل و رمز عبور را وارد کنید." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (error) {
      // پیام‌های رایج Supabase:
      // - "Invalid login credentials" => ایمیل یا رمز عبور اشتباه است
      // - "Email not confirmed" => کاربر هنوز ایمیلش را تایید نکرده است
      if (error.message.toLowerCase().includes("email not confirmed")) {
        return NextResponse.json(
          { message: "ایمیل شما هنوز تایید نشده است. لطفاً ایمیل خود را بررسی کنید." },
          { status: 401 }
        );
      }
      if (error.message.toLowerCase().includes("invalid login credentials")) {
        return NextResponse.json(
          { message: "ایمیل یا رمز عبور اشتباه است." },
          { status: 401 }
        );
      }
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    if (!data.session) {
      return NextResponse.json(
        { message: "ورود ناموفق بود. لطفاً دوباره تلاش کنید." },
        { status: 401 }
      );
    }

    // ست کردن کوکی‌های session برای حفظ وضعیت ورود کاربر
    const response = NextResponse.json({
      message: "ورود با موفقیت انجام شد.",
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });

    response.cookies.set("sb-access-token", data.session.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: data.session.expires_in,
    });

    response.cookies.set("sb-refresh-token", data.session.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 روز
    });

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "خطای سرور." }, { status: 500 });
  }
}
