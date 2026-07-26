// مسیر فایل: app/quiz/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function QuizLanding() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputFocused, setInputFocused] = useState(false);

  // وضعیت کاربر لاگین‌شده
  const [user, setUser] = useState<{ id: string; email: string; firstName: string; lastName: string } | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  // مودال اخطار ورود
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    router.prefetch("/assessment");

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setUserLoading(false));
  }, [router]);

  useEffect(() => {
    if (!showAuthModal) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShowAuthModal(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showAuthModal]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.refresh();
  };

  const handleSearch = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (searchQuery.trim()) {
      router.push(`/assessment?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push("/assessment");
    }
  };

  const handleSpotlight = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }, []);

  const tags = ["برنامه‌نویسی", "طراحی UI/UX", "بازاریابی", "داده‌کاوی", "مدیریت محصول"];

  /* ── پروفایل شایستگی نمونه برای هر حوزه (پیش‌نمای زنده) ── */
  const profiles = useMemo(
    () => ({
      "برنامه‌نویسی": {
        role: "توسعه‌دهنده نرم‌افزار",
        match: 92,
        axes: [
          { label: "حل مسئله", v: 0.92 },
          { label: "منطق و الگوریتم", v: 0.86 },
          { label: "یادگیری ابزار", v: 0.78 },
          { label: "کار تیمی", v: 0.62 },
          { label: "دقت و جزئیات", v: 0.83 },
          { label: "خلاقیت", v: 0.58 },
        ],
      },
      "طراحی UI/UX": {
        role: "طراح تجربه کاربری",
        match: 88,
        axes: [
          { label: "حل مسئله", v: 0.7 },
          { label: "منطق و الگوریتم", v: 0.48 },
          { label: "یادگیری ابزار", v: 0.75 },
          { label: "کار تیمی", v: 0.82 },
          { label: "دقت و جزئیات", v: 0.9 },
          { label: "خلاقیت", v: 0.95 },
        ],
      },
      "بازاریابی": {
        role: "متخصص بازاریابی دیجیتال",
        match: 84,
        axes: [
          { label: "حل مسئله", v: 0.66 },
          { label: "منطق و الگوریتم", v: 0.55 },
          { label: "یادگیری ابزار", v: 0.7 },
          { label: "کار تیمی", v: 0.9 },
          { label: "دقت و جزئیات", v: 0.6 },
          { label: "خلاقیت", v: 0.88 },
        ],
      },
      "داده‌کاوی": {
        role: "تحلیل‌گر داده",
        match: 90,
        axes: [
          { label: "حل مسئله", v: 0.88 },
          { label: "منطق و الگوریتم", v: 0.95 },
          { label: "یادگیری ابزار", v: 0.8 },
          { label: "کار تیمی", v: 0.55 },
          { label: "دقت و جزئیات", v: 0.92 },
          { label: "خلاقیت", v: 0.5 },
        ],
      },
      "مدیریت محصول": {
        role: "مدیر محصول",
        match: 86,
        axes: [
          { label: "حل مسئله", v: 0.85 },
          { label: "منطق و الگوریتم", v: 0.6 },
          { label: "یادگیری ابزار", v: 0.65 },
          { label: "کار تیمی", v: 0.95 },
          { label: "دقت و جزئیات", v: 0.72 },
          { label: "خلاقیت", v: 0.8 },
        ],
      },
    }),
    []
  );

  const profileKeys = useMemo(() => Object.keys(profiles) as (keyof typeof profiles)[], [profiles]);

  // اگر کاربر چیزی تایپ نکرده، بین حوزه‌ها می‌چرخد؛ به‌محض تایپ، روی همان حوزه قفل می‌شود.
  const [cycleIndex, setCycleIndex] = useState(0);
  const matchedKey = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return null;
    return profileKeys.find((k) => k.includes(q) || q.includes(k)) ?? null;
  }, [searchQuery, profileKeys]);

  useEffect(() => {
    if (searchQuery.trim()) return;
    const id = setInterval(() => setCycleIndex((i) => (i + 1) % profileKeys.length), 3200);
    return () => clearInterval(id);
  }, [searchQuery, profileKeys.length]);

  const activeKey = matchedKey ?? profileKeys[cycleIndex];
  const active = profiles[activeKey];
  const isCustom = !!searchQuery.trim() && !matchedKey;

  // انیمیشن نرم بین پروفایل‌ها
  const [shape, setShape] = useState(active.axes.map((a) => a.v));
  const shapeRef = useRef(shape);
  const rafRef = useRef(0);

  useEffect(() => {
    const target = active.axes.map((a) => a.v);
    cancelAnimationFrame(rafRef.current);
    const step = () => {
      const cur = shapeRef.current;
      const next = cur.map((v, i) => v + (target[i] - v) * 0.12);
      const done = next.every((v, i) => Math.abs(target[i] - v) < 0.002);
      shapeRef.current = done ? target : next;
      setShape(shapeRef.current);
      if (!done) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  // هندسه‌ی نمودار رادار
  const R = 96;
  const CX = 150;
  const CY = 148;
  const axisPoint = (i: number, r: number) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / active.axes.length;
    return [CX + Math.cos(angle) * r, CY + Math.sin(angle) * r] as const;
  };
  const polygon = (values: number[], scale = 1) =>
    values.map((v, i) => axisPoint(i, R * v * scale).join(",")).join(" ");

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
            linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 64px 64px;
          pointer-events: none;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%);
        }

        .k2-noise {
          position: fixed;
          inset: 0;
          opacity: 0.02;
          pointer-events: none;
          z-index: 1;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        .k2-gradient-text {
          background: linear-gradient(to bottom, #ffffff, rgba(255,255,255,0.72));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .k2-card {
          position: relative;
          background: linear-gradient(to bottom, rgba(255,255,255,0.07), rgba(255,255,255,0.015));
          border: 1px solid var(--border-default);
          border-radius: 16px;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.03),
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
        .k2-card:hover::before { opacity: 1; }

        .k2-card-lift:hover {
          transform: translateY(-6px);
          border-color: var(--border-hover);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.08),
            0 12px 40px rgba(0,0,0,0.5),
            0 0 60px rgba(94,106,210,0.12);
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
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border-default);
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .k2-search.focused {
          border-color: var(--border-accent);
          background: rgba(255,255,255,0.055);
          box-shadow: 0 0 0 3px rgba(94,106,210,0.12);
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
        .k2-step-row:hover { background: rgba(255,255,255,0.02); }

        .k2-mobile-menu {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height 0.3s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease;
        }
        .k2-mobile-menu.open { max-height: 320px; opacity: 1; }

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

        .k2-meter {
          height: 6px;
          border-radius: 100px;
          background: rgba(255,255,255,0.06);
          overflow: hidden;
        }
        .k2-meter-fill {
          height: 100%;
          border-radius: 100px;
          background: linear-gradient(90deg, #5e6ad2, #a855f7);
          box-shadow: 0 0 12px rgba(94,106,210,0.5);
          transition: width 0.6s cubic-bezier(0.16,1,0.3,1);
        }

        @media (max-width: 860px) {
          .k2-nav-links { display: none !important; }
          .k2-hamburger { display: flex !important; }
          .k2-desktop-actions { display: none !important; }
          .k2-hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .k2-viz-col { order: 2; }
          .k2-hero-title { font-size: 38px !important; }
          .k2-search { flex-direction: column !important; align-items: stretch !important; }
          .k2-search input { width: 100% !important; }
          .k2-search .k2-btn { width: 100% !important; }
          .k2-stats-row { gap: 24px !important; flex-wrap: wrap; }
        }
      `}</style>

      <main
        dir="rtl"
        style={{
          position: "relative",
          minHeight: "100vh",
          width: "100%",
          background:
            "radial-gradient(ellipse 1200px 800px at 50% -10%, #0e0e16 0%, #050506 55%, #020203 100%)",
          fontFamily: "var(--font-sans)",
          overflow: "hidden",
        }}
      >
        {/* Ambient blobs */}
        <div
          style={{
            position: "absolute", top: "-200px", left: "50%", transform: "translateX(-50%)",
            width: 1100, height: 700, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(94,106,210,0.28), transparent 70%)",
            filter: "blur(140px)", pointerEvents: "none", animation: "k2Float1 9s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute", top: "20%", left: "-200px",
            width: 600, height: 800, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,0.14), transparent 70%)",
            filter: "blur(120px)", pointerEvents: "none", animation: "k2Float2 10s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute", top: "35%", right: "-160px",
            width: 500, height: 700, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(94,106,210,0.12), transparent 70%)",
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
              background: "rgba(2,2,3,0.72)",
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
                background: "linear-gradient(to bottom, #101017, #08080b)",
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
                  onClick={() => router.push("/auth")}
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
          {/* Nav */}
          <nav
            style={{
              position: "sticky", top: 0, zIndex: 50,
              display: "flex", flexDirection: "column", justifyContent: "center",
              padding: "0 clamp(16px, 4vw, 40px)",
              background: "rgba(5,5,6,0.7)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderBottom: "1px solid var(--border-default)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
              <Link
                href="/"
                style={{ fontWeight: 700, fontSize: 19, letterSpacing: "-0.02em", color: "var(--foreground)", textDecoration: "none" }}
              >
                Karex
              </Link>

              <div className="k2-nav-links" style={{ display: "flex", gap: 4 }}>
                <Link href="/" className="k2-nav-link">خانه</Link>
                <a href="#how" className="k2-nav-link">روش کار</a>
              </div>

              <div className="k2-desktop-actions" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {userLoading ? (
                  <div style={{ width: 132, height: 38, borderRadius: 8, background: "var(--surface)" }} />
                ) : user ? (
                  <>
                    <span style={{ fontSize: 13.5, color: "var(--foreground-muted)", marginLeft: 4 }}>
                      سلام، {user.firstName || user.email}
                    </span>
                    <button className="k2-btn k2-btn-secondary" onClick={() => router.push("/dashboard")} style={{ fontSize: 14, padding: "9px 18px", height: 38 }}>
                      داشبورد
                    </button>
                    <button className="k2-btn k2-btn-ghost" onClick={handleLogout} style={{ fontSize: 14, padding: "9px 16px" }}>
                      خروج
                    </button>
                  </>
                ) : (
                  <>
                    <button className="k2-btn k2-btn-ghost" onClick={() => router.push("/auth")} style={{ fontSize: 14, padding: "9px 16px" }}>
                      ورود
                    </button>
                    <button className="k2-btn k2-btn-primary" onClick={() => router.push("/register")} style={{ fontSize: 14, padding: "9px 18px", height: 38 }}>
                      ثبت‌نام
                    </button>
                  </>
                )}
              </div>

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
                <Link href="/" className="k2-nav-link" onClick={() => setMenuOpen(false)}>خانه</Link>
                <a href="#how" className="k2-nav-link" onClick={() => setMenuOpen(false)}>روش کار</a>
                {user ? (
                  <>
                    <button className="k2-btn k2-btn-secondary" onClick={() => router.push("/dashboard")} style={{ fontSize: 14, padding: "10px", marginTop: 8 }}>داشبورد</button>
                    <button className="k2-btn k2-btn-ghost" onClick={handleLogout} style={{ fontSize: 14, padding: "10px" }}>خروج</button>
                  </>
                ) : (
                  <>
                    <button className="k2-btn k2-btn-secondary" onClick={() => router.push("/auth")} style={{ fontSize: 14, padding: "10px", marginTop: 8 }}>ورود</button>
                    <button className="k2-btn k2-btn-primary" onClick={() => router.push("/register")} style={{ fontSize: 14, padding: "10px" }}>ثبت‌نام رایگان</button>
                  </>
                )}
              </div>
            </div>
          </nav>

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
                      onChange={(e) => setSearchQuery(e.target.value)}
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

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 16, alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--foreground-subtle)", marginLeft: 4 }}>
                      پیشنهادی
                    </span>
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        className={`k2-tag ${searchQuery === tag ? "active" : ""}`}
                        onClick={() => setSearchQuery(tag)}
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

              {/* ستون تصویری — پیش‌نمای زنده پروفایل شایستگی */}
              <div className={`k2-viz-col ${mounted ? "k2-fade-4" : ""}`} style={{ display: "flex", justifyContent: "center" }}>
                <div className="k2-card" onMouseMove={handleSpotlight} style={{ width: "100%", maxWidth: 420, padding: 22 }}>
                  {/* سربرگ کارت */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <span className="k2-live-label">
                      <span className="k2-live-dot" />
                      پیش‌نمای نتیجه
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--foreground-subtle)", letterSpacing: "0.06em" }}>
                      نمونه
                    </span>
                  </div>

                  <div style={{ minHeight: 52, textAlign: "right", marginBottom: 4 }}>
                    <div key={activeKey} className="k2-swap" style={{ fontSize: 12.5, color: "var(--foreground-muted)" }}>
                      {isCustom ? "حوزه دلخواه شما" : activeKey}
                    </div>
                    <div key={`${activeKey}-r`} className="k2-swap" style={{ fontWeight: 700, fontSize: 17, color: "var(--foreground)", letterSpacing: "-0.01em", marginTop: 2 }}>
                      {isCustom ? searchQuery.trim() : active.role}
                    </div>
                  </div>

                  {/* نمودار رادار شایستگی */}
                  <svg viewBox="0 0 300 300" style={{ width: "100%", display: "block" }} xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <radialGradient id="k2Fill" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#5e6ad2" stopOpacity="0.42" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0.14" />
                      </radialGradient>
                    </defs>

                    {/* حلقه‌های راهنما */}
                    {[0.25, 0.5, 0.75, 1].map((k) => (
                      <polygon
                        key={k}
                        points={polygon(active.axes.map(() => 1), k)}
                        fill="none"
                        stroke="rgba(255,255,255,0.055)"
                        strokeWidth="1"
                      />
                    ))}

                    {/* محورها + برچسب‌ها */}
                    {active.axes.map((a, i) => {
                      const [x, y] = axisPoint(i, R);
                      const [lx, ly] = axisPoint(i, R + 26);
                      return (
                        <g key={a.label}>
                          <line x1={CX} y1={CY} x2={x} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                          <text
                            x={lx} y={ly + 4}
                            textAnchor={Math.abs(lx - CX) < 6 ? "middle" : lx > CX ? "start" : "end"}
                            fill="#8a8f98" fontSize="10.5" fontFamily="var(--font-sans)"
                          >
                            {a.label}
                          </text>
                        </g>
                      );
                    })}

                    {/* شکل شایستگی (متحرک) */}
                    <polygon points={polygon(shape)} fill="url(#k2Fill)" stroke="#5e6ad2" strokeWidth="1.8" strokeLinejoin="round" />
                    {shape.map((v, i) => {
                      const [x, y] = axisPoint(i, R * v);
                      return <circle key={i} cx={x} cy={y} r="3.2" fill="#08080b" stroke="#5e6ad2" strokeWidth="1.5" />;
                    })}
                    <circle cx={CX} cy={CY} r="2" fill="rgba(255,255,255,0.18)" />
                  </svg>

                  {/* میزان تطابق */}
                  <div style={{ marginTop: 6, paddingTop: 16, borderTop: "1px solid var(--border-default)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
                      <span style={{ fontSize: 12.5, color: "var(--foreground-muted)" }}>میزان تطابق با این مسیر</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)" }}>
                        ٪{active.match}
                      </span>
                    </div>
                    <div className="k2-meter">
                      <div className="k2-meter-fill" style={{ width: `${active.match}%` }} />
                    </div>
                  </div>
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
