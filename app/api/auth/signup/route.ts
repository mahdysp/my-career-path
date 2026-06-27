import { NextRequest, NextResponse } from "next/server";
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

    // ثبت‌نام با emailRedirectTo — Confirm Email روشن است
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: false, // Supabase ایمیل تایید می‌فرسته
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      },
    });

    if (authError) {
      if (authError.message.toLowerCase().includes("already registered") ||
          authError.message.toLowerCase().includes("already been registered")) {
        return NextResponse.json(
          { message: "این ایمیل قبلاً ثبت شده است. لطفاً وارد حساب خود شوید." },
          { status: 400 }
        );
      }
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

      if (profileError.code === "23505") {
        return NextResponse.json(
          { message: "این ایمیل قبلاً ثبت شده است. لطفاً وارد حساب خود شوید." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { message: "خطا در ذخیره اطلاعات. لطفاً دوباره تلاش کنید." },
        { status: 500 }
      );
    }

    // چون Confirm Email روشن است، session برنمی‌گردد
    // کاربر باید ایمیلش را تایید کند
    return NextResponse.json({
      message: "ثبت‌نام با موفقیت انجام شد. لطفاً ایمیل خود را برای تایید حساب بررسی کنید.",
      requiresEmailConfirmation: true,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "خطای سرور." }, { status: 500 });
  }
}
