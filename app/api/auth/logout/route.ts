import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "خروج با موفقیت انجام شد." });

  // حذف کوکی‌های session
  response.cookies.set("sb-access-token", "", { maxAge: 0, path: "/" });
  response.cookies.set("sb-refresh-token", "", { maxAge: 0, path: "/" });

  return response;
}
