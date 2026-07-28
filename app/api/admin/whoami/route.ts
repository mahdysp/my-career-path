import { NextRequest, NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/**
 * «آیا کاربر جاری ادمین است؟»
 *
 * چرا جدا از بقیه‌ی مسیرهای پنل: صفحه‌ی ورود باید *قبل* از هدایت کاربر
 * به /admin بداند که او دسترسی دارد یا نه. بدون این، کاربر عادی به پنل
 * فرستاده می‌شد و آنجا با «دسترسی ندارید» روبه‌رو می‌شد — یعنی خطا را
 * یک صفحه دیرتر از جایی که باید می‌دید.
 *
 * همیشه ۲۰۰ برمی‌گرداند و نتیجه را در بدنه می‌گذارد؛ فراخوان‌کننده
 * لازم نیست بین ۴۰۱ و ۴۰۳ تفاوت بگذارد.
 */
export async function GET(req: NextRequest) {
  const check = await checkAdmin(req);

  if (!check.ok) {
    return NextResponse.json({
      admin: false,
      /* ۴۰۱ یعنی اصلاً وارد نشده، ۴۰۳ یعنی وارد شده ولی ادمین نیست.
         این تفکیک به فرم ورود کمک می‌کند پیام درست را نشان دهد. */
      reason: check.status === 401 ? "guest" : "forbidden",
      message: check.message,
    });
  }

  return check.applyCookies(
    NextResponse.json({
      admin: true,
      email: check.admin.email,
      via: check.admin.via,
    })
  );
}
