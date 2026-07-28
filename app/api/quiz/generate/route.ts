import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/route-error";
import { checkRateLimitAsync } from "@/lib/rate-limit";
import { aiErrorMessage, parseJsonLoose, runPrompt } from "@/lib/ai-runtime";

/**
 * قالب پشتیبان.
 *
 * اگر جدول ai_prompts هنوز ساخته نشده باشد (مهاجرت اجرا نشده) همین متن
 * استفاده می‌شود تا آزمون از کار نیفتد. نسخه‌ی قابل ویرایش در دیتابیس است.
 */
const FALLBACK = {
  system:
    "You are a career counseling expert. Always respond with valid JSON only, no markdown, no extra text.",
  temperature: 0.7,
  maxTokens: 4000,
  template: `شما یک متخصص مسیریابی شغلی هستید. کاربر می‌خواهد مسیر شغلی خود را در حوزه "{{query}}" کشف کند.

{{count}} سوال ترکیبی طراحی کن که:
- علایق، مهارت‌ها، شخصیت و اهداف کاربر را بسنجد
- مرتبط با حوزه "{{query}}" باشد
- به فارسی روان و ساده نوشته شده باشد
- از ساده به پیچیده پیش برود

فرمت خروجی باید دقیقاً این JSON باشد و هیچ متن اضافه یا markdown نداشته باشد:
{
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "dimension": "I",
      "text": "متن سوال",
      "options": ["گزینه ۱", "گزینه ۲", "گزینه ۳", "گزینه ۴"]
    },
    {
      "id": 2,
      "type": "likert",
      "dimension": "S",
      "text": "چقدر از کار تیمی لذت می‌بری؟",
      "scale": {
        "min": 1,
        "max": 5,
        "minLabel": "اصلاً",
        "maxLabel": "خیلی زیاد"
      }
    }
  ]
}

قواعد «dimension» (مدل RIASEC هالند) — این فیلد برای همه سوالات الزامی است:
  R = عمل‌گرا: ساختن، تعمیر، کار با ابزار و تجهیزات
  I = پژوهشگر: تحلیل، پژوهش، حل مسائل پیچیده
  A = هنرمند: خلاقیت، طراحی، بیان بصری
  S = اجتماعی: آموزش، کمک و خدمت به دیگران
  E = متهور: رهبری، مذاکره، توسعه کسب‌وکار
  C = منظم: نظم، داده، کار مبتنی بر رویه

مهم:
- هر شش بُعد باید حداقل یک سوال داشته باشد و توزیع تا حد امکان یکنواخت باشد.
- در سوالات چندگزینه‌ای، گزینه‌ها را از «بیشترین همسویی با آن بُعد» به
  «کمترین» مرتب کن؛ یعنی گزینه اول قوی‌ترین نشانه‌ی آن بُعد باشد.

برای {{count}} سوال، حدوداً {{mcCount}} تا multiple_choice و {{likertCount}} تا likert بیاور. فقط JSON خالص برگردان.`,
};

export async function POST(req: NextRequest) {
  try {
    // فقط کاربران واردشده — این مسیر به سرویس پولی وصل است
    if (!req.cookies.get("sb-access-token")?.value) {
      return NextResponse.json(
        { message: "برای شروع آزمون ابتدا وارد حساب خود شوید." },
        { status: 401 }
      );
    }

    const limited = await checkRateLimitAsync(req, { name: "generate", limit: 8, windowMs: 60_000 });
    if (limited) return limited;

    const { query, count } = await req.json();

    if (!query || !count) {
      return NextResponse.json(
        { message: "حوزه تخصصی و تعداد سوالات الزامی است." },
        { status: 400 }
      );
    }

    const validCounts = [10, 15, 20];
    if (!validCounts.includes(Number(count))) {
      return NextResponse.json(
        { message: "تعداد سوالات باید ۱۰، ۱۵ یا ۲۰ باشد." },
        { status: 400 }
      );
    }

    const mcCount = Math.round(Number(count) * 0.6);
    const likertCount = Math.round(Number(count) * 0.4);

    let completion;
    try {
      completion = await runPrompt(
        "quiz.generate",
        { query, count, mcCount, likertCount },
        FALLBACK
      );
    } catch (e) {
      console.error("[quiz.generate] همه‌ی سرویس‌ها شکست خوردند:", e);
      return NextResponse.json({ message: aiErrorMessage(e) }, { status: 503 });
    }

    let parsed: { questions?: unknown };
    try {
      parsed = parseJsonLoose<{ questions?: unknown }>(completion.text);
    } catch {
      console.error("[quiz.generate] پاسخ JSON نبود:", completion.text.slice(0, 400));
      return NextResponse.json(
        { message: "خطا در پردازش سوالات. لطفاً دوباره تلاش کنید." },
        { status: 502 }
      );
    }

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      return NextResponse.json({ message: "فرمت سوالات نامعتبر است." }, { status: 502 });
    }

    return NextResponse.json({ questions: parsed.questions });
  } catch (err) {
    return handleRouteError(err);
  }
}
