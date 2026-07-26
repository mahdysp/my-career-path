import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user, supabase, applyCookies } = await getSession(req);

    if (!user || !supabase) {
      return applyCookies(NextResponse.json({ user: null, attempts: [] }, { status: 200 }));
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, education, email, created_at")
      .eq("id", user.id)
      .maybeSingle();

    // result_data هم برمی‌گردد تا داشبورد تحلیل تجمیعی نشان دهد
    const { data: attempts, error: attemptsError } = await supabase
      .from("quiz_attempts")
      .select("id, created_at, query, result_summary, result_data")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (attemptsError) {
      console.error("Attempts fetch error:", attemptsError);
    }

    return applyCookies(
      NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: profile?.first_name || "",
          lastName: profile?.last_name || "",
          education: profile?.education || "",
          memberSince: profile?.created_at || user.created_at || null,
        },
        attempts: attempts || [],
      })
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ user: null, attempts: [] }, { status: 200 });
  }
}
