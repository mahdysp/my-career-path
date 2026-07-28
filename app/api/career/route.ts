import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/route-error";
import { runPrompt } from "@/lib/ai-runtime";

/**
 * نقشه‌ی راه کوتاه مهندسی.
 *
 * پیش‌تر کلید Gemini به‌صورت ثابت داخل همین فایل نوشته شده بود (یک مقدار
 * جای‌گیر). حالا از همان لایه‌ی سرویس‌دهنده‌های /admin/ai استفاده می‌کند تا
 * کلید در یک جای امن و رمزشده بماند.
 *
 * اگر هیچ سرویسی تنظیم نشده باشد، به‌جای خطا یک نقشه‌ی راه ثابت برمی‌گرداند —
 * این مسیر باید همیشه چیزی برای نمایش داشته باشد.
 */

/** نقشه‌های راه ثابت، وقتی سرویس هوش مصنوعی در دسترس نیست */
const CANNED: Record<string, string> = {
  embedded:
    "⚡ ۱. تسلط بر زبان C/C++ و میکروکنترلرهای AVR/ARM\n" +
    "🛠️ ۲. شبیه‌سازی مدارها در Proteus و کار با سنسورها\n" +
    "🎯 ۳. پیاده‌سازی سیستم‌های RTOS و کار روی بردهای تعبیه‌شده (Embedded)",
  fpga:
    "📐 ۱. یادگیری زبان‌های توصیف سخت‌افزار (Verilog یا VHDL)\n" +
    "💻 ۲. آشنایی با معماری داخلی FPGA و ابزارهای سنتز (مثل Vivado)\n" +
    "🚀 ۳. پیاده‌سازی پردازش سیگنال دیجیتال (DSP) و تست روی سخت‌افزار واقعی",
  default:
    "🏗️ ۱. تسلط بر اصول شئ‌گرایی (OOP) و الگوهای طراحی (Design Patterns)\n" +
    "📊 ۲. مدل‌سازی سیستم با نمودارهای UML (ساختار Use Caseها و روابط آن)\n" +
    "💻 ۳. طراحی معماری نرم‌افزار و سیستم‌های ماژولار",
};

const FALLBACK = {
  system: "You are a concise engineering career mentor. Answer in Persian.",
  temperature: 0.7,
  maxTokens: 700,
  template:
    "شما یک مشاور شغلی مهندسی هستید. نام کاربر {{name}} است و حوزه تخصصی او {{skill}}. " +
    "یک نقشه راه خلاصه و ۳ مرحله‌ای مهندسی به زبان فارسی بنویس.",
};

export async function POST(request: Request) {
  try {
    const { name, skill } = (await request.json()) as { name?: string; skill?: string };

    const safeName = (name ?? "").toString().slice(0, 80) || "دوست عزیز";
    const safeSkill = (skill ?? "").toString().slice(0, 80);

    try {
      const completion = await runPrompt(
        "career.roadmap",
        { name: safeName, skill: safeSkill || "مهندسی نرم‌افزار" },
        FALLBACK
      );
      return NextResponse.json({ aiResponse: completion.text });
    } catch {
      // سرویسی تنظیم نشده یا در دسترس نیست — نسخه‌ی ثابت
      const roadmap = CANNED[safeSkill] ?? CANNED.default;
      return NextResponse.json({
        aiResponse:
          `سلام مهندس ${safeName} عزیز!\n\n` +
          `📍 مسیر پیشنهادی برای شما در حوزه تخصصی‌تان:\n\n${roadmap}`,
      });
    }
  } catch (err) {
    return handleRouteError(err, { message: "خطا در ارتباط با سرور مهندسی", status: 400 });
  }
}
