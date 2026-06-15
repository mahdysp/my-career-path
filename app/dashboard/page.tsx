"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type QuizAttempt = {
  id: string;
  created_at: string;
  query: string | null;
  result_summary: string | null;
};

type UserData = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  education: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  const [user, setUser] = useState<UserData | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  // فرم ویرایش پروفایل
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", education: "" });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push("/auth");
          return;
        }
        setUser(data.user);
        setAttempts(data.attempts || []);
        setFormData({
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          education: data.user.education || "",
        });
      })
      .catch(() => router.push("/auth"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage("");
    setSaveError("");

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "خطایی پیش آمده است.");
      }

      setUser((prev) => (prev ? { ...prev, ...formData } : prev));
      setSaveMessage(data.message || "اطلاعات با موفقیت به‌روزرسانی شد.");
      setEditMode(false);
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // پس‌زمینه canvas (مطابق هویت بصری مشترک)
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

  const educationLabels: Record<string, string> = {
    student: "دانش‌آموز",
    university: "دانشجو",
    graduate: "فارغ‌التحصیل",
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("fa-IR", {
        year: "numeric", month: "long", day: "numeric",
      });
    } catch {
      return iso;
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", width: "100%", background: "#070d1a",
        fontFamily: "Vazirmatn, sans-serif", direction: "rtl",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#94a3b8", fontSize: 14,
      }}>
        در حال بارگذاری...
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700;900&display=swap');

        @keyframes blink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
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
        .auth-input:disabled { opacity: 0.6; cursor: not-allowed; }

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

        .ghost-btn {
          background: transparent; border: 1px solid rgba(59,130,246,0.25);
          color: #93c5fd; border-radius: 10px; padding: 10px 20px;
          font-family: 'Vazirmatn', sans-serif; font-size: 13px; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
        }
        .ghost-btn:hover { background: rgba(59,130,246,0.1) !important; }

        .nav-logout:hover { background: rgba(239,68,68,0.12) !important; border-color: rgba(239,68,68,0.6) !important; color: #fca5a5 !important; }
        .nav-back:hover { background: rgba(59,130,246,0.12) !important; border-color: rgba(59,130,246,0.6) !important; color: #60a5fa !important; }

        .attempt-card { transition: all 0.2s; cursor: pointer; }
        .attempt-card:hover {
          border-color: rgba(59,130,246,0.4) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(29,78,216,0.15);
        }

        @media (max-width: 768px) {
          .dash-nav { padding: 12px 16px !important; }
          .dash-main { padding: 24px 16px !important; }
          .dash-grid { grid-template-columns: 1fr !important; }
          .profile-grid-2 { grid-template-columns: 1fr !important; }
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
          className="dash-nav"
          style={{
            position: "sticky", top: 0, zIndex: 50,
            background: "rgba(7,13,26,0.85)", backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(59,130,246,0.1)",
            padding: "14px 40px", display: "flex",
            justifyContent: "space-between", alignItems: "center",
          }}
        >
          <button
            className="ghost-btn nav-logout"
            onClick={handleLogout}
            style={{ color: "#f87171", borderColor: "rgba(239,68,68,0.3)" }}
          >
            خروج
          </button>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>
              سلام، {user?.firstName || user?.email}
            </span>
            <button
              className="ghost-btn nav-back"
              onClick={() => router.push("/quiz")}
              style={{ color: "#93c5fd" }}
            >
              بازگشت به خانه
            </button>
          </div>
        </nav>

        {/* محتوای اصلی */}
        <main
          className="dash-main"
          style={{
            maxWidth: 1100, margin: "0 auto", padding: "48px 40px",
            position: "relative", zIndex: 10,
          }}
        >
          {/* عنوان صفحه */}
          <div style={{ marginBottom: 32, textAlign: "right" }}>
            <div style={{ marginBottom: 14 }}>
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
            <h1 style={{ fontSize: 32, fontWeight: 900, color: "#f8fafc", marginBottom: 6 }}>
              داشبورد{" "}
              <span style={{
                background: "linear-gradient(90deg,#3b82f6,#10b981)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                من
              </span>
            </h1>
            <p style={{ fontSize: 14, color: "#94a3b8" }}>
              مدیریت اطلاعات حساب و مشاهده‌ی تاریخچه آزمون‌های مسیر شغلی
            </p>
          </div>

          {/* گرید اصلی */}
          <div className="dash-grid" style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24, alignItems: "start" }}>

            {/* کارت پروفایل */}
            <div
              style={{
                background: "linear-gradient(145deg,rgba(15,31,61,0.95),rgba(7,13,26,0.98))",
                border: "1px solid rgba(59,130,246,0.18)",
                borderRadius: 24, padding: "28px 24px",
                boxShadow: "0 0 40px rgba(29,78,216,0.1), 0 0 0 1px rgba(255,255,255,0.04) inset",
                textAlign: "right",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h2 style={{ fontSize: 17, fontWeight: 900, color: "#f8fafc" }}>اطلاعات پروفایل</h2>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "linear-gradient(135deg,rgba(29,78,216,0.3),rgba(16,185,129,0.2))",
                  border: "1px solid rgba(59,130,246,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                }}>
                  👤
                </div>
              </div>

              {saveMessage && (
                <div style={{
                  background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
                  color: "#34d399", fontSize: 12, padding: "8px 12px",
                  borderRadius: 10, marginBottom: 14, textAlign: "center",
                }}>
                  {saveMessage}
                </div>
              )}
              {saveError && (
                <div style={{
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                  color: "#f87171", fontSize: 12, padding: "8px 12px",
                  borderRadius: 10, marginBottom: 14, textAlign: "center",
                }}>
                  {saveError}
                </div>
              )}

              {!editMode ? (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>نام و نام خانوادگی</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>
                        {user?.firstName} {user?.lastName}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>ایمیل</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", direction: "ltr", textAlign: "right" }}>
                        {user?.email}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>وضعیت تحصیلی</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>
                        {user?.education ? educationLabels[user.education] || user.education : "—"}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => { setEditMode(true); setSaveMessage(""); setSaveError(""); }}
                    className="auth-submit"
                    style={{
                      width: "100%",
                      background: "linear-gradient(135deg,#1d4ed8,#1e40af)",
                      color: "#fff", border: "none", borderRadius: 12,
                      padding: "11px 16px",
                      fontFamily: "Vazirmatn, sans-serif", fontSize: 14, fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: "0 6px 20px rgba(29,78,216,0.3)",
                      transition: "transform 0.18s, box-shadow 0.18s",
                    }}
                  >
                    ویرایش اطلاعات
                  </button>
                </>
              ) : (
                <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div className="profile-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 5, fontWeight: 600 }}>نام</label>
                      <input
                        type="text"
                        required
                        className="auth-input"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 5, fontWeight: 600 }}>نام خانوادگی</label>
                      <input
                        type="text"
                        required
                        className="auth-input"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 5, fontWeight: 600 }}>وضعیت تحصیلی</label>
                    <select
                      className="auth-input"
                      required
                      value={formData.education}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    >
                      <option value="">انتخاب کنید</option>
                      <option value="student">دانش‌آموز</option>
                      <option value="university">دانشجو</option>
                      <option value="graduate">فارغ‌التحصیل</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    <button
                      type="submit"
                      disabled={saving}
                      className="auth-submit"
                      style={{
                        flex: 1,
                        background: "linear-gradient(135deg,#1d4ed8,#1e40af)",
                        color: "#fff", border: "none", borderRadius: 12,
                        padding: "11px 16px",
                        fontFamily: "Vazirmatn, sans-serif", fontSize: 14, fontWeight: 800,
                        cursor: "pointer",
                        boxShadow: "0 6px 20px rgba(29,78,216,0.3)",
                        transition: "transform 0.18s, box-shadow 0.18s",
                      }}
                    >
                      {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false);
                        setSaveError("");
                        if (user) {
                          setFormData({ firstName: user.firstName, lastName: user.lastName, education: user.education });
                        }
                      }}
                      className="ghost-btn"
                      style={{ flex: "0 0 auto" }}
                    >
                      انصراف
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* ستون راست: آمار + لیست آزمون‌ها */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* آمار کلی */}
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{
                  flex: 1, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)",
                  borderRadius: 16, padding: "16px 18px", textAlign: "right",
                }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#3b82f6" }}>{attempts.length}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>آزمون انجام‌شده</div>
                </div>
                <div style={{
                  flex: 1, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)",
                  borderRadius: 16, padding: "16px 18px", textAlign: "right",
                }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#10b981" }}>
                    {attempts.length > 0 ? formatDate(attempts[0].created_at) : "—"}
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>آخرین آزمون</div>
                </div>
              </div>

              {/* لیست آزمون‌ها */}
              <div
                style={{
                  background: "linear-gradient(145deg,rgba(15,31,61,0.95),rgba(7,13,26,0.98))",
                  border: "1px solid rgba(59,130,246,0.18)",
                  borderRadius: 24, padding: "24px",
                  boxShadow: "0 0 40px rgba(29,78,216,0.1), 0 0 0 1px rgba(255,255,255,0.04) inset",
                  textAlign: "right",
                }}
              >
                <h2 style={{ fontSize: 17, fontWeight: 900, color: "#f8fafc", marginBottom: 4 }}>
                  تاریخچه آزمون‌ها
                </h2>
                <p style={{ fontSize: 12, color: "#64748b", marginBottom: 18 }}>
                  هر آزمون به‌صورت جدا و با تاریخ مربوط به خودش نگه داشته می‌شود
                </p>

                {attempts.length === 0 ? (
                  <div style={{
                    border: "1px dashed rgba(59,130,246,0.25)", borderRadius: 16,
                    padding: "36px 20px", textAlign: "center",
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>🧭</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>
                      هنوز هیچ آزمونی ثبت نکرده‌ای
                    </div>
                    <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 18, lineHeight: 1.8 }}>
                      با شرکت در آزمون مسیریابی شغلی، نتایج اینجا به‌ترتیب زمان نمایش داده می‌شوند.
                    </div>
                    <button
                      onClick={() => router.push("/quiz")}
                      className="auth-submit"
                      style={{
                        background: "linear-gradient(135deg,#1d4ed8,#1e40af)",
                        color: "#fff", border: "none", borderRadius: 12,
                        padding: "10px 24px",
                        fontFamily: "Vazirmatn, sans-serif", fontSize: 13, fontWeight: 800,
                        cursor: "pointer",
                        boxShadow: "0 6px 20px rgba(29,78,216,0.3)",
                        transition: "transform 0.18s, box-shadow 0.18s",
                      }}
                    >
                      شروع آزمون جدید ←
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {attempts.map((attempt, idx) => (
                      <div
                        key={attempt.id}
                        className="attempt-card"
                        onClick={() => router.push(`/result?attempt=${attempt.id}`)}
                        style={{
                          background: "rgba(59,130,246,0.05)",
                          border: "1px solid rgba(59,130,246,0.15)",
                          borderRadius: 14, padding: "14px 16px",
                          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                            background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 800, color: "#3b82f6",
                          }}>
                            #{attempts.length - idx}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>
                              {attempt.result_summary || attempt.query || "آزمون مسیریابی شغلی"}
                            </div>
                            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                              {formatDate(attempt.created_at)}
                            </div>
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: "#3b82f6", fontWeight: 700, whiteSpace: "nowrap" }}>
                          مشاهده نتیجه ←
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
