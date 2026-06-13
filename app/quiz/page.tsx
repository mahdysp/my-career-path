"use client";
import { useState } from "react";

export default function CareerHub() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b]" style={{ fontFamily: 'vazirmatn, sans-serif', direction: 'rtl' }}>
      
      {/* ۱. هدر اصلاح‌شده بر اساس سلیقه شما */}
      <nav className="bg-white border-b border-[#e2e8f0] sticky top-0 z-50 px-8 py-4 flex justify-between items-center shadow-sm">
        {/* سمت راست: فقط لوگوی سایت بدون گزینه‌های اضافی منو */}
        <div className="flex items-center">
          <span className="text-xl font-black text-[#2563eb] tracking-tight">کارخونه</span>
        </div>
        
        {/* سمت چپ: دکمه‌های ورود و ثبت‌نام کاربردی */}
        <div className="flex gap-3">
          <button className="text-sm font-semibold px-4 py-2 text-[#2563eb] hover:bg-[#eff6ff] rounded-xl transition">ورود</button>
          <button className="text-sm font-semibold px-5 py-2 bg-[#2563eb] text-white hover:bg-[#1d4ed8] rounded-xl shadow-md shadow-blue-100 transition">ثبت‌نام</button>
        </div>
      </nav>

      {/* ۲. بخش قهرمان خلوت، کوبنده و کاملاً متمرکز */}
      <header className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        {/* تگ بالای تیتر حذف شد */}
        <h1 className="text-3xl md:text-5xl font-black text-[#0f172a] leading-tight">
          مسیر شغلی مهندسی خودت را <span className="text-[#2563eb]">کشف کن</span>
        </h1>
        {/* بخش انتهایی جمله کارفرمایان حذف شد */}
        <p className="text-[#64748b] mt-4 text-base md:text-lg max-w-xl mx-auto font-normal">
          تخصص خود را انتخاب کنید و با سیستم هوشمند ارزیابی مهارت، شایستگی‌های خودتان را بسنجید.
        </p>

        {/* باکس جستجوی مدرن */}
        <div className="max-w-2xl mx-auto bg-white p-2 rounded-2xl shadow-lg shadow-slate-100 border border-[#e2e8f0] mt-10 flex gap-2 items-center">
          <input 
            type="text" 
            placeholder="جستجوی حوزه مهندسی (مثلاً: نرم‌افزار، سخت‌افزار...)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-4 py-3 bg-transparent text-sm font-medium focus:outline-none placeholder-[#94a3b8]"
          />
          <button className="bg-[#2563eb] text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-[#1d4ed8] transition whitespace-nowrap">
            شروع ارزیابی
          </button>
        </div>
      </header>

    </div>
  );
}
