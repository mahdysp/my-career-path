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

  const features = [
    {
      title: "تحلیل شخصیت شغلی",
      desc: "پاسخ‌هات رو بر اساس مدل‌های شناخته‌شده‌ی روان‌شناسی شغلی می‌سنجیم، نه یک تست حدسی.",
    },
    {
      title: "پیشنهاد مسیر متناسب",
      desc: "از بین مسیرهای شغلی موجود، فقط اون‌هایی که با مهارت و علاقه‌ت هم‌خونی دارن رو نشون می‌دیم.",
    },
    {
      title: "نقشه راه یادگیری",
      desc: "برای هر مسیر پیشنهادی، گام‌به‌گام مشخص می‌کنیم چی یاد بگیری و از کجا شروع کنی.",
    },
  ];

  const steps = [
    {
      num: "۰۱",
      title: "پاسخ به سؤالات کوتاه",
      desc: "چند سؤال ساده درباره‌ی علایق، مهارت‌ها و اهدافت.",
    },
    {
      num: "۰۲",
      title: "تحلیل پاسخ‌ها",
      desc: "سیستم پاسخ‌هات رو در چند ثانیه تحلیل می‌کنه.",
    },
    {
      num: "۰۳",
      title: "دریافت نقشه راه",
      desc: "مسیرهای شغلی پیشنهادی به‌همراه برنامه یادگیری رو می‌بینی.",
    },
  ];

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&display=swap');

        html, body {
          background: var(--color-bg);
        }

        .k-nav-link {
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-secondary);
          text-decoration: none;
          padding: 8px 12px;
          border-radius: 6px;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .k-nav-link:hover {
          background: rgba(10, 10, 10, 0.04);
          color: var(--color-text-primary);
        }

        .k-btn {
          font-family: var(--font-body);
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
          transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease, border-color 0.12s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .k-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .k-btn:disabled { cursor: wait; opacity: 0.7; }

        .k-btn-primary {
          background: var(--color-primary);
          color: #fff;
          border: 1px solid var(--color-primary);
        }
        .k-btn-primary:hover:not(:disabled) {
          background: var(--color-primary-hover);
          border-color: var(--color-primary-hover);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
        }

        .k-btn-secondary {
          background: transparent;
          color: var(--color-text-primary);
          border: 1px solid var(--color-border);
        }
        .k-btn-secondary:hover:not(:disabled) {
          border-color: var(--color-text-secondary);
        }

        .k-btn-ghost {
          background: transparent;
          color: var(--color-text-secondary);
          border: none;
        }
        .k-btn-ghost:hover {
          color: var(--color-text-primary);
        }

        .k-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
        }
        .k-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
          border-color: #d8d8de;
        }

        .k-step-row {
          border-bottom: 1px solid var(--color-border);
          transition: background 0.15s ease;
        }
        .k-step-row:last-child { border-bottom: none; }
        .k-step-row:hover { background: rgba(10, 10, 10, 0.02); }

        @keyframes kFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .k-fade-1 { animation: kFadeUp 0.5s ease both; animation-delay: 0.05s; }
        .k-fade-2 { animation: kFadeUp 0.5s ease both; animation-delay: 0.12s; }
        .k-fade-3 { animation: kFadeUp 0.5s ease both; animation-delay: 0.19s; }
        .k-fade-4 { animation: kFadeUp 0.5s ease both; animation-delay: 0.26s; }

        @media (max-width: 768px) {
          .k-nav-links { display: none !important; }
          .k-hero-title { font-size: 40px !important; }
          .k-stats-row { flex-wrap: wrap !important; gap: 24px !important; }
          .k-stat-divider { display: none !important; }
          .k-features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <main
        dir="rtl"
        style={{
          minHeight: "100vh",
          width: "100%",
          background: "var(--color-bg)",
          fontFamily: "var(--font-body)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Nav */}
        <nav
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 clamp(16px, 4vw, 40px)",
            background: "rgba(250, 250, 250, 0.8)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: "-0.03em",
              color: "var(--color-text-primary)",
            }}
          >
            Karex
          </span>

          <div className="k-nav-links" style={{ display: "flex", gap: 4 }}>
            <a href="#features" className="k-nav-link">ویژگی‌ها</a>
            <a href="#how-it-works" className="k-nav-link">روش کار</a>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              className="k-btn k-btn-ghost"
              onClick={() => router.push("/auth")}
              style={{ fontSize: 14, padding: "8px 14px" }}
            >
              ورود
            </button>
            <button
              className="k-btn k-btn-primary"
              onClick={() => router.push("/register")}
              style={{ fontSize: 14, padding: "8px 16px", height: 36 }}
            >
              ثبت‌نام
            </button>
          </div>
        </nav>

        {/* Hero */}
        <section
          style={{
            maxWidth: 1280,
            width: "100%",
            margin: "0 auto",
            padding: "clamp(56px, 10vw, 112px) clamp(16px, 4vw, 40px) 0",
            textAlign: "center",
          }}
        >
          <div
            className={mounted ? "k-fade-1" : ""}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              border: "1px solid var(--color-border)",
              borderRadius: 9999,
              padding: "5px 14px",
              marginBottom: 24,
              fontFamily: "var(--font-body)",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--color-text-secondary)",
            }}
          >
            سامانه هدایت شغلی
          </div>

          <h1
            className={`k-hero-title ${mounted ? "k-fade-2" : ""}`}
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(40px, 6vw, 72px)",
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              color: "var(--color-text-primary)",
              margin: "0 auto 20px",
              maxWidth: 780,
            }}
          >
            مسیر شغلی خودت را با دقت پیدا کن
          </h1>

          <p
            className={mounted ? "k-fade-2" : ""}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 17,
              lineHeight: 1.8,
              color: "var(--color-text-secondary)",
              maxWidth: 520,
              margin: "0 auto 36px",
            }}
          >
            چند سؤال کوتاه جواب می‌دی، ما علایق و مهارت‌هات رو تحلیل می‌کنیم و
            مسیرهای شغلی متناسب با تو رو با یک نقشه راه یادگیری نشونت می‌دیم.
          </p>

          <div
            className={mounted ? "k-fade-3" : ""}
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: 20,
            }}
          >
            <button
              className="k-btn k-btn-primary"
              onClick={handleStart}
              disabled={isLoading}
              style={{ fontSize: 15, padding: "0 28px", height: 44 }}
            >
              {isLoading ? "در حال آماده‌سازی..." : "شروع آزمون"}
            </button>
            <a
              href="#how-it-works"
              className="k-btn k-btn-secondary"
              style={{ fontSize: 15, padding: "0 24px", height: 44, textDecoration: "none" }}
            >
              بیشتر بدانید
            </a>
          </div>

          <p
            className={mounted ? "k-fade-3" : ""}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "var(--color-neutral)",
              marginBottom: 64,
            }}
          >
            رایگان و بدون نیاز به کارت بانکی &nbsp;·&nbsp; کمتر از ۵ دقیقه
          </p>

          {/* Stats */}
          <div
            className={`k-stats-row ${mounted ? "k-fade-4" : ""}`}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 48,
              paddingBottom: 64,
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            {[
              { num: "+۲٬۴۰۰", lbl: "مسیر شغلی" },
              { num: "۹۴٪", lbl: "دقت تحلیل" },
              { num: "۴٫۹", lbl: "امتیاز کاربران" },
            ].map((s, i) => (
              <div key={s.lbl} style={{ display: "flex", alignItems: "center", gap: 48 }}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: 32,
                      letterSpacing: "-0.02em",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {s.num}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 12,
                      color: "var(--color-text-secondary)",
                      marginTop: 4,
                    }}
                  >
                    {s.lbl}
                  </div>
                </div>
                {i < 2 && (
                  <div
                    className="k-stat-divider"
                    style={{ width: 1, height: 36, background: "var(--color-border)" }}
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          style={{
            maxWidth: 1280,
            width: "100%",
            margin: "0 auto",
            padding: "80px clamp(16px, 4vw, 40px)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 32,
              letterSpacing: "-0.03em",
              color: "var(--color-text-primary)",
              textAlign: "right",
              marginBottom: 40,
            }}
          >
            چه چیزی می‌گیری؟
          </h2>

          <div
            className="k-features-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 24,
            }}
          >
            {features.map((f) => (
              <div
                key={f.title}
                className="k-card"
                style={{ padding: 28, textAlign: "right" }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: 17,
                    color: "var(--color-text-primary)",
                    marginBottom: 10,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    lineHeight: 1.8,
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          style={{
            maxWidth: 900,
            width: "100%",
            margin: "0 auto",
            padding: "0 clamp(16px, 4vw, 40px) 96px",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 32,
              letterSpacing: "-0.03em",
              color: "var(--color-text-primary)",
              textAlign: "right",
              marginBottom: 24,
            }}
          >
            روش کار
          </h2>

          <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, overflow: "hidden" }}>
            {steps.map((s) => (
              <div
                key={s.num}
                className="k-step-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  padding: "20px 24px",
                  textAlign: "right",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    color: "var(--color-neutral)",
                    minWidth: 28,
                  }}
                >
                  {s.num}
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      fontSize: 15,
                      color: "var(--color-text-primary)",
                      marginBottom: 4,
                    }}
                  >
                    {s.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 13,
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {s.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 40 }}>
            <button
              className="k-btn k-btn-primary"
              onClick={handleStart}
              disabled={isLoading}
              style={{ fontSize: 15, padding: "0 28px", height: 44 }}
            >
              {isLoading ? "در حال آماده‌سازی..." : "شروع آزمون"}
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            borderTop: "1px solid var(--color-border)",
            padding: "24px clamp(16px, 4vw, 40px)",
            textAlign: "center",
          }}
        >
          <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-neutral)" }}>
            © Karex — همه حقوق محفوظ است
          </p>
        </footer>
      </main>
    </>
  );
}
