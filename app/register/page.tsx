"use client";
import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    education: "",
    email: "",
    password: ""
  });

  // در اینجا می‌توانید همان کدهای useEffect و Canvas صفحه قبل را برای داشتن پس‌زمینه زنده قرار دهید

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("اطلاعات ثبت‌نام:", formData);
    // در اینجا منطق API و ارسال به دیتابیس را قرار دهید
  };

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px", display: "flex", alignItems: "center", justifyContent: "center", background: "#070d1a" }}>
      {/* <canvas ... /> اگر خواستید Canvas اضافه کنید */}
      
      <div style={{ width: "100%", maxWidth: 500, background: "rgba(15,31,61,0.9)", padding: "40px", borderRadius: 24, border: "1px solid rgba(59,130,246,0.2)", backdropFilter: "blur(10px)" }}>
        <h1 style={{ color: "#fff", textAlign: "center", marginBottom: 30 }}>عضویت در سامانه</h1>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <input placeholder="نام" className="auth-input" required onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
            <input placeholder="نام خانوادگی" className="auth-input" required onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
          </div>
          
          <select className="auth-input" required onChange={(e) => setFormData({...formData, education: e.target.value})}>
            <option value="">وضعیت تحصیلی خود را انتخاب کنید</option>
            <option value="student">دانش‌آموز</option>
            <option value="university">دانشجو</option>
            <option value="graduate">فارغ‌التحصیل</option>
          </select>

          <input type="email" placeholder="ایمیل" className="auth-input" required onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <input type="password" placeholder="رمز عبور" className="auth-input" required onChange={(e) => setFormData({...formData, password: e.target.value})} />

          <button type="submit" className="auth-submit" style={{ marginTop: 10, padding: 14, background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: "bold" }}>
            ثبت‌نام نهایی
          </button>
        </form>
      </div>
      
      {/* استایل‌های مورد نیاز که کلاس auth-input و auth-submit را تعریف می‌کنند اینجا قرار دهید */}
    </div>
  );
}
