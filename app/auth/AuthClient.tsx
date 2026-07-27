// مسیر فایل: app/auth/AuthClient.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PasswordLamp from "@/app/components/PasswordLamp";
import { passwordLampStyles } from "@/app/components/passwordLampStyles";
import ThemeToggle from "@/app/components/ThemeToggle";

export default function AuthClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // middleware مقصد اصلی را در ?next= می‌گذارد؛ فقط مسیرهای داخلی پذیرفته می‌شوند
  const rawNext = searchParams.get("next");
  const parsedNext =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : null;

  const [mounted, setMounted] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  /* در پشتی پنل مدیریت: سه ضربه‌ی پیاپی روی قفل (پنجره‌ی ۱٫۲ ثانیه).
     یک کلیک ساده نیست تا تصادفی باز نشود.

     نکته‌ی مهم: نمی‌توان مستقیم به /admin پرید، چون کاربرِ هنوز
     وارد‌نشده را middleware فوراً به /auth برمی‌گرداند و حلقه می‌شود.
     پس فقط مقصدِ بعد از ورود را روی /admin می‌گذاریم و کاربر همین‌جا
     وارد می‌شود. اگر از قبل نشست دارد، مستقیم می‌رویم.

     این فقط میان‌بر است، نه لایه‌ی امنیتی — کنترل واقعی در
     lib/admin-auth.ts سمت سرور انجام می‌شود. */
  const lockTaps = useRef(0);
  const lockTimer = useRef<number | null>(null);
  const [adminMode, setAdminMode] = useState(false);

  const handleLockTap = () => {
    lockTaps.current += 1;
    if (lockTimer.current) window.clearTimeout(lockTimer.current);

    if (lockTaps.current >= 3) {
      lockTaps.current = 0;
      setAdminMode(true);
      // اگر همین حالا نشست دارد، معطلش نکنیم
      fetch("/api/auth/me", { credentials: "same-origin" })
        .then((r) => r.json())
        .then((d) => {
          if (d?.user) router.push("/admin");
        })
        .catch(() => {});
      return;
    }
    lockTimer.current = window.setTimeout(() => {
      lockTaps.current = 0;
    }, 1200);
  };

  useEffect(() => {
    return () => {
      if (lockTimer.current) window.clearTimeout(lockTimer.current);
    };
  }, []);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  /* مقصد پس از ورود موفق. حالت ادمین بر ?next= اولویت دارد. */
  const nextUrl = adminMode ? "/admin" : parsedNext ?? "/quiz";

  useEffect(() => {
    setMounted(true);
    router.prefetch(nextUrl);
    router.prefetch("/register");
  }, [router, nextUrl]);

  const handleSpotlight = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "مشکلی پیش آمده است.");
      }

      if (isLogin) {
        router.push(nextUrl);
      } else {
        setIsLogin(true);
        setError("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "مشکلی پیش آمده است.");
    } finally {
      setLoading(false);
    }
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
        @keyframes k2Pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(0.72); }
        }
        @keyframes k2Spin { to { transform: rotate(360deg); } }
        @keyframes k2Shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-3px); }
          40%, 60% { transform: translateX(3px); }
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
        .k2-btn:disabled { cursor: wait; opacity: 0.7; }

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

        .k2-btn-ghost {
          background: transparent;
          color: var(--foreground-muted);
          border-radius: 8px;
        }
        .k2-btn-ghost:hover { background: var(--surface); color: var(--foreground); }

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
        /* دکمه‌ی قفل نباید شبیه دکمه به‌نظر برسد */
        .k2-icon-btn {
          padding: 0; cursor: pointer;
          font: inherit; -webkit-tap-highlight-color: transparent;
          transition: border-color .2s ease, box-shadow .2s ease;
        }
        .k2-icon-btn.armed {
          border-color: var(--accent);
          background: color-mix(in srgb, var(--accent) 14%, transparent);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }
        .k2-icon-btn:focus-visible {
          outline: none;
          border-color: var(--border-accent);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }

        /* ── فرم ── */
        .k2-field { display: flex; flex-direction: column; gap: 7px; }
        .k2-label {
          font-size: 12.5px;
          color: var(--foreground-muted);
          display: flex;
          align-items: center;
          justify-content: space-between;
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
        .k2-input-wrap svg.lead { margin: 0 12px; color: var(--foreground-subtle); flex-shrink: 0; transition: color 0.2s ease; }
        .k2-input-wrap.focused svg.lead { color: var(--accent); }
        .k2-input-wrap input {
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

        @media (max-width: 560px) {
          .k2-card-pad { padding: 30px 22px !important; }
        }

        @media (max-width: 380px) {
          .k2-card-pad { padding: 24px 15px !important; }
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
              padding: "clamp(32px, 7vw, 72px) clamp(16px, 4vw, 40px)",
            }}
          >
            <div style={{ width: "100%", maxWidth: 424 }}>
              <div
                className={`k2-card k2-card-pad ${mounted ? "k2-fade-1" : ""}`}
                onMouseMove={handleSpotlight}
                style={{ padding: "34px 32px", textAlign: "right" }}
              >
                {/* Icon + title */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
                  {/* در حالت ورود، قفل یک در پشتی به پنل مدیریت است.
                      عمداً هیچ نشانه‌ی بصری ندارد؛ امنیت واقعی در
                      lib/admin-auth.ts و middleware اعمال می‌شود، نه اینجا. */}
                  {isLogin ? (
                    <button
                      type="button"
                      className={`k2-icon-box k2-icon-btn ${adminMode ? "armed" : ""}`}
                      onClick={handleLockTap}
                      aria-label="ورود به حساب کاربری"
                      title=""
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <rect x="4" y="10" width="16" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
                        <path d="M8 10V7.5a4 4 0 1 1 8 0V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </button>
                  ) : (
                    <div className="k2-icon-box">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </div>
                  )}
                  <div
                    key={isLogin ? (adminMode ? "admin" : "login") : "signup"}
                    className="k2-swap"
                    style={{ minWidth: 0 }}
                  >
                    <h1
                      className="k2-gradient-text"
                      style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", margin: 0, lineHeight: 1.35 }}
                    >
                      {!isLogin
                        ? "ساخت حساب کاربری"
                        : adminMode
                          ? "ورود مدیران"
                          : "ورود به حساب کاربری"}
                    </h1>
                    <p style={{ fontSize: 13, color: "var(--foreground-muted)", margin: "4px 0 0", lineHeight: 1.7 }}>
                      {!isLogin
                        ? "چند ثانیه تا شروع مسیر شغلی‌تان فاصله دارید"
                        : adminMode
                          ? "پس از ورود به پنل مدیریت هدایت می‌شوید"
                          : "برای ادامه مسیر شغلی‌تان وارد شوید"}
                    </p>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="k2-alert" style={{ marginBottom: 16 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M12 7.5v5.5M12 16.2v.3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                  {!isLogin && (
                    <div className="k2-field">
                      <label className="k2-label" htmlFor="name">نام و نام خانوادگی</label>
                      <div className={`k2-input-wrap ${focused === "name" ? "focused" : ""}`}>
                        <svg className="lead" width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
                          <path d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                        </svg>
                        <input
                          id="name"
                          type="text"
                          required
                          autoComplete="name"
                          placeholder="نام کامل شما"
                          value={formData.name}
                          onFocus={() => setFocused("name")}
                          onBlur={() => setFocused(null)}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  <div className="k2-field">
                    <label className="k2-label" htmlFor="email">ایمیل</label>
                    <div className={`k2-input-wrap ${focused === "email" ? "focused" : ""}`}>
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
                        onBlur={() => setFocused(null)}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

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
                          autoComplete={isLogin ? "current-password" : "new-password"}
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
                      {!showPassword && (
                        <span style={{ fontSize: 11, color: "var(--foreground-subtle)", marginTop: 1 }}>
                          برای دیدن رمز، چراغ را روشن کنید
                        </span>
                      )}
                    </div>

                    <PasswordLamp on={showPassword} onToggle={() => setShowPassword((v) => !v)} />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="k2-btn k2-btn-primary"
                    style={{ width: "100%", height: 46, fontSize: 15, marginTop: 5 }}
                  >
                    {loading ? (
                      <>
                        <span className="k2-spinner" />
                        در حال پردازش...
                      </>
                    ) : isLogin ? (
                      "ورود"
                    ) : (
                      "ثبت‌نام"
                    )}
                  </button>
                </form>

                {/* Switch */}
                <div className="k2-divider">یا</div>

                <div style={{ textAlign: "center", fontSize: 13.5, color: "var(--foreground-muted)" }}>
                  {isLogin ? "هنوز حساب کاربری ندارید؟ " : "قبلاً ثبت‌نام کرده‌اید؟ "}
                  <button
                    type="button"
                    onClick={() => {
                      if (isLogin) {
                        router.push("/register");
                      } else {
                        setIsLogin(true);
                        setError("");
                      }
                    }}
                    className="k2-link"
                    style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 13.5, padding: 0 }}
                  >
                    {isLogin ? "ساخت حساب رایگان" : "ورود به حساب"}
                  </button>
                </div>
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
