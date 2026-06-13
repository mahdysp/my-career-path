"use client";
import { useState } from "react";

export default function CareerHub() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b]" style={{ fontFamily: 'vazirmatn, sans-serif', direction: 'rtl' }}>
      
      {/* ۱. هدر ساده و متمرکز */}
      <nav className="bg-white border-b border-[#e2e8f0] sticky top-0 z-50 px-8 py-5 flex justify-between items-center shadow-sm">
        {/* سمت راست: لوگو */}
        <div className="flex items-center">
          <span className="text-2xl font-black text-[#2563eb] tracking-tight">کارخونه</span>
        </div>
        
        {/* سمت چپ: دکمه‌های ورود و ثبت‌نام */}
        <div className="flex gap-4">
          <button className="text-base font-bold px-4 py-2 text-[#2563eb] hover:bg-[#eff6ff] rounded-xl transition">ورود</button>
          <button className="text-base font-bold px-6 py-2.5 bg-[#2563eb] text-white hover:bg-[#1d4ed8] rounded-xl shadow-md shadow-blue-100 transition">ثبت‌نام</button>
        </div>
      </nav>

      {/* ۲. بخش قهرمان خلوت، با فونت‌های درشت‌تر و بدون محدودیت مهندسی */}
      <header className="max-w-4xl mx-auto px-6 pt-28 pb-20 text-center">
        {/* سایز متن از text-5xl به text-6xl ارتقا یافت */}
        <h1 className="text-4xl md:text-6xl font-black text-[#0f172a] leading-tight tracking-tight">
          مسیر شغلی خودت را <span className="text-[#2563eb]">کشف کن</span>
        </h1>
        
        {/* سایز متن توضیحات از text-lg به text-xl ارتقا یافت */}
        <p className="text-[#64748b] mt-6 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
          تخصص خود را انتخاب کنید و با سیستم هوشمند ارزیابی مهارت، شایستگی‌های خودتان را بسنجید.
        </p>

        {/* باکس جستجوی بزرگ‌تر و خواناتر */}
        <div className="max-w-2xl mx-auto bg-white p-3 rounded-2xl shadow-xl shadow-slate-100 border border-[#e2e8f0] mt-12 flex gap-3 items-center">
          <input 
            type="text" 
            placeholder="جستجوی حوزه تخصصی (مثلاً: برنامه‌نویسی، طراحی، مالی...)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-4 py-3 bg-transparent text-base font-bold focus:outline-none placeholder-[#94a3b8]"
          />
          <button className="bg-[#2563eb] text-white text-base font-black px-8 py-3.5 rounded-xl hover:bg-[#1d4ed8] transition whitespace-nowrap">
            شروع ارزیابی
          </button>
        </div>
      </header>

    </div>
  );
}
