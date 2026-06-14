"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    education: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // وضعیت بررسی ایمیل
  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "valid" | "invalid" | "exists">("idle");
  const [emailMessage, setEmailMessage] = useState("");

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

  // بررسی ایمیل هنگام خروج از فیلد (onBlur)
  const checkEmail = async () => {
    const email = formData.email.trim();

    if (!email) {
      setEmailStatus("idle");
      setEmailMessage("");
      return;
    }

    // اعتبارسنجی سریع فرمت در سمت کلاینت (قبل از ارسال درخواست)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailStatus("invalid");
      setEmailMessage("فرمت ایمیل صحیح نیست.");
      return;
    }

    setEmailStatus("checking");
    setEmailMessage("در حال بررسی...");

    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setEmailStatus("idle");
        setEmailMessage("");
        return;
      }

      if (!data.valid) {
        setEmailStatus("invalid");
        setEmailMessage(data.message);
      } else if (data.exists) {
        setEmailStatus("exists");
        setEmailMessage(data.message);
      } else {
        setEmailStatus("valid");
        setEmailMessage(data.message);
      }
    } catch {
      setEmailStatus("idle");
      setEmailMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // جلوگیری از ارسال فرم اگر ایمیل تکراری یا نامعتبر باشد
    if (emailStatus === "exists") {
      setError("این ایمیل قبلاً ثبت شده است. لطفاً وارد حساب خود شوید.");
      return;
    }
    if (emailStatus === "invalid") {
      setError("لطفاً یک ایمیل معتبر وارد کنید.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "مشکلی پیش آمده است.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // رنگ و آیکون وضعیت ایمیل
  const emailStatusStyles: Record<string, { color: string; icon: string }> = {
    idle: { color: "#64748b", icon: "" },
    checking: { color: "#fbbf24", icon: "⏳" },
    valid: { color: "#10b981", icon: "✓" },
    invalid: { color: "#f87171", icon: "✕" },
    exists: { color: "#f87171", icon: "✕" },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700;900&display=swap');

        @keyframes blink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .auth-input {
          width: 100%;
          background: rgba(15,31,61,0.6);
          border: 1px solid rgba(59,130,246,0.15);
          border-radius: 12px;
          padding: 12px 16px;
          color: #e2e8f0;
          font-size: 14px;
          font-family: 'Vazirmatn', sans-serif;
          font-weight: 500;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
        }
        .auth-input:focus {
          border-color: rgba(59,130,246,0.5);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.08);
        }
        .auth-input::placeholder { color: #475569; }

        .auth-input.email-valid { border-color: rgba(16,185,129,0.5); }
        .auth-input.email-invalid { border-color: rgba(248,113,113,0.5); }
        .auth-input.email-checking { border-color: rgba(251,191,36,0.5); }

        select.auth-input {
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2393c5fd' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: left 14px center;
          padding-left: 38px;
          cursor: pointer;
        }
        select.auth-input option {
          background: #0f1f3d;
          color: #e2e8f0;
        }

        .auth-submit:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 12px 40px rgba(29,78,216,0.5) !important;
        }
        .auth-submit:active:not(:disabled) { transform: scale(0.98); }
        .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .auth-switch:hover { color: #60a5fa !important; }

        .email-icon-checking {
          display: inline-block;
          animation: spin 0.8s linear infinite;
        }

        @media (max-width: 768px) {
          .auth-card { padding: 32px 24px !important; }
          .auth-wrap { padding: 16px !important; }
          .auth-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div
        ref={wrapRef}
        className="auth-wrap"
        style={{
          minHeight: "100vh", width: "100%", background: "#070d1a",
          fontFamily: "Vazirmatn, sans-serif", direction: "rtl",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", overflow: "hidden", padding: 24,
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        />

        <div
          className="auth-card"
          style={{
            position: "relative", zIndex: 10,
            width: "100%", maxWidth: 480, textAlign: "center",
            background: "linear-gradient(145deg,rgba(15,31,61,0.95),rgba(7,13,26,0.98))",
            border: "1px solid rgba(59,130,246,0.18)",
            borderRadius: 24, padding: "44px 40px",
            boxShadow: "0 0 60px rgba(29,78,216,0.12), 0 0 0 1px rgba(255,255,255,0.04) inset",
          }}
        >
          {/* بج */}
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

          {success ? (
            <>
              {/* آیکون موفقیت */}
              <div style={{
                width: 64, height: 64, borderRadius: 18, margin: "0 auto 20px",
                background: "linear-gradient(135deg,rgba(16,185,129,0.3),rgba(59,130,246,0.2))",
                border: "1px solid rgba(16,185,129,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26, boxShadow: "0 0 24px rgba(16,185,129,0.2)",
              }}>
                📩
              </div>

              {/* تیتر موفقیت */}
              <h1 style={{ fontSize: 24, fontWeight: 900, color: "#f8fafc", marginBottom: 8 }}>
                ایمیل خود را{" "}
                <span style={{
                  background: "linear-gradient(90deg,#3b82f6,#10b981)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>
                  تایید کنید
                </span>
              </h1>

              <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.8, marginBottom: 28 }}>
                لینک تایید به آدرس <strong style={{ color: "#e2e8f0" }}>{formData.email}</strong> ارسال شد.
                برای فعال‌سازی حساب کاربری، روی لینک داخل ایمیل کلیک کنید و سپس وارد حساب خود شوید.
              </p>

              <button
                onClick={() => router.push("/auth")}
                className="auth-submit"
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg,#1d4ed8,#1e40af)",
                  color: "#fff", border: "none", borderRadius: 14,
                  padding: "14px 20px",
                  fontFamily: "Vazirmatn, sans-serif", fontSize: 16, fontWeight: 900,
                  cursor: "pointer",
                  boxShadow: "0 8px 32px rgba(29,78,216,0.35)",
                  transition: "transform 0.18s, box-shadow 0.18s",
                }}
              >
                رفتن به صفحه ورود
              </button>
            </>
          ) : (
          <>
          {/* آیکون */}
          <div style={{
            width: 64, height: 64, borderRadius: 18, margin: "0 auto 20px",
            background: "linear-gradient(135deg,rgba(29,78,216,0.3),rgba(16,185,129,0.2))",
            border: "1px solid rgba(59,130,246,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, boxShadow: "0 0 24px rgba(59,130,246,0.2)",
          }}>
            ✨
          </div>

          {/* تیتر */}
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#f8fafc", marginBottom: 8 }}>
            عضویت در{" "}
            <span style={{
              background: "linear-gradient(90deg,#3b82f6,#10b981)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              سامانه
            </span>
          </h1>

          <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7, marginBottom: 28 }}>
            با تکمیل اطلاعات زیر، حساب کاربری‌ات رو بساز و مسیر شغلی‌ات رو کشف کن
          </p>
          </>
          )}

          {!success && (
          <>
          {/* خطا */}
          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171", fontSize: 13, padding: "10px 14px",
              borderRadius: 12, marginBottom: 16, textAlign: "center",
            }}>
              {error}
            </div>
          )}

          {/* فرم */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14, textAlign: "right" }}>

            <div className="auth-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 6, fontWeight: 600 }}>
                  نام
                </label>
                <input
                  type="text"
                  placeholder="مثلاً علی"
                  className="auth-input"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 6, fontWeight: 600 }}>
                  نام خانوادگی
                </label>
                <input
                  type="text"
                  placeholder="مثلاً محمدی"
                  className="auth-input"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 6, fontWeight: 600 }}>
                وضعیت تحصیلی
              </label>
              <select
                className="auth-input"
                required
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              >
                <option value="">وضعیت تحصیلی خود را انتخاب کن</option>
                <option value="student">دانش‌آموز</option>
                <option value="university">دانشجو</option>
                <option value="graduate">فارغ‌التحصیل</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 6, fontWeight: 600 }}>
                ایمیل
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  placeholder="example@email.com"
                  className={`auth-input ${
                    emailStatus === "valid" ? "email-valid" :
                    emailStatus === "invalid" || emailStatus === "exists" ? "email-invalid" :
                    emailStatus === "checking" ? "email-checking" : ""
                  }`}
                  required
                  style={{ textAlign: "left", direction: "ltr", paddingLeft: 38 }}
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setEmailStatus("idle");
                    setEmailMessage("");
                  }}
                  onBlur={checkEmail}
                />
                {/* آیکون وضعیت */}
                {emailStatus !== "idle" && (
                  <span style={{
                    position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                    fontSize: 14, color: emailStatusStyles[emailStatus].color,
                  }}>
                    {emailStatus === "checking" ? (
                      <span className="email-icon-checking">⏳</span>
                    ) : (
                      emailStatusStyles[emailStatus].icon
                    )}
                  </span>
                )}
              </div>
              {/* پیام وضعیت */}
              {emailMessage && (
                <div style={{
                  fontSize: 12, marginTop: 6, textAlign: "right",
                  color: emailStatusStyles[emailStatus].color,
                }}>
                  {emailMessage}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 6, fontWeight: 600 }}>
                رمز عبور
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="auth-input"
                required
                style={{ textAlign: "left", direction: "ltr" }}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading || emailStatus === "exists" || emailStatus === "invalid"}
              className="auth-submit"
              style={{
                width: "100%", marginTop: 6,
                background: "linear-gradient(135deg,#1d4ed8,#1e40af)",
                color: "#fff", border: "none", borderRadius: 14,
                padding: "14px 20px",
                fontFamily: "Vazirmatn, sans-serif", fontSize: 16, fontWeight: 900,
                cursor: "pointer",
                boxShadow: "0 8px 32px rgba(29,78,216,0.35)",
                transition: "transform 0.18s, box-shadow 0.18s",
              }}
            >
              {loading ? "در حال پردازش..." : "ثبت‌نام نهایی"}
            </button>
          </form>

          {/* لینک ورود */}
          <div style={{ marginTop: 24, fontSize: 13, color: "#64748b" }}>
            قبلاً ثبت‌نام کرده‌ای؟{" "}
            <button
              onClick={() => router.push("/auth")}
              className="auth-switch"
              style={{
                color: "#3b82f6", fontWeight: 700, background: "none",
                border: "none", cursor: "pointer", fontFamily: "Vazirmatn, sans-serif",
                fontSize: 13, transition: "color 0.15s",
              }}
            >
              ورود به حساب
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
