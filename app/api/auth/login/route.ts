import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/route-error";
import { checkRateLimitAsync } from "@/lib/rate-limit";
import { setSessionCookies } from "@/lib/auth-cookies";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const limited = await checkRateLimitAsync(req, { name: "login", limit: 10, windowMs: 60_000 });
    if (limited) return limited;

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
      // خطاهای شبکه‌ای Supabase (پروژه خوابیده، فیلترینگ و…) نباید خام به کاربر برسد
      return handleRouteError(error, { message: "ورود ناموفق بود. لطفاً دوباره تلاش کنید.", status: 401 });
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

    setSessionCookies(response, {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
    });

    return response;
  } catch (err) {
    return handleRouteError(err);
  }
}
