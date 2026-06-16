import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
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

    const prompt = `شما یک متخصص مسیریابی شغلی هستید. کاربر می‌خواهد مسیر شغلی خود را در حوزه "${query}" کشف کند.

${count} سوال ترکیبی طراحی کن که:
- علایق، مهارت‌ها، شخصیت و اهداف کاربر را بسنجد
- مرتبط با حوزه "${query}" باشد
- به فارسی روان و ساده نوشته شده باشد
- از ساده به پیچیده پیش برود

فرمت خروجی باید دقیقاً این JSON باشد و هیچ متن اضافه یا markdown نداشته باشد:
{
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "text": "متن سوال",
      "options": ["گزینه ۱", "گزینه ۲", "گزینه ۳", "گزینه ۴"]
    },
    {
      "id": 2,
      "type": "likert",
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

برای ${count} سوال، حدوداً ${Math.round(count * 0.6)} تا multiple_choice و ${Math.round(count * 0.4)} تا likert بیاور. فقط JSON خالص برگردان.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://my-career-path-nine.vercel.app",
        "X-Title": "My Career Path",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.2-3b-instruct:free",
        messages: [
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
      console.error("OpenRouter API error:", err);
      return NextResponse.json(
        { message: "خطا در ساخت سوالات.", detail: err },
        { status: 500 }
      );
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    // پاک کردن markdown fences احتمالی
    const clean = text.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      console.error("JSON parse error:", clean);
      return NextResponse.json(
        { message: "خطا در پردازش سوالات. لطفاً دوباره تلاش کنید." },
        { status: 500 }
      );
    }

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      return NextResponse.json(
        { message: "فرمت سوالات نامعتبر است." },
        { status: 500 }
      );
    }

    return NextResponse.json({ questions: parsed.questions });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "خطای سرور." }, { status: 500 });
  }
}
