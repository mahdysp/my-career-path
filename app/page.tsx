"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function CareerHub() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartAnalysis = () => {
    if (isLoading) return;
    setIsLoading(true);
    timeoutRef.current = setTimeout(() => {
      router.push("/quiz");
    }, 600);
  };

  // Animated canvas background
  useEffect(() => {
    const cv = canvasRef.current;
    const wrap = wrapRef.current;
    if (!cv || !wrap) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let width = wrap.clientWidth;
    let height = wrap.clientHeight;

    const resize = () => {
      if (!cv || !wrap) return;
      width = wrap.clientWidth;
      height = wrap.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      cv.width = width * dpr;
      cv.height = height * dpr;
      cv.style.width = `${width}px`;
      cv.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const STAR_COUNT = 90;
    const PARTICLE_COUNT = 28;

    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.4 + 0.25,
      a: Math.random() * 0.7 + 0.2,
      speed: Math.random() * 0.02 + 0.004,
      phase: Math.random() * Math.PI * 2,
    }));

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      color: string;
      a: number;
      life: number;
      maxLife: number;
    };

    const makeParticle = (): Particle => {
      const colors = [
        "rgba(0,255,136,",
        "rgba(255,0,255,",
        "rgba(0,212,255,",
      ];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        a: Math.random() * 0.5 + 0.15,
        life: 0,
        maxLife: Math.random() * 220 + 160,
      };
    };

    let particles: Particle[] = Array.from(
      { length: PARTICLE_COUNT },
      makeParticle
    );

    let t = 0;
    const draw = () => {
      t += 1;
      ctx.clearRect(0, 0, width, height);

      // Ambient glows
      const g1 = ctx.createRadialGradient(
        width * 0.2,
        height * 0.22,
        0,
        width * 0.2,
        height * 0.22,
        width * 0.45
      );
      g1.addColorStop(0, "rgba(0,255,136,0.09)");
      g1.addColorStop(1, "transparent");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, width, height);

      const g2 = ctx.createRadialGradient(
        width * 0.82,
        height * 0.72,
        0,
        width * 0.82,
        height * 0.72,
        width * 0.5
      );
      g2.addColorStop(0, "rgba(255,0,255,0.06)");
      g2.addColorStop(1, "transparent");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, width, height);

      // Stars
      stars.forEach((s) => {
        s.phase += s.speed;
        const alpha = s.a * (0.55 + 0.45 * Math.sin(s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,255,230,${alpha})`;
        ctx.fill();
      });

      // Particle links
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,255,136,${0.06 * (1 - d / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Particles
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        if (
          p.life > p.maxLife ||
          p.x < -10 || p.x > width + 10 ||
          p.y < -10 || p.y > height + 10
        ) {
          particles[i] = makeParticle();
          return;
        }

        const fade =
          p.life < 30
            ? p.life / 30
            : p.life > p.maxLife - 30
            ? (p.maxLife - p.life) / 30
            : 1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.a * fade})`;
        ctx.fill();
      });

      // Scanning line
      const scanY = (t * 1.8) % height;
      const scanGlow = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
      scanGlow.addColorStop(0, "transparent");
      scanGlow.addColorStop(0.5, "rgba(0,212,255,0.08)");
      scanGlow.addColorStop(1, "transparent");
      ctx.fillStyle = scanGlow;
      ctx.fillRect(0, scanY - 20, width, 40);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = [
    { num: "+۲۴۰۰", lbl: "مسیر شغلی", color: "#00ff88" },
    { num: "۵ دقیقه", lbl: "زمان تحلیل", color: "#ff00ff" },
    { num: "%۹۴", lbl: "دقت نتایج", color: "#00d4ff" },
  ];

  const steps = [
    { n: "۱", lbl: "پرسش‌نامه", color: "#00ff88" },
    { n: "۲", lbl: "تحلیل AI", color: "#ff00ff" },
    { n: "۳", lbl: "نتیجه", color: "#00d4ff" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700;800;900&display=swap');

        :root {
          --bg: #0a0a0f;
          --fg: #e0e0e0;
          --card: #12121a;
          --muted: #1c1c2e;
          --muted-fg: #8b93a7;
          --accent: #00ff88;
          --accent-2: #ff00ff;
          --accent-3: #00d4ff;
        }

        @keyframes blink { 50% { opacity: 0; } }
        @keyframes titleGlitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(1px, -1px); }
          40% { transform: translate(-1px, 1px); }
          60% { transform: translate(0.5px, 0); }
          80% { transform: translate(-0.5px, 0.5px); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 rgba(0,255,136,0), 0 0 18px rgba(0,255,136,0.08); }
          50% { box-shadow: 0 0 0 rgba(0,255,136,0), 0 0 28px rgba(0,255,136,0.16); }
        }
        @keyframes scanMove {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        .cyber-scanlines::after {
          content: "";
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent 0px,
            transparent 2px,
            rgba(0, 0, 0, 0.28) 2px,
            rgba(0, 0, 0, 0.28) 4px
          );
          pointer-events: none;
          opacity: 0.35;
          z-index: 2;
        }
        .cyber-grid {
          background-image:
            linear-gradient(rgba(0, 255, 136, 0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.045) 1px, transparent 1px);
          background-size: 42px 42px;
        }
        .cyber-chamfer {
          clip-path: polygon(
            0 12px, 12px 0, calc(100% - 12px) 0, 100% 12px,
            100% calc(100% - 12px), calc(100% - 12px) 100%,
            12px 100%, 0 calc(100% - 12px)
          );
        }
        .cyber-chamfer-sm {
          clip-path: polygon(
            0 9px, 9px 0, calc(100% - 9px) 0, 100% 9px,
            100% calc(100% - 9px), calc(100% - 9px) 100%,
            9px 100%, 0 calc(100% - 9px)
          );
        }
        .cyber-title {
          position: relative;
          display: inline-block;
          color: var(--accent);
          text-shadow: 0 0 10px rgba(0,255,136,0.35), 0 0 18px rgba(0,255,136,0.16);
          animation: titleGlitch 5.5s infinite steps(2, end);
        }
        .cyber-title::before,
        .cyber-title::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.45;
        }
        .cyber-title::before { transform: translateX(1px); color: var(--accent-2); }
        .cyber-title::after { transform: translateX(-1px); color: var(--accent-3); }

        .terminal-cursor {
          display: inline-block;
          width: 8px;
          height: 1em;
          margin-right: 6px;
          background: var(--accent);
          vertical-align: -2px;
          animation: blink 1s step-end infinite;
        }
        .start-btn {
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }
        .start-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 20%, transparent 45%);
          opacity: 0.7;
          pointer-events: none;
        }
        .start-btn:hover::before { transform: translateX(110%); transition: transform 550ms ease; }
        .start-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 8px rgba(0,255,136,0.75), 0 0 24px rgba(0,255,136,0.2), inset 0 0 0 1px rgba(255,255,255,0.06) !important;
          filter: brightness(1.05);
        }
        .start-btn:active { transform: translateY(0) scale(0.995); }
        .hud-card {
          transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
          animation: pulseGlow 4.5s ease-in-out infinite;
        }
        .hud-card:hover {
          transform: translateY(-2px);
          border-color: rgba(0,255,136,0.55) !important;
          box-shadow: 0 0 8px rgba(0,255,136,0.25), 0 0 28px rgba(0,255,136,0.08), inset 0 0 0 1px rgba(255,255,255,0.03);
        }
        .step-node { transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease; }
        .step-node:hover { transform: translateY(-1px); box-shadow: 0 0 12px rgba(0,255,136,0.18); }
        .scanner {
          position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 1;
        }
        .scanner::before {
          content: "";
          position: absolute; top: -20%; left: 0; right: 0; height: 16%;
          background: linear-gradient(to bottom, transparent, rgba(0, 212, 255, 0.035), transparent);
          animation: scanMove 7.5s linear infinite;
        }
        .focus-neon:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px rgba(10,10,15,1), 0 0 0 4px rgba(0,255,136,0.6), 0 0 16px rgba(0,255,136,0.22);
        }
        @media (prefers-reduced-motion: reduce) {
          .cyber-title, .scanner::before, .terminal-cursor, .hud-card, .start-btn::before {
            animation: none !important; transition: none !important;
          }
        }
      `}</style>

      <div
        ref={wrapRef}
        className="cyber-scanlines cyber-grid"
        style={{
          minHeight: "100vh",
          width: "100%",
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 20% 20%, rgba(0,255,136,0.08), transparent 28%), radial-gradient(circle at 80% 70%, rgba(255,0,255,0.08), transparent 30%), linear-gradient(180deg, #090a10 0%, #0a0a0f 52%, #06070c 100%)",
          fontFamily: "Vazirmatn, sans-serif",
          direction: "rtl",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.015), transparent 60%)",
            mixBlendMode: "screen",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div className="scanner" />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div style={{ position: "relative", zIndex: 10, marginBottom: 18 }}>
          <span
            className="cyber-chamfer-sm"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 16px",
              border: "1px solid rgba(0,255,136,0.35)",
              background: "rgba(0,255,136,0.08)",
              color: "#b6ffd9",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.06em",
              boxShadow: "0 0 14px rgba(0,255,136,0.08)",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#00ff88",
                boxShadow: "0 0 8px rgba(0,255,136,0.9)",
                display: "inline-block",
              }}
            />
            SYSTEM: AI CAREER ROUTER
          </span>
        </div>

        <div
          className="cyber-chamfer hud-card"
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: 500,
            textAlign: "center",
            background:
              "linear-gradient(145deg, rgba(18,18,26,0.96), rgba(8,10,16,0.98))",
            border: "1px solid rgba(0,255,136,0.24)",
            padding: "42px 28px 30px",
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.03) inset, 0 0 24px rgba(0,255,136,0.06)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 14,
              display: "flex",
              gap: 6,
              opacity: 0.9,
            }}
          >
            {["#ff3366", "#ffd000", "#00ff88"].map((c) => (
              <span
                key={c}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: c,
                  boxShadow: `0 0 8px ${c}`,
                  display: "inline-block",
                }}
              />
            ))}
          </div>

          <div
            style={{
              width: 74,
              height: 74,
              margin: "0 auto 22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(0,212,255,0.35)",
              background:
                "linear-gradient(135deg, rgba(0,212,255,0.12), rgba(0,255,136,0.1))",
              boxShadow:
                "0 0 14px rgba(0,212,255,0.12), inset 0 0 24px rgba(255,255,255,0.03)",
              clipPath:
                "polygon(0 12px, 12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px))",
              fontSize: 30,
            }}
          >
            🎯
          </div>

          <div
            style={{
              fontSize: 11,
              color: "#7fffd1",
              letterSpacing: "0.22em",
              marginBottom: 10,
              fontWeight: 800,
            }}
          >
            [ CAREER / ANALYSIS / HUB ]
          </div>

          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.1rem)",
              lineHeight: 1.18,
              color: "#f3f6fb",
              margin: "0 0 12px",
              fontWeight: 900,
            }}
          >
            سامانه{" "}
            <span className="cyber-title" data-text="هدایت مسیر">
              هدایت مسیر
            </span>
            <br />
            شغلی من
          </h1>

          <p
            style={{
              fontSize: 14,
              color: "#9aa4ba",
              lineHeight: 1.9,
              marginBottom: 26,
            }}
          >
            <span style={{ color: "#00ff88", fontWeight: 800 }}>›</span> با پاسخ
            به چند سؤال هوشمند، بهترین مسیر شغلی متناسب با علاقه، مهارت و
            هدف‌هایت را پیدا کن.
            <span className="terminal-cursor" />
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 10,
              marginBottom: 26,
            }}
          >
            {stats.map((s) => (
              <div
                key={s.lbl}
                className="cyber-chamfer-sm"
                style={{
                  background: "rgba(28,28,46,0.66)",
                  border: `1px solid ${s.color}33`,
                  padding: "12px 8px",
                  boxShadow: `0 0 10px ${s.color}10 inset`,
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: s.color,
                    textShadow: `0 0 10px ${s.color}55`,
                  }}
                >
                  {s.num}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#8b93a7",
                    marginTop: 4,
                    letterSpacing: "0.03em",
                  }}
                >
                  {s.lbl}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleStartAnalysis}
            disabled={isLoading}
            aria-busy={isLoading}
            className="start-btn cyber-chamfer-sm focus-neon"
            style={{
              width: "100%",
              minHeight: 52,
              border: "1px solid rgba(0,255,136,0.5)",
              background:
                "linear-gradient(135deg, rgba(0,255,136,0.92), rgba(0,212,255,0.88))",
              color: "#071018",
              padding: "14px 18px",
              fontFamily: "Vazirmatn, sans-serif",
              fontSize: 16,
              fontWeight: 900,
              letterSpacing: "0.04em",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.76 : 1,
              boxShadow:
                "0 0 8px rgba(0,255,136,0.35), 0 0 26px rgba(0,255,136,0.14), inset 0 0 0 1px rgba(255,255,255,0.08)",
              transition: "all 160ms ease",
            }}
          >
            {isLoading ? "در حال پردازش..." : "شروع تحلیل رایگان ←"}
          </button>

          <div
            style={{
              marginTop: 12,
              fontSize: 11,
              color: "#76819c",
              letterSpacing: "0.04em",
            }}
          >
            بدون ثبت‌نام • کمتر از ۵ دقیقه • خروجی شخصی‌سازی‌شده
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              marginTop: 24,
              gap: 8,
            }}
          >
            {steps.map((step, idx) => (
              <div
                key={step.n}
                style={{
                  flex: 1,
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {idx > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 13,
                      right: "50%",
                      width: "calc(100% - 32px)",
                      height: 1,
                      background:
                        "linear-gradient(90deg, rgba(0,255,136,0.28), rgba(0,212,255,0.12))",
                    }}
                  />
                )}
                <div
                  className="step-node cyber-chamfer-sm"
                  style={{
                    minWidth: 34,
                    height: 28,
                    padding: "0 10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(10,10,15,0.86)",
                    border: `1px solid ${step.color}66`,
                    color: step.color,
                    fontSize: 12,
                    fontWeight: 900,
                    boxShadow: `0 0 10px ${step.color}1a`,
                  }}
                >
                  {step.n}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#8b93a7",
                    textAlign: "center",
                    lineHeight: 1.5,
                  }}
                >
                  {step.lbl}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function CareerHub() {
  const router = useRouter();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const stats = [
    { num: "+۲۴۰۰", lbl: "مسیر شغلی" },
    { num: "۵ دقیقه", lbl: "زمان تحلیل" },
    { num: "%۹۴", lbl: "دقت نتایج" },
  ];

  const steps = [
    { n: "۱", lbl: "پرسش‌نامه" },
    { n: "۲", lbl: "تحلیل AI" },
    { n: "۳", lbl: "نتیجه" },
  ];

  const handleStartAnalysis = () => {
    if (isLoading) return;

    setIsLoading(true);

    timeoutRef.current = setTimeout(() => {
      router.push("/quiz");
    }, 600);
  };

  const handleCardMouseMove = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const el = cardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  useEffect(() => {
    const cv = canvasRef.current;
    const wrap = wrapRef.current;
    if (!cv || !wrap) return;

    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let width = wrap.clientWidth;
    let height = wrap.clientHeight;

    const resize = () => {
      if (!cv || !wrap || !ctx) return;

      width = wrap.clientWidth;
      height = wrap.clientHeight;

      const dpr = window.devicePixelRatio || 1;
      cv.width = width * dpr;
      cv.height = height * dpr;
      cv.style.width = `${width}px`;
      cv.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const STAR_COUNT = 70;
    const PARTICLE_COUNT = 18;

    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.2 + 0.2,
      a: Math.random() * 0.45 + 0.1,
      speed: Math.random() * 0.012 + 0.003,
      phase: Math.random() * Math.PI * 2,
    }));

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      a: number;
      life: number;
      maxLife: number;
    };

    const makeParticle = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      r: Math.random() * 1.8 + 0.8,
      a: Math.random() * 0.25 + 0.08,
      life: 0,
      maxLife: Math.random() * 220 + 140,
    });

    let particles: Particle[] = Array.from(
      { length: PARTICLE_COUNT },
      makeParticle
    );

    let t = 0;

    const draw = () => {
      t++;
      ctx.clearRect(0, 0, width, height);

      const g1 = ctx.createRadialGradient(
        width * 0.5,
        height * 0.15,
        0,
        width * 0.5,
        height * 0.15,
        width * 0.55
      );
      g1.addColorStop(0, "rgba(94,106,210,0.10)");
      g1.addColorStop(1, "transparent");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, width, height);

      const g2 = ctx.createRadialGradient(
        width * 0.2,
        height * 0.5,
        0,
        width * 0.2,
        height * 0.5,
        width * 0.35
      );
      g2.addColorStop(0, "rgba(124,58,237,0.06)");
      g2.addColorStop(1, "transparent");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, width, height);

      stars.forEach((s) => {
        s.phase += s.speed;
        const alpha = s.a * (0.6 + 0.4 * Math.sin(s.phase));

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(237,237,239,${alpha})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.hypot(dx, dy);

          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(94,106,210,${0.05 * (1 - d / 120)})`;
            ctx.lineWidth = 0.6;
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
          p.x < -20 ||
          p.x > width + 20 ||
          p.y < -20 ||
          p.y > height + 20
        ) {
          particles[i] = makeParticle();
          return;
        }

        const fade =
          p.life < 24
            ? p.life / 24
            : p.life > p.maxLife - 24
            ? (p.maxLife - p.life) / 24
            : 1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(104,114,217,${p.a * fade})`;
        ctx.fill();
      });

      const scanY = (t * 0.7) % height;
      const scan = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
      scan.addColorStop(0, "transparent");
      scan.addColorStop(0.5, "rgba(94,106,210,0.035)");
      scan.addColorStop(1, "transparent");
      ctx.fillStyle = scan;
      ctx.fillRect(0, scanY - 20, width, 40);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [router]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Vazirmatn:wght@400;500;700;800;900&display=swap');

        :root {
          --bg-deep: #020203;
          --bg-base: #050506;
          --bg-elevated: #0a0a0c;
          --surface: rgba(255,255,255,0.05);
          --surface-hover: rgba(255,255,255,0.08);
          --fg: #EDEDEF;
          --fg-muted: #8A8F98;
          --accent: #5E6AD2;
          --accent-bright: #6872D9;
          --border: rgba(255,255,255,0.06);
          --border-hover: rgba(255,255,255,0.10);
        }

        @keyframes floatOne {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -18px, 0); }
        }

        @keyframes floatTwo {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(14px, -12px, 0); }
        }

        @keyframes pulseBlob {
          0%, 100% { opacity: 0.12; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.03); }
        }

        @keyframes shine {
          from { transform: translateX(-160%) skewX(-18deg); }
          to { transform: translateX(220%) skewX(-18deg); }
        }

        .page-shell {
          font-family: "Vazirmatn", "Inter", system-ui, sans-serif;
          color: var(--fg);
        }

        .grid-overlay {
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 64px 64px;
          opacity: 0.22;
          pointer-events: none;
        }

        .noise-overlay {
          background:
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.02), transparent 30%),
            radial-gradient(circle at 80% 30%, rgba(255,255,255,0.015), transparent 25%),
            radial-gradient(circle at 50% 80%, rgba(255,255,255,0.015), transparent 25%);
         "use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function CareerHub() {
  const router = useRouter();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const handleStartAnalysis = () => {
    if (isLoading) return;

    setIsLoading(true);

    timeoutRef.current = setTimeout(() => {
      router.push("/quiz");
    }, 600);
  };

  const handleCardMouseMove = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const el = cardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  useEffect(() => {
    const cv = canvasRef.current;
    const wrap = wrapRef.current;
    if (!cv || !wrap) return;

    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let bounds = {
      width: wrap.clientWidth,
      height: wrap.clientHeight,
    };

    function resize() {
      if (!cv || !wrap || !ctx) return;

      bounds = {
        width: wrap.clientWidth,
        height: wrap.clientHeight,
      };

      const dpr = window.devicePixelRatio || 1;

      cv.width = bounds.width * dpr;
      cv.height = bounds.height * dpr;
      cv.style.width = `${bounds.width}px`;
      cv.style.height = `${bounds.height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    const STAR_COUNT = 72;
    const PARTICLE_COUNT = 20;

    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * bounds.width,
      y: Math.random() * bounds.height,
      r: Math.random() * 1.1 + 0.25,
      a: Math.random() * 0.45 + 0.12,
      speed: Math.random() * 0.012 + 0.003,
      phase: Math.random() * Math.PI * 2,
    }));

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      a: number;
      life: number;
      maxLife: number;
    };

    function makeParticle(): Particle {
      return {
        x: Math.random() * bounds.width,
        y: Math.random() * bounds.height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.8 + 0.8,
        a: Math.random() * 0.25 + 0.08,
        life: 0,
        maxLife: Math.random() * 260 + 150,
      };
    }

    let particles: Particle[] = Array.from(
      { length: PARTICLE_COUNT },
      makeParticle
    );

    let t = 0;

    function draw() {
      if (!ctx) return;

      t += 1;
      ctx.clearRect(0, 0, bounds.width, bounds.height);

      const ambientTop = ctx.createRadialGradient(
        bounds.width * 0.5,
        bounds.height * 0.12,
        0,
        bounds.width * 0.5,
        bounds.height * 0.12,
        bounds.width * 0.55
      );
      ambientTop.addColorStop(0, "rgba(94,106,210,0.10)");
      ambientTop.addColorStop(1, "transparent");
      ctx.fillStyle = ambientTop;
      ctx.fillRect(0, 0, bounds.width, bounds.height);

      const ambientSide = ctx.createRadialGradient(
        bounds.width * 0.18,
        bounds.height * 0.48,
        0,
        bounds.width * 0.18,
        bounds.height * 0.48,
        bounds.width * 0.38
      );
      ambientSide.addColorStop(0, "rgba(124,58,237,0.07)");
      ambientSide.addColorStop(1, "transparent");
      ctx.fillStyle = ambientSide;
      ctx.fillRect(0, 0, bounds.width, bounds.height);

      stars.forEach((s) => {
        s.phase += s.speed;
        const alpha = s.a * (0.65 + 0.35 * Math.sin(s.phase));

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(237,237,239,${alpha})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.hypot(dx, dy);

          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(94,106,210,${0.05 * (1 - d / 120)})`;
            ctx.lineWidth = 0.6;
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
          p.x < -20 ||
          p.x > bounds.width + 20 ||
          p.y < -20 ||
          p.y > bounds.height + 20
        ) {
          particles[i] = makeParticle();
          return;
        }

        const fade =
          p.life < 24
            ? p.life / 24
            : p.life > p.maxLife - 24
            ? (p.maxLife - p.life) / 24
            : 1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(104,114,217,${p.a * fade})`;
        ctx.fill();
      });

      const sweepY = (t * 0.7) % bounds.height;
      const sweep = ctx.createLinearGradient(0, sweepY - 22, 0, sweepY + 22);
      sweep.addColorStop(0, "transparent");
      sweep.addColorStop(0.5, "rgba(94,106,210,0.035)");
      sweep.addColorStop(1, "transparent");
      ctx.fillStyle = sweep;
      ctx.fillRect(0, sweepY - 22, bounds.width, 44);

      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [router]);

  const stats = [
    { num: "+۲۴۰۰", lbl: "مسیر شغلی" },
    { num: "۵ دقیقه", lbl: "زمان تحلیل" },
    { num: "use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function CareerHub() {
  const router = useRouter();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const handleStartAnalysis = () => {
    if (isLoading) return;
    setIsLoading(true);

    timeoutRef.current = setTimeout(() => {
      router.push("/quiz");
    }, 600);
  };

  useEffect(() => {
    const cv = canvasRef.current;
    const wrap = wrapRef.current;
    if (!cv || !wrap) return;

    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let bounds = {
      width: wrap.clientWidth,
      height: wrap.clientHeight,
    };

    function resize() {
      if (!cv || !wrap || !ctx) return;

      bounds = {
        width: wrap.clientWidth,
        height: wrap.clientHeight,
      };

      const dpr = window.devicePixelRatio || 1;
      cv.width = bounds.width * dpr;
      cv.height = bounds.height * dpr;
      cv.style.width = `${bounds.width}px`;
      cv.style.height = `${bounds.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    const STAR_COUNT = 90;
    const PARTICLE_COUNT = 28;

    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * bounds.width,
      y: Math.random() * bounds.height,
      r: Math.random() * 1.4 + 0.25,
      a: Math.random() * 0.7 + 0.2,
      speed: Math.random() * 0.02 + 0.004,
      phase: Math.random() * Math.PI * 2,
    }));

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      color: string;
      a: number;
      life: number;
      maxLife: number;
    };

    function makeParticle(): Particle {
      const colors = [
        "rgba(0,255,136,",
        "rgba(255,0,255,",
        "rgba(0,212,255,",
      ];

      const color = colors[Math.floor(Math.random() * colors.length)];

      return {
        x: Math.random() * bounds.width,
        y: Math.random() * bounds.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.8,
        color,
        a: Math.random() * 0.5 + 0.15,
        life: 0,
        maxLife: Math.random() * 220 + 160,
      };
    }

    let particles: Particle[] = Array.from(
      { length: PARTICLE_COUNT },
      makeParticle
    );

    let t = 0;

    function draw() {
      if (!ctx) return;

      t += 1;
      ctx.clearRect(0, 0, bounds.width, bounds.height);

      const g1 = ctx.createRadialGradient(
        bounds.width * 0.2,
        bounds.height * 0.22,
        0,
        bounds.width * 0.2,
        bounds.height * 0.22,
        bounds.width * 0.45
      );
      g1.addColorStop(0, "rgba(0,255,136,0.09)");
      g1.addColorStop(1, "transparent");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, bounds.width, bounds.height);

      const g2 = ctx.createRadialGradient(
        bounds.width * 0.82,
        bounds.height * 0.72,
        0,
        bounds.width * 0.82,
        bounds.height * 0.72,
        bounds.width * 0.5
      );
      g2.addColorStop(0, "rgba(255,0,255,0.06)");
      g2.addColorStop(1, "transparent");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, bounds.width, bounds.height);

      stars.forEach((s) => {
        s.phase += s.speed;
        const alpha = s.a * (0.55 + 0.45 * Math.sin(s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,255,230,${alpha})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);

          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,255,136,${0.06 * (1 - d / 110)})`;
            ctx.lineWidth = 0.6;
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
          p.x < -10 ||
          p.x > bounds.width + 10 ||
          p.y < -10 ||
          p.y > bounds.height + 10
        ) {
          particles[i] = makeParticle();
          return;
        }

        const fade =
          p.life < 30
            ? p.life / 30
            : p.life > p.maxLife - 30
            ? (p.maxLife - p.life) / 30
            : 1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.a * fade})`;
        ctx.fill();
      });

      const scanY = (t * 1.8) % bounds.height;
      const scanGlow = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
      scanGlow.addColorStop(0, "transparent");
      scanGlow.addColorStop(0.5, "rgba(0,212,255,0.08)");
      scanGlow.addColorStop(1, "transparent");
      ctx.fillStyle = scanGlow;
      ctx.fillRect(0, scanY - 20, bounds.width, 40);

      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [router]);

  const stats = [
    { num: "+۲۴۰۰", lbl: "مسیر شغلی", color: "#00ff88" },
    { num: "۵ دقیقه", lbl: "زمان تحلیل", color: "#ff00ff" },
    { num: "%۹۴", lbl: "دقت نتایج", color: "#00d4ff" },
  ];

  const steps = [
    { n: "۱", lbl: "پرسش‌نامه", color: "#00ff88" },
    { n: "۲", lbl: "تحلیل AI", color: "#ff00ff" },
    { n: "۳", lbl: "نتیجه", color: "#00d4ff" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700;800;900&display=swap');

        :root {
          --bg: #0a0a0f;
          --fg: #e0e0e0;
          --card: #12121a;
          --muted: #1c1c2e;
          --muted-fg: #8b93a7;
          --accent: #00ff88;
          --accent-2: #ff00ff;
          --accent-3: #00d4ff;
          --border: #2a2a3a;
          --danger: #ff3366;
          --neon: 0 0 5px rgba(0,255,136,0.9), 0 0 14px rgba(0,255,136,0.22);
          --neon-magenta: 0 0 6px rgba(255,0,255,0.7), 0 0 18px rgba(255,0,255,0.18);
          --neon-cyan: 0 0 6px rgba(0,212,255,0.8), 0 0 18px rgba(0,212,255,0.2);
        }

        @keyframes blink {
          50% { opacity: 0; }
        }

        @keyframes titleGlitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(1px, -1px); }
          40% { transform: translate(-1px, 1px); }
          60% { transform: translate(0.5px, 0); }
          80% { transform: translate(-0.5px, 0.5px); }
        }

        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 rgba(0,255,136,0), 0 0 18px rgba(0,255,136,0.08); }
          50% { box-shadow: 0 0 0 rgba(0,255,136,0), 0 0 28px rgba(0,255,136,0.16); }
        }

        @keyframes scanMove {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        @keyframes borderShift {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(25deg); }
        }

        .cyber-scanlines::after {
          content: "";
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent 0px,
            transparent 2px,
            rgba(0, 0, 0, 0.28) 2px,
            rgba(0, 0, 0, 0.28) 4px
          );
          pointer-events: none;
          opacity: 0.35;
          z-index: 2;
        }

        .cyber-grid {
          background-image:
            linear-gradient(rgba(0, 255, 136, 0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.045) 1px, transparent 1px);
          background-size: 42px 42px;
        }

        .cyber-chamfer {
          clip-path: polygon(
            0 12px,
            12px 0,
            calc(100% - 12px) 0,
            100% 12px,
            100% calc(100% - 12px),
            calc(100% - 12px) 100%,
            12px 100%,
            0 calc(100% - 12px)
          );
        }

        .cyber-chamfer-sm {
          clip-path: polygon(
            0 9px,
            9px 0,
            calc(100% - 9px) 0,
            100% 9px,
            100% calc(100% - 9px),
            calc(100% - 9px) 100%,
            9px 100%,
            0 calc(100% - 9px)
          );
        }

        .cyber-title {
          position: relative;
          display: inline-block;
          color: var(--accent);
          text-shadow:
            0 0 10px rgba(0,255,136,0.35),
            0 0 18px rgba(0,255,136,0.16);
          animation: titleGlitch 5.5s infinite steps(2, end);
        }

        .cyber-title::before,
        .cyber-title::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.45;
        }

        .cyber-title::before {
          transform: translateX(1px);
          color: var(--accent-2);
        }

        .cyber-title::after {
          transform: translateX(-1px);
          color: var(--accent-3);
        }

        .terminal-cursor {
          display: inline-block;
          width: 8px;
          height: 1em;
          margin-right: 6px;
          background: var(--accent);
          vertical-align: -2px;
          animation: blink 1s step-end infinite;
        }

        .start-btn {
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }

        .start-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              90deg,
              transparent 0%,
              rgba(255,255,255,0.06) 20%,
              transparent 45%
            );
          transform: translateX(0);
          opacity: 0.7;
          pointer-events: none;
        }

        .start-btn:hover::before {
          transform: translateX(110%);
          transition: transform 550ms ease;
        }

        .start-btn:hover {
          transform: translateY(-2px);
          box-shadow:
            0 0 8px rgba(0,255,136,0.75),
            0 0 24px rgba(0,255,136,0.2),
            inset 0 0 0 1px rgba(255,255,255,0.06) !important;
          filter: brightness(1.05);
        }

        .start-btn:active {
          transform: translateY(0) scale(0.995);
        }

        .hud-card {
          transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
          animation: pulseGlow 4.5s ease-in-out infinite;
        }

        .hud-card:hover {
          transform: translateY(-2px);
          border-color: rgba(0,255,136,0.55) !important;
          box-shadow:
            0 0 8px rgba(0,255,136,0.25),
            0 0 28px rgba(0,255,136,0.08),
            inset 0 0 0 1px rgba(255,255,255,0.03);
        }

        .step-node {
          transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
        }

        .step-node:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 12px rgba(0,255,136,0.18);
        }

        .scanner {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 1;
        }

        .scanner::before {
          content: "";
          position: absolute;
          top: -20%;
          left: 0;
          right: 0;
          height: 16%;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(0, 212, 255, 0.035),
            transparent
          );
          animation: scanMove 7.5s linear infinite;
        }

        .focus-neon:focus-visible {
          outline: none;
          box-shadow:
            0 0 0 2px rgba(10,10,15,1),
            0 0 0 4px rgba(0,255,136,0.6),
            0 0 16px rgba(0,255,136,0.22);
        }

        @media (prefers-reduced-motion: reduce) {
          .cyber-title,
          .scanner::before,
          .terminal-cursor,
          .hud-card,
          .start-btn::before {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div
        ref={wrapRef}
        className="cyber-scanlines cyber-grid"
        style={{
          minHeight: "100vh",
          width: "100%",
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 20% 20%, rgba(0,255,136,0.08), transparent 28%), radial-gradient(circle at 80% 70%, rgba(255,0,255,0.08), transparent 30%), linear-gradient(180deg, #090a10 0%, #0a0a0f 52%, #06070c 100%)",
          fontFamily: "Vazirmatn, sans-serif",
          direction: "rtl",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.015), transparent 60%)",
            mixBlendMode: "screen",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div className="scanner" />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 10,
            marginBottom: 18,
          }}
        >
          <span
            className="cyber-chamfer-sm"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 16px",
              border: "1px solid rgba(0,255,136,0.35)",
              background: "rgba(0,255,136,0.08)",
              color: "#b6ffd9",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.06em",
              boxShadow: "0 0 14px rgba(0,255,136,0.08)",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#00ff88",
                boxShadow: "0 0 8px rgba(0,255,136,0.9)",
                display: "inline-block",
              }}
            />
            SYSTEM: AI CAREER ROUTER
          </span>
        </div>

        <div
          className="cyber-chamfer hud-card"
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: 500,
            textAlign: "center",
            background:
              "linear-gradient(145deg, rgba(18,18,26,0.96), rgba(8,10,16,0.98))",
            border: "1px solid rgba(0,255,136,0.24)",
            padding: "42px 28px 30px",
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.03) inset, 0 0 24px rgba(0,255,136,0.06)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 14,
              display: "flex",
              gap: 6,
              opacity: 0.9,
            }}
          >
            {["#ff3366", "#ffd000", "#00ff88"].map((c) => (
              <span
                key={c}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: c,
                  boxShadow: `0 0 8px ${c}`,
                  display: "inline-block",
                }}
              />
            ))}
          </div>

          <div
            style={{
              width: 74,
              height: 74,
              margin: "0 auto 22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(0,212,255,0.35)",
              background:
                "linear-gradient(135deg, rgba(0,212,255,0.12), rgba(0,255,136,0.1))",
              boxShadow:
                "0 0 14px rgba(0,212,255,0.12), inset 0 0 24px rgba(255,255,255,0.03)",
              clipPath:
                "polygon(0 12px, 12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px))",
              fontSize: 30,
            }}
          >
            🎯
          </div>

          <div
            style={{
              fontSize: 11,
              color: "#7fffd1",
              letterSpacing: "0.22em",
              marginBottom: 10,
              fontWeight: 800,
            }}
          >
            [ CAREER / ANALYSIS / HUB ]
          </div>

          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.1rem)",
              lineHeight: 1.18,
              color: "#f3f6fb",
              margin: "0 0 12px",
              fontWeight: 900,
            }}
          >
            سامانه{" "}
            <span className="cyber-title" data-text="هدایت مسیر">
              هدایت مسیر
            </span>
            <br />
            شغلی من
          </h1>

          <p
            style={{
              fontSize: 14,
              color: "#9aa4ba",
              lineHeight: 1.9,
              marginBottom: 26,
            }}
          >
            <span style={{ color: "#00ff88", fontWeight: 800 }}>›</span> با پاسخ
            به چند سؤال هوشمند، بهترین مسیر شغلی متناسب با علاقه، مهارت و
            هدف‌هایت را پیدا کن.
            <span className="terminal-cursor" />
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 10,
              marginBottom: 26,
            }}
          >
            {stats.map((s) => (
              <div
                key={s.lbl}
                className="cyber-chamfer-sm"
                style={{
                  background: "rgba(28,28,46,0.66)",
                  border: `1px solid ${s.color}33`,
                  padding: "12px 8px",
                  boxShadow: `0 0 10px ${s.color}10 inset`,
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: s.color,
                    textShadow: `0 0 10px ${s.color}55`,
                  }}
                >
                  {s.num}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#8b93a7",
                    marginTop: 4,
                    letterSpacing: "0.03em",
                  }}
                >
                  {s.lbl}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleStartAnalysis}
            disabled={isLoading}
            aria-busy={isLoading}
            className="start-btn cyber-chamfer-sm focus-neon"
            style={{
              width: "100%",
              minHeight: 52,
              border: "1px solid rgba(0,255,136,0.5)",
              background:
                "linear-gradient(135deg, rgba(0,255,136,0.92), rgba(0,212,255,0.88))",
              color: "#071018",
              padding: "14px 18px",
              fontFamily: "Vazirmatn, sans-serif",
              fontSize: 16,
              fontWeight: 900,
              letterSpacing: "0.04em",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.76 : 1,
              boxShadow:
                "0 0 8px rgba(0,255,136,0.35), 0 0 26px rgba(0,255,136,0.14), inset 0 0 0 1px rgba(255,255,255,0.08)",
              transition: "all 160ms ease",
            }}
          >
            {isLoading ? "در حال پردازش..." : "شروع تحلیل رایگان ←"}
          </button>

          <div
            style={{
              marginTop: 12,
              fontSize: 11,
              color: "#76819c",
              letterSpacing: "0.04em",
            }}
          >
            بدون ثبت‌نام • کمتر از ۵ دقیقه • خروجی شخصی‌سازی‌شده
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              marginTop: 24,
              gap: 8,
            }}
          >
            {steps.map((step, idx) => (
              <div
                key={step.n}
                style={{
                  flex: 1,
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {idx > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 13,
                      right: "50%",
                      width: "calc(50% - 16px)",
                      height: 1,
                      background:
                        "linear-gradient(90deg, rgba(0,255,136,0.28), rgba(0,212,255,0.12))",
                    }}
                  />
                )}

                {idx < steps.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 13,
                      left: "50%",
                      width: "calc(50% - 16px)",
                      height: 1,
                      background:
                        "linear-gradient(90deg, rgba(0,212,255,0.12), rgba(0,255,136,0.28))",
                    }}
                  />
                )}

                <div
                  className="step-node cyber-chamfer-sm"
                  style={{
                    minWidth: 34,
                    height: 28,
                    padding: "0 10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(10,10,15,0.86)",
                    border: `1px solid ${step.color}66`,
                    color: step.color,
                    fontSize: 12,
                    fontWeight: 900,
                    boxShadow: `0 0 10px ${step.color}1a`,
                  }}
                >
                  {step.n}
                </div>

                <div
                  style={{
                    fontSize: 11,
                    color: "#8b93a7",
                    textAlign: "center",
                    lineHeight: 1.5,
                  }}
                >
                  {step.lbl}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
