"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type CareerPath = {
  title: string;
  match_percentage: number;
  description: string;
  required_skills: string[];
  avg_salary: string;
};

type RoadmapPhase = {
  phase: string;
  title: string;
  duration: string;
  steps: string[];
};

type PersonalityTrait = {
  trait: string;
  description: string;
  score: number;
};

type ResultData = {
  summary: string;
  personality_traits: PersonalityTrait[];
  career_paths: CareerPath[];
  roadmap: RoadmapPhase[];
  strengths: string[];
  areas_to_improve: string[];
};

export default function ResultPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  const [phase, setPhase] = useState<"loading" | "result" | "error">("loading");
  const [result, setResult] = useState<ResultData | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"paths" | "roadmap" | "personality">("paths");

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

  // خواندن داده از sessionStorage و ارسال به API
  useEffect(() => {
    const raw = sessionStorage.getItem("quiz_data");
    if (!raw) {
      setError("داده‌ای برای تحلیل یافت نشد. لطفاً آزمون را دوباره بدهید.");
      setPhase("error");
      return;
    }

    let quizData;
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
      .then((res) => res.json())
      .then((data) => {
        if (data.result) {
          setResult(data.result);
          setPhase("result");
          // پاک کردن sessionStorage بعد از موفقیت
          sessionStorage.removeItem("quiz_data");
        } else {
          setError(data.message || "خطا در دریافت نتیجه.");
          setPhase("error");
        }
      })
      .catch(() => {
        setError("خطا در اتصال به سرور." + err.message);
        setPhase("error");
      });
  }, []);

  const getMatchColor = (pct: number) => {
    if (pct >= 85) return "#10b981";
    if (pct >= 70) return "#3b82f6";
    if (pct >= 55) return "#f59e0b";
    return "#94a3b8";
  };

  // loading
  if (phase === "loading") {
    return (
      <div style={{
        minHeight: "100vh", width: "100%", background: "#070d1a",
        fontFamily: "Vazirmatn, sans-serif", direction: "rtl",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 16,
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700;900&display=swap');
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }`}</style>
        <div style={{ fontSize: 48, animation: "pulse 1.5s ease-in-out infinite" }}>🔍</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: "#f8fafc" }}>در حال تحلیل پاسخ‌ها...</div>
        <div style={{ fontSize: 13, color: "#64748b", maxWidth: 300, textAlign: "center", lineHeight: 1.8 }}>
          هوش مصنوعی در حال بررسی علایق، مهارت‌ها و اهداف شما است
        </div>
      </div>
    );
  }

  // error
  if (phase === "error") {
    return (
      <div style={{
        minHeight: "100vh", width: "100%", background: "#070d1a",
        fontFamily: "Vazirmatn, sans-serif", direction: "rtl",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 16,
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700;900&display=swap');`}</style>
        <div style={{ fontSize: 40 }}>⚠️</div>
        <div style={{ fontSize: 15, color: "#f87171", fontWeight: 700 }}>{error}</div>
        <button
          onClick={() => router.push("/quiz")}
          style={{
            background: "linear-gradient(135deg,#1d4ed8,#1e40af)",
            color: "#fff", border: "none", borderRadius: 12,
            padding: "12px 28px", fontSize: 14, fontWeight: 800,
            cursor: "pointer", fontFamily: "Vazirmatn, sans-serif", marginTop: 8,
          }}
        >
          بازگشت و تلاش مجدد
        </button>
      </div>
    );
  }

  if (!result) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700;900&display=swap');

        @keyframes blink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fillBar {
          from { width: 0%; }
          to { width: var(--target-width); }
        }

        .tab-btn {
          padding: 10px 20px;
          border-radius: 10px;
          border: 1px solid rgba(59,130,246,0.2);
          background: transparent;
          color: #64748b;
          font-family: 'Vazirmatn', sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .tab-btn:hover { color: #93c5fd; border-color: rgba(59,130,246,0.4); }
        .tab-btn.active {
          background: rgba(59,130,246,0.12);
          border-color: rgba(59,130,246,0.5);
          color: #60a5fa;
        }

        .result-card {
          background: linear-gradient(145deg,rgba(15,31,61,0.95),rgba(7,13,26,0.98));
          border: 1px solid rgba(59,130,246,0.18);
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 0 40px rgba(29,78,216,0.08);
          animation: fadeIn 0.4s ease forwards;
        }

        .skill-tag {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          background: rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
          color: #93c5fd;
        }

        @media (max-width: 768px) {
          .result-main { padding: 24px 16px !important; }
          .result-grid { grid-template-columns: 1fr !important; }
          .tab-row { gap: 6px !important; flex-wrap: wrap !important; }
          .tab-btn { padding: 8px 14px !important; font-size: 12px !important; }
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
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => router.push("/quiz")}
              style={{
                fontSize: 13, fontWeight: 700, padding: "8px 16px",
                color: "#93c5fd", background: "transparent",
                border: "1px solid rgba(59,130,246,0.25)",
                borderRadius: 10, cursor: "pointer",
                fontFamily: "Vazirmatn, sans-serif",
              }}
            >
              آزمون جدید
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                fontSize: 13, fontWeight: 700, padding: "8px 16px",
                color: "#fff", background: "#1d4ed8",
                border: "none", borderRadius: 10, cursor: "pointer",
                fontFamily: "Vazirmatn, sans-serif",
                boxShadow: "0 4px 16px rgba(29,78,216,0.3)",
              }}
            >
              داشبورد
            </button>
          </div>

          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)",
            color: "#fcd34d", fontSize: 12, fontWeight: 700,
            padding: "5px 14px", borderRadius: 100,
          }}>
            <span style={{
              width: 6, height: 6, background: "#f59e0b", borderRadius: "50%",
              animation: "blink 1.8s ease-in-out infinite", display: "inline-block",
            }} />
            نتیجه آزمون — {query}
          </span>
        </nav>

        <main
          className="result-main"
          style={{
            maxWidth: 900, margin: "0 auto", padding: "48px 24px",
            position: "relative", zIndex: 10,
          }}
        >
          {/* هدر نتیجه */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: "#f8fafc", marginBottom: 12 }}>
              نتیجه{" "}
              <span style={{
                background: "linear-gradient(90deg,#3b82f6,#10b981)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                مسیریابی شغلی
              </span>
            </h1>
            <p style={{
              fontSize: 15, color: "#94a3b8", lineHeight: 1.8,
              maxWidth: 600, margin: "0 auto",
            }}>
              {result.summary}
            </p>
          </div>

          {/* نقاط قوت و بهبود */}
          <div className="result-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
            <div className="result-card">
              <h3 style={{ fontSize: 15, fontWeight: 900, color: "#10b981", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <span>✅</span> نقاط قوت شما
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.strengths?.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ color: "#10b981", fontSize: 14, marginTop: 1, flexShrink: 0 }}>◆</span>
                    <span style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="result-card">
              <h3 style={{ fontSize: 15, fontWeight: 900, color: "#f59e0b", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <span>🎯</span> حوزه‌های بهبود
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.areas_to_improve?.map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ color: "#f59e0b", fontSize: 14, marginTop: 1, flexShrink: 0 }}>◆</span>
                    <span style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6 }}>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* تب‌ها */}
          <div className="tab-row" style={{ display: "flex", gap: 10, marginBottom: 24 }}>
            <button className={`tab-btn ${activeTab === "paths" ? "active" : ""}`} onClick={() => setActiveTab("paths")}>
              🗺️ مسیرهای شغلی
            </button>
            <button className={`tab-btn ${activeTab === "roadmap" ? "active" : ""}`} onClick={() => setActiveTab("roadmap")}>
              📍 نقشه راه
            </button>
            <button className={`tab-btn ${activeTab === "personality" ? "active" : ""}`} onClick={() => setActiveTab("personality")}>
              🧠 تحلیل شخصیت
            </button>
          </div>

          {/* محتوای تب‌ها */}

          {/* مسیرهای شغلی */}
          {activeTab === "paths" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {result.career_paths?.map((path, i) => (
                <div key={i} className="result-card">
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 14 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <span style={{
                          width: 28, height: 28, borderRadius: 8,
                          background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 800, color: "#3b82f6", flexShrink: 0,
                        }}>
                          {i + 1}
                        </span>
                        <h3 style={{ fontSize: 17, fontWeight: 900, color: "#f8fafc" }}>{path.title}</h3>
                      </div>
                      <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7 }}>{path.description}</p>
                    </div>
                    <div style={{ textAlign: "center", flexShrink: 0 }}>
                      <div style={{
                        width: 60, height: 60, borderRadius: "50%",
                        background: `conic-gradient(${getMatchColor(path.match_percentage)} ${path.match_percentage * 3.6}deg, rgba(59,130,246,0.1) 0deg)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        position: "relative",
                      }}>
                        <div style={{
                          width: 46, height: 46, borderRadius: "50%",
                          background: "rgba(7,13,26,0.95)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 13, fontWeight: 900, color: getMatchColor(path.match_percentage),
                        }}>
                          {path.match_percentage}٪
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>تطابق</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {path.required_skills?.map((skill, j) => (
                        <span key={j} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                    {path.avg_salary && (
                      <div style={{
                        fontSize: 12, fontWeight: 700, color: "#10b981",
                        background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
                        padding: "4px 12px", borderRadius: 100,
                      }}>
                        💰 {path.avg_salary}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* نقشه راه */}
          {activeTab === "roadmap" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {result.roadmap?.map((phase, i) => (
                <div key={i} style={{ display: "flex", gap: 16, position: "relative" }}>
                  {/* خط عمودی */}
                  {i < result.roadmap.length - 1 && (
                    <div style={{
                      position: "absolute", right: 19, top: 40, bottom: -16,
                      width: 2, background: "rgba(59,130,246,0.2)", zIndex: 0,
                    }} />
                  )}
                  {/* دایره */}
                  <div style={{ flexShrink: 0, position: "relative", zIndex: 1 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: "linear-gradient(135deg,rgba(29,78,216,0.4),rgba(16,185,129,0.2))",
                      border: "2px solid rgba(59,130,246,0.4)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 900, color: "#3b82f6",
                    }}>
                      {i + 1}
                    </div>
                  </div>
                  {/* محتوا */}
                  <div className="result-card" style={{ flex: 1, marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 900, color: "#f8fafc" }}>
                        {phase.phase} — {phase.title}
                      </h3>
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: "#f59e0b",
                        background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)",
                        padding: "3px 10px", borderRadius: 100,
                      }}>
                        ⏱ {phase.duration}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {phase.steps?.map((step, j) => (
                        <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                          <span style={{
                            width: 18, height: 18, borderRadius: 6, flexShrink: 0,
                            background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 9, fontWeight: 800, color: "#3b82f6", marginTop: 1,
                          }}>
                            {j + 1}
                          </span>
                          <span style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6 }}>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* تحلیل شخصیت */}
          {activeTab === "personality" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {result.personality_traits?.map((trait, i) => (
                <div key={i} className="result-card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 900, color: "#f8fafc", marginBottom: 4 }}>{trait.trait}</h3>
                      <p style={{ fontSize: 13, color: "#94a3b8" }}>{trait.description}</p>
                    </div>
                    <div style={{
                      fontSize: 18, fontWeight: 900, color: getMatchColor(trait.score),
                      flexShrink: 0, marginRight: 16,
                    }}>
                      {trait.score}٪
                    </div>
                  </div>
                  <div style={{ height: 6, background: "rgba(59,130,246,0.1)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${trait.score}%`,
                      background: `linear-gradient(90deg,${getMatchColor(trait.score)},${getMatchColor(trait.score)}88)`,
                      borderRadius: 3,
                      transition: "width 1s ease",
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* دکمه‌های پایین */}
          <div style={{ display: "flex", gap: 12, marginTop: 40, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => router.push("/quiz")}
              style={{
                background: "transparent", color: "#93c5fd",
                border: "1px solid rgba(59,130,246,0.3)", borderRadius: 12,
                padding: "12px 28px", fontSize: 14, fontWeight: 800,
                cursor: "pointer", fontFamily: "Vazirmatn, sans-serif",
                transition: "all 0.2s",
              }}
            >
              آزمون جدید
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                background: "linear-gradient(135deg,#1d4ed8,#1e40af)",
                color: "#fff", border: "none", borderRadius: 12,
                padding: "12px 28px", fontSize: 14, fontWeight: 800,
                cursor: "pointer", fontFamily: "Vazirmatn, sans-serif",
                boxShadow: "0 8px 32px rgba(29,78,216,0.35)",
                transition: "all 0.2s",
              }}
            >
              مشاهده در داشبورد
            </button>
          </div>
        </main>
      </div>
    </>
  );
}
