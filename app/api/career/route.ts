import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, skill } = body;

    const API_KEY = "YOUR_GEMINI_API_KEY_HERE"; 

    // اگر کلید ست نشده باشد، نقشه‌های راه شبیه‌سازی شده مهندسی را برمی‌گردانیم
    if (API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
      let roadmap = '';
      
      if (skill === 'embedded') {
        roadmap = '⚡ ۱. تسلط بر زبان C/C++ و میکروکنترلرهای AVR/ARM\n🛠️ ۲. شبیه‌سازی مدارها در Proteus و کار با سنسورها\n🎯 ۳. پیاده‌سازی سیستم‌های RTOS و کار روی بردهای تعبیه‌شده (Embedded)';
      } else if (skill === 'fpga') {
        roadmap = '📐 ۱. یادگیری زبان‌های توصیف سخت‌افزار (Verilog یا VHDL)\n💻 ۲. آشنایی با معماری داخلی FPGA و ابزارهای سنتز (مثل Vivado)\n🚀 ۳. پیاده‌سازی پردازش سیگنال دیجیتال (DSP) و تست روی سخت‌افزار واقعی';
      } else {
        roadmap = '🏗️ ۱. تسلط بر اصول شئ‌گرایی (OOP) و الگوهای طراحی (Design Patterns)\n📊 ۲. مدل‌سازی سیستم با نمودارهای UML (ساختار Use Caseها و روابط آن)\n💻 ۳. طراحی معماری نرم‌افزار و سیستم‌های ماژولار';
      }
      
      return NextResponse.json({ 
        aiResponse: `سلام مهندس ${name} عزیز!\n\nزیرساخت هوش مصنوعی بدون نیاز به پکیج آماده است.\n\n📍 مسیر پیشنهادی برای شما در حوزه تخصصی‌تان:\n\n${roadmap}`
      });
    }

    // بخش اتصال به API واقعی گوگل (در صورت داشتن کلید)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `شما یک مشاور شغلی مهندسی هستید. نام کاربر ${name} است و حوزه تخصصی او ${skill}. یک نقشه راه خلاصه و ۳ مرحله‌ای مهندسی به زبان فارسی بنویس.` }]
        }]
      })
    });

    const data = await response.json();
    return NextResponse.json({ aiResponse: data.candidates[0].content.parts[0].text });

  } catch (error) {
    return NextResponse.json({ aiResponse: 'خطا در ارتباط با سرور مهندسی' });
  }
}
