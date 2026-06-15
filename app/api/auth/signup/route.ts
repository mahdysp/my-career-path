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

    // 1) Create the auth user (Supabase handles password hashing + sends
    //    a confirmation email automatically, since "Confirm email" is ON)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        emailRedirectTo: "https://my-career-path-nine.vercel.app/auth",
      },
    });

    if (authError) {
      // Common case: email already registered
      return NextResponse.json({ message: authError.message }, { status: 400 });
    }

    const userId = authData.user?.id;

    if (!userId) {
      return NextResponse.json(
        { message: "خطا در ایجاد حساب کاربری." },
        { status: 500 }
      );
    }

    // 2) Insert the extra profile fields, linked to the auth user's id.
    //    Uses supabaseAdmin (service_role) because the newly created user
    //    has no authenticated session on this server-side anon client,
    //    so RLS would otherwise block the insert.
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

    return NextResponse.json({
      message: "ثبت‌نام با موفقیت انجام شد. لطفاً ایمیل خود را برای تایید حساب بررسی کنید.",
      requiresEmailConfirmation: true,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "خطای سرور." }, { status: 500 });
  }
}
