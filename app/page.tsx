"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CareerHub() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    router.prefetch("/quiz");
  }, [router]);

  const handleStart = () => {
    setIsLoading(true);
    setTimeout(() => router.push("/quiz"), 400);
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }

        html, body {
          background: #07070b;
          color: #fff;
          overflow-x: hidden;
          font-family: 'Vazirmatn', system-ui, -apple-system, sans-serif;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -30px) scale(1.05); }
        }

        @keyframes floatReverse {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-25px, 20px) scale(1.08); }
        }

        @keyframes shimmer {
          0% { background-position: -200% 50%; }
          100% { background-position: 200% 50%; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 0 1px rgba(124, 138, 255, 0.15), 0 20px 60px -20px rgba(124, 138, 255, 0.3); }
          50% { box-shadow: 0 0 0 1px rgba(124, 138, 255, 0.3), 0 25px 70px -15px rgba(124, 138, 255, 0.45); }
        }
      `}</style>

      <main
        dir="rtl"
        style={{
          minHeight: "100vh",
          minHeight: "100dvh",
          width: "100%",
          position: "relative",
          background: "#07070b",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Background layers */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,138,255,0.18) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 100% 100%, rgba(167,139,250,0.12) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 0% 80%, rgba(96,165,250,0.08) 0%, transparent 50%)",
            pointerEvents: "none",
          }}
        />

        {/* Animated blobs */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "-15%",
            left: "10%",
            width: "min(60vw, 500px)",
            height: "min(60vw, 500px)",
            background: "radial-gradient(circle, rgba(124,138,255,0.25) 0%, transparent 70%)",
            filter: "blur(60px)",
            animation: "float 14s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: "-10%",
            right: "5%",
            width: "min(50vw, 400px)",
            height: "min(50vw, 400px)",
            background: "radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)",
            filter: "blur(60px)",
            animation: "floatReverse 18s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />

        {/* Grid overlay */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)",
            pointerEvents: "none",
          }}
        />

        {/* Top Nav */}
        <nav
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            padding: "20px clamp(16px, 4vw, 32px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.6s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #7c8aff, #a78bfa)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px -8px rgba(124,138,255,0.6)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>
              Karex
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 999,
              background: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.2)",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 8px #22c55e",
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            <span style={{ fontSize: 11, color: "#86efac", fontWeight: 600 }}>آنلاین</span>
          </div>
        </nav>

        {/* Main content */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            flex: 1,
            width: "100%",
            maxWidth: 1100,
            margin: "0 auto",
            padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 32px) 40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          {/* Top badge */}
          <div
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
              transitionDelay: "0.1s",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              marginBottom: 28,
            }}
          >
            <span style={{ fontSize: 14 }}>✨</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
              مبتنی بر هوش مصنوعی
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
              transitionDelay: "0.2s",
              fontSize: "clamp(34px, 7vw, 64px)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "#fff",
              marginBottom: 20,
              maxWidth: 800,
            }}
          >
            مسیر شغلی‌ات را{" "}
            <span
              style={{
                background: "linear-gradient(120deg, #7c8aff 0%, #a78bfa 50%, #7c8aff 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "shimmer 5s linear infinite",
                display: "inline-block",
              }}
            >
              هوشمندانه
            </span>
            <br />
            کشف کن
          </h1>

          {/* Subtitle */}
          <p
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
              transitionDelay: "0.3s",
              fontSize: "clamp(15px, 2.2vw, 18px)",
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.7,
              maxWidth: 560,
              marginBottom: 36,
              padding: "0 8px",
            }}
          >
            با چند سؤال ساده، علایق، مهارت‌ها و شخصیتت رو تحلیل می‌کنیم
            تا بهترین مسیر شغلی رو پیشنهاد بدیم.
          </p>

          {/* CTA Buttons */}
          <div
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
              transitionDelay: "0.4s",
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              justifyContent: "center",
              marginBottom: 48,
              width: "100%",
              maxWidth: 480,
            }}
          >
            <button
              onClick={handleStart}
              disabled={isLoading}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 20px 50px -12px rgba(124,138,255,0.7)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 30px -8px rgba(124,138,255,0.5)";
              }}
              style={{
                flex: "1 1 200px",
                minWidth: 0,
                padding: "16px 28px",
                fontSize: 15,
                fontWeight: 700,
                color: "#fff",
                background: "linear-gradient(135deg, #7c8aff 0%, #a78bfa 100%)",
                border: "none",
                borderRadius: 14,
                cursor: isLoading ? "wait" : "pointer",
                boxShadow: "0 10px 30px -8px rgba(124,138,255,0.5)",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                fontFamily: "inherit",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: isLoading ? 0.85 : 1,
              }}
            >
              {isLoading ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.8s linear infinite" }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                  </svg>
                  در حال آماده‌سازی...
                </>
              ) : (
                <>
                  شروع تحلیل
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5" />
                    <path d="M12 19l-7-7 7-7" />
                  </svg>
                </>
              )}
            </button>

            <button
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              }}
              style={{
                flex: "1 1 160px",
                minWidth: 0,
                padding: "16px 24px",
                fontSize: 15,
                fontWeight: 600,
                color: "rgba(255,255,255,0.9)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 14,
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontFamily: "inherit",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
            >
              بیشتر بدانید
            </button>
          </div>

          {/* Trust indicators */}
          <div
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
              transitionDelay: "0.5s",
              display: "flex",
              alignItems: "center",
              gap: "clamp(16px, 4vw, 32px)",
              flexWrap: "wrap",
              justifyContent: "center",
              marginBottom: 56,
              color: "rgba(255,255,255,0.5)",
              fontSize: 13,
            }}
          >
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              کاملاً رایگان
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              بدون نیاز به ثبت‌نام
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              فقط ۵ دقیقه
            </div>
          </div>

          {/* Stats Cards */}
          <div
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
              transitionDelay: "0.6s",
              width: "100%",
              maxWidth: 900,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "clamp(12px, 2vw, 20px)",
              marginBottom: 56,
            }}
          >
            {[
              { value: "+۲٬۴۰۰", label: "مسیر شغلی", icon: "🎯" },
              { value: "٪۹۴", label: "دقت تحلیل", icon: "📊" },
              { value: "۵۰K+", label: "کاربر فعال", icon: "👥" },
              { value: "۴.۹", label: "امتیاز کاربران", icon: "⭐" },
            ].map((stat, i) => (
              <div
                key={i}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.borderColor = "rgba(124,138,255,0.3)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                }}
                style={{
                  padding: "20px 16px",
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  cursor: "default",
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 8 }}>{stat.icon}</div>
                <div
                  style={{
                    fontSize: "clamp(20px, 3vw, 26px)",
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: "-0.02em",
                    marginBottom: 4,
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
              transitionDelay: "0.7s",
              width: "100%",
              maxWidth: 900,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
              marginBottom: 56,
            }}
          >
            {[
              {
                title: "تحلیل شخصیت",
                desc: "بر اساس مدل‌های روانشناسی شناخته‌شده، شخصیت شغلی‌ات رو تحلیل می‌کنیم.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                ),
                gradient: "linear-gradient(135deg, #7c8aff, #6366f1)",
              },
              {
                title: "پیشنهاد هوشمند",
                desc: "از بین هزاران مسیر شغلی، بهترین‌ها رو برای تو انتخاب می‌کنیم.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                ),
                gradient: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
              },
              {
                title: "نقشه راه",
                desc: "گام‌به‌گام مسیر یادگیری و رشد برای هر شغل پیشنهادی رو دریافت کن.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                ),
                gradient: "linear-gradient(135deg, #60a5fa, #3b82f6)",
              },
            ].map((feat, i) => (
              <div
                key={i}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.borderColor = "rgba(124,138,255,0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                }}
                style={{
                  padding: 24,
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  textAlign: "right",
                  cursor: "default",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: feat.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    marginBottom: 16,
                    boxShadow: "0 8px 20px -6px rgba(124,138,255,0.5)",
                  }}
                >
                  {feat.icon}
                </div>
                <h3
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: 8,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {feat.title}
                </h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
              transitionDelay: "0.8s",
              width: "100%",
              maxWidth: 900,
              marginBottom: 40,
            }}
          >
            <h2
              style={{
                fontSize: "clamp(20px, 3vw, 26px)",
                fontWeight: 700,
                color: "#fff",
                marginBottom: 28,
                letterSpacing: "-0.02em",
              }}
            >
              فقط در <span style={{ color: "#a78bfa" }}>۳ قدم</span> ساده
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 16,
                position: "relative",
              }}
            >
              {[
                { num: "۱", title: "پاسخ به سؤالات", desc: "به سؤالات کوتاه و هوشمند پاسخ بده" },
                { num: "۲", title: "تحلیل هوشمند", desc: "هوش مصنوعی پاسخ‌هات رو تحلیل می‌کنه" },
                { num: "۳", title: "دریافت نتیجه", desc: "بهترین مسیرهای شغلی رو ببین" },
              ].map((step, i) => (
                <div
                  key={i}
                  style={{
                    padding: "24px 20px",
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: i === 0
                        ? "linear-gradient(135deg, #7c8aff, #a78bfa)"
                        : "rgba(124,138,255,0.1)",
                      border: i === 0 ? "none" : "1px solid rgba(124,138,255,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      fontWeight: 800,
                      color: i === 0 ? "#fff" : "#a78bfa",
                      marginBottom: 14,
                      boxShadow: i === 0 ? "0 8px 20px -6px rgba(124,138,255,0.6)" : "none",
                    }}
                  >
                    {step.num}
                  </div>
                  <h4
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#fff",
                      marginBottom: 6,
                    }}
                  >
                    {step.title}
                  </h4>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            padding: "24px clamp(16px, 4vw, 32px)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            textAlign: "center",
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.8s ease",
            transitionDelay: "1s",
          }}
        >
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
            ساخته شده با ❤️ توسط <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Karex</span>
          </p>
        </footer>
      </main>
    </>
  );
}
