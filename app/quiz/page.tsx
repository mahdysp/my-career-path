"use client";
import { useState } from "react";

export default function CareerHub() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-white text-[#1e293b]" style={{ fontFamily: 'vazirmatn, sans-serif', direction: 'rtl' }}>
      
      {/* ۱. هدر شیک و تمیز سایت */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 px-8 py-5 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-2xl font-black text-[#2563eb] tracking-tight">کارخونه</span>
        </div>
        <div className="flex gap-4">
          <button className="text-base font-bold px-4 py-2 text-[#2563eb] hover:bg-[#eff6ff] rounded-xl transition">ورود</button>
          <button className="text-base font-bold px-6 py-2.5 bg-[#2563eb] text-white hover:bg-[#1d4ed8] rounded-xl shadow-md shadow-blue-100 transition">ثبت‌نام</button>
        </div>
      </nav>

      {/* ۲. بخش اصلی دو ستونه (الهام گرفته از طرح بالا سمت راست) */}
      <main className="max-w-7xl mx-auto px-8 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* ستون راست: متن‌ها و باکس جستجو */}
        <div className="text-right z-10 order-first lg:order-none">
          <h1 className="text-4xl md:text-6xl font-black text-[#0f172a] leading-tight tracking-tight">
            مسیر شغلی خودت را <span className="text-[#2563eb]">کشف کن</span>
          </h1>
          
          <p className="text-[#64748b] mt-6 text-lg md:text-xl max-w-xl font-medium leading-relaxed">
            تخصص خود را انتخاب کنید و با سیستم هوشمند ارزیابی مهارت، شایستگی‌های خودتان را بسنجید.
          </p>

          {/* باکس جستجوی بزرگ و مدرن */}
          <div className="bg-white p-3 rounded-2xl shadow-xl shadow-slate-100 border border-[#e2e8f0] mt-12 flex gap-3 items-center max-w-xl">
            <input 
              type="text" 
              placeholder="جستجوی حوزه تخصصی (برنامه‌نویسی، طراحی...)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-4 py-3 bg-transparent text-base font-bold focus:outline-none placeholder-[#94a3b8]"
            />
            <button className="bg-[#2563eb] text-white text-base font-black px-8 py-3.5 rounded-xl hover:bg-[#1d4ed8] transition whitespace-nowrap">
              شروع ارزیابی
            </button>
          </div>
        </div>

        {/* ستون چپ: گرافیک بومی‌سازی شده از طرح (کوه، قطب‌نما و پرچم صعود با SVG حرفه‌ای و سبک) */}
        <div className="relative w-full h-[350px] md:h-[450px] flex items-center justify-center overflow-hidden">
          <svg viewBox="0 0 500 400" className="w-full h-full max-w-[500px]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* گرادینت‌های ملایم دقیقا مثل عکس مورد نظر شما */}
              <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* خط افق و مسیر ملایم */}
            <path d="M 50,350 Q 200,320 350,280 T 500,220" fill="none" stroke="url(#accentGrad)" strokeWidth="4" strokeDasharray="6 6" />

            {/* کوه بزرگ سمت راست پس‌زمینه */}
            <polygon points="250,350 400,100 520,350" fill="url(#mountainGrad)" />
            
            {/* کوه کوچک‌تر جلو با رنگ گرم‌تر مایل به نارنجی ملایم */}
            <polygon points="120,350 240,180 360,350" fill="url(#accentGrad)" opacity="0.6" />
            
            {/* پرچم صعود و موفقیت در نوک کوه */}
            <line x1="240" y1="180" x2="240" y2="150" stroke="#f97316" strokeWidth="3" />
            <polygon points="240,150 275,160 240,170" fill="#f97316" />

            {/* چرخ‌دنده‌های انتزاعی متداخل در پایین صفحه */}
            <circle cx="100" cy="320" r="30" fill="none" stroke="#3b82f6" strokeWidth="4" strokeOpacity="0.2" strokeDasharray="10 4" />
            <circle cx="145" cy="340" r="20" fill="none" stroke="#f97316" strokeWidth="3" strokeOpacity="0.2" strokeDasharray="6 3" />

            {/* نماد قطب‌نما / ستاره راهنما در بالا سمت راست */}
            <g transform="translate(420, 80)">
              <circle cx="0" cy="0" r="25" fill="none" stroke="#3b82f6" strokeWidth="2" strokeOpacity="0.3" />
              <path d="M 0,-30 L 7,-7 L 30,0 L 7,7 L 0,30 L -7,7 L -30,0 L -7,-7 Z" fill="url(#accentGrad)" />
              <circle cx="0" cy="0" r="4" fill="#2563eb" />
            </g>
          </svg>
        </div>

      </main>

    </div>
  );
}
