import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/route-error";
import { checkRateLimitAsync } from "@/lib/rate-limit";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.mykarex.ir").replace(/\/$/, "");

export async function POST(req: NextRequest) {
  try {
    const limited = await checkRateLimitAsync(req, { name: "signup", limit: 5, windowMs: 60_000 });
    if (limited) return limited;

    const { firstName, lastName, education, email, password } = await req.json();

    if (!firstName || !lastName || !education || !email || !password) {
      return NextResponse.json(
        { message: "لطفاً همه فیلدها را تکمیل کنید." },
        { status: 400 }
      );
    }

    if (String(password).length < 8) {
      return NextResponse.json(
        { message: "رمز عبور باید حداقل ۸ کاراکتر باشد." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // signUp معمولی — Supabase ایمیل تایید می‌فرستد از طریق Custom SMTP
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: `${SITE_URL}/auth`,
        data: { first_name: firstName, last_name: lastName },
      },
    });

    if (authError) {
      if (authError.message.toLowerCase().includes("already registered")) {
        return NextResponse.json(
          { message: "این ایمیل قبلاً ثبت شده است. لطفاً وارد حساب خود شوید." },
          { status: 400 }
        );
      }
      return handleRouteError(authError, { message: authError.message, status: 400 });
    }

    const userId = authData.user?.id;

    if (!userId) {
      return NextResponse.json({ message: "خطا در ایجاد حساب کاربری." }, { status: 500 });
    }

    /**
     * ساخت پروفایل.
     *
     * از upsert استفاده می‌شود چون اگر کاربر قبلاً ثبت‌نام ناقص داشته باشد
     * (کاربر Auth ساخته شده ولی profile نه)، تلاش دوباره باید کار کند نه اینکه
     * با خطای کلید تکراری شکست بخورد.
     */
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        email: normalizedEmail,
        first_name: firstName,
        last_name: lastName,
        education,
      },
      { onConflict: "id" }
    );

    if (profileError) {
      console.error("Profile insert error:", profileError);

      // ایمیل تکراری در ردیف دیگری — یعنی حساب واقعاً از قبل هست
      if (profileError.code === "23505") {
        return NextResponse.json(
          { message: "این ایمیل قبلاً ثبت شده است. لطفاً وارد حساب خود شوید." },
          { status: 400 }
        );
      }

      /**
       * جبران (rollback): اگر پروفایل ساخته نشد، کاربر Auth را حذف می‌کنیم.
       * بدون این کار کاربر «یتیم» می‌ماند: نه پروفایل دارد و نه می‌تواند دوباره
       * ثبت‌نام کند، چون ایمیلش «قبلاً ثبت شده» گزارش می‌شود.
       */
      try {
        await supabaseAdmin.auth.admin.deleteUser(userId);
        console.warn("Rolled back orphan auth user:", userId);
      } catch (rollbackErr) {
        console.error("Rollback failed — orphan user remains:", userId, rollbackErr);
      }

      return NextResponse.json(
        { message: "خطا در ذخیره اطلاعات. لطفاً دوباره تلاش کنید." },
        { status: 500 }
      );
    }

    // کاربر باید ایمیلش را تایید کند
    return NextResponse.json({
      message: "ثبت‌نام با موفقیت انجام شد. لطفاً ایمیل خود را برای تایید حساب بررسی کنید.",
      requiresEmailConfirmation: true,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
