import { NextResponse } from "next/server";
import { clearSessionCookies } from "@/lib/auth-cookies";

export async function POST() {
  // صفات کوکی باید دقیقاً با زمان ست‌شدن یکی باشد، وگرنه ممکن است پاک نشود
  return clearSessionCookies(
    NextResponse.json({ message: "خروج با موفقیت انجام شد." })
  );
}
