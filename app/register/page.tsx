"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    education: "",
    email: "",
    password: ""
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  // توجه: کدهای مربوط به Canvas (useEffect و draw) را دقیقاً مشابه صفحه قبل کپی کنید اینجا

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  return (
    <div className="register-container" style={{ minHeight: "100vh", background: "#070d1a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      {/* در اینجا باید تگ <canvas> و استایل‌های عمومی قرار بگیرند */}

      <div style={{ maxWidth: 450, width: "100%", background: "rgba(15,31,61,0.8)", padding: 40, borderRadius: 24, border: "1px solid rgba(59,130,246,0.2)", zIndex: 10 }}>
        <h2 style={{ textAlign: "center", marginBottom: 30 }}>مرحله {step} از ۳</h2>

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            <input placeholder="نام" className="auth-input" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
            <input placeholder="نام خانوادگی" className="auth-input" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
            <button onClick={handleNext} className="auth-submit">بعدی</button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            <label style={{ fontSize: 13, color: "#94a3b8" }}>وضعیت تحصیلی:</label>
            <select className="auth-input" value={formData.education} onChange={(e) => setFormData({...formData, education: e.target.value})}>
              <option value="">انتخاب کنید...</option>
              <option value="student">دانش‌آموز</option>
              <option value="university">دانشجو</option>
              <option value="graduate">فارغ‌التحصیل</option>
            </select>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleBack} className="auth-submit" style={{ background: "#475569" }}>بازگشت</button>
              <button onClick={handleNext} className="auth-submit">بعدی</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            <input type="email" placeholder="ایمیل" className="auth-input" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <input type="password" placeholder="رمز عبور" className="auth-input" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleBack} className="auth-submit" style={{ background: "#475569" }}>بازگشت</button>
              <button onClick={() => alert("ثبت‌نام نهایی شد!")} className="auth-submit" style={{ background: "#10b981" }}>تکمیل ثبت‌نام</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
