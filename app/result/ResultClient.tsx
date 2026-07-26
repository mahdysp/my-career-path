// مسیر فایل: app/result/ResultClient.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ThemeToggle from "@/app/components/ThemeToggle";

type CareerPath = {
  title: string;
  match_percentage: number;
  description: string;
  required_skills: string[];
  avg_salary: string;
};

type RoadmapPhase = { phase: string; title: string; duration: string; steps: string[] };
type PersonalityTrait = { trait: string; description: string; score: number };

type ResultData = {
  summary: string;
  personality_traits: PersonalityTrait[];
  career_paths: CareerPath[];
  roadmap: RoadmapPhase[];
  strengths: string[];
  areas_to_improve: string[];
};

type Tab = "paths" | "roadmap" | "personality";

const styles = `
  @keyframes k2Float1 { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(20px,-30px) rotate(2deg); } }
  @keyframes k2Float2 { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(-24px,20px) rotate(-2deg); } }
  @keyframes k2FadeUp { from { opacity:0; transform: translateY(18px); } to { opacity:1; transform: translateY(0); } }
  @keyframes k2Spin { to { transform: rotate(360deg); } }
  @keyframes k2Pulse { 0%,100% { opacity:1; transform: scale(1); } 50% { opacity:.35; transform: scale(.72); } }
  @keyframes k2Dash { to { stroke-dashoffset: 0; } }

  .k2-f1 { animation: k2FadeUp .6s cubic-bezier(.16,1,.3,1) both; }
  .k2-f2 { animation: k2FadeUp .6s cubic-bezier(.16,1,.3,1) both; animation-delay:.07s; }
  .k2-f3 { animation: k2FadeUp .6s cubic-bezier(.16,1,.3,1) both; animation-delay:.14s; }

  .k2-grid-overlay {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(to right, var(--grid-line) 1px, transparent 1px),
      linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px);
    background-size: 64px 64px;
    mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%);
  }
  .k2-noise {
    position: fixed; inset: 0; opacity: var(--noise-opacity); pointer-events: none; z-index: 1;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }
  .k2-gradient-text {
    background: var(--heading-gradient);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }

  .k2-btn {
    font-family: var(--font-sans); font-weight: 500; border: none; cursor: pointer;
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    transition: transform .2s cubic-bezier(.16,1,.3,1), box-shadow .2s ease, background .2s ease, color .2s ease;
    text-decoration: none;
  }
  .k2-btn:active:not(:disabled) { transform: scale(.98); }
  .k2-btn-primary {
    background: var(--accent); color: #fff; border-radius: 8px;
    box-shadow: 0 0 0 1px var(--border-accent), 0 4px 12px var(--accent-glow);
  }
  .k2-btn-primary:hover { background: var(--accent-bright); transform: translateY(-2px); }
  .k2-btn-secondary {
    background: var(--surface); color: var(--foreground); border-radius: 8px;
    box-shadow: inset 0 0 0 1px var(--border-default);
  }
  .k2-btn-secondary:hover { background: var(--surface-hover); box-shadow: inset 0 0 0 1px var(--border-hover); }
  .k2-btn-ghost { background: transparent; color: var(--foreground-muted); border-radius: 8px; }
  .k2-btn-ghost:hover { background: var(--surface); color: var(--foreground); }

  .k2-card {
    position: relative; background: var(--card-gradient);
    border: 1px solid var(--border-default); border-radius: 16px;
    box-shadow: var(--card-shadow); overflow: hidden;
  }
  .k2-card::before {
    content:""; position:absolute; inset:0; border-radius:inherit; pointer-events:none;
    background: radial-gradient(340px circle at var(--mx,50%) var(--my,50%), var(--accent-glow), transparent 60%);
    opacity:0; transition: opacity .3s ease;
  }
  .k2-card:hover::before { opacity:.55; }

  .k2-sec-label { font-family: var(--font-mono); font-size: 11px; letter-spacing: .1em; color: var(--accent); }
  .k2-sec-title { font-weight: 700; font-size: 17px; letter-spacing: -.01em; color: var(--foreground); margin: 6px 0 0; }

  .k2-icon-box {
    width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0;
    border: 1px solid var(--border-hover); background: var(--surface);
    display: flex; align-items: center; justify-content: center; color: var(--accent);
  }

  .k2-shell { max-width: 940px; margin: 0 auto; padding: 0 clamp(16px,4vw,32px); }

  .k2-tabs { display: flex; gap: 6; background: var(--surface); border: 1px solid var(--border-default);
             border-radius: 11px; padding: 4px; gap: 4px; }
  .k2-tab {
    flex: 1; height: 36px; border: none; border-radius: 8px; cursor: pointer;
    font-family: var(--font-sans); font-size: 13px; color: var(--foreground-muted);
    background: transparent; transition: all .2s ease;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .k2-tab:hover { color: var(--foreground); }
  .k2-tab.on {
    background: var(--accent); color: #fff;
    box-shadow: 0 2px 10px var(--accent-glow);
  }

  .k2-bar { height: 6px; border-radius: 100px; background: var(--track); overflow: hidden; }
  .k2-bar > i {
    display: block; height: 100%; border-radius: 100px;
    background: linear-gradient(90deg, var(--accent), #a855f7);
    transition: width 1s cubic-bezier(.16,1,.3,1);
  }

  .k2-chip {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11.5px; color: var(--foreground-muted);
    background: var(--surface); border: 1px solid var(--border-default);
    border-radius: 100px; padding: 4px 10px;
  }

  .k2-phase { position: relative; padding: 0 26px 22px 0; border-right: 1px solid var(--border-default); }
  .k2-phase:last-child { border-right-color: transparent; padding-bottom: 0; }
  .k2-phase::before {
    content: ""; position: absolute; right: -5.5px; top: 3px;
    width: 10px; height: 10px; border-radius: 50%;
    background: var(--accent); box-shadow: 0 0 0 4px var(--background-base), 0 0 10px var(--accent-glow);
  }

  .k2-spinner {
    width: 16px; height: 16px; border: 2px solid var(--track);
    border-top-color: var(--accent); border-radius: 50%; animation: k2Spin .7s linear infinite;
  }

  .k2-alert {
    display: flex; align-items: flex-start; gap: 9px; text-align: right;
    background: color-mix(in srgb, var(--danger) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--danger) 30%, transparent);
    color: var(--danger); font-size: 13px; line-height: 1.7; padding: 12px 14px; border-radius: 10px;
  }

  @media (max-width: 640px) {
    .k2-hide-sm { display: none !important; }
    .k2-head-actions { width: 100%; }
    .k2-shell { padding: 0 14px; }
    .k2-card-pad-sm { padding: 18px 16px !important; }
    /* تایم‌لاین نقشه راه در موبایل تودرتو نشود */
    .k2-phase { padding-right: 18px; }
  }

  @media (max-width: 430px) {
    /* تب‌ها زیر هم بهتر از فشرده‌شدن و بریده‌شدن متن است */
    .k2-tabs { flex-direction: column; gap: 4px; }
    .k2-tab { width: 100%; height: 42px; font-size: 13.5px; }
    .k2-shell { padding: 0 12px; }
  }
`;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main
      dir="rtl"
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        background: "var(--page-gradient)",
        fontFamily: "var(--font-sans)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute", top: "-240px", left: "50%", transform: "translateX(-50%)",
          width: 1100, height: 700, borderRadius: "50%",
          background: "radial-gradient(circle, var(--blob-1), transparent 70%)",
          filter: "blur(140px)", pointerEvents: "none", animation: "k2Float1 9s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute", top: "38%", left: "-220px",
          width: 600, height: 800, borderRadius: "50%",
          background: "radial-gradient(circle, var(--blob-2), transparent 70%)",
          filter: "blur(120px)", pointerEvents: "none", animation: "k2Float2 11s ease-in-out infinite",
        }}
      />
      <div className="k2-grid-overlay" />
      <div className="k2-noise" />
      <div style={{ position: "relative", zIndex: 10 }}>{children}</div>
    </main>
  );
}

export default function ResultClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attempt");

  const [phase, setPhase] = useState<"loading" | "result" | "error">("loading");
  const [result, setResult] = useState<ResultData | null>(null);
  const [query, setQuery] = useState("");
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("paths");
  const [copied, setCopied] = useState(false);

  const spotlight = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  }, []);

  useEffect(() => {
    let cancelled = false;

    /* ── حالت ۱: نتیجه ذخیره‌شده از داشبورد ── */
    if (attemptId) {
      fetch(`/api/quiz/attempt/${attemptId}`)
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "خطا در دریافت نتیجه.");
          return data;
        })
        .then((data) => {
          if (cancelled) return;
          const a = data.attempt;
          if (!a?.result_data) throw new Error("محتوای این نتیجه در دسترس نیست.");
          setResult(a.result_data);
          setQuery(a.query || "");
          setCreatedAt(a.created_at || null);
          setPhase("result");
        })
        .catch((err) => {
          if (cancelled) return;
          setError(err instanceof Error ? err.message : "خطا در دریافت نتیجه.");
          setPhase("error");
        });
      return () => { cancelled = true; };
    }

    /* ── حالت ۲: آزمون تازه‌تمام‌شده ── */
    const raw = sessionStorage.getItem("quiz_data");
    if (!raw) {
      setError("داده‌ای برای نمایش یافت نشد. لطفاً آزمون را دوباره انجام دهید.");
      setPhase("error");
      return;
    }

    let quizData: { query?: string; questions?: unknown; answers?: unknown };
    try {
      quizData = JSON.parse(raw);
    } catch {
      setError("خطا در خواندن داده‌های آزمون.");
      setPhase("error");
      return;
    }

    setQuery(quizData.query || "");

    fetch("/api/quiz/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: quizData.query,
        questions: quizData.questions,
        answers: quizData.answers,
      }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "خطا در تحلیل پاسخ‌ها.");
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        if (!data.result) throw new Error(data.message || "خطا در دریافت نتیجه.");
        setResult(data.result);
        setPhase("result");
        sessionStorage.removeItem("quiz_data");
        // اگر ذخیره شد، آدرس را پایدار کن تا رفرش نتیجه را از دست ندهد
        if (data.attemptId) {
          window.history.replaceState(null, "", `/result?attempt=${data.attemptId}`);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "خطا در تحلیل پاسخ‌ها.");
        setPhase("error");
      });

    return () => { cancelled = true; };
  }, [attemptId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  /* ── بارگذاری ── */
  if (phase === "loading") {
    return (
      <>
        <style>{styles}</style>
        <Shell>
          <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div className="k2-f1" style={{ textAlign: "center", maxWidth: 420 }}>
              <svg width="88" height="88" viewBox="0 0 100 100" style={{ margin: "0 auto 26px", display: "block" }}>
                <polygon points="50,14 81,32 81,68 50,86 19,68 19,32" fill="none" stroke="var(--border-hover)" strokeWidth="1.5" />
                <polygon
                  points="50,26 70,38 70,62 50,74 30,62 30,38" fill="var(--accent-glow)"
                  stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round"
                  strokeDasharray="150" strokeDashoffset="150"
                  style={{ animation: "k2Dash 1.6s ease-in-out infinite alternate" }}
                />
                <circle cx="50" cy="50" r="4" fill="#a855f7" style={{ animation: "k2Pulse 1.3s ease-in-out infinite" }} />
              </svg>
              <h1 className="k2-gradient-text" style={{ fontWeight: 700, fontSize: 21, letterSpacing: "-.02em", margin: "0 0 10px" }}>
                {attemptId ? "در حال بازیابی نتیجه" : "در حال تحلیل پاسخ‌های شما"}
              </h1>
              <p style={{ fontSize: 13.5, color: "var(--foreground-muted)", lineHeight: 1.9, margin: 0 }}>
                {attemptId
                  ? "نتیجه‌ی ذخیره‌شده‌ی شما در حال بارگذاری است."
                  : "الگوهای علاقه و مهارت شما استخراج می‌شود تا بهترین مسیر پیشنهاد شود."}
              </p>
            </div>
          </div>
        </Shell>
      </>
    );
  }

  /* ── خطا ── */
  if (phase === "error" || !result) {
    return (
      <>
        <style>{styles}</style>
        <Shell>
          <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div className="k2-card k2-f1" style={{ maxWidth: 420, width: "100%", padding: 30, textAlign: "right" }}>
              <div className="k2-alert" style={{ marginBottom: 20 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M12 7.5v5.5M12 16.2v.3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                </svg>
                <span>{error}</span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="k2-btn k2-btn-primary" onClick={() => router.push("/quiz")} style={{ flex: 1, height: 44, fontSize: 14 }}>
                  آزمون جدید
                </button>
                <Link href="/dashboard" className="k2-btn k2-btn-secondary" style={{ flex: 1, height: 44, fontSize: 14 }}>
                  داشبورد
                </Link>
              </div>
            </div>
          </div>
        </Shell>
      </>
    );
  }

  const paths = result.career_paths ?? [];
  const roadmap = result.roadmap ?? [];
  const traits = result.personality_traits ?? [];
  const best = paths.length ? Math.max(...paths.map((p) => p.match_percentage || 0)) : 0;

  return (
    <>
      <style>{styles}</style>
      <Shell>
        {/* ناوبار */}
        <nav
          style={{
            position: "sticky", top: 0, zIndex: 50,
            background: "var(--nav-bg)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            borderBottom: "1px solid var(--border-default)",
          }}
        >
          <div className="k2-shell" style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <Link href="/" style={{ fontWeight: 700, fontSize: 19, letterSpacing: "-.02em", color: "var(--foreground)", textDecoration: "none" }}>
              Karex
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ThemeToggle />
              <button className="k2-btn k2-btn-secondary" onClick={handleCopy} style={{ fontSize: 13, height: 36, padding: "0 14px" }}>
                {copied ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    کپی شد
                  </>
                ) : (
                  "کپی لینک"
                )}
              </button>
              <Link href="/dashboard" className="k2-btn k2-btn-ghost k2-hide-sm" style={{ fontSize: 13, height: 36, padding: "0 14px" }}>
                داشبورد
              </Link>
            </div>
          </div>
        </nav>

        <div className="k2-shell" style={{ padding: "clamp(28px,5vw,44px) clamp(16px,4vw,32px) 72px" }}>
          {/* سربرگ */}
          <div className="k2-f1" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <span className="k2-chip">
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 8px var(--accent-glow)" }} />
                {query || "مسیریابی شغلی"}
              </span>
              {createdAt && (
                <span className="k2-chip" style={{ fontFamily: "var(--font-mono)" }}>
                  {new Date(createdAt).toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              )}
              {best > 0 && (
                <span className="k2-chip" style={{ color: "var(--accent)", borderColor: "var(--border-accent)" }}>
                  بالاترین تطابق ٪{best}
                </span>
              )}
            </div>
            <h1 className="k2-gradient-text" style={{ fontWeight: 700, fontSize: 26, letterSpacing: "-.02em", margin: 0, lineHeight: 1.35 }}>
              نتیجه‌ی مسیریابی شغلی شما
            </h1>
          </div>

          {/* خلاصه */}
          {result.summary && (
            <div className="k2-card k2-f2 k2-card-pad-sm" onMouseMove={spotlight} style={{ padding: "22px 24px", marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div className="k2-icon-box">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3l2.4 5.8L20.5 9l-4.4 4.1 1.2 6-5.3-3.1-5.3 3.1 1.2-6L3.5 9l6.1-.2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{ minWidth: 0 }}>
                  <span className="k2-sec-label">خلاصه تحلیل</span>
                  <p style={{ fontSize: 14, lineHeight: 2, color: "var(--foreground)", margin: "8px 0 0" }}>
                    {result.summary}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* قوت‌ها و بهبودها */}
          {(result.strengths?.length || result.areas_to_improve?.length) && (
            <div
              className="k2-f2"
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16, marginBottom: 16 }}
            >
              {result.strengths?.length > 0 && (
                <div className="k2-card k2-card-pad-sm" onMouseMove={spotlight} style={{ padding: "20px 22px" }}>
                  <span className="k2-sec-label">نقاط قوت</span>
                  <h2 className="k2-sec-title" style={{ marginBottom: 14 }}>در چه چیزی خوبید</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {result.strengths.map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 9, fontSize: 13.5, color: "var(--foreground)", lineHeight: 1.8 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ color: "var(--success)", flexShrink: 0, marginTop: 4 }}>
                          <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.areas_to_improve?.length > 0 && (
                <div className="k2-card k2-card-pad-sm" onMouseMove={spotlight} style={{ padding: "20px 22px" }}>
                  <span className="k2-sec-label">فرصت رشد</span>
                  <h2 className="k2-sec-title" style={{ marginBottom: 14 }}>روی چه چیزی کار کنید</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {result.areas_to_improve.map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 9, fontSize: 13.5, color: "var(--foreground)", lineHeight: 1.8 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ color: "var(--warning)", flexShrink: 0, marginTop: 4 }}>
                          <path d="M12 5v9M12 17.5v.3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                        </svg>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* تب‌ها */}
          <div className="k2-tabs k2-f3" style={{ marginBottom: 16 }}>
            {([
              ["paths", "مسیرهای شغلی", paths.length],
              ["roadmap", "نقشه راه", roadmap.length],
              ["personality", "ویژگی‌ها", traits.length],
            ] as [Tab, string, number][]).map(([id, label, n]) => (
              <button key={id} className={`k2-tab ${tab === id ? "on" : ""}`} onClick={() => setTab(id)}>
                {label}
                {n > 0 && (
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, opacity: 0.7 }}>{n}</span>
                )}
              </button>
            ))}
          </div>

          {/* محتوای تب */}
          {tab === "paths" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {paths.map((p, i) => (
                <div key={i} className="k2-card k2-f1 k2-card-pad-sm" onMouseMove={spotlight} style={{ padding: "22px 24px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, marginBottom: 12 }}>
                    <div style={{ display: "flex", gap: 12, minWidth: 0 }}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--foreground-subtle)",
                          paddingTop: 3, flexShrink: 0,
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontWeight: 700, fontSize: 16.5, color: "var(--foreground)", margin: 0, lineHeight: 1.5 }}>
                          {p.title}
                        </h3>
                        {p.avg_salary && (
                          <span style={{ fontSize: 12, color: "var(--foreground-muted)", display: "block", marginTop: 4 }}>
                            درآمد تخمینی: {p.avg_salary}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)", fontSize: 17,
                        color: i === 0 ? "var(--accent)" : "var(--foreground-muted)", flexShrink: 0,
                      }}
                    >
                      ٪{p.match_percentage}
                    </span>
                  </div>

                  <div className="k2-bar" style={{ marginBottom: 14 }}>
                    <i style={{ width: `${p.match_percentage}%` }} />
                  </div>

                  {p.description && (
                    <p style={{ fontSize: 13.5, lineHeight: 2, color: "var(--foreground-muted)", margin: "0 0 14px" }}>
                      {p.description}
                    </p>
                  )}

                  {p.required_skills?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {p.required_skills.map((s, j) => (
                        <span key={j} className="k2-chip">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === "roadmap" && (
            <div className="k2-card k2-f1 k2-card-pad-sm" onMouseMove={spotlight} style={{ padding: "26px 28px" }}>
              {roadmap.map((ph, i) => (
                <div key={i} className="k2-phase">
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                    <span className="k2-sec-label">{ph.phase}</span>
                    <h3 style={{ fontWeight: 700, fontSize: 15.5, color: "var(--foreground)", margin: 0 }}>{ph.title}</h3>
                    {ph.duration && (
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--foreground-subtle)" }}>
                        {ph.duration}
                      </span>
                    )}
                  </div>
                  <ul style={{ margin: 0, paddingRight: 18, display: "flex", flexDirection: "column", gap: 6 }}>
                    {ph.steps?.map((st, j) => (
                      <li key={j} style={{ fontSize: 13.5, lineHeight: 1.9, color: "var(--foreground-muted)" }}>
                        {st}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {tab === "personality" && (
            <div className="k2-card k2-f1 k2-card-pad-sm" onMouseMove={spotlight} style={{ padding: "24px 26px" }}>
              {traits.map((t, i) => (
                <div key={i} style={{ marginBottom: i === traits.length - 1 ? 0 : 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontWeight: 500, fontSize: 14, color: "var(--foreground)" }}>{t.trait}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--accent)" }}>{t.score}</span>
                  </div>
                  <div className="k2-bar" style={{ marginBottom: 8 }}>
                    <i style={{ width: `${t.score}%` }} />
                  </div>
                  {t.description && (
                    <p style={{ fontSize: 12.5, lineHeight: 1.9, color: "var(--foreground-muted)", margin: 0 }}>
                      {t.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* اقدام‌ها */}
          <div style={{ display: "flex", gap: 10, marginTop: 26, flexWrap: "wrap" }}>
            <button className="k2-btn k2-btn-primary" onClick={() => router.push("/quiz")} style={{ height: 44, padding: "0 24px", fontSize: 14 }}>
              آزمون جدید
            </button>
            <Link href="/dashboard" className="k2-btn k2-btn-secondary" style={{ height: 44, padding: "0 24px", fontSize: 14 }}>
              مشاهده داشبورد
            </Link>
          </div>
        </div>

        <footer style={{ borderTop: "1px solid var(--border-default)", padding: "22px clamp(16px,4vw,32px)", textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "var(--foreground-subtle)", fontFamily: "var(--font-mono)", margin: 0 }}>
            © Karex — تمامی حقوق محفوظ است
          </p>
        </footer>
      </Shell>
    </>
  );
}
