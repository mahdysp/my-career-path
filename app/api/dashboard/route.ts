import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.cookies.get("sb-access-token")?.value;

    if (!accessToken) {
      return NextResponse.json({ user: null, attempts: [] }, { status: 200 });
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
      return NextResponse.json({ user: null, attempts: [] }, { status: 200 });
    }

    // گرفتن پروفایل
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, education, email")
      .eq("id", userData.user.id)
      .maybeSingle();

    // گرفتن لیست آزمون‌ها (جدیدترین اول)
    const { data: attempts, error: attemptsError } = await supabase
      .from("quiz_attempts")
      .select("id, created_at, query, result_summary")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });

    if (attemptsError) {
      console.error("Attempts fetch error:", attemptsError);
    }

    return NextResponse.json({
      user: {
        id: userData.user.id,
        email: userData.user.email,
        firstName: profile?.first_name || "",
        lastName: profile?.last_name || "",
        education: profile?.education || "",
      },
      attempts: attempts || [],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ user: null, attempts: [] }, { status: 200 });
  }
}
