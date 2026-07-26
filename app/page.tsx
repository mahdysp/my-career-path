"use client"; 

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/app/components/ThemeToggle";

export default function CareerHub() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    router.prefetch("/quiz");

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [router]);

  const handleStart = () => {
    setIsLoading(true);
    setTimeout(() => router.push("/quiz"), 400);
  };

  const handleSpotlight = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }, []);

  const heroOpacity = Math.max(1 - scrollY / 480, 0);
  const heroScale = Math.max(1 - scrollY / 4000, 0.94);
  const heroTranslate = Math.min(scrollY * 0.18, 90);

  const steps = [
    { num: "01", title: "پاسخ به سؤالات کوتاه", desc: "چند سؤال ساده درباره‌ی علایق، مهارت‌ها و اهدافتان." },
    { num: "02", title: "تحلیل پاسخ‌ها", desc: "سیستم پاسخ‌های شما را در چند ثانیه تحلیل می‌کند." },
    { num: "03", title: "دریافت نقشه راه", desc: "مسیرهای شغلی پیشنهادی به‌همراه برنامه یادگیری را می‌بینید." },
  ];

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

        .k2-fade-1 { animation: k2FadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.05s; }
        .k2-fade-2 { animation: k2FadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.14s; }
        .k2-fade-3 { animation: k2FadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.23s; }
        .k2-fade-4 { animation: k2FadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.32s; }

        .k2-nav-link {
          font-family: var(--font-sans);
          font-size: 14px;
          color: var(--foreground-muted);
          text-decoration: none;
          padding: 8px 14px;
          border-radius: 8px;
          transition: color 0.2s ease, background 0.2s ease;
        }
        .k2-nav-link:hover { color: var(--foreground); background: var(--surface); }

        .k2-btn {
          font-family: var(--font-sans);
          font-weight: 500;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s ease, background 0.2s ease;
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

        .k2-btn-secondary {
          background: var(--surface);
          color: var(--foreground);
          border-radius: 8px;
          box-shadow: inset 0 0 0 1px var(--border-default);
        }
        .k2-btn-secondary:hover { background: var(--surface-hover); box-shadow: inset 0 0 0 1px var(--border-hover); }

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
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.03),
            0 2px 20px rgba(0,0,0,0.4),
            0 0 40px rgba(0,0,0,0.15);
          transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .k2-card:hover {
          transform: translateY(-6px);
          border-color: var(--border-hover);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.08),
            0 12px 40px rgba(0,0,0,0.5),
            0 0 60px var(--blob-3);
        }
        .k2-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(300px circle at var(--mx, 50%) var(--my, 50%), rgba(94,106,210,0.16), transparent 60%);
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

        .k2-step-row {
          position: relative;
          border-bottom: 1px solid var(--border-default);
          transition: background 0.2s ease;
        }
        .k2-step-row:last-child { border-bottom: none; }
        .k2-step-row:hover { background: rgba(255,255,255,0.02); }

        .k2-mobile-menu {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height 0.3s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease;
        }
        .k2-mobile-menu.open { max-height: 320px; opacity: 1; }

        .k2-bento {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 20px;
        }

        @media (max-width: 860px) {
          .k2-nav-links { display: none !important; }
          .k2-hero-title { font-size: 42px !important; }
          .k2-hero-sub { font-size: 15px !important; }
          .k2-stats-row { gap: 28px !important; flex-wrap: wrap; }
          .k2-hamburger { display: flex !important; }
          .k2-desktop-actions { display: none !important; }
          .k2-bento {
            grid-template-columns: 1fr !important;
          }
          .k2-bento > * {
            grid-column: 1 !important;
            grid-row: auto !important;
          }
        }
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
        }}
      >
        {/* Ambient blobs */}
        <div
          style={{
            position: "absolute", top: "-200px", left: "50%", transform: "translateX(-50%)",
            width: 1100, height: 700, borderRadius: "50%",
            background: "radial-gradient(circle, var(--blob-1), transparent 70%)",
            filter: "blur(140px)", pointerEvents: "none", animation: "k2Float1 9s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute", top: "20%", left: "-200px",
            width: 600, height: 800, borderRadius: "50%",
            background: "radial-gradient(circle, var(--blob-2), transparent 70%)",
            filter: "blur(120px)", pointerEvents: "none", animation: "k2Float2 10s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute", top: "35%", right: "-160px",
            width: 500, height: 700, borderRadius: "50%",
            background: "radial-gradient(circle, var(--blob-3), transparent 70%)",
            filter: "blur(100px)", pointerEvents: "none", animation: "k2Float3 8s ease-in-out infinite",
          }}
        />
        <div className="k2-grid-overlay" />
        <div className="k2-noise" />

        <div style={{ position: "relative", zIndex: 10 }}>
          {/* Nav */}
          <nav
            style={{
              position: "sticky", top: 0, zIndex: 50,
              height: 64, display: "flex", flexDirection: "column",
              justifyContent: "center",
              padding: "0 clamp(16px, 4vw, 40px)",
              background: "var(--nav-bg)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderBottom: "1px solid var(--border-default)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
              <span style={{ fontWeight: 700, fontSize: 19, letterSpacing: "-0.02em", color: "var(--foreground)" }}>
                Karex
              </span>

              <div className="k2-nav-links" style={{ display: "flex", gap: 4 }}>
                <a href="#features" className="k2-nav-link">ویژگی‌ها</a>
                <a href="#how-it-works" className="k2-nav-link">روش کار</a>
              </div>

              <div className="k2-desktop-actions" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <ThemeToggle />
                <button className="k2-btn k2-btn-ghost" onClick={() => router.push("/auth")} style={{ fontSize: 14, padding: "9px 16px" }}>
                  ورود
                </button>
                <button className="k2-btn k2-btn-primary" onClick={() => router.push("/register")} style={{ fontSize: 14, padding: "9px 18px", height: 38 }}>
                  ثبت‌نام
                </button>
              </div>

              <span className="k2-hamburger" style={{ display: "none", gap: 8, alignItems: "center" }}>
                <ThemeToggle />
              </span>

              <button
                className="k2-hamburger"
                onClick={() => setMenuOpen((v) => !v)}
                style={{
                  display: "none", width: 36, height: 36, alignItems: "center", justifyContent: "center",
                  background: "var(--surface)", border: "1px solid var(--border-default)", borderRadius: 8, color: "var(--foreground)",
                }}
              >
                {menuOpen ? "✕" : "☰"}
              </button>
            </div>

            <div className={`k2-mobile-menu ${menuOpen ? "open" : ""}`}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "12px 0 20px" }}>
                <a href="#features" className="k2-nav-link" onClick={() => setMenuOpen(false)}>ویژگی‌ها</a>
                <a href="#how-it-works" className="k2-nav-link" onClick={() => setMenuOpen(false)}>روش کار</a>
                <button className="k2-btn k2-btn-secondary" onClick={() => router.push("/auth")} style={{ fontSize: 14, padding: "10px", marginTop: 8 }}>ورود</button>
                <button className="k2-btn k2-btn-primary" onClick={() => router.push("/register")} style={{ fontSize: 14, padding: "10px" }}>ثبت‌نام رایگان</button>
              </div>
            </div>
          </nav>

          {/* Hero */}
          <section
            style={{
              maxWidth: 1280, width: "100%", margin: "0 auto",
              padding: "clamp(64px, 11vw, 128px) clamp(16px, 4vw, 40px) 0",
              textAlign: "center",
              opacity: mounted ? heroOpacity : 1,
              transform: mounted ? `translateY(${heroTranslate}px) scale(${heroScale})` : "none",
              transition: "opacity 0.1s linear",
            }}
          >
            <h1
              className={`k2-hero-title k2-gradient-text ${mounted ? "k2-fade-1" : ""}`}
              style={{
                fontWeight: 700,
                fontSize: "clamp(42px, 6.5vw, 76px)",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                margin: "0 auto 20px",
                maxWidth: 820,
              }}
            >
              بدون سردرگمی، نقشه راه آینده شغلی‌تان را بسازید
            </h1>

            <p
              className={`k2-hero-sub ${mounted ? "k2-fade-2" : ""}`}
              style={{
                fontSize: 17, lineHeight: 1.8, color: "var(--foreground-muted)",
                maxWidth: 540, margin: "0 auto 40px",
              }}
            >
              ارزیابی هوشمند علایق و توانمندی‌ها برای ترسیم دقیق‌ترین مسیر شغلی
              از کشف استعداد تا آغاز یادگیری
            </p>

            <div className={mounted ? "k2-fade-3" : ""} style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 72 }}>
              <button className="k2-btn k2-btn-primary" onClick={handleStart} disabled={isLoading} style={{ fontSize: 15, padding: "0 30px", height: 46 }}>
                {isLoading ? "در حال آماده‌سازی..." : "شروع آزمون"}
              </button>
              <a href="#how-it-works" className="k2-btn k2-btn-secondary" style={{ fontSize: 15, padding: "0 26px", height: 46, textDecoration: "none" }}>
                بیشتر بدانید
              </a>
            </div>

            
          </section>

          {/* Features — Bento */}
          <section id="features" style={{ maxWidth: 1280, width: "100%", margin: "0 auto", padding: "112px clamp(16px, 4vw, 40px)" }}>
            <div style={{ textAlign: "right", marginBottom: 40 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.1em", color: "var(--accent)" }}>
                ویژگی‌ها
              </span>
              <h2 style={{ fontWeight: 700, fontSize: 34, letterSpacing: "-0.02em", color: "var(--foreground)", marginTop: 8 }}>
                چرا کارکس؟
              </h2>
            </div>

            <div className="k2-bento">
              {/* کارت بزرگ */}
              <div
                className="k2-card"
                onMouseMove={handleSpotlight}
                style={{ gridColumn: "1", gridRow: "1 / span 2", padding: 32, textAlign: "right", display: "flex", flexDirection: "column", gap: 16, justifyContent: "center" }}
              >
                <div className="k2-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M4 19V5m5 14V9m5 10V13m5 6V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 20, color: "var(--foreground)", marginBottom: 12, letterSpacing: "-0.01em" }}>
                    تحلیل شخصیت شغلی مبتنی بر داده
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.9, color: "var(--foreground-muted)", maxWidth: 440 }}>
                    پاسخ‌های شما بر اساس مدل‌های شناخته‌شده‌ی روان‌شناسی شغلی سنجیده می‌شود، نه یک تست حدسی.
                    کارکس الگوهای پنهان علاقه و مهارت شما را شناسایی می‌کند.
                  </p>
                </div>
              </div>

              {/* کارت کوچک ۱ */}
              <div
                className="k2-card"
                onMouseMove={handleSpotlight}
                style={{ gridColumn: "2", gridRow: "1", padding: 28, textAlign: "right", display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div className="k2-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3l2.6 6.2L21 10l-5 4.6L17.4 21 12 17.3 6.6 21 8 14.6 3 10l6.4-.8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 16, color: "var(--foreground)", marginBottom: 8 }}>
                    پیشنهاد مسیر متناسب
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--foreground-muted)" }}>
                    فقط مسیرهایی که با مهارت و علاقه شما هم‌خوانی دارند نشان داده می‌شود.
                  </p>
                </div>
              </div>

              {/* کارت کوچک ۲ */}
              <div
                className="k2-card"
                onMouseMove={handleSpotlight}
                style={{ gridColumn: "2", gridRow: "2", padding: 28, textAlign: "right", display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div className="k2-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M4 6h16M4 12h10M4 18h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 16, color: "var(--foreground)", marginBottom: 8 }}>
                    نقشه راه یادگیری
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--foreground-muted)" }}>
                    گام‌به‌گام مشخص می‌کنیم چه چیزی یاد بگیرید و از کجا شروع کنید.
                  </p>
                </div>
              </div>

              {/* کارت عریض */}
              <div
                className="k2-card"
                onMouseMove={handleSpotlight}
                style={{ gridColumn: "1 / -1", gridRow: "3", padding: 28, textAlign: "right", display: "flex", alignItems: "center", gap: 20 }}
              >
                <div className="k2-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 8v4l3 2M12 3a9 9 0 1 0 9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 16, color: "var(--foreground)", marginBottom: 6 }}>
                    پشتیبانی هوش مصنوعی، هر زمان که نیاز دارید
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--foreground-muted)" }}>
                    سؤال دارید؟ در هر مرحله از مسیر، دستیار هوشمند کارکس همراه شماست و راهنمایی می‌کند.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* How it works */}
          <section id="how-it-works" style={{ maxWidth: 860, width: "100%", margin: "0 auto", padding: "0 clamp(16px, 4vw, 40px) 128px" }}>
            <div style={{ textAlign: "right", marginBottom: 28 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.1em", color: "var(--accent)" }}>
                روش کار
              </span>
              <h2 style={{ fontWeight: 700, fontSize: 34, letterSpacing: "-0.02em", color: "var(--foreground)", marginTop: 8 }}>
                سه گام تا مسیر روشن
              </h2>
            </div>

            <div className="k2-card" style={{ overflow: "hidden" }}>
              {steps.map((s) => (
                <div key={s.num} className="k2-step-row" style={{ display: "flex", alignItems: "center", gap: 22, padding: "22px 26px", textAlign: "right" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--foreground-subtle)", minWidth: 28 }}>
                    {s.num}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--foreground)", marginBottom: 4 }}>{s.title}</div>
                    <div style={{ fontSize: 13, color: "var(--foreground-muted)" }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 44 }}>
              <button className="k2-btn k2-btn-primary" onClick={handleStart} disabled={isLoading} style={{ fontSize: 15, padding: "0 30px", height: 46 }}>
                {isLoading ? "در حال آماده‌سازی..." : "شروع آزمون"}
              </button>
            </div>
          </section>

          {/* Footer */}
          <footer style={{ borderTop: "1px solid var(--border-default)", padding: "28px clamp(16px, 4vw, 40px)", textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "var(--foreground-subtle)", fontFamily: "var(--font-mono)" }}>
              © Karex — تمامی حقوق محفوظ است
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
