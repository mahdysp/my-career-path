// مسیر فایل: app/register/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PasswordLamp from "@/app/components/PasswordLamp";
import { passwordLampStyles } from "@/app/components/passwordLampStyles";
import ThemeToggle from "@/app/components/ThemeToggle";

type EmailStatus = "idle" | "checking" | "valid" | "invalid" | "exists";

export default function RegisterPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    education: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle");
  const [emailMessage, setEmailMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    router.prefetch("/auth");
  }, [router]);

  const handleSpotlight = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }, []);

  const checkEmail = async () => {
    const email = formData.email.trim();

    if (!email) {
      setEmailStatus("idle");
      setEmailMessage("");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setEmailStatus("invalid");
      setEmailMessage("فرمت ایمیل صحیح نیست.");
      return;
    }

    setEmailStatus("checking");
    setEmailMessage("در حال بررسی...");

    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setEmailStatus("idle");
        setEmailMessage("");
        return;
      }

      if (!data.valid) {
        setEmailStatus("invalid");
        setEmailMessage(data.message);
      } else if (data.exists) {
        setEmailStatus("exists");
        setEmailMessage(data.message);
      } else {
        setEmailStatus("valid");
        setEmailMessage(data.message);
      }
    } catch {
      setEmailStatus("idle");
      setEmailMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (emailStatus === "exists") {
      setError("این ایمیل قبلاً ثبت شده است. لطفاً وارد حساب خود شوید.");
      return;
    }
    if (emailStatus === "invalid") {
      setError("لطفاً یک ایمیل معتبر وارد کنید.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "مشکلی پیش آمده است.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "مشکلی پیش آمده است.");
    } finally {
      setLoading(false);
    }
  };

  // ── قدرت رمز عبور ──
  const pwd = formData.password;
  const pwdScore = [
    pwd.length >= 8,
    /[a-z]/.test(pwd) && /[A-Z]/.test(pwd),
    /\d/.test(pwd),
    /[^A-Za-z0-9]/.test(pwd),
  ].filter(Boolean).length;
  const pwdLabels = ["خیلی ضعیف", "ضعیف", "متوسط", "خوب", "قوی"];
  const pwdColors = ["#f87171", "#f87171", "#fbbf24", "#60a5fa", "#4ade80"];

  const emailTone: Record<EmailStatus, string> = {
    idle: "var(--foreground-subtle)",
    checking: "#fbbf24",
    valid: "#4ade80",
    invalid: "#f87171",
    exists: "#f87171",
  };

  return (
    <>
      <style>{`
        @keyframes k2Float1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(20px, -30px) rotate(2deg); }
        }
        @keyframes k2Float2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-24px, 20px) rotate(-2deg); }
        }
        @keyframes k2Float3 {
          0%, 100% { transform: translate(0, 0); opacity: 0.5; }
          50% { transform: translate(10px, -14px); opacity: 0.8; }
        }
        @keyframes k2FadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes k2Swap {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes k2Spin { to { transform: rotate(360deg); } }
        @keyframes k2Shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-3px); }
          40%, 60% { transform: translateX(3px); }
        }
        @keyframes k2Pop {
          from { opacity: 0; transform: scale(0.86); }
          to { opacity: 1; transform: scale(1); }
        }

        .k2-fade-1 { animation: k2FadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.05s; }
        .k2-fade-2 { animation: k2FadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.14s; }
        .k2-swap { animation: k2Swap 0.35s cubic-bezier(0.16,1,0.3,1) both; }

        .k2-btn {
          font-family: var(--font-sans);
          font-weight: 500;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease;
        }
        .k2-btn:active:not(:disabled) { transform: scale(0.98); }
        .k2-btn:disabled { cursor: not-allowed; opacity: 0.55; }

        .k2-btn-primary {
          background: var(--accent);
          color: #fff;
          border-radius: 8px;
          box-shadow:
            0 0 0 1px rgba(94,106,210,0.5),
            0 4px 12px rgba(94,106,210,0.3),
            inset 0 1px 0 0 rgba(255,255,255,0.2);
        }
        .k2-btn-primary:hover:not(:disabled) {
          background: var(--accent-bright);
          box-shadow:
            0 0 0 1px rgba(94,106,210,0.7),
            0 6px 24px rgba(94,106,210,0.45),
            inset 0 1px 0 0 rgba(255,255,255,0.25);
          transform: translateY(-2px);
        }

        .k2-grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(to right, var(--grid-line) 1px, transparent 1px),
            linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px);
          background-size: 64px 64px;
          pointer-events: none;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%);
        }

        .k2-noise {
          position: fixed;
          inset: 0;
          opacity: var(--noise-opacity);
          pointer-events: none;
          z-index: 1;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        .k2-gradient-text {
          background: var(--heading-gradient);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .k2-card {
          position: relative;
          background: var(--card-gradient);
          border: 1px solid var(--border-default);
          border-radius: 16px;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.03),
            0 2px 20px rgba(0,0,0,0.4),
            0 0 40px rgba(0,0,0,0.15);
        }
        .k2-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), rgba(94,106,210,0.14), transparent 60%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .k2-card:hover::before { opacity: 1; }

        .k2-icon-box {
          width: 44px; height: 44px;
          border-radius: 12px;
          border: 1px solid var(--border-hover);
          background: var(--surface);
          display: flex; align-items: center; justify-content: center;
          color: var(--accent);
          flex-shrink: 0;
        }

        .k2-field { display: flex; flex-direction: column; gap: 7px; }
        .k2-label {
          font-size: 12.5px;
          color: var(--foreground-muted);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .k2-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border-default);
          border-radius: 10px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .k2-input-wrap.focused {
          border-color: var(--border-accent);
          background: rgba(255,255,255,0.055);
          box-shadow: 0 0 0 3px var(--blob-3);
        }
        .k2-input-wrap.ok      { border-color: rgba(74,222,128,0.42); }
        .k2-input-wrap.bad     { border-color: rgba(248,113,113,0.45); }
        .k2-input-wrap.pending { border-color: rgba(251,191,36,0.42); }

        .k2-input-wrap svg.lead { margin: 0 12px; color: var(--foreground-subtle); flex-shrink: 0; transition: color 0.2s ease; }
        .k2-input-wrap.focused svg.lead { color: var(--accent); }
        .k2-input-wrap input,
        .k2-input-wrap select {
          flex: 1;
          min-width: 0;
          background: transparent;
          border: none;
          outline: none;
          color: var(--foreground);
          font-family: var(--font-sans);
          font-size: 14px;
          padding: 12px 0;
        }
        .k2-input-wrap input::placeholder { color: var(--placeholder); }
        .k2-input-wrap select {
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
          padding-left: 34px;
        }
        .k2-input-wrap select option { background: var(--option-bg); color: var(--foreground); }
        .k2-select-caret {
          position: absolute;
          left: 13px;
          pointer-events: none;
          color: var(--foreground-subtle);
          display: flex;
        }
        .k2-tail {
          display: flex;
          align-items: center;
          padding: 0 12px;
          flex-shrink: 0;
        }

        .k2-alert {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          text-align: right;
          background: rgba(248,113,113,0.08);
          border: 1px solid rgba(248,113,113,0.25);
          color: #fca5a5;
          font-size: 13px;
          line-height: 1.7;
          padding: 11px 13px;
          border-radius: 10px;
          animation: k2Swap 0.3s cubic-bezier(0.16,1,0.3,1) both, k2Shake 0.4s ease both;
        }

        .k2-hint {
          font-family: var(--font-mono);
          font-size: 10.5px;
          color: #fbbf24;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .k2-spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: k2Spin 0.7s linear infinite;
        }
        .k2-spinner.sm {
          width: 12px; height: 12px;
          border-width: 1.8px;
          border-color: rgba(251,191,36,0.3);
          border-top-color: #fbbf24;
        }

        .k2-meter {
          display: flex;
          gap: 4px;
          margin-top: 2px;
        }
        .k2-meter i {
          flex: 1;
          height: 3px;
          border-radius: 100px;
          background: rgba(255,255,255,0.08);
          transition: background 0.3s ease;
        }

        .k2-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 22px 0 18px;
          font-family: var(--font-mono);
          font-size: 10.5px;
          color: var(--foreground-subtle);
        }
        .k2-divider::before, .k2-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: var(--border-default);
        }

        .k2-link {
          color: var(--accent);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }
        .k2-link:hover { color: var(--accent-bright); text-decoration: underline; }

        .k2-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--foreground-muted);
          text-decoration: none;
          padding: 8px 12px;
          border-radius: 8px;
          transition: color 0.2s ease, background 0.2s ease;
        }
        .k2-back:hover { color: var(--foreground); background: var(--surface); }

        .k2-trust {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 20px;
          font-size: 11px;
          color: var(--foreground-subtle);
        }

        .k2-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        @media (max-width: 560px) {
          .k2-card-pad { padding: 30px 22px !important; }
          .k2-row-2 { grid-template-columns: 1fr !important; }
        }

        @media (max-width: 380px) {
          .k2-card-pad { padding: 24px 15px !important; }
          .k2-row-2 { grid-template-columns: 1fr !important; }
        }

        ${passwordLampStyles}
      `}</style>

      <main
        dir="rtl"
        style={{
          position: "relative",
          minHeight: "100vh",
          width: "100%",
          background:
            "var(--page-gradient)",
          fontFamily: "var(--font-sans)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Ambient blobs */}
        <div
          style={{
            position: "absolute", top: "-240px", left: "50%", transform: "translateX(-50%)",
            width: 1100, height: 700, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(94,106,210,0.26), transparent 70%)",
            filter: "blur(140px)", pointerEvents: "none", animation: "k2Float1 9s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute", top: "25%", left: "-220px",
            width: 600, height: 800, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,0.13), transparent 70%)",
            filter: "blur(120px)", pointerEvents: "none", animation: "k2Float2 10s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute", top: "40%", right: "-180px",
            width: 500, height: 700, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(94,106,210,0.11), transparent 70%)",
            filter: "blur(100px)", pointerEvents: "none", animation: "k2Float3 8s ease-in-out infinite",
          }}
        />
        <div className="k2-grid-overlay" />
        <div className="k2-noise" />

        <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          {/* Nav */}
          <nav
            style={{
              height: 64, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 clamp(16px, 4vw, 40px)",
              borderBottom: "1px solid var(--border-default)",
            }}
          >
            <Link
              href="/"
              style={{ fontWeight: 700, fontSize: 19, letterSpacing: "-0.02em", color: "var(--foreground)", textDecoration: "none" }}
            >
              Karex
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ThemeToggle />
              <Link href="/" className="k2-back">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M14 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
                بازگشت به خانه
              </Link>
            </div>
          </nav>

          {/* Card */}
          <div
            style={{
              flex: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "clamp(32px, 6vw, 64px) clamp(16px, 4vw, 40px)",
            }}
          >
            <div style={{ width: "100%", maxWidth: 470 }}>
              <div
                className={`k2-card k2-card-pad ${mounted ? "k2-fade-1" : ""}`}
                onMouseMove={handleSpotlight}
                style={{ padding: "34px 32px", textAlign: "right" }}
              >
                {success ? (
                  /* ── حالت موفقیت ── */
                  <div style={{ textAlign: "center", animation: "k2Pop 0.4s cubic-bezier(0.16,1,0.3,1) both" }}>
                    <div
                      className="k2-icon-box"
                      style={{ margin: "0 auto 18px", width: 52, height: 52, color: "#4ade80", borderColor: "rgba(74,222,128,0.3)", background: "rgba(74,222,128,0.08)" }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="5.5" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
                        <path d="M4 8l8 5.5L20 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>

                    <h1
                      className="k2-gradient-text"
                      style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 10px" }}
                    >
                      ایمیل خود را تایید کنید
                    </h1>

                    <p style={{ fontSize: 13.5, color: "var(--foreground-muted)", lineHeight: 1.9, margin: "0 0 8px" }}>
                      لینک تایید به این آدرس ارسال شد:
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--foreground)",
                        direction: "ltr", background: "var(--surface)", border: "1px solid var(--border-default)",
                        borderRadius: 8, padding: "9px 12px", margin: "0 0 18px", wordBreak: "break-all",
                      }}
                    >
                      {formData.email}
                    </p>
                    <p style={{ fontSize: 13, color: "var(--foreground-muted)", lineHeight: 1.9, margin: "0 0 24px" }}>
                      برای فعال‌سازی حساب، روی لینک داخل ایمیل کلیک کنید و سپس وارد شوید.
                      اگر ایمیل را نمی‌بینید، پوشه‌ی اسپم را بررسی کنید.
                    </p>

                    <button
                      onClick={() => router.push("/auth")}
                      className="k2-btn k2-btn-primary"
                      style={{ width: "100%", height: 46, fontSize: 15 }}
                    >
                      رفتن به صفحه ورود
                    </button>
                  </div>
                ) : (
                  /* ── فرم ثبت‌نام ── */
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
                      <div className="k2-icon-box">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <circle cx="10" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
                          <path d="M3.5 20c0-3.3 2.9-5.5 6.5-5.5 1.2 0 2.3.2 3.2.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                          <path d="M18 14v6M15 17h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h1
                          className="k2-gradient-text"
                          style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", margin: 0, lineHeight: 1.35 }}
                        >
                          ساخت حساب کاربری
                        </h1>
                        <p style={{ fontSize: 13, color: "var(--foreground-muted)", margin: "4px 0 0", lineHeight: 1.7 }}>
                          اطلاعات زیر را کامل کنید تا مسیر شغلی‌تان را بسازیم
                        </p>
                      </div>
                    </div>

                    {error && (
                      <div className="k2-alert" style={{ marginBottom: 16 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                          <path d="M12 7.5v5.5M12 16.2v.3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                        </svg>
                        <span>{error}</span>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                      {/* نام و نام خانوادگی */}
                      <div className="k2-row-2">
                        <div className="k2-field">
                          <label className="k2-label" htmlFor="firstName">نام</label>
                          <div className={`k2-input-wrap ${focused === "firstName" ? "focused" : ""}`}>
                            <svg className="lead" width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
                              <path d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                            </svg>
                            <input
                              id="firstName"
                              type="text"
                              required
                              autoComplete="given-name"
                              placeholder="مثلاً علی"
                              value={formData.firstName}
                              onFocus={() => setFocused("firstName")}
                              onBlur={() => setFocused(null)}
                              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="k2-field">
                          <label className="k2-label" htmlFor="lastName">نام خانوادگی</label>
                          <div className={`k2-input-wrap ${focused === "lastName" ? "focused" : ""}`}>
                            <input
                              id="lastName"
                              type="text"
                              required
                              autoComplete="family-name"
                              placeholder="مثلاً محمدی"
                              style={{ paddingRight: 13 }}
                              value={formData.lastName}
                              onFocus={() => setFocused("lastName")}
                              onBlur={() => setFocused(null)}
                              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* وضعیت تحصیلی */}
                      <div className="k2-field">
                        <label className="k2-label" htmlFor="education">وضعیت تحصیلی</label>
                        <div className={`k2-input-wrap ${focused === "education" ? "focused" : ""}`}>
                          <svg className="lead" width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M3 9l9-4.5L21 9l-9 4.5L3 9z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                            <path d="M7 11v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                          </svg>
                          <select
                            id="education"
                            required
                            value={formData.education}
                            onFocus={() => setFocused("education")}
                            onBlur={() => setFocused(null)}
                            onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                            style={{ color: formData.education ? "var(--foreground)" : "var(--placeholder)" }}
                          >
                            <option value="">انتخاب کنید…</option>
                            <option value="student">دانش‌آموز</option>
                            <option value="university">دانشجو</option>
                            <option value="graduate">فارغ‌التحصیل</option>
                          </select>
                          <span className="k2-select-caret">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        </div>
                      </div>

                      {/* ایمیل */}
                      <div className="k2-field">
                        <label className="k2-label" htmlFor="email">ایمیل</label>
                        <div
                          className={`k2-input-wrap ${focused === "email" ? "focused" : ""} ${
                            emailStatus === "valid" ? "ok" :
                            emailStatus === "invalid" || emailStatus === "exists" ? "bad" :
                            emailStatus === "checking" ? "pending" : ""
                          }`}
                        >
                          <svg className="lead" width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="5.5" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
                            <path d="M4 8l8 5.5L20 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <input
                            id="email"
                            type="email"
                            required
                            autoComplete="email"
                            dir="ltr"
                            placeholder="you@example.com"
                            style={{ textAlign: "left" }}
                            value={formData.email}
                            onFocus={() => setFocused("email")}
                            onChange={(e) => {
                              setFormData({ ...formData, email: e.target.value });
                              setEmailStatus("idle");
                              setEmailMessage("");
                            }}
                            onBlur={() => { setFocused(null); checkEmail(); }}
                          />
                          {emailStatus !== "idle" && (
                            <span className="k2-tail" style={{ color: emailTone[emailStatus] }}>
                              {emailStatus === "checking" ? (
                                <span className="k2-spinner sm" />
                              ) : emailStatus === "valid" ? (
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                  <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              ) : (
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
                                </svg>
                              )}
                            </span>
                          )}
                        </div>
                        {emailMessage && (
                          <span className="k2-swap" style={{ fontSize: 11.5, color: emailTone[emailStatus] }}>
                            {emailMessage}
                          </span>
                        )}
                      </div>

                      {/* رمز عبور + چراغ */}
                      <div className="k2-pass-row">
                        <div className="k2-field">
                          <label className="k2-label" htmlFor="password">
                            <span>رمز عبور</span>
                            {capsOn && (
                              <span className="k2-hint">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                                  <path d="M12 4l7 8h-4v5H9v-5H5l7-8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                                </svg>
                                Caps Lock روشن است
                              </span>
                            )}
                          </label>
                          <div className={`k2-input-wrap ${focused === "password" ? "focused" : ""} ${showPassword ? "lit" : ""}`}>
                            <svg className="lead" width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <rect x="4.5" y="10.5" width="15" height="9" rx="2.2" stroke="currentColor" strokeWidth="1.7" />
                              <path d="M8 10.5V7.8a4 4 0 1 1 8 0v2.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                            </svg>
                            <input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              required
                              autoComplete="new-password"
                              dir="ltr"
                              placeholder="••••••••"
                              style={{ textAlign: "left", paddingLeft: 12 }}
                              value={formData.password}
                              onFocus={() => setFocused("password")}
                              onBlur={() => { setFocused(null); setCapsOn(false); }}
                              onKeyUp={(e) => setCapsOn(e.getModifierState?.("CapsLock") ?? false)}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                          </div>

                          {/* نوار قدرت رمز */}
                          <div className="k2-meter">
                            {[0, 1, 2, 3].map((i) => (
                              <i key={i} style={{ background: pwd && i < pwdScore ? pwdColors[pwdScore] : undefined }} />
                            ))}
                          </div>
                          {(pwd || !showPassword) && (
                            <span style={{ fontSize: 11, color: pwd ? pwdColors[pwdScore] : "var(--foreground-subtle)" }}>
                              {pwd ? `قدرت رمز: ${pwdLabels[pwdScore]}` : "برای دیدن رمز، چراغ را روشن کنید"}
                            </span>
                          )}
                        </div>

                        <PasswordLamp on={showPassword} onToggle={() => setShowPassword((v) => !v)} />
                      </div>

                      <button
                        type="submit"
                        disabled={loading || emailStatus === "exists" || emailStatus === "invalid"}
                        className="k2-btn k2-btn-primary"
                        style={{ width: "100%", height: 46, fontSize: 15, marginTop: 5 }}
                      >
                        {loading ? (
                          <>
                            <span className="k2-spinner" />
                            در حال پردازش...
                          </>
                        ) : (
                          "ثبت‌نام"
                        )}
                      </button>
                    </form>

                    <div className="k2-divider">یا</div>

                    <div style={{ textAlign: "center", fontSize: 13.5, color: "var(--foreground-muted)" }}>
                      قبلاً ثبت‌نام کرده‌اید؟{" "}
                      <Link href="/auth" className="k2-link">
                        ورود به حساب
                      </Link>
                    </div>
                  </>
                )}
              </div>

              {/* Trust line */}
              <div className={`k2-trust ${mounted ? "k2-fade-2" : ""}`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M12 3l7.5 3v5.5c0 4.4-3.1 8.3-7.5 9.5-4.4-1.2-7.5-5.1-7.5-9.5V6L12 3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                  <path d="M9 12l2.2 2.2L15.5 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                اطلاعات شما رمزنگاری شده و محرمانه باقی می‌ماند
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer style={{ flexShrink: 0, borderTop: "1px solid var(--border-default)", padding: "22px clamp(16px, 4vw, 40px)", textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "var(--foreground-subtle)", fontFamily: "var(--font-mono)", margin: 0 }}>
              © Karex — تمامی حقوق محفوظ است
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
