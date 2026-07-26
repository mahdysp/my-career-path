import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/route-error";
import { checkRateLimitAsync } from "@/lib/rate-limit";
import { getSession } from "@/lib/session";
import {
  buildUserVector,
  hasEnoughSignal,
  hollandCodeToVector,
  matchPercent,
} from "@/lib/riasec-score";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    if (!req.cookies.get("sb-access-token")?.value) {
      return NextResponse.json(
        { message: "برای دیدن تحلیل ابتدا وارد حساب خود شوید." },
        { status: 401 }
      );
    }

    const limited = await checkRateLimitAsync(req, { name: "analyze", limit: 6, windowMs: 60_000 });
    if (limited) return limited;

    const { query, questions, answers } = await req.json();

    if (!query || !questions || !answers) {
      return NextResponse.json(
        { message: "اطلاعات ناقص است." },
        { status: 400 }
      );
    }

    // ساخت متن سوال‌وجواب برای AI
    const qaText = questions.map((q: any) => {
      const answer = answers.find((a: any) => a.questionId === q.id);
      if (q.type === "multiple_choice") {
        return `سوال: ${q.text}\nجواب: ${answer?.answer || "بدون جواب"}`;
      } else {
        return `سوال: ${q.text}\nجواب: ${answer?.answer} از ۵`;
      }
    }).join("\n\n");

    const prompt = `شما یک مشاور ارشد مسیریابی شغلی هستید. کاربر آزمون مسیریابی شغلی در حوزه "${query}" را تکمیل کرده است.

پاسخ‌های کاربر:
${qaText}

بر اساس این پاسخ‌ها، یک تحلیل جامع و دقیق به فارسی ارائه بده.

فرمت خروجی باید دقیقاً این JSON باشد و هیچ متن اضافه یا markdown نداشته باشد:
{
  "summary": "یک پاراگراف کوتاه (۲-۳ جمله) درباره شخصیت و مسیر شغلی کاربر",
  "personality_traits": [
    {"trait": "نام ویژگی", "description": "توضیح کوتاه", "score": 85}
  ],
  "career_paths": [
    {
      "title": "عنوان مسیر شغلی",
      "holland_code": "IRC",
      "description": "توضیح این مسیر و چرا مناسب این کاربر است",
      "required_skills": ["مهارت ۱", "مهارت ۲", "مهارت ۳"],
      "avg_salary": "مثلاً ۱۵-۳۰ میلیون تومان"
    }
  ],
  "roadmap": [
    {
      "phase": "فاز ۱",
      "title": "عنوان فاز",
      "duration": "مثلاً ۳-۶ ماه",
      "steps": ["قدم ۱", "قدم ۲", "قدم ۳"]
    }
  ],
  "strengths": ["نقطه قوت ۱", "نقطه قوت ۲", "نقطه قوت ۳"],
  "areas_to_improve": ["حوزه بهبود ۱", "حوزه بهبود ۲"]
}

حتماً:
- برای هر مسیر شغلی، «holland_code» را بنویس: سه حرف از مدل RIASEC هالند،
  به ترتیب اهمیت برای آن شغل. حروف مجاز:
  R (عمل‌گرا)، I (پژوهشگر)، A (هنرمند)، S (اجتماعی)، E (متهور)، C (منظم).
  مثال: توسعه‌دهنده نرم‌افزار = "ICR" ، طراح رابط کاربری = "AIC".
  درصد تطابق را خودت محاسبه نکن؛ سیستم آن را از پاسخ‌های کاربر حساب می‌کند.
- حداقل ۳ مسیر شغلی پیشنهاد بده
- حداقل ۳ فاز در نقشه راه داشته باش
- همه چیز را به فارسی روان بنویس
- فقط JSON خالص برگردان`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are a career counseling expert. Always respond with valid JSON only, no markdown, no extra text.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Groq API error:", err);
      return NextResponse.json(
        { message: "خطا در تحلیل.", detail: err },
        { status: 500 }
      );
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    const clean = text.replace(/```json|```/g, "").trim();

    let result;
    try {
      result = JSON.parse(clean);
    } catch {
      console.error("JSON parse error:", clean);
      return NextResponse.json(
        { message: "خطا در پردازش نتیجه. لطفاً دوباره تلاش کنید." },
        { status: 500 }
      );
    }

    /* ── محاسبه‌ی واقعی درصد تطابق ──
       درصد را دیگر از هوش مصنوعی نمی‌پذیریم (قابل تکرار نبود و تعریف نداشت).
       اینجا پروفایل RIASEC کاربر از پاسخ‌هایش ساخته می‌شود و تطابق با هر شغل
       از شباهت کسینوسی حساب می‌گردد — همیشه یکسان و قابل توضیح. */
    try {
      const { vector, covered } = buildUserVector(questions, answers);

      if (hasEnoughSignal(covered) && Array.isArray(result?.career_paths)) {
        result.career_paths = result.career_paths.map(
          (c: { holland_code?: string; match_percentage?: number }) => {
            const target = hollandCodeToVector(c.holland_code || "");
            return {
              ...c,
              match_percentage: target
                ? matchPercent(vector, target)
                : (c.match_percentage ?? null),
              match_basis: target ? "riasec" : "estimate",
            };
          }
        );
        // مرتب‌سازی نزولی تا «بهترین گزینه» واقعاً اول باشد
        result.career_paths.sort(
          (a: { match_percentage?: number }, b: { match_percentage?: number }) =>
            (b.match_percentage ?? 0) - (a.match_percentage ?? 0)
        );
        result.riasec_profile = vector;
      }
    } catch (e) {
      console.error("RIASEC scoring failed:", e);
    }

    // ذخیره در quiz_attempts — نشست در صورت نیاز تازه می‌شود تا نتیجه‌ی
    // تحلیل‌شده به‌خاطر انقضای توکن از دست نرود.
    let attemptId: string | null = null;
    let applyCookies: (r: NextResponse) => NextResponse = (r) => r;

    try {
      const session = await getSession(req);
      applyCookies = session.applyCookies;

      if (session.user) {
        const { data: attempt } = await supabaseAdmin
          .from("quiz_attempts")
          .insert({
            user_id: session.user.id,
            query,
            answers,
            result_summary: result.summary,
            result_data: result,
          })
          .select("id")
          .single();

        attemptId = attempt?.id || null;
      }
    } catch (e) {
      console.error("DB save error:", e);
    }

    return applyCookies(NextResponse.json({ result, attemptId }));
  } catch (err) {
    return handleRouteError(err);
  }
}
