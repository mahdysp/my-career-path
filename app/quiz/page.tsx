"use client";
import { useState } from "react";

export default function CareerHub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b]" style={{ fontFamily: 'vazirmatn, sans-serif', direction: 'rtl' }}>
      
      {/* ۱. هدر سایت (Navbar) */}
      <nav className="bg-white border-b border-[#e2e8f0] sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-8">
          <span className="text-2xl font-black text-[#2563eb] tracking-tight">کارخونه</span>
          <div className="hidden md:flex gap-6 text-sm font-medium text-[#64748b]">
            <a href="#" className="hover:text-[#2563eb] transition">فرصت‌های شغلی</a>
            <a href="#" className="hover:text-[#2563eb] transition">شایستگی‌سنجی</a>
            <a href="#" className="hover:text-[#2563eb] transition">شرکت‌ها</a>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="text-sm font-semibold px-4 py-2 text-[#2563eb] hover:bg-[#eff6ff] rounded-xl transition">ورود کارفرما</button>
          <button className="text-sm font-semibold px-5 py-2 bg-[#2563eb] text-white hover:bg-[#1d4ed8] rounded-xl shadow-md shadow-blue-100 transition">ثبت‌نام کارجو</button>
        </div>
      </nav>

      {/* ۲. بخش قهرمان (Hero Section) */}
      <header className="max-w-6xl mx-auto px-6 pt-16 pb-12 text-center">
        <span className="text-xs font-bold uppercase tracking-wider bg-[#dbeafe] text-[#2563eb] px-3 py-1.5 rounded-full">پلتفرم تخصصی اشتغال مهندسی</span>
        <h1 className="text-4xl md:text-5xl font-black text-[#0f172a] mt-6 leading-tight max-w-3xl mx-auto">
          مسیر شغلی خودت را پیدا کن و در <span className="text-[#2563eb]">بهترین شرکت‌ها</span> استخدام شو
        </h1>
        <p className="text-[#64748b] mt-4 text-base md:text-lg max-w-2xl mx-auto font-normal">
          با سیستم هوشمند ارزیابی مهارت، شایستگی‌های خودت را بسنج و مستقیم به کارفرمایان معتبر متصل شو.
        </p>

        {/* باکس جستجوی دریبل‌پسند (Search Bar) */}
        <div className="max-w-3xl mx-auto bg-white p-3 rounded-2xl shadow-xl shadow-slate-100 border border-[#e2e8f0] mt-10 flex flex-col md:flex-row gap-2 items-center">
          <div className="w-full relative flex items-center px-3">
            <input 
              type="text" 
              placeholder="عنوان شغلی، مهارت یا شرکت..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-4 py-3 bg-transparent text-sm font-medium focus:outline-none placeholder-[#94a3b8]"
            />
          </div>
          <button className="w-full md:w-auto bg-[#0f172a] text-white text-sm font-bold px-8 py-4 rounded-xl hover:bg-[#1e293b] transition whitespace-nowrap">
            جستجوی فرصت‌ها
          </button>
        </div>
      </header>

    </div>
  );
}
