import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requirePublicConfig } from "@/lib/supabase-env";

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.cookies.get("sb-access-token")?.value;

    if (!accessToken) {
      return NextResponse.json({ user: null, attempts: [] }, { status: 200 });
    }

    const { url, anonKey } = requirePublicConfig();

    const supabase = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !userData.user) {
      return NextResponse.json({ user: null, attempts: [] }, { status: 200 });
    }

    // گرفتن پروفایل
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, education, email, created_at")
      .eq("id", userData.user.id)
      .maybeSingle();

    // گرفتن لیست آزمون‌ها (جدیدترین اول)
    // نکته: result_data هم برگردانده می‌شود تا داشبورد بتواند تحلیل تجمیعی نشان دهد.
    const { data: attempts, error: attemptsError } = await supabase
      .from("quiz_attempts")
      .select("id, created_at, query, result_summary, result_data")
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
        memberSince: profile?.created_at || userData.user.created_at || null,
      },
      attempts: attempts || [],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ user: null, attempts: [] }, { status: 200 });
  }
}
