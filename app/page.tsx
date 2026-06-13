"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function CareerHub() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartAnalysis = () => {
    setIsLoading(true);
    // ایجاد وقفه کوتاه برای اجرای کامل افکت کشیده شدن صفحه به چپ
    setTimeout(() => {
      router.push("/quiz");
    }, 550);
  };

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

    const STAR_COUNT = 120;
    const PARTICLE_COUNT = 40;

    const stars = Array.from({ length: STAR_COUNT }, () => ({
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
      const colors = [
        "rgba(59,130,246,",
        "rgba(16,185,129,",
        "rgba(245,158,11,",
        "rgba(99,102,241,",
      ];
      const c = colors[Math.floor(Math.random() * colors.length)];
      return {
        x: Math.random() * (cv?.width || 800),
        y: Math.random() * (cv?.height || 600),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
        color: c,
        a: Math.random() * 0.6 + 0.2,
        life: 0,
        maxLife: Math.random() * 300 + 200,
      };
    }

    let particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, makeParticle);
    let t = 0;

    function draw() {
      if (!cv || !ctx) return;
      t++;
      ctx.clearRect(0, 0, cv.width, cv.height);

      const g1 = ctx.createRadialGradient(
        cv.width * 0.2, cv.height * 0.3, 0,
        cv.width * 0.2, cv.height * 0.3, cv.width * 0.45
      );
      g1.addColorStop(0, "rgba(29,78,216,0.07)");
      g1.addColorStop(1, "transparent");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, cv.width, cv.height);

      const g2 = ctx.createRadialGradient(
        cv.width * 0.8, cv.height * 0.65, 0,
        cv.width * 0.8, cv.height * 0.65, cv.width * 0.5
      );
      g2.addColorStop(0, "rgba(16,185,129,0.05)");
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
        if (
          p.life > p.maxLife ||
          p.x < -10 || p.x > (cv?.width || 0) + 10 ||
          p.y < -10 || p.y > (cv?.height || 0) + 10
        ) {
          particles[i] = makeParticle();
          return;
        }
        const fade =
          p.life < 30 ? p.life / 30
          : p.life > p.maxLife - 30 ? (p.maxLife - p.life) / 30
          : 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.a * fade + ")";
        ctx.fill();
      });

      const scanY = (t * 0.5) % cv.height;
      const sg = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
      sg.addColorStop(0, "transparent");
      sg.addColorStop(0.5, "rgba(59,130,246,0.025)");
      sg.addColorStop(1, "transparent");
      ctx.fillStyle = sg;
      ctx.fillRect(0, scanY - 30, cv.width, 60);

      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  const stats = [
    { num: "+۲۴۰۰", lbl: "مسیر شغلی", color: "#3b82f6" },
    { num: "۵ دقیقه", lbl: "زمان تحلیل", color: "#f59e0b" },
    { num: "%۹۴",   lbl: "دقت نتایج",  color: "#10b981" },
  ];

  const steps = [
    { n: "۱", lbl: "پرسش‌نامه", color: "#3b82f6", border: "rgba(59,130,246,0.4)" },
    { n: "۲", lbl: "تحلیل AI",  color: "#f59e0b", border: "rgba(245,158,11,0.4)"  },
    { n: "۳", lbl: "نتیجه",     color: "#10b981", border: "rgba(16,185,129,0.4)"  },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700;900&display=swap');
        @keyframes blink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.7); }
        }
        .start-btn:hover {
          transform: translateY(-2px) scale(1.01) !important;
          box-shadow: 0 12px 40px rgba(29,78,216,0.5) !important;
        }
        .start-btn:active { transform: scale(0.99) !important; }
        
        /* کلاس‌های انیمیشن نرم برای خروج هماهنگ */
        .page-wrap {
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-in-out;
        }
        .slide-out-active {
          transform: translateX(100%) scale(0.98);
          opacity: 0;
        }
      `}</style>

      <div
        ref={wrapRef}
        className={`page-wrap ${isLoading ? "slide-out-active" : ""}`}
        style={{
          minHeight: "100vh", width: "100%", background: "#070d1a",
          fontFamily: "Vazirmatn, sans-serif", direction: "rtl",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          position: "relative", overflow: "hidden", padding: "40px 20px",
        }}
      >
        {/* Canvas background */}
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        />

        {/* Badge */}
        <div style={{ position: "relative", zIndex: 10, marginBottom: 20 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)",
            color: "#fcd34d", fontSize: 12, fontWeight: 700,
            padding: "5px 14px", borderRadius: 100, letterSpacing: "0.05em",
          }}>
            <span style={{
              width: 6, height: 6, background: "#f59e0b", borderRadius: "50%",
              animation: "blink 1.8s ease-in-out infinite", display: "inline-block",
            }} />
            هوش مصنوعی مسیریاب شغلی
          </span>
        </div>

        {/* Card */}
        <div style={{
          position: "relative", zIndex: 10, width: "100%", maxWidth: 460, textAlign: "center",
          background: "linear-gradient(145deg,rgba(15,31,61,0.95),rgba(7,13,26,0.98))",
          border: "1px solid rgba(59,130,246,0.18)", borderRadius: 24, padding: "40px 44px",
          boxShadow: "0 0 60px rgba(29,78,216,0.12), 0 0 0 1px rgba(255,255,255,0.04) inset",
        }}>

          {/* Icon */}
          <div style={{
            width: 64, height: 64, borderRadius: 18, margin: "0 auto 24px",
            background: "linear-gradient(135deg,rgba(29,78,216,0.3),rgba(16,185,129,0.2))",
            border: "1px solid rgba(59,130,246,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, boxShadow: "0 0 24px rgba(59,130,246,0.2)",
          }}>
            🎯
          </div>

          {/* Title */}
          <h1 style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.25, color: "#f8fafc", marginBottom: 10 }}>
            سامانه{" "}
            <span style={{
              background: "linear-gradient(90deg,#3b82f6,#10b981)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              هدایت مسیر
            </span>
            <br />شغلی من
          </h1>

          <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7, marginBottom: 28 }}>
            با پاسخ به چند سؤال هوشمند، بهترین مسیر شغلی متناسب با علاقه، مهارت و هدف‌هایت رو پیدا کن.
          </p>

          {/* Stats */}
          <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
            {stats.map((s) => (
              <div key={s.lbl} style={{
                flex: 1,
                background: "rgba(59,130,246,0.06)",
                border: "1px solid rgba(59,130,246,0.12)",
                borderRadius: 12, padding: "10px 8px",
              }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: s.color }}>{s.num}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{s.lbl}</div>
              </div>
            ))}
          </div>

          {/* Button */}
          <button
            className="start-btn"
            onClick={handleStartAnalysis}
            disabled={isLoading}
            style={{
              width: "100%",
              background: "linear-gradient(135deg,#1d4ed8,#1e40af)",
              color: "#fff", border: "none", borderRadius: 14,
              padding: "14px 20px",
              fontFamily: "Vazirmatn, sans-serif", fontSize: 16, fontWeight: 900,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              boxShadow: "0 8px 32px rgba(29,78,216,0.35)",
              transition: "transform 0.18s, box-shadow 0.18s",
            }}
          >
            {isLoading ? "در حال پردازش..." : "شروع تحلیل رایگان ←"}
          </button>

          {/* Steps */}
          <div style={{ display: "flex", alignItems: "center", marginTop: 20 }}>
            {steps.map((step, idx) => (
              <div key={step.n} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative" }}>
                {idx > 0 && (
                  <div style={{ position: "absolute", top: 11, right: 0, width: "calc(50% - 11px)", height: 1, background: "rgba(59,130,246,0.2)" }} />
                )}
                {idx < steps.length - 1 && (
                  <div style={{ position: "absolute", top: 11, left: 0, width: "calc(50% - 11px)", height: 1, background: "rgba(59,130,246,0.2)" }} />
                )}
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: "rgba(59,130,246,0.1)",
                  border: `1px solid ${step.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700, color: step.color,
                }}>
                  {step.n}
                </div>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>{step.lbl}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
