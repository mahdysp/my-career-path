import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user, supabase, applyCookies } = await getSession(req);

    if (!user || !supabase) {
      return applyCookies(NextResponse.json({ user: null }, { status: 200 }));
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .maybeSingle();

    return applyCookies(
      NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: profile?.first_name || "",
          lastName: profile?.last_name || "",
        },
      })
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
