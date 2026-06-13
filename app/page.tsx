"use client";
import { useState } from "react";

export default function CareerHub() {
  // استیت‌های مربوط به فرم ارزیابی مهارت
  const [name, setName] = useState("");
  const [skill, setSkill] = useState("frontend");
  const [customSkill, setCustomSkill] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitted(false);

    // تعیین حوزه نهایی برای ارسال به API
    const finalSkill = skill === "other" ? customSkill : skill;

    try {
      const response = await fetch("/api/career", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, skill: finalSkill }),
      });

      const data = await response.json();
      setAiResult(data.aiResponse);
      setSubmitted(true);
    } catch (error) {
      console.error("خطا در برقراری ارتباط با سرور:", error);
      alert("متأسفانه مشکلی در تحلیل مهارت رخ داد. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-[#1e293b]" style={{ fontFamily: 'vazirmatn, sans-serif', direction: 'rtl' }}>
      
      {/* ۱. هدر سایت */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <nav className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-black text-[#2563eb] tracking-tight">کارخونه</span>
            <span className="mr-3 bg-blue-50 text-[#2563eb] text-xs font-bold px-2.5 py-1 rounded-lg border border-blue-100">نسخه هوشمند</span>
          </div>
          <div className="flex gap-2">
            <button className="text-sm font-bold px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition">راهنما</button>
          </div>
        </nav>
      </header>

      {/* ۲. بخش اصلی ارزیابی مهارت */}
      <main className="max-w-3xl mx-auto px-6 pt-12 pb-24">
        
        {/* هدینگ و توضیحات بالای فرم */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-[#0f172a] tracking-tight">
            ارزیابی هوشمند <span className="text-[#2563eb]">مسیر شغلی</span>
          </h1>
          <p className="text-[#64748b] mt-3 text-base md:text-lg font-medium">
            نام و حوزه تخصصی خود را وارد کنید تا هوش مصنوعی شایستگی‌های شما را تحلیل کند.
          </p>
        </div>

        {/* کارت اصلی فرم */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* فیلد نام و نام خانوادگی */}
            <div className="flex flex-col gap-2">
              <label className="text-base font-bold text-[#0f172a]">نام یا نام مستعار شما</label>
              <input
                type="text"
                required
                placeholder="مثلاً: مهدی"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb] text-base font-medium transition"
              />
            </div>

            {/* فیلد انتخاب حوزه تخصصی */}
            <div className="flex flex-col gap-2">
              <label className="text-base font-bold text-[#0f172a]">حوزه تخصصی مورد نظر</label>
              <select
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb] text-base font-bold transition appearance-none cursor-pointer"
              >
                <option value="frontend">برنامه‌نویسی فرانت‌اند (Frontend)</option>
                <option value="backend">برنامه‌نویسی بک‌اند (Backend)</option>
                <option value="uiux">طراحی رابط کاربری (UI/UX)</option>
                <option value="devops">مهندسی دواپس (DevOps)</option>
                <option value="other">سایر حوزه‌ها (تایپ اختیاری)...</option>
              </select>
            </div>

            {/* فیلد پویا در صورت انتخاب «سایر حوزه‌ها» */}
            {skill === "other" && (
              <div className="flex flex-col gap-2 animate-fadeIn">
                <label className="text-sm font-bold text-slate-600">نام حوزه تخصصی خود را بنویسید</label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً: هوش مصنوعی، گرافیک، سئو"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb] text-base font-medium transition"
                />
              </div>
            )}

            {/* دکمه ثبت و ارسال */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-black text-base shadow-lg transition flex items-center justify-center gap-2 ${
                loading 
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none" 
                  : "bg-[#2563eb] text-white hover:bg-[#1d4ed8] shadow-blue-500/10"
              }`}
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></span>
                  در حال تحلیل شایستگی‌ها توسط هوش مصنوعی...
                </>
              ) : (
                "ثبت و تحلیل هوشمند مهارت‌ها"
              )}
            </button>
          </form>
        </div>

        {/* ۳. بخش نمایش نتایج تحلیل هوش مصنوعی */}
        {submitted && !loading && (
          <div className="mt-8 bg-gradient-to-br from-white to-slate-50 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/40 border border-emerald-100 text-right animate-slideUp">
            <div className="flex items-center gap-2 mb-4 text-emerald-600">
              <span className="text-2xl">✨</span>
              <h2 className="text-xl font-black">گزارش و تحلیل اختصاصی برای {name}</h2>
            </div>
            <hr className="border-slate-100 mb-4" />
            <div className="text-slate-700 text-base leading-relaxed font-medium whitespace-pre-line bg-white/60 p-5 rounded-2xl border border-slate-100/80">
              {aiResult}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
