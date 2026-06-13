"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function CareerHub() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const [searchQuery, setSearchQuery] = useState("");

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

    const STAR_COUNT = 140;
    const PARTICLE_COUNT = 45;

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
        x: Math.random() * cv!.width,
        y: Math.random() * cv!.height,
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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/result?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push("/result");
    }
  };

  const tags = ["برنامه‌نویسی", "طراحی UI/UX", "بازاریابی", "داده‌کاوی", "مدیریت محصول"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700;900&display=swap');

        @keyframes blink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }

        .search-btn:hover { background: #1e40af !important; transform: scale(1.02); }
        .search-btn:active { transform: scale(0.98); }
        .tag-pill:hover { background: rgba(59,130,246,0.2) !important; border-color: rgba(59,130,246,0.5) !important; }
        .nav-login:hover { background: rgba(59,130,246,0.12) !important; border-color: rgba(59,130,246,0.6) !important; color: #60a5fa !important; }
        .nav-register:hover { background: #1e40af !important; box-shadow: 0 6px 24px rgba(29,78,216,0.5) !important; }

        /* ناوبار موبایل */
        @media (max-width: 768px) {
          .nav-inner {
            padding: 12px 16px !important;
          }
          .nav-btn-text { display: none; }
          .nav-login-short::after { content: "ورود"; }
          .nav-register-short::after { content: "ثبت‌نام"; }
        }

        /* گرید اصلی موبایل */
        @media (max-width: 768px) {
          .main-grid {
            grid-template-columns: 1fr !important;
            padding: 32px 20px !important;
            gap: 40px !important;
          }
          .main-grid h1 {
            font-size: 28px !important;
          }
          .main-grid p {
            font-size: 14px !important;
          }
          .search-box {
            max-width: 100% !important;
            flex-direction: column !important;
            gap: 10px !important;
          }
          .search-box input {
            width: 100% !important;
            padding: 14px 16px !important;
          }
          .search-btn {
            width: 100% !important;
            padding: 14px !important;
            text-align: center !important;
          }
          .stats-row {
            gap: 20px !important;
          }
          .svg-col {
            display: none !important;
          }
          .tags-row {
            gap: 6px !important;
          }
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
        <nav
          className="nav-inner"
          style={{
            position: "sticky", top: 0, zIndex: 50,
            background: "rgba(7,13,26,0.85)", backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(59,130,246,0.1)",
            padding: "14px 40px", display: "flex",
            justifyContent: "space-between", alignItems: "center",
          }}
        >
          <div />
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="nav-login"
              style={{
                fontSize: 14, fontWeight: 700, padding: "9px 22px",
                color: "#93c5fd", background: "transparent",
                border: "1px solid rgba(59,130,246,0.25)",
                borderRadius: 10, cursor: "pointer", transition: "all 0.2s",
                fontFamily: "Vazirmatn, sans-serif",
              }}
            >
              ورود به حساب
            </button>
            <button
              className="nav-register"
              style={{
                fontSize: 14, fontWeight: 700, padding: "9px 22px",
                color: "#fff", background: "#1d4ed8",
                border: "1px solid rgba(59,130,246,0.4)",
                borderRadius: 10, cursor: "pointer", transition: "all 0.2s",
                boxShadow: "0 4px 16px rgba(29,78,216,0.35)",
                fontFamily: "Vazirmatn, sans-serif",
              }}
            >
              ساخت حساب رایگان
            </button>
          </div>
        </nav>

        {/* محتوای اصلی */}
        <main
          className="main-grid"
          style={{
            maxWidth: 1200, margin: "0 auto", padding: "80px 40px",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60,
            alignItems: "center", position: "relative", zIndex: 10,
          }}
        >
          {/* ستون راست: متن */}
          <div style={{ textAlign: "right" }}>

            <div style={{ marginBottom: 20 }}>
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
                سامانه هوشمند مسیریابی شغلی
              </span>
            </div>

            <h1 style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.2, color: "#f8fafc", marginBottom: 16 }}>
              مسیر شغلی خودت را{" "}
              <span style={{
                background: "linear-gradient(90deg,#3b82f6,#10b981)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                کشف کن
              </span>
            </h1>

            <p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.8, marginBottom: 32, maxWidth: 460 }}>
              تخصص خود را انتخاب کن و با سیستم هوشمند ارزیابی مهارت، شایستگی‌هایت رو بسنج.
            </p>

            {/* باکس جستجو */}
            <div
              className="search-box"
              style={{
                background: "rgba(15,31,61,0.9)", border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: 18, padding: 8, display: "flex", gap: 8, alignItems: "center",
                maxWidth: 500, boxShadow: "0 0 40px rgba(29,78,216,0.1)",
              }}
            >
              <input
                type="text"
                placeholder="جستجوی حوزه تخصصی..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                style={{
                  flex: 1, padding: "12px 16px", background: "transparent",
                  border: "none", outline: "none", color: "#e2e8f0",
                  fontSize: 14, fontFamily: "Vazirmatn, sans-serif", fontWeight: 500,
                }}
              />
              <button
                className="search-btn"
                onClick={handleSearch}
                style={{
                  background: "#1d4ed8", color: "#fff", border: "none",
                  borderRadius: 12, padding: "12px 24px",
                  fontSize: 14, fontWeight: 900, cursor: "pointer",
                  fontFamily: "Vazirmatn, sans-serif", whiteSpace: "nowrap",
                  transition: "all 0.15s", boxShadow: "0 4px 16px rgba(29,78,216,0.4)",
                }}
              >
                شروع ارزیابی
              </button>
            </div>

            {/* تگ‌های پیشنهادی */}
            <div className="tags-row" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
              <span style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center" }}>پیشنهادی:</span>
              {tags.map((tag) => (
                <button
                  key={tag}
                  className="tag-pill"
                  onClick={() => setSearchQuery(tag)}
                  style={{
                    fontSize: 12, fontWeight: 600, padding: "5px 12px",
                    background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)",
                    borderRadius: 100, color: "#93c5fd", cursor: "pointer",
                    fontFamily: "Vazirmatn, sans-serif", transition: "all 0.15s",
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* آمار */}
            <div className="stats-row" style={{ display: "flex", gap: 32, marginTop: 40 }}>
              {[
                { num: "+۲۴۰۰", lbl: "مسیر شغلی", color: "#3b82f6" },
                { num: "%۹۴",   lbl: "دقت نتایج",  color: "#10b981" },
              ].map((s) => (
                <div key={s.lbl}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.num}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ستون چپ: SVG — در موبایل مخفی میشه */}
          <div className="svg-col" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 480 420" style={{ width: "100%", maxWidth: 480, animation: "float 5s ease-in-out infinite" }} xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="mtnGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#1e40af" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="mtnFront" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.08" />
                </linearGradient>
                <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.6" />
                </linearGradient>
                <radialGradient id="glowCenter" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </radialGradient>
              </defs>

              <ellipse cx="240" cy="280" rx="200" ry="120" fill="url(#glowCenter)" />
              <polygon points="240,360 420,80 560,360" fill="url(#mtnGrad)" />
              <polygon points="80,360 220,140 370,360" fill="url(#mtnFront)" />
              <path d="M 100,340 Q 160,280 200,220 T 270,160 T 310,120" fill="none" stroke="url(#pathGrad)" strokeWidth="2.5" strokeDasharray="8 5" opacity="0.7" />

              {[{ cx: 100, cy: 340 }, { cx: 180, cy: 255 }, { cx: 240, cy: 195 }, { cx: 285, cy: 148 }].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.cx} cy={pt.cy} r="5" fill="#0b1629" stroke="#3b82f6" strokeWidth="1.5" />
                  <circle cx={pt.cx} cy={pt.cy} r="2.5" fill="#3b82f6" />
                </g>
              ))}

              <line x1="220" y1="140" x2="220" y2="105" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
              <polygon points="220,105 255,114 220,123" fill="#f59e0b" opacity="0.9" />

              <g transform="translate(390, 90)">
                <circle cx="0" cy="0" r="32" fill="rgba(15,31,61,0.8)" stroke="rgba(59,130,246,0.3)" strokeWidth="1" />
                <circle cx="0" cy="0" r="26" fill="none" stroke="rgba(59,130,246,0.15)" strokeWidth="1" />
                <path d="M 0,-20 L 5,-5 L 0,0 L -5,-5 Z" fill="#3b82f6" opacity="0.9" />
                <path d="M 0,20 L 5,5 L 0,0 L -5,5 Z" fill="#475569" opacity="0.7" />
                <path d="M -20,0 L -5,-5 L 0,0 L -5,5 Z" fill="#475569" opacity="0.5" />
                <path d="M 20,0 L 5,-5 L 0,0 L 5,5 Z" fill="#475569" opacity="0.5" />
                <circle cx="0" cy="0" r="3" fill="#f59e0b" />
              </g>

              <g transform="translate(30, 140)">
                <rect width="110" height="58" rx="10" fill="rgba(15,31,61,0.9)" stroke="rgba(59,130,246,0.25)" strokeWidth="1" />
                <rect x="10" y="12" width="28" height="6" rx="3" fill="#3b82f6" opacity="0.7" />
                <rect x="10" y="24" width="44" height="5" rx="2.5" fill="#334155" opacity="0.8" />
                <rect x="10" y="34" width="36" height="5" rx="2.5" fill="#334155" opacity="0.5" />
                <circle cx="90" cy="20" r="12" fill="rgba(16,185,129,0.15)" stroke="rgba(16,185,129,0.3)" strokeWidth="1" />
                <text x="90" y="24" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="700">۹۴٪</text>
              </g>

              <g transform="translate(340, 230)">
                <rect width="115" height="62" rx="10" fill="rgba(15,31,61,0.9)" stroke="rgba(245,158,11,0.25)" strokeWidth="1" />
                <rect x="10" y="12" width="32" height="6" rx="3" fill="#f59e0b" opacity="0.7" />
                <rect x="10" y="24" width="48" height="5" rx="2.5" fill="#334155" opacity="0.8" />
                <rect x="10" y="34" width="38" height="5" rx="2.5" fill="#334155" opacity="0.5" />
                <rect x="10" y="44" width="55" height="5" rx="2.5" fill="#334155" opacity="0.3" />
              </g>

              <line x1="0" y1="360" x2="480" y2="360" stroke="rgba(59,130,246,0.08)" strokeWidth="1" />
              <line x1="0" y1="380" x2="480" y2="380" stroke="rgba(59,130,246,0.05)" strokeWidth="1" />
            </svg>
          </div>
        </main>
      </div>
    </>
  );
}
