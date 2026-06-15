import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.cookies.get("sb-access-token")?.value;

    if (!accessToken) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // کلاینت موقت با توکن کاربر برای گرفتن اطلاعات اون کاربر خاص
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // گرفتن نام و نام خانوادگی از جدول profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", data.user.id)
      .maybeSingle();

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        firstName: profile?.first_name || "",
        lastName: profile?.last_name || "",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
