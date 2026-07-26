// مسیر فایل: app/assessment/AssessmentClient.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ThemeToggle from "@/app/components/ThemeToggle";

type MultipleChoiceQuestion = {
  id: number;
  type: "multiple_choice";
  text: string;
  options: string[];
};

type LikertQuestion = {
  id: number;
  type: "likert";
  text: string;
  scale: { min: number; max: number; minLabel: string; maxLabel: string };
};

type Question = MultipleChoiceQuestion | LikertQuestion;

type Answer = { questionId: number; answer: string | number };

const LETTERS = ["الف", "ب", "ج", "د", "ه", "و"];

const styles = `
    @keyframes k2Float1 { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(20px,-30px) rotate(2deg); } }
    @keyframes k2Float2 { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(-24px,20px) rotate(-2deg); } }
    @keyframes k2FadeUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
    @keyframes k2Spin { to { transform: rotate(360deg); } }
    @keyframes k2Pulse { 0%,100% { opacity:1; transform: scale(1); } 50% { opacity:0.35; transform: scale(0.72); } }
    @keyframes k2Shake {
      10%,90% { transform: translateX(-1px); } 20%,80% { transform: translateX(2px); }
      30%,50%,70% { transform: translateX(-3px); } 40%,60% { transform: translateX(3px); }
    }
    @keyframes k2Dash { to { stroke-dashoffset: 0; } }
    @keyframes k2Overlay { from { opacity: 0; } to { opacity: 1; } }
    @keyframes k2ModalIn { from { opacity:0; transform: translateY(14px) scale(0.97); } to { opacity:1; transform: translateY(0) scale(1); } }

    .k2-fade-1 { animation: k2FadeUp .6s cubic-bezier(.16,1,.3,1) both; }

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
      transition: transform .2s cubic-bezier(.16,1,.3,1), box-shadow .2s ease, background .2s ease, color .2s ease, opacity .2s ease;
    }
    .k2-btn:active:not(:disabled) { transform: scale(.98); }
    .k2-btn:disabled { cursor: not-allowed; opacity: .45; }
    .k2-btn-primary {
      background: var(--accent); color: #fff; border-radius: 8px;
      box-shadow: 0 0 0 1px rgba(94,106,210,.5), 0 4px 12px rgba(94,106,210,.3), inset 0 1px 0 0 rgba(255,255,255,.2);
    }
    .k2-btn-primary:hover:not(:disabled) {
      background: var(--accent-bright); transform: translateY(-2px);
      box-shadow: 0 0 0 1px rgba(94,106,210,.7), 0 6px 24px rgba(94,106,210,.45), inset 0 1px 0 0 rgba(255,255,255,.25);
    }
    .k2-btn-secondary {
      background: var(--surface); color: var(--foreground); border-radius: 8px;
      box-shadow: inset 0 0 0 1px var(--border-default);
    }
    .k2-btn-secondary:hover:not(:disabled) { background: var(--surface-hover); box-shadow: inset 0 0 0 1px var(--border-hover); }
    .k2-btn-ghost { background: transparent; color: var(--foreground-muted); border-radius: 8px; }
    .k2-btn-ghost:hover { background: var(--surface); color: var(--foreground); }

    .k2-card {
      position: relative;
      background: var(--card-gradient);
      border: 1px solid var(--border-default); border-radius: 16px;
      box-shadow: var(--card-shadow);
    }

    /* ── نوار پیشرفت ── */
    .k2-rail { height: 2px; background: var(--track); position: relative; overflow: hidden; }
    .k2-rail > i {
      position: absolute; inset: 0 auto 0 0; display: block; height: 100%;
      background: linear-gradient(90deg,#5e6ad2,#a855f7);
      box-shadow: 0 0 12px rgba(94,106,210,.6);
      transition: width .45s cubic-bezier(.16,1,.3,1);
    }

    /* ── نقشه سوالات ── */
    .k2-dots { display: flex; gap: 5px; align-items: center; flex-wrap: wrap; justify-content: center; }
    .k2-dot {
      width: 7px; height: 7px; border-radius: 50%; padding: 0; border: none; cursor: pointer;
      background: rgba(255,255,255,.12); transition: all .25s cubic-bezier(.16,1,.3,1);
    }
    .k2-dot.done { background: var(--accent); }
    .k2-dot.now  { background: #fff; width: 20px; border-radius: 100px; box-shadow: 0 0 10px rgba(255,255,255,.35); }
    .k2-dot:hover:not(.now) { transform: scale(1.4); background: var(--accent-bright); }

    /* ── گزینه‌ها ── */
    .k2-opt {
      display: flex; align-items: center; gap: 13px; width: 100%; text-align: right;
      font-family: var(--font-sans); font-size: 14.5px; line-height: 1.7; color: var(--foreground);
      background: rgba(255,255,255,.03); border: 1px solid var(--border-default);
      border-radius: 12px; padding: 15px 16px; cursor: pointer;
      transition: all .18s cubic-bezier(.16,1,.3,1);
    }
    .k2-opt:hover { background: var(--input-bg-focus); border-color: var(--border-hover); transform: translateX(-3px); }
    .k2-opt.on {
      background: rgba(94,106,210,.14); border-color: var(--border-accent);
      box-shadow: 0 0 0 3px rgba(94,106,210,.1);
    }
    .k2-opt-key {
      width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-mono); font-size: 11px;
      background: var(--surface); border: 1px solid var(--border-default);
      color: var(--foreground-muted); transition: all .18s ease;
    }
    .k2-opt.on .k2-opt-key {
      background: var(--accent); border-color: var(--accent); color: #fff;
      box-shadow: 0 0 12px rgba(94,106,210,.5);
    }

    /* ── طیف لیکرت ── */
    .k2-scale { display: flex; gap: 8px; direction: ltr; }
    .k2-scale button {
      flex: 1; height: 52px; border-radius: 12px; cursor: pointer;
      font-family: var(--font-mono); font-size: 15px; color: var(--foreground-muted);
      background: rgba(255,255,255,.03); border: 1px solid var(--border-default);
      transition: all .18s cubic-bezier(.16,1,.3,1);
      display: flex; align-items: center; justify-content: center;
    }
    .k2-scale button:hover { background: var(--track); color: var(--foreground); transform: translateY(-3px); }
    .k2-scale button.on {
      background: var(--accent); border-color: var(--accent); color: #fff;
      box-shadow: 0 0 0 3px rgba(94,106,210,.14), 0 6px 18px rgba(94,106,210,.35);
      transform: translateY(-3px);
    }

    .k2-kbd {
      font-family: var(--font-mono); font-size: 10px; color: var(--foreground-subtle);
      background: var(--surface); border: 1px solid var(--border-default);
      border-radius: 5px; padding: 2px 6px; min-width: 18px; display: inline-block; text-align: center;
    }

    .k2-swap-in  { animation: k2FadeUp .35s cubic-bezier(.16,1,.3,1) both; }

    .k2-alert {
      display: flex; align-items: flex-start; gap: 9px; text-align: right;
      background: rgba(248,113,113,.08); border: 1px solid rgba(248,113,113,.25);
      color: #fca5a5; font-size: 13px; line-height: 1.7; padding: 12px 14px; border-radius: 10px;
      animation: k2Shake .4s ease both;
    }

    .k2-spinner {
      width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.25);
      border-top-color: #fff; border-radius: 50%; animation: k2Spin .7s linear infinite;
    }

    @media (max-width: 640px) {
      .k2-q-card { padding: 26px 20px !important; }
      .k2-nav-meta { display: none !important; }
      .k2-scale button { height: 46px; font-size: 14px; }
      .k2-foot { flex-direction: column-reverse !important; align-items: stretch !important; }
      .k2-foot .k2-btn { width: 100%; }
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
      background:
        "var(--page-gradient)",
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
        position: "absolute", top: "35%", left: "-220px",
        width: 600, height: 800, borderRadius: "50%",
        background: "radial-gradient(circle, var(--blob-2), transparent 70%)",
        filter: "blur(120px)", pointerEvents: "none", animation: "k2Float2 10s ease-in-out infinite",
      }}
    />
    <div className="k2-grid-overlay" />
    <div className="k2-noise" />
    <div style={{ position: "relative", zIndex: 10 }}>{children}</div>
  </main>
);
}

export default function AssessmentClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const count = Number(searchParams.get("count") || 10);

  const [phase, setPhase] = useState<"loading" | "quiz" | "submitting">("loading");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selected, setSelected] = useState<string | number | null>(null);
  const [error, setError] = useState("");
  const [leaving, setLeaving] = useState<"next" | "prev" | null>(null);
  const [confirmExit, setConfirmExit] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const cardRef = useRef<HTMLDivElement>(null);

  /* ── دریافت سوالات ── */
  useEffect(() => {
    if (!query) {
      router.push("/quiz");
      return;
    }

    let cancelled = false;
    fetch("/api/quiz/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, count }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.questions && Array.isArray(data.questions) && data.questions.length) {
          setQuestions(data.questions);
          setPhase("quiz");
          setStartedAt(Date.now());
        } else {
          setError(data.message || "خطا در دریافت سوالات. لطفاً دوباره تلاش کنید.");
        }
      })
      .catch(() => !cancelled && setError("ارتباط با سرور برقرار نشد."));

    return () => {
      cancelled = true;
    };
  }, [query, count, router]);

  /* ── تایمر سپری‌شده ── */
  useEffect(() => {
    if (phase !== "quiz" || startedAt === null) return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(id);
  }, [phase, startedAt]);

  const currentQuestion = questions[currentIndex];
  const answeredCount = answers.length;
  const progress = questions.length ? (answeredCount / questions.length) * 100 : 0;

  /* ── ناوبری ── */
  const goTo = useCallback(
    (index: number, dir: "next" | "prev") => {
      setLeaving(dir);
      setTimeout(() => {
        setCurrentIndex(index);
        const prior = answers.find((a) => a.questionId === questions[index]?.id);
        setSelected(prior ? prior.answer : null);
        setLeaving(null);
      }, 180);
    },
    [answers, questions]
  );

  const handleNext = useCallback(() => {
    if (selected === null || leaving) return;

    const qid = currentQuestion.id;
    const next = [...answers.filter((a) => a.questionId !== qid), { questionId: qid, answer: selected }];
    setAnswers(next);

    if (currentIndex < questions.length - 1) {
      goTo(currentIndex + 1, "next");
    } else {
      setPhase("submitting");
      sessionStorage.setItem(
        "quiz_data",
        JSON.stringify({ query, count, questions, answers: next })
      );
      router.push("/result");
    }
  }, [selected, leaving, currentQuestion, answers, currentIndex, questions, query, count, router, goTo]);

  const handlePrev = useCallback(() => {
    if (currentIndex === 0 || leaving) return;
    if (selected !== null) {
      const qid = currentQuestion.id;
      setAnswers((prev) => [...prev.filter((a) => a.questionId !== qid), { questionId: qid, answer: selected }]);
    }
    goTo(currentIndex - 1, "prev");
  }, [currentIndex, leaving, selected, currentQuestion, goTo]);

  /* ── میانبرهای صفحه‌کلید ── */
  useEffect(() => {
    if (phase !== "quiz" || !currentQuestion) return;

    const onKey = (e: KeyboardEvent) => {
      if (confirmExit) {
        if (e.key === "Escape") setConfirmExit(false);
        return;
      }
      if (e.key === "Enter" && selected !== null) {
        e.preventDefault();
        handleNext();
        return;
      }
      if (e.key === "Backspace" && currentIndex > 0) {
        e.preventDefault();
        handlePrev();
        return;
      }
      // انتخاب گزینه با عدد ۱..۹
      const n = Number(e.key);
      if (!Number.isNaN(n) && n >= 1) {
        if (currentQuestion.type === "multiple_choice") {
          const opt = currentQuestion.options[n - 1];
          if (opt !== undefined) setSelected(opt);
        } else {
          const { min, max } = currentQuestion.scale;
          if (n >= min && n <= max) setSelected(n);
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, currentQuestion, selected, currentIndex, confirmExit, handleNext, handlePrev]);

  const fmtTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const answeredIds = useMemo(() => new Set(answers.map((a) => a.questionId)), [answers]);

  /* ─────────────── استایل مشترک ─────────────── */

  /* ─────────────── حالت بارگذاری ─────────────── */
  if (phase === "loading") {
    return (
      <>
        <style>{styles}</style>
        <Shell>
          <div
            style={{
              minHeight: "100vh", display: "flex", alignItems: "center",
              justifyContent: "center", padding: 24,
            }}
          >
            {error ? (
              <div className="k2-card k2-fade-1" style={{ maxWidth: 400, width: "100%", padding: 30, textAlign: "right" }}>
                <div className="k2-alert" style={{ marginBottom: 20 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M12 7.5v5.5M12 16.2v.3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                  </svg>
                  <span>{error}</span>
                </div>
                <button className="k2-btn k2-btn-primary" onClick={() => router.push("/quiz")} style={{ width: "100%", height: 44, fontSize: 14.5 }}>
                  بازگشت و تلاش دوباره
                </button>
              </div>
            ) : (
              <div className="k2-fade-1" style={{ textAlign: "center", maxWidth: 420 }}>
                {/* قطب‌نمای در حال جست‌وجو */}
                <svg width="88" height="88" viewBox="0 0 100 100" style={{ margin: "0 auto 26px", display: "block" }}>
                  <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="1.5" />
                  <circle
                    cx="50" cy="50" r="38" fill="none" stroke="#5e6ad2" strokeWidth="2"
                    strokeLinecap="round" strokeDasharray="60 179"
                    style={{ transformOrigin: "50px 50px", animation: "k2Spin 1.4s linear infinite" }}
                  />
                  <circle cx="50" cy="50" r="27" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="1" />
                  <g style={{ transformOrigin: "50px 50px", animation: "k2Spin 3.6s cubic-bezier(.5,0,.5,1) infinite" }}>
                    <path d="M50 26 L55 50 L50 54 L45 50 Z" fill="#a855f7" />
                    <path d="M50 74 L55 50 L50 46 L45 50 Z" fill="#3a3f4d" />
                  </g>
                  <circle cx="50" cy="50" r="3.2" fill="#5e6ad2" />
                </svg>

                <h1 className="k2-gradient-text" style={{ fontWeight: 700, fontSize: 21, letterSpacing: "-.02em", margin: "0 0 10px" }}>
                  در حال ساخت سوالات اختصاصی شما
                </h1>
                <p style={{ fontSize: 13.5, color: "var(--foreground-muted)", lineHeight: 1.9, margin: 0 }}>
                  هوش مصنوعی در حال طراحی پرسش‌های متناسب با حوزه‌ی{" "}
                  <span style={{ color: "var(--foreground)" }}>«{query}»</span> است.
                  این کار چند ثانیه طول می‌کشد.
                </p>
              </div>
            )}
          </div>
        </Shell>
      </>
    );
  }

  /* ─────────────── حالت ارسال ─────────────── */
  if (phase === "submitting") {
    return (
      <>
        <style>{styles}</style>
        <Shell>
          <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div className="k2-fade-1" style={{ textAlign: "center", maxWidth: 420 }}>
              <svg width="88" height="88" viewBox="0 0 100 100" style={{ margin: "0 auto 26px", display: "block" }}>
                <polygon points="50,14 81,32 81,68 50,86 19,68 19,32" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1.5" />
                <polygon
                  points="50,26 70,38 70,62 50,74 30,62 30,38" fill="rgba(94,106,210,.12)"
                  stroke="#5e6ad2" strokeWidth="2" strokeLinejoin="round"
                  strokeDasharray="150" strokeDashoffset="150"
                  style={{ animation: "k2Dash 1.6s ease-in-out infinite alternate" }}
                />
                <circle cx="50" cy="50" r="4" fill="#a855f7" style={{ animation: "k2Pulse 1.3s ease-in-out infinite" }} />
              </svg>
              <h1 className="k2-gradient-text" style={{ fontWeight: 700, fontSize: 21, letterSpacing: "-.02em", margin: "0 0 10px" }}>
                در حال تحلیل پاسخ‌های شما
              </h1>
              <p style={{ fontSize: 13.5, color: "var(--foreground-muted)", lineHeight: 1.9, margin: 0 }}>
                الگوهای علاقه و مهارت شما استخراج می‌شود تا مسیر شغلی متناسب پیشنهاد شود.
              </p>
            </div>
          </div>
        </Shell>
      </>
    );
  }

  if (!currentQuestion) return null;

  const isLast = currentIndex === questions.length - 1;

  return (
    <>
      <style>{styles}</style>
      <Shell>
        {/* ── مودال تایید خروج ── */}
        {confirmExit && (
          <div
            onClick={() => setConfirmExit(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 100,
              background: "var(--overlay)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
              animation: "k2Overlay .2s ease both",
            }}
          >
            <div
              className="k2-card"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%", maxWidth: 380, padding: "28px 26px", textAlign: "right",
                background: "var(--card-solid)",
                animation: "k2ModalIn .28s cubic-bezier(.16,1,.3,1) both",
              }}
            >
              <h2 style={{ fontWeight: 700, fontSize: 18, color: "var(--foreground)", margin: "0 0 10px" }}>
                از آزمون خارج می‌شوید؟
              </h2>
              <p style={{ fontSize: 13.5, color: "var(--foreground-muted)", lineHeight: 1.9, margin: "0 0 22px" }}>
                {answeredCount > 0
                  ? `شما به ${answeredCount} سوال پاسخ داده‌اید. با خروج، این پاسخ‌ها پاک می‌شوند.`
                  : "با خروج، به صفحه‌ی انتخاب حوزه برمی‌گردید."}
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="k2-btn k2-btn-secondary" onClick={() => setConfirmExit(false)} style={{ flex: 1, height: 42, fontSize: 14 }}>
                  ادامه آزمون
                </button>
                <button
                  className="k2-btn k2-btn-ghost"
                  onClick={() => router.push("/quiz")}
                  style={{ flex: 1, height: 42, fontSize: 14, color: "#fca5a5" }}
                >
                  خروج
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── ناوبار ── */}
        <nav
          style={{
            position: "sticky", top: 0, zIndex: 50,
            background: "var(--nav-bg)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            borderBottom: "1px solid var(--border-default)",
          }}
        >
          <div
            style={{
              height: 60, maxWidth: 940, margin: "0 auto",
              padding: "0 clamp(16px,4vw,32px)",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
            }}
          >
            <button className="k2-btn k2-btn-ghost" onClick={() => setConfirmExit(true)} style={{ fontSize: 13, padding: "8px 12px" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M14 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              خروج
            </button>

            {/* نقشه سوالات */}
            <div className="k2-dots">
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  className={`k2-dot ${i === currentIndex ? "now" : answeredIds.has(q.id) ? "done" : ""}`}
                  onClick={() => i !== currentIndex && goTo(i, i > currentIndex ? "next" : "prev")}
                  aria-label={`سوال ${i + 1}`}
                  title={`سوال ${i + 1}`}
                />
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ThemeToggle />
              <div className="k2-nav-meta" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--foreground-subtle)" }}>
                {fmtTime(elapsed)}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--foreground-muted)",
                  background: "var(--surface)", border: "1px solid var(--border-default)",
                  borderRadius: 100, padding: "5px 11px", maxWidth: 150,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}
                title={query}
              >
                {query}
              </span>
              </div>
            </div>
          </div>

          <div className="k2-rail">
            <i style={{ width: `${progress}%` }} />
          </div>
        </nav>

        {/* ── محتوا ── */}
        <div
          style={{
            maxWidth: 700, margin: "0 auto",
            padding: "clamp(36px,6vw,64px) clamp(16px,4vw,32px) 64px",
          }}
        >
          {/* شمارنده */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16, justifyContent: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 26, color: "var(--foreground)" }}>
              {String(currentIndex + 1).padStart(2, "0")}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--foreground-subtle)" }}>
              / {String(questions.length).padStart(2, "0")}
            </span>
          </div>

          {/* کارت سوال */}
          <div
            ref={cardRef}
            key={currentIndex}
            className="k2-card k2-q-card k2-swap-in"
            style={{
              padding: "32px 30px",
              textAlign: "right",
              opacity: leaving ? 0 : 1,
              transform: leaving === "next" ? "translateX(20px)" : leaving === "prev" ? "translateX(-20px)" : "none",
              transition: "opacity .18s ease, transform .18s ease",
            }}
          >
            <h2
              style={{
                fontWeight: 700, fontSize: 19, lineHeight: 1.8,
                color: "var(--foreground)", letterSpacing: "-.01em", margin: "0 0 26px",
              }}
            >
              {currentQuestion.text}
            </h2>

            {currentQuestion.type === "multiple_choice" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {currentQuestion.options.map((option, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`k2-opt ${selected === option ? "on" : ""}`}
                    onClick={() => setSelected(option)}
                  >
                    <span className="k2-opt-key">{LETTERS[i] ?? i + 1}</span>
                    <span style={{ flex: 1 }}>{option}</span>
                    {selected === option && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: "var(--accent)", flexShrink: 0 }}>
                        <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, gap: 12 }}>
                  <span style={{ fontSize: 12, color: "var(--foreground-muted)" }}>
                    {currentQuestion.scale.minLabel}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--foreground-muted)" }}>
                    {currentQuestion.scale.maxLabel}
                  </span>
                </div>
                <div className="k2-scale">
                  {Array.from(
                    { length: currentQuestion.scale.max - currentQuestion.scale.min + 1 },
                    (_, i) => i + currentQuestion.scale.min
                  ).map((val) => (
                    <button
                      key={val}
                      type="button"
                      className={selected === val ? "on" : ""}
                      onClick={() => setSelected(val)}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* پاورقی */}
          <div
            className="k2-foot"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 22 }}
          >
            <button
              className="k2-btn k2-btn-secondary"
              onClick={handlePrev}
              disabled={currentIndex === 0 || !!leaving}
              style={{ height: 44, padding: "0 20px", fontSize: 14 }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M10 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              قبلی
            </button>

            <button
              className="k2-btn k2-btn-primary"
              onClick={handleNext}
              disabled={selected === null || !!leaving}
              style={{ height: 44, padding: "0 28px", fontSize: 14.5, flex: "0 1 auto", minWidth: 150 }}
            >
              {isLast ? "مشاهده نتیجه" : "سوال بعدی"}
              {!isLast && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M14 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>

          {/* راهنمای میانبرها */}
          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 14, marginTop: 22, flexWrap: "wrap",
              fontSize: 11.5, color: "var(--foreground-subtle)",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span className="k2-kbd">۱–۹</span> انتخاب گزینه
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span className="k2-kbd">Enter</span> بعدی
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span className="k2-kbd">←</span> قبلی
            </span>
          </div>
        </div>
      </Shell>
    </>
  );
}
