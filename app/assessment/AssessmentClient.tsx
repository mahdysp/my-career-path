"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
  scale: {
    min: number;
    max: number;
    minLabel: string;
    maxLabel: string;
  };
};

type Question = MultipleChoiceQuestion | LikertQuestion;

type Answer = {
  questionId: number;
  answer: string | number;
};

export default function AssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const count = Number(searchParams.get("count") || 10);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  const [phase, setPhase] = useState<"loading" | "quiz" | "submitting">("loading");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [error, setError] = useState("");
  const [animating, setAnimating] = useState(false);

  // canvas background
  useEffect(() => {
    const cv = canvasRef.current;
    const wrap = wrapRef.current;
    if (!cv || !wrap) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!cv || !wrap) return;
      cv.width = wrap.offsetWidth;
      cv.height = wrap.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const stars = Array.from({ length: 140 }, () => ({
      x: Math.random() * cv.width,
      y: Math.random() * cv.height,
      r: Math.random() * 1.2 + 0.2,
      a: Math.random(),
      speed: Math.random() * 0.008 + 0.002,
      phase: Math.random() * Math.PI * 2,
    }));

    type Particle = {
      x: number; y: number; vx: number; vy: number;
      r: number; color: string; a: number; life: number; maxLife: number;
    };

    function makeParticle(): Particle {
      const colors = ["rgba(59,130,246,", "rgba(16,185,129,", "rgba(245,158,11,", "rgba(99,102,241,"];
      return {
        x: Math.random() * cv!.width,
        y: Math.random() * cv!.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        a: Math.random() * 0.6 + 0.2,
        life: 0,
        maxLife: Math.random() * 300 + 200,
      };
    }

    let particles: Particle[] = Array.from({ length: 45 }, makeParticle);
    let t = 0;

    function draw() {
      if (!cv || !ctx) return;
      t++;
      ctx.clearRect(0, 0, cv.width, cv.height);

      const g1 = ctx.createRadialGradient(cv.width * 0.15, cv.height * 0.4, 0, cv.width * 0.15, cv.height * 0.4, cv.width * 0.5);
      g1.addColorStop(0, "rgba(29,78,216,0.08)");
      g1.addColorStop(1, "transparent");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, cv.width, cv.height);

      const g2 = ctx.createRadialGradient(cv.width * 0.85, cv.height * 0.6, 0, cv.width * 0.85, cv.height * 0.6, cv.width * 0.45);
      g2.addColorStop(0, "rgba(16,185,129,0.06)");
      g2.addColorStop(1, "transparent");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, cv.width, cv.height);

      stars.forEach((s) => {
        s.phase += s.speed;
        const a = s.a * (0.6 + 0.4 * Math.sin(s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148,163,184,${a})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 90) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(59,130,246,${0.08 * (1 - d / 90)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        if (p.life > p.maxLife || p.x < -10 || p.x > cv!.width + 10 || p.y < -10 || p.y > cv!.height + 10) {
          particles[i] = makeParticle();
          return;
        }
        const fade = p.life < 30 ? p.life / 30 : p.life > p.maxLife - 30 ? (p.maxLife - p.life) / 30 : 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.a * fade + ")";
        ctx.fill();
      });

      const scanY = (t * 0.4) % cv.height;
      const sg = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
      sg.addColorStop(0, "transparent");
      sg.addColorStop(0.5, "rgba(59,130,246,0.02)");
      sg.addColorStop(1, "transparent");
      ctx.fillStyle = sg;
      ctx.fillRect(0, scanY - 40, cv.width, 80);

      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  // گرفتن سوالات از API
  useEffect(() => {
    if (!query) {
      router.push("/quiz");
      return;
    }

    fetch("/api/quiz/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, count }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.questions && Array.isArray(data.questions)) {
          setQuestions(data.questions);
          setPhase("quiz");
        } else {
          setError("خطا در دریافت سوالات. لطفاً دوباره تلاش کنید.");
        }
      })
      .catch(() => setError("خطا در اتصال به سرور."));
  }, [query, count, router]);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0;

  const handleNext = useCallback(() => {
    if (selectedAnswer === null) return;
    if (animating) return;

    const newAnswers = [
      ...answers,
      { questionId: currentQuestion.id, answer: selectedAnswer },
    ];

    setAnimating(true);

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setAnswers(newAnswers);
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setAnimating(false);
      } else {
        // آخرین سوال — برو به تحلیل
        setAnswers(newAnswers);
        setPhase("submitting");

        // ذخیره موقت در sessionStorage و رفتن به result
        sessionStorage.setItem("quiz_data", JSON.stringify({
          query,
          count,
          questions,
          answers: newAnswers,
        }));

        router.push("/result");
      }
    }, 300);
  }, [selectedAnswer, animating, answers, currentQuestion, currentIndex, questions, query, count, router]);

  // کیبورد shortcut
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && selectedAnswer !== null) {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedAnswer, handleNext]);

  // loading state
  if (phase === "loading") {
    return (
      <div style={{
        minHeight: "100vh", width: "100%", background: "#070d1a",
        fontFamily: "Vazirmatn, sans-serif", direction: "rtl",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 16, color: "#94a3b8",
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700;900&display=swap');`}</style>
        {error ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <div style={{ color: "#f87171", fontSize: 15, marginBottom: 20 }}>{error}</div>
            <button
              onClick={() => router.push("/quiz")}
              style={{
                background: "linear-gradient(135deg,#1d4ed8,#1e40af)",
                color: "#fff", border: "none", borderRadius: 12,
                padding: "12px 28px", fontSize: 14, fontWeight: 800,
                cursor: "pointer", fontFamily: "Vazirmatn, sans-serif",
              }}
            >
              بازگشت
            </button>
          </div>
        ) : (
          <>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: "linear-gradient(135deg,rgba(29,78,216,0.3),rgba(16,185,129,0.2))",
              border: "1px solid rgba(59,130,246,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
              animation: "spin 2s linear infinite",
            }}>🧭</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>
              در حال آماده‌سازی سوالات...
            </div>
            <div style={{ fontSize: 13, color: "#64748b" }}>
              هوش مصنوعی سوالات مرتبط با «{query}» را می‌سازد
            </div>
          </>
        )}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (phase === "submitting") {
    return (
      <div style={{
        minHeight: "100vh", width: "100%", background: "#070d1a",
        fontFamily: "Vazirmatn, sans-serif", direction: "rtl",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 16, color: "#94a3b8",
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700;900&display=swap');`}</style>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🔍</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>در حال تحلیل پاسخ‌ها...</div>
        <div style={{ fontSize: 13, color: "#64748b" }}>هوش مصنوعی مسیر شغلی مناسب شما را پیدا می‌کند</div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700;900&display=swap');

        @keyframes blink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .option-btn {
          width: 100%;
          background: rgba(15,31,61,0.6);
          border: 1px solid rgba(59,130,246,0.15);
          border-radius: 14px;
          padding: 14px 18px;
          color: #cbd5e1;
          font-size: 14px;
          font-family: 'Vazirmatn', sans-serif;
          font-weight: 600;
          text-align: right;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .option-btn:hover {
          border-color: rgba(59,130,246,0.4);
          background: rgba(59,130,246,0.08);
          color: #e2e8f0;
        }
        .option-btn.selected {
          border-color: rgba(59,130,246,0.7);
          background: rgba(59,130,246,0.15);
          color: #e2e8f0;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }

        .likert-btn {
          flex: 1;
          aspect-ratio: 1;
          border-radius: 12px;
          border: 1px solid rgba(59,130,246,0.2);
          background: rgba(15,31,61,0.6);
          color: #94a3b8;
          font-family: 'Vazirmatn', sans-serif;
          font-size: 16px;
          font-weight: 900;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .likert-btn:hover {
          border-color: rgba(59,130,246,0.5);
          background: rgba(59,130,246,0.1);
          color: #e2e8f0;
        }
        .likert-btn.selected {
          border-color: rgba(59,130,246,0.8);
          background: rgba(59,130,246,0.2);
          color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }

        .next-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(29,78,216,0.5) !important;
        }
        .next-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .question-card {
          animation: fadeSlideIn 0.35s ease forwards;
        }

        @media (max-width: 768px) {
          .assessment-main { padding: 24px 16px !important; }
          .question-card { padding: 28px 20px !important; }
        }
      `}</style>

      <div
        ref={wrapRef}
        style={{
          minHeight: "100vh", width: "100%", background: "#070d1a",
          fontFamily: "Vazirmatn, sans-serif", direction: "rtl",
          position: "relative", overflow: "hidden",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        />

        {/* ناوبار */}
        <nav style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "rgba(7,13,26,0.85)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(59,130,246,0.1)",
          padding: "14px 40px", display: "flex",
          justifyContent: "space-between", alignItems: "center",
        }}>
          <button
            onClick={() => router.push("/quiz")}
            style={{
              fontSize: 13, fontWeight: 700, padding: "8px 18px",
              color: "#93c5fd", background: "transparent",
              border: "1px solid rgba(59,130,246,0.25)",
              borderRadius: 10, cursor: "pointer", transition: "all 0.2s",
              fontFamily: "Vazirmatn, sans-serif",
            }}
          >
            ← خروج از آزمون
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
              سوال {currentIndex + 1} از {questions.length}
            </span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)",
              color: "#fcd34d", fontSize: 11, fontWeight: 700,
              padding: "4px 10px", borderRadius: 100,
            }}>
              <span style={{
                width: 5, height: 5, background: "#f59e0b", borderRadius: "50%",
                animation: "blink 1.8s ease-in-out infinite", display: "inline-block",
              }} />
              {query}
            </span>
          </div>
        </nav>

        {/* progress bar */}
        <div style={{
          position: "sticky", top: "57px", zIndex: 49,
          height: 3, background: "rgba(59,130,246,0.1)",
        }}>
          <div style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg,#3b82f6,#10b981)",
            transition: "width 0.4s ease",
            borderRadius: "0 2px 2px 0",
          }} />
        </div>

        {/* محتوای اصلی */}
        <main
          className="assessment-main"
          style={{
            maxWidth: 680, margin: "0 auto", padding: "60px 24px",
            position: "relative", zIndex: 10,
            display: "flex", flexDirection: "column", alignItems: "center",
          }}
        >
          {/* شماره سوال */}
          <div style={{ marginBottom: 24, textAlign: "center" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 44, height: 44, borderRadius: 14,
              background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)",
              fontSize: 16, fontWeight: 900, color: "#3b82f6",
            }}>
              {currentIndex + 1}
            </div>
          </div>

          {/* کارت سوال */}
          <div
            key={currentIndex}
            className="question-card"
            style={{
              width: "100%",
              background: "linear-gradient(145deg,rgba(15,31,61,0.95),rgba(7,13,26,0.98))",
              border: "1px solid rgba(59,130,246,0.18)",
              borderRadius: 24, padding: "36px 32px",
              boxShadow: "0 0 60px rgba(29,78,216,0.1), 0 0 0 1px rgba(255,255,255,0.04) inset",
              opacity: animating ? 0 : 1,
              transition: "opacity 0.3s ease",
            }}
          >
            {/* متن سوال */}
            <h2 style={{
              fontSize: 20, fontWeight: 900, color: "#f8fafc",
              lineHeight: 1.6, marginBottom: 28, textAlign: "right",
            }}>
              {currentQuestion.text}
            </h2>

            {/* گزینه‌ها */}
            {currentQuestion.type === "multiple_choice" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {currentQuestion.options.map((option, i) => (
                  <button
                    key={i}
                    className={`option-btn ${selectedAnswer === option ? "selected" : ""}`}
                    onClick={() => setSelectedAnswer(option)}
                  >
                    <span style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: selectedAnswer === option ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.06)",
                      border: `1px solid ${selectedAnswer === option ? "rgba(59,130,246,0.6)" : "rgba(59,130,246,0.2)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 800,
                      color: selectedAnswer === option ? "#3b82f6" : "#64748b",
                      transition: "all 0.2s",
                    }}>
                      {["الف", "ب", "ج", "د"][i]}
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <div>
                {/* لیبل‌ها */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                    {currentQuestion.scale.maxLabel}
                  </span>
                  <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                    {currentQuestion.scale.minLabel}
                  </span>
                </div>
                {/* دکمه‌های Likert */}
                <div style={{ display: "flex", gap: 8, direction: "ltr" }}>
                  {Array.from(
                    { length: currentQuestion.scale.max - currentQuestion.scale.min + 1 },
                    (_, i) => i + currentQuestion.scale.min
                  ).map((val) => (
                    <button
                      key={val}
                      className={`likert-btn ${selectedAnswer === val ? "selected" : ""}`}
                      onClick={() => setSelectedAnswer(val)}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                  <span style={{ fontSize: 11, color: "#475569" }}>۱ = {currentQuestion.scale.minLabel}</span>
                  <span style={{ fontSize: 11, color: "#475569" }}>۵ = {currentQuestion.scale.maxLabel}</span>
                </div>
              </div>
            )}
          </div>

          {/* دکمه بعدی */}
          <div style={{ marginTop: 24, width: "100%", display: "flex", justifyContent: "center" }}>
            <button
              className="next-btn"
              onClick={handleNext}
              disabled={selectedAnswer === null || animating}
              style={{
                background: "linear-gradient(135deg,#1d4ed8,#1e40af)",
                color: "#fff", border: "none", borderRadius: 14,
                padding: "14px 48px",
                fontFamily: "Vazirmatn, sans-serif", fontSize: 15, fontWeight: 900,
                cursor: "pointer",
                boxShadow: "0 8px 32px rgba(29,78,216,0.35)",
                transition: "transform 0.18s, box-shadow 0.18s, opacity 0.2s",
              }}
            >
              {currentIndex < questions.length - 1 ? "سوال بعدی ←" : "مشاهده نتیجه 🎯"}
            </button>
          </div>

          {/* راهنما */}
          <div style={{ marginTop: 14, fontSize: 12, color: "#475569" }}>
            برای ادامه می‌توانی Enter بزنی
          </div>
        </main>
      </div>
    </>
  );
}
