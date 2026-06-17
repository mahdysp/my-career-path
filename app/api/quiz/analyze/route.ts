import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
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
      "match_percentage": 92,
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

    // ذخیره در quiz_attempts اگر کاربر لاگین است
    const accessToken = req.cookies.get("sb-access-token")?.value;
    let attemptId = null;

    if (accessToken) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
        );

        const { data: userData } = await supabase.auth.getUser(accessToken);

        if (userData.user) {
          const { data: attempt } = await supabaseAdmin
            .from("quiz_attempts")
            .insert({
              user_id: userData.user.id,
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
    }

    return NextResponse.json({ result, attemptId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "خطای سرور." }, { status: 500 });
  }
}
