// مسیر فایل: app/quiz/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SiteNav from "@/app/components/SiteNav";
import {
  ONET_PROFILES,
  RIASEC_AXES,
  hollandCode,
  matchProfile,
  scoreVector,
} from "@/lib/onet-profiles";

export default function QuizLanding() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputFocused, setInputFocused] = useState(false);

  // وضعیت کاربر لاگین‌شده
  const [user, setUser] = useState<{ id: string; email: string; firstName: string; lastName: string } | null>(null);

  // مودال اخطار ورود
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingTarget, setPendingTarget] = useState("/assessment");
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    setMounted(true);
    router.prefetch("/assessment");

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, [router]);

  useEffect(() => {
    if (!showAuthModal) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShowAuthModal(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showAuthModal]);


  const handleSearch = () => {
    const q = searchQuery.trim();

    // بدون حوزه، آزمون معنا ندارد
    if (!q) {
      setSearchError("لطفاً حوزه‌ی تخصصی خود را وارد یا انتخاب کنید.");
      return;
    }
    setSearchError("");

    const target = `/assessment?q=${encodeURIComponent(q)}`;

    // مهمان: مودال را نشان بده و مقصد را نگه دار تا بعد از ورود برگردد
    if (!user) {
      setPendingTarget(target);
      setShowAuthModal(true);
      return;
    }

    router.push(target);
  };

  const handleSpotlight = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }, []);

  const tags = ["برنامه‌نویسی", "طراحی UI/UX", "بازاریابی", "داده‌کاوی", "مدیریت محصول"];

  /* ───────── پیش‌نمای زنده پروفایل علاقه شغلی (داده واقعی O*NET) ───────── */

  // اگر کاربر چیزی تایپ نکرده، بین مشاغل می‌چرخد؛ به‌محض تایپ روی همان شغل قفل می‌شود.
  const [cycleIndex, setCycleIndex] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);

  const matched = useMemo(() => matchProfile(searchQuery), [searchQuery]);
  const isCustom = !!searchQuery.trim() && !matched;

  useEffect(() => {
    if (matched) return;
    const id = setInterval(() => setCycleIndex((i) => (i + 1) % ONET_PROFILES.length), 3600);
    return () => clearInterval(id);
  }, [matched]);

  const active = matched ?? ONET_PROFILES[cycleIndex];
  const target = useMemo(() => scoreVector(active), [active]);
  const code = useMemo(() => hollandCode(active), [active]);

  // مورف نرم بین پروفایل‌ها
  const [shape, setShape] = useState<number[]>(target);
  const shapeRef = useRef<number[]>(target);
  const rafRef = useRef(0);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    const step = () => {
      const cur = shapeRef.current;
      const next = cur.map((v, i) => v + (target[i] - v) * 0.11);
      const done = next.every((v, i) => Math.abs(target[i] - v) < 0.25);
      shapeRef.current = done ? target : next;
      setShape(shapeRef.current);
      if (!done) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);

  // هندسه نمودار رادار
  const R = 84;
  const CX = 150;
  const CY = 138;
  const N = RIASEC_AXES.length;
  const axisPoint = useCallback(
    (i: number, r: number) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / N;
      return [CX + Math.cos(angle) * r, CY + Math.sin(angle) * r] as const;
    },
    [N]
  );
  const polygon = useCallback(
    (values: number[]) => values.map((v, i) => axisPoint(i, (R * v) / 100).join(",")).join(" "),
    [axisPoint]
  );

  const fmtWage = (n: number) => `$${Math.round(n / 1000)}K`;
  const fmtCount = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${Math.round(n / 1000)}K`;

  const stats = [
    { num: "۲۴۰۰+", lbl: "مسیر شغلی" },
    { num: "٪۹۴", lbl: "دقت نتایج" },
    { num: "۵ دقیقه", lbl: "زمان ارزیابی" },
  ];

  const points = [
    { title: "انتخاب حوزه", desc: "تخصص یا علاقه‌ی مورد نظرتان را وارد کنید." },
    { title: "ارزیابی مهارت", desc: "سؤال‌های متناسب با همان حوزه پرسیده می‌شود." },
    { title: "گزارش شایستگی", desc: "نقاط قوت و شکاف‌های مهارتی‌تان مشخص می‌شود." },
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
        @keyframes k2ModalIn {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes k2Overlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes k2Pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(0.72); }
        }
        @keyframes k2Swap {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .k2-fade-1 { animation: k2FadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.05s; }
        .k2-fade-2 { animation: k2FadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.14s; }
        .k2-fade-3 { animation: k2FadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.23s; }
        .k2-fade-4 { animation: k2FadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.32s; }
        .k2-fade-5 { animation: k2FadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.4s; }

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
            0 0 0 1px var(--border-default),
            0 2px 20px rgba(0,0,0,0.4),
            0 0 40px rgba(0,0,0,0.15);
          transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease, border-color 0.25s ease;
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
        @media (hover: hover) and (pointer: fine) {
    .k2-card:hover::before { opacity: 1; }
  }

        @media (hover: hover) and (pointer: fine) {
          .k2-card-lift:hover {
            transform: translateY(-6px);
            border-color: var(--border-hover);
            box-shadow:
              0 0 0 1px var(--border-hover),
              0 12px 40px rgba(0,0,0,0.5),
              0 0 60px var(--blob-3);
          }
        }

        .k2-icon-box {
          width: 44px; height: 44px;
          border-radius: 12px;
          border: 1px solid var(--border-hover);
          background: var(--surface);
          display: flex; align-items: center; justify-content: center;
          color: var(--accent);
          flex-shrink: 0;
        }

        .k2-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.08em;
          color: var(--foreground-subtle);
          background: var(--surface);
          border: 1px solid var(--border-default);
          border-radius: 100px;
          padding: 6px 14px;
        }
        .k2-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 8px var(--accent-glow);
        }

        .k2-search {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px;
          border-radius: 12px;
          background: var(--input-bg);
          border: 1px solid var(--border-default);
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .k2-search.focused {
          border-color: var(--border-accent);
          background: var(--input-bg-focus);
          box-shadow: 0 0 0 3px var(--blob-3);
        }
        .k2-search input {
          flex: 1;
          min-width: 0;
          background: transparent;
          border: none;
          outline: none;
          color: var(--foreground);
          font-family: var(--font-sans);
          font-size: 14px;
          padding: 10px 12px;
        }
        .k2-search input::placeholder { color: var(--foreground-muted); }

        .k2-tag {
          font-family: var(--font-sans);
          font-size: 12.5px;
          color: var(--foreground-muted);
          background: var(--surface);
          border: 1px solid var(--border-default);
          border-radius: 100px;
          padding: 6px 13px;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .k2-tag:hover {
          color: var(--foreground);
          border-color: var(--border-accent);
          background: var(--surface-hover);
        }
        .k2-tag.active {
          color: #fff;
          border-color: var(--border-accent);
          background: rgba(94,106,210,0.18);
        }

        .k2-step-row {
          position: relative;
          border-bottom: 1px solid var(--border-default);
          transition: background 0.2s ease;
        }
        .k2-step-row:last-child { border-bottom: none; }
        .k2-step-row:hover { background: var(--surface); }

        .k2-mobile-actions { display: none; gap: 8px; align-items: center; }

        .k2-mobile-menu {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height 0.3s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease;
        }
        .k2-mobile-menu.open { max-height: 70vh; opacity: 1; overflow-y: auto; }

        .k2-hero-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 56px;
          align-items: center;
        }

        .k2-live-label {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: var(--font-mono);
          font-size: 10.5px;
          letter-spacing: 0.06em;
          color: var(--foreground-subtle);
        }
        .k2-live-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 8px rgba(74,222,128,0.55);
          animation: k2Pulse 1.7s ease-in-out infinite;
        }

        .k2-swap { animation: k2Swap 0.35s cubic-bezier(0.16,1,0.3,1) both; }

        .k2-holland {
          display: flex;
          gap: 4px;
        }
        .k2-holland span {
          width: 22px; height: 22px;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--foreground);
          background: rgba(94,106,210,0.16);
          border: 1px solid var(--border-accent);
          border-radius: 6px;
        }
        .k2-holland span:first-child {
          background: rgba(94,106,210,0.34);
          box-shadow: 0 0 10px rgba(94,106,210,0.3);
        }

        .k2-axis-hint {
          min-height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-size: 11.5px;
          line-height: 1.7;
          color: var(--foreground-muted);
          padding: 0 4px;
          margin-top: 2px;
        }

        .k2-stat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          padding: 13px 0 12px;
          margin-top: 4px;
          border-top: 1px solid var(--border-default);
          border-bottom: 1px solid var(--border-default);
          text-align: center;
        }
        .k2-stat-num {
          font-family: var(--font-mono);
          font-size: 15px;
          color: var(--foreground);
        }
        .k2-stat-lbl {
          font-size: 10.5px;
          color: var(--foreground-subtle);
          margin-top: 4px;
        }

        .k2-source {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 11px;
          font-size: 10.5px;
          line-height: 1.6;
          color: var(--foreground-subtle);
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .k2-source:hover { color: var(--foreground-muted); }
        .k2-source b { font-weight: 600; }

        @media (max-width: 860px) {
          .k2-nav-links { display: none !important; }
          .k2-mobile-actions { display: flex !important; }
          .k2-desktop-actions { display: none !important; }
          .k2-hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .k2-viz-col { order: 2; }
          .k2-hero-title { font-size: 38px !important; }
          .k2-search { flex-direction: column !important; align-items: stretch !important; }
          .k2-search input { width: 100% !important; }
          .k2-search .k2-btn { width: 100% !important; }
          .k2-stats-row { gap: 24px !important; flex-wrap: wrap; }
        }

        @media (max-width: 430px) {
          .k2-hero-title { font-size: 31px !important; line-height: 1.3 !important; }
          .k2-tag { font-size: 12px; padding: 7px 12px; }   /* هدف لمس بزرگ‌تر */
          .k2-stats-row { gap: 18px !important; }
          .k2-viz-col .k2-card { padding: 16px !important; }
        }

        @media (max-width: 360px) {
          .k2-hero-title { font-size: 27px !important; }
          .k2-holland span { width: 20px; height: 20px; font-size: 10px; }
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

        {/* مودال اخطار ورود */}
        {showAuthModal && (
          <div
            onClick={() => setShowAuthModal(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 100,
              background: "var(--overlay)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 24,
              animation: "k2Overlay 0.2s ease both",
            }}
          >
            <div
              className="k2-card"
              onClick={(e) => e.stopPropagation()}
              onMouseMove={handleSpotlight}
              style={{
                width: "100%", maxWidth: 400, textAlign: "right",
                padding: "32px 30px",
                animation: "k2ModalIn 0.28s cubic-bezier(0.16,1,0.3,1) both",
                background: "var(--card-solid)",
              }}
            >
              <div className="k2-icon-box" style={{ marginBottom: 18 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="10" width="16" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M8 10V7.5a4 4 0 1 1 8 0V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>

              <h2 style={{ fontWeight: 700, fontSize: 20, letterSpacing: "-0.01em", color: "var(--foreground)", marginBottom: 10 }}>
                ابتدا وارد شوید
              </h2>
              <p style={{ fontSize: 14, lineHeight: 1.9, color: "var(--foreground-muted)", marginBottom: 24 }}>
                برای شروع ارزیابی مسیر شغلی باید وارد حساب کاربری خود شوید.
                اگر هنوز حساب ندارید، ساخت آن رایگان است.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  className="k2-btn k2-btn-primary"
                  onClick={() => router.push(`/auth?next=${encodeURIComponent(pendingTarget)}`)}
                  style={{ fontSize: 14.5, height: 44, width: "100%" }}
                >
                  ورود به حساب کاربری
                </button>
                <button
                  className="k2-btn k2-btn-secondary"
                  onClick={() => router.push("/register")}
                  style={{ fontSize: 14.5, height: 44, width: "100%" }}
                >
                  ساخت حساب رایگان
                </button>
                <button
                  className="k2-btn k2-btn-ghost"
                  onClick={() => setShowAuthModal(false)}
                  style={{ fontSize: 13, height: 36, width: "100%", marginTop: 2 }}
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ position: "relative", zIndex: 10 }}>
          <SiteNav />
          <div className="kn-spacer" />

          {/* Hero */}
          <section
            style={{
              maxWidth: 1280, width: "100%", margin: "0 auto",
              padding: "clamp(56px, 9vw, 104px) clamp(16px, 4vw, 40px) 0",
            }}
          >
            <div className="k2-hero-grid">
              <div style={{ textAlign: "right" }}>
                <div className={mounted ? "k2-fade-1" : ""} style={{ marginBottom: 22 }}>
                  <span className="k2-badge">
                    <span className="k2-badge-dot" />
                    سامانه هوشمند مسیریابی شغلی
                  </span>
                </div>

                <h1
                  className={`k2-hero-title k2-gradient-text ${mounted ? "k2-fade-2" : ""}`}
                  style={{
                    fontWeight: 700,
                    fontSize: "clamp(38px, 4.6vw, 56px)",
                    lineHeight: 1.2,
                    letterSpacing: "-0.02em",
                    margin: "0 0 18px",
                    maxWidth: 560,
                  }}
                >
                  مسیر شغلی خودت را کشف کن
                </h1>

                <p
                  className={mounted ? "k2-fade-3" : ""}
                  style={{
                    fontSize: 16, lineHeight: 1.9, color: "var(--foreground-muted)",
                    maxWidth: 470, margin: "0 0 32px",
                  }}
                >
                  حوزه‌ی تخصصی‌ات را انتخاب کن تا با ارزیابی هوشمند مهارت،
                  شایستگی‌ها و شکاف‌های یادگیری‌ات را دقیق بسنجیم.
                </p>

                <div className={mounted ? "k2-fade-4" : ""} style={{ maxWidth: 520 }}>
                  <div className={`k2-search ${inputFocused ? "focused" : ""}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: 10, flexShrink: 0, color: "var(--foreground-muted)" }}>
                      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    <input
                      type="text"
                      placeholder="جستجوی حوزه تخصصی..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); if (searchError) setSearchError(""); }}
                      onFocus={() => setInputFocused(true)}
                      onBlur={() => setInputFocused(false)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <button
                      className="k2-btn k2-btn-primary"
                      onClick={handleSearch}
                      style={{ fontSize: 14, padding: "0 22px", height: 40, whiteSpace: "nowrap" }}
                    >
                      شروع ارزیابی
                    </button>
                  </div>

                  {searchError && (
                    <div
                      role="alert"
                      style={{
                        display: "flex", alignItems: "center", gap: 7, marginTop: 10,
                        fontSize: 12.5, color: "var(--danger)",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                        <path d="M12 7.5v5.5M12 16.2v.3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                      </svg>
                      {searchError}
                    </div>
                  )}

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 16, alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--foreground-subtle)", marginLeft: 4 }}>
                      پیشنهادی
                    </span>
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        className={`k2-tag ${searchQuery === tag ? "active" : ""}`}
                        onClick={() => { setSearchQuery(tag); setSearchError(""); }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  className={`k2-stats-row ${mounted ? "k2-fade-5" : ""}`}
                  style={{ display: "flex", gap: 40, marginTop: 44 }}
                >
                  {stats.map((s) => (
                    <div key={s.lbl}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 500, color: "var(--foreground)" }}>
                        {s.num}
                      </div>
                      <div style={{ fontSize: 12.5, color: "var(--foreground-muted)", marginTop: 5 }}>{s.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ستون تصویری — پروفایل علاقه شغلی بر پایه داده واقعی O*NET */}
              <div className={`k2-viz-col ${mounted ? "k2-fade-4" : ""}`} style={{ display: "flex", justifyContent: "center" }}>
                <div className="k2-card" onMouseMove={handleSpotlight} style={{ width: "100%", maxWidth: 430, padding: "20px 20px 18px" }}>

                  {/* سربرگ */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ textAlign: "right", minWidth: 0 }}>
                      <span className="k2-live-label">
                        <span className="k2-live-dot" />
                        پروفایل علاقه شغلی
                      </span>
                      <div key={active.code} className="k2-swap" style={{ marginTop: 7 }}>
                        <div style={{ fontWeight: 700, fontSize: 16.5, color: "var(--foreground)", letterSpacing: "-0.01em" }}>
                          {isCustom ? searchQuery.trim() : active.role}
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--foreground-subtle)", marginTop: 3, direction: "ltr", textAlign: "right" }}>
                          {active.englishTitle}
                        </div>
                      </div>
                    </div>

                    {/* کد هالند */}
                    <div key={`${active.code}-hc`} className="k2-swap" style={{ textAlign: "center", flexShrink: 0 }}>
                      <div className="k2-holland">
                        {code.map((a) => (
                          <span key={a.key}>{a.key}</span>
                        ))}
                      </div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--foreground-subtle)", marginTop: 5, letterSpacing: "0.05em" }}>
                        کد هالند
                      </div>
                    </div>
                  </div>

                  {/* نمودار رادار RIASEC */}
                  <svg
                    viewBox="-8 0 316 262"
                    style={{ width: "100%", display: "block", marginTop: 4, overflow: "visible" }}
                    xmlns="http://www.w3.org/2000/svg"
                    role="img"
                    aria-label={`نمودار شش‌ضلعی علاقه شغلی برای ${active.role}`}
                  >
                    <defs>
                      <radialGradient id="k2Fill" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#5e6ad2" stopOpacity="0.45" />
                        <stop offset="70%" stopColor="#7c6ad2" stopOpacity="0.24" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1" />
                      </radialGradient>
                      <filter id="k2Glow" x="-40%" y="-40%" width="180%" height="180%">
                        <feGaussianBlur stdDeviation="4" result="b" />
                        <feMerge>
                          <feMergeNode in="b" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {/* حلقه‌های راهنما ۲۵/۵۰/۷۵/۱۰۰ */}
                    {[25, 50, 75, 100].map((k) => (
                      <polygon
                        key={k}
                        points={polygon(RIASEC_AXES.map(() => k))}
                        fill="none"
                        stroke="var(--grid-line)"
                        strokeWidth="1"
                      />
                    ))}
                    <text x={CX + 3} y={CY - R + 3} fill="var(--foreground-subtle)" fontSize="8" fontFamily="JetBrains Mono, monospace">100</text>
                    <text x={CX + 3} y={CY - R / 2 + 3} fill="var(--foreground-subtle)" fontSize="8" fontFamily="JetBrains Mono, monospace">50</text>

                    {/* محورها و برچسب‌ها */}
                    {RIASEC_AXES.map((a, i) => {
                      const [x, y] = axisPoint(i, R);
                      const [lx, ly] = axisPoint(i, R + 24);
                      const isTop = code[0].key === a.key;
                      const isHot = hovered === i;
                      const anchor = Math.abs(lx - CX) < 8 ? "middle" : lx > CX ? "start" : "end";
                      return (
                        <g
                          key={a.key}
                          onMouseEnter={() => setHovered(i)}
                          onMouseLeave={() => setHovered(null)}
                          style={{ cursor: "default" }}
                        >
                          <line x1={CX} y1={CY} x2={x} y2={y} stroke="var(--grid-line)" strokeWidth="1" />
                          {/* ناحیه بزرگ‌تر برای hover */}
                          <circle cx={lx} cy={ly - 4} r="22" fill="transparent" />
                          <text
                            x={lx} y={ly}
                            textAnchor={anchor}
                            fill={isHot || isTop ? "var(--foreground)" : "var(--foreground-muted)"}
                            fontSize="10.5"
                            fontWeight={isTop ? 700 : 400}
                            style={{ transition: "fill 0.2s ease" }}
                          >
                            {a.label}
                          </text>
                          <text
                            x={lx} y={ly + 12}
                            textAnchor={anchor}
                            fill={isHot ? "#5e6ad2" : "var(--foreground-subtle)"}
                            fontSize="9"
                            fontFamily="JetBrains Mono, monospace"
                            style={{ transition: "fill 0.2s ease" }}
                          >
                            {active.scores[a.key]}
                          </text>
                        </g>
                      );
                    })}

                    {/* چندضلعی داده (متحرک) */}
                    <polygon
                      points={polygon(shape)}
                      fill="url(#k2Fill)"
                      stroke="#6872d9"
                      strokeWidth="1.9"
                      strokeLinejoin="round"
                      filter="url(#k2Glow)"
                    />

                    {/* رئوس */}
                    {shape.map((v, i) => {
                      const [x, y] = axisPoint(i, (R * v) / 100);
                      const isHot = hovered === i;
                      return (
                        <circle
                          key={i}
                          cx={x} cy={y}
                          r={isHot ? 5 : 3.3}
                          fill="var(--node-fill)"
                          stroke={isHot ? "#a855f7" : "#5e6ad2"}
                          strokeWidth="1.7"
                          style={{ transition: "r 0.18s ease, stroke 0.18s ease" }}
                        />
                      );
                    })}
                    <circle cx={CX} cy={CY} r="1.8" fill="rgba(255,255,255,0.2)" />
                  </svg>

                  {/* توضیح محور زیر نشانگر */}
                  <div className="k2-axis-hint">
                    {hovered !== null ? (
                      <span key={hovered} className="k2-swap">
                        <b style={{ color: "var(--foreground)" }}>{RIASEC_AXES[hovered].label}</b>
                        {" — "}
                        {RIASEC_AXES[hovered].hint}
                      </span>
                    ) : (
                      <span style={{ color: "var(--foreground-subtle)" }}>
                        نشانگر را روی هر محور ببرید
                      </span>
                    )}
                  </div>

                  {/* آمار واقعی بازار کار */}
                  <div key={`${active.code}-st`} className="k2-swap k2-stat-grid">
                    <div>
                      <div className="k2-stat-num">{fmtWage(active.medianWage)}</div>
                      <div className="k2-stat-lbl">میانه درآمد سالانه</div>
                    </div>
                    <div>
                      <div className="k2-stat-num">{fmtCount(active.employment)}</div>
                      <div className="k2-stat-lbl">شاغل فعلی</div>
                    </div>
                    <div>
                      <div className="k2-stat-num" style={{ color: "#4ade80" }}>+{fmtCount(active.openings)}</div>
                      <div className="k2-stat-lbl">فرصت تا ۲۰۳۴</div>
                    </div>
                  </div>

                  {/* منبع */}
                  <a
                    href={active.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="k2-source"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 11v5M12 7.6v.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span>
                      داده‌ها از <b>O*NET</b> — پایگاه مشاغل وزارت کار آمریکا
                      <span style={{ fontFamily: "var(--font-mono)", opacity: 0.75 }}> · {active.code}</span>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* How */}
          <section id="how" style={{ maxWidth: 860, width: "100%", margin: "0 auto", padding: "clamp(72px, 10vw, 112px) clamp(16px, 4vw, 40px) 112px" }}>
            <div style={{ textAlign: "right", marginBottom: 28 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.1em", color: "var(--accent)" }}>
                روش کار
              </span>
              <h2 style={{ fontWeight: 700, fontSize: 34, letterSpacing: "-0.02em", color: "var(--foreground)", marginTop: 8 }}>
                ارزیابی در سه مرحله
              </h2>
            </div>

            <div className="k2-card">
              {points.map((p, i) => (
                <div key={p.title} className="k2-step-row" style={{ display: "flex", alignItems: "center", gap: 22, padding: "22px 26px", textAlign: "right" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--foreground-subtle)", minWidth: 28 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--foreground)", marginBottom: 4 }}>{p.title}</div>
                    <div style={{ fontSize: 13, color: "var(--foreground-muted)" }}>{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 44 }}>
              <button className="k2-btn k2-btn-primary" onClick={handleSearch} style={{ fontSize: 15, padding: "0 30px", height: 46 }}>
                شروع ارزیابی
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
