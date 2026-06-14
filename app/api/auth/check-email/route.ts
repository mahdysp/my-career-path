import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "ایمیل ارسال نشده است." }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ valid: false, exists: false, message: "فرمت ایمیل صحیح نیست." });
    }

    // Check if the email already exists in the profiles table
    const { data, error } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ message: "خطا در بررسی ایمیل." }, { status: 500 });
    }

    return NextResponse.json({
      valid: true,
      exists: !!data,
      message: data ? "این ایمیل قبلاً ثبت شده است." : "ایمیل قابل استفاده است.",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "خطای سرور." }, { status: 500 });
  }
}
