// مسیر فایل: app/dashboard/page.tsx
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

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", education: "" });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) { router.push("/auth"); return; }
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
      if (!res.ok) throw new Error(data.message || "خطایی پیش آمده است.");
      setUser((prev) => (prev ? { ...prev, ...formData } : prev));
      setSaveMessage(data.message || "اطلاعات با موفقیت به‌روزرسانی شد.");
      setEditMode(false);
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── پس‌زمینه: ستاره‌های ثابت + shooting stars + slow comets ──
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

    // ستاره‌های ثابت چشمک‌زن
    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random() * cv.width,
      y: Math.random() * cv.height,
      r: Math.random() * 1.4 + 0.2,
      a: Math.random(),
      speed: Math.random() * 0.006 + 0.002,
      phase: Math.random() * Math.PI * 2,
    }));

    // shooting stars (خط کشیده سریع)
    type ShootingStar = {
      x: number; y: number;
      vx: number; vy: number;
      len: number; alpha: number;
      life: number; maxLife: number;
    };

    function makeShootingStar(): ShootingStar {
      const angle = (Math.random() * 30 + 15) * (Math.PI / 180);
      const speed = Math.random() * 10 + 8;
      return {
        x: Math.random() * cv!.width,
        y: Math.random() * cv!.height * 0.5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len: Math.random() * 120 + 60,
        alpha: Math.random() * 0.7 + 0.3,
        life: 0,
        maxLife: Math.random() * 40 + 20,
      };
    }

    // slow comets (دنباله‌دار کند با دنباله بلند)
    type Comet = {
      x: number; y: number;
      vx: number; vy: number;
      len: number; alpha: number;
      r: number;
      life: number; maxLife: number;
      color: string;
    };

    function makeComet(): Comet {
      const angle = (Math.random() * 40 + 10) * (Math.PI / 180);
      const speed = Math.random() * 1.5 + 0.5;
      const colors = ["#3b82f6", "#10b981", "#f59e0b", "#a78bfa"];
      return {
        x: Math.random() * cv!.width * 0.5,
        y: Math.random() * cv!.height * 0.4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len: Math.random() * 180 + 80,
        alpha: Math.random() * 0.5 + 0.2,
        r: Math.random() * 1.5 + 0.8,
        life: 0,
        maxLife: Math.random() * 300 + 200,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    }

    let shootingStars: ShootingStar[] = [];
    let comets: Comet[] = Array.from({ length: 3 }, makeComet);
    let shootingTimer = 0;
    let t = 0;

    function draw() {
      if (!cv || !ctx) return;
      t++;
      shootingTimer++;
      ctx.clearRect(0, 0, cv.width, cv.height);

      // nebula glows
      const g1 = ctx.createRadialGradient(cv.width * 0.15, cv.height * 0.35, 0, cv.width * 0.15, cv.height * 0.35, cv.width * 0.5);
      g1.addColorStop(0, "rgba(29,78,216,0.08)");
      g1.addColorStop(1, "transparent");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, cv.width, cv.height);

      const g2 = ctx.createRadialGradient(cv.width * 0.85, cv.height * 0.65, 0, cv.width * 0.85, cv.height * 0.65, cv.width * 0.45);
      g2.addColorStop(0, "rgba(16,185,129,0.06)");
      g2.addColorStop(1, "transparent");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, cv.width, cv.height);

      const g3 = ctx.createRadialGradient(cv.width * 0.5, cv.height * 0.2, 0, cv.width * 0.5, cv.height * 0.2, cv.width * 0.35);
      g3.addColorStop(0, "rgba(99,102,241,0.04)");
      g3.addColorStop(1, "transparent");
      ctx.fillStyle = g3;
      ctx.fillRect(0, 0, cv.width, cv.height);

      // ستاره‌های ثابت
      stars.forEach((s) => {
        s.phase += s.speed;
        const a = s.a * (0.5 + 0.5 * Math.sin(s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148,163,184,${a})`;
        ctx.fill();
      });

      // scan line محو
      const scanY = (t * 0.3) % cv.height;
      const sg = ctx.createLinearGradient(0, scanY - 50, 0, scanY + 50);
      sg.addColorStop(0, "transparent");
      sg.addColorStop(0.5, "rgba(59,130,246,0.015)");
      sg.addColorStop(1, "transparent");
      ctx.fillStyle = sg;
      ctx.fillRect(0, scanY - 50, cv.width, 100);

      // shooting stars — هر ۹۰ فریم یکی جدید
      if (shootingTimer > 90 && Math.random() < 0.4) {
        shootingStars.push(makeShootingStar());
        shootingTimer = 0;
      }

      shootingStars = shootingStars.filter((s) => s.life <= s.maxLife);
      shootingStars.forEach((s) => {
        s.life++;
        const progress = s.life / s.maxLife;
        const fade = progress < 0.2 ? progress / 0.2 : progress > 0.7 ? (1 - progress) / 0.3 : 1;
        const tailX = s.x - (s.vx / Math.sqrt(s.vx * s.vx + s.vy * s.vy)) * s.len;
        const tailY = s.y - (s.vy / Math.sqrt(s.vx * s.vx + s.vy * s.vy)) * s.len;

        const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255,255,255,${s.alpha * fade})`);
        grad.addColorStop(0.3, `rgba(180,210,255,${s.alpha * fade * 0.6})`);
        grad.addColorStop(1, "rgba(180,210,255,0)");

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // هسته روشن
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.alpha * fade})`;
        ctx.fill();

        s.x += s.vx;
        s.y += s.vy;
      });

      // slow comets (دنباله‌دار کند)
      comets.forEach((c, i) => {
        c.life++;
        if (c.life > c.maxLife || c.x > cv!.width + 200 || c.y > cv!.height + 200) {
          comets[i] = makeComet();
          return;
        }

        const progress = c.life / c.maxLife;
        const fade = progress < 0.15 ? progress / 0.15 : progress > 0.75 ? (1 - progress) / 0.25 : 1;

        const speed = Math.sqrt(c.vx * c.vx + c.vy * c.vy);
        const nx = c.vx / speed;
        const ny = c.vy / speed;
        const tailX = c.x - nx * c.len;
        const tailY = c.y - ny * c.len;

        // دنباله با رنگ کومت
        const cometGrad = ctx.createLinearGradient(c.x, c.y, tailX, tailY);
        cometGrad.addColorStop(0, `${c.color}${Math.round(c.alpha * fade * 255).toString(16).padStart(2, "0")}`);
        cometGrad.addColorStop(0.4, `${c.color}${Math.round(c.alpha * fade * 0.4 * 255).toString(16).padStart(2, "0")}`);
        cometGrad.addColorStop(1, `${c.color}00`);

        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = cometGrad;
        ctx.lineWidth = c.r * 1.5;
        ctx.lineCap = "round";
        ctx.stroke();

        // هسته کومت
        const coreGlow = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r * 4);
        coreGlow.addColorStop(0, `${c.color}${Math.round(c.alpha * fade * 255).toString(16).padStart(2, "0")}`);
        coreGlow.addColorStop(1, `${c.color}00`);
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = coreGlow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${c.alpha * fade * 0.9})`;
        ctx.fill();

        c.x += c.vx;
        c.y += c.vy;
      });

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
    } catch { return iso; }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", width: "100%", background: "#0a0a2e",
        fontFamily: "Vazirmatn, sans-serif", direction: "rtl",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#94a3b8", fontSize: 14,
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700;900&display=swap');`}</style>
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
          appearance: none; -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2393c5fd' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: left 14px center;
          padding-left: 38px;
          cursor: pointer;
        }
        select.auth-input option { background: #0f1f3d; color: #e2e8f0; }

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
          {/* سمت راست: سلام + بازگشت */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>
              سلام، {user?.firstName || user?.email}
            </span>
            <button className="ghost-btn nav-back" onClick={() => router.push("/quiz")}>
              بازگشت به خانه
            </button>
          </div>

          {/* سمت چپ: خروج */}
          <button
            className="ghost-btn nav-logout"
            onClick={handleLogout}
            style={{
              color: "#fff",
              background: "linear-gradient(135deg,#dc2626,#b91c1c)",
              border: "1px solid rgba(239,68,68,0.4)",
              boxShadow: "0 4px 16px rgba(220,38,38,0.35)",
            }}
          >
            خروج
          </button>
        </nav>

        {/* محتوای اصلی */}
        <main
          className="dash-main"
          style={{
            maxWidth: 1100, margin: "0 auto", padding: "48px 40px",
            position: "relative", zIndex: 10,
          }}
        >
          {/* عنوان */}
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
            <div style={{
              background: "linear-gradient(145deg,rgba(15,31,61,0.95),rgba(7,13,26,0.98))",
              border: "1px solid rgba(59,130,246,0.18)",
              borderRadius: 24, padding: "28px 24px",
              boxShadow: "0 0 40px rgba(29,78,216,0.1), 0 0 0 1px rgba(255,255,255,0.04) inset",
              textAlign: "right",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h2 style={{ fontSize: 17, fontWeight: 900, color: "#f8fafc" }}>اطلاعات پروفایل</h2>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "linear-gradient(135deg,rgba(29,78,216,0.3),rgba(16,185,129,0.2))",
                  border: "1px solid rgba(59,130,246,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                }}>👤</div>
              </div>

              {saveMessage && (
                <div style={{
                  background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
                  color: "#34d399", fontSize: 12, padding: "8px 12px",
                  borderRadius: 10, marginBottom: 14, textAlign: "center",
                }}>{saveMessage}</div>
              )}
              {saveError && (
                <div style={{
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                  color: "#f87171", fontSize: 12, padding: "8px 12px",
                  borderRadius: 10, marginBottom: 14, textAlign: "center",
                }}>{saveError}</div>
              )}

              {!editMode ? (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
                    {[
                      { lbl: "نام و نام خانوادگی", val: `${user?.firstName} ${user?.lastName}` },
                      { lbl: "ایمیل", val: user?.email, ltr: true },
                      { lbl: "وضعیت تحصیلی", val: user?.education ? educationLabels[user.education] || user.education : "—" },
                    ].map((item) => (
                      <div key={item.lbl}>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{item.lbl}</div>
                        <div style={{
                          fontSize: 14, fontWeight: 700, color: "#e2e8f0",
                          ...(item.ltr ? { direction: "ltr", textAlign: "right" } : {}),
                        }}>{item.val}</div>
                      </div>
                    ))}
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
                      cursor: "pointer", boxShadow: "0 6px 20px rgba(29,78,216,0.3)",
                      transition: "transform 0.18s, box-shadow 0.18s",
                    }}
                  >ویرایش اطلاعات</button>
                </>
              ) : (
                <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div className="profile-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { lbl: "نام", key: "firstName" },
                      { lbl: "نام خانوادگی", key: "lastName" },
                    ].map((f) => (
                      <div key={f.key}>
                        <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 5, fontWeight: 600 }}>{f.lbl}</label>
                        <input
                          type="text" required className="auth-input"
                          value={formData[f.key as keyof typeof formData]}
                          onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 5, fontWeight: 600 }}>وضعیت تحصیلی</label>
                    <select className="auth-input" required value={formData.education}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}>
                      <option value="">انتخاب کنید</option>
                      <option value="student">دانش‌آموز</option>
                      <option value="university">دانشجو</option>
                      <option value="graduate">فارغ‌التحصیل</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    <button type="submit" disabled={saving} className="auth-submit" style={{
                      flex: 1, background: "linear-gradient(135deg,#1d4ed8,#1e40af)",
                      color: "#fff", border: "none", borderRadius: 12, padding: "11px 16px",
                      fontFamily: "Vazirmatn, sans-serif", fontSize: 14, fontWeight: 800,
                      cursor: "pointer", boxShadow: "0 6px 20px rgba(29,78,216,0.3)",
                      transition: "transform 0.18s, box-shadow 0.18s",
                    }}>
                      {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
                    </button>
                    <button type="button" className="ghost-btn" style={{ flex: "0 0 auto" }}
                      onClick={() => {
                        setEditMode(false); setSaveError("");
                        if (user) setFormData({ firstName: user.firstName, lastName: user.lastName, education: user.education });
                      }}>
                      انصراف
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* ستون راست: آمار + لیست */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", gap: 12 }}>
                {[
                  { val: attempts.length, lbl: "آزمون انجام‌شده", color: "#3b82f6", bg: "rgba(59,130,246,0.06)", border: "rgba(59,130,246,0.15)" },
                  { val: attempts.length > 0 ? formatDate(attempts[0].created_at) : "—", lbl: "آخرین آزمون", color: "#10b981", bg: "rgba(16,185,129,0.06)", border: "rgba(16,185,129,0.15)" },
                ].map((s) => (
                  <div key={s.lbl} style={{
                    flex: 1, background: s.bg, border: `1px solid ${s.border}`,
                    borderRadius: 16, padding: "16px 18px", textAlign: "right",
                  }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{s.lbl}</div>
                  </div>
                ))}
              </div>

              <div style={{
                background: "linear-gradient(145deg,rgba(15,31,61,0.95),rgba(7,13,26,0.98))",
                border: "1px solid rgba(59,130,246,0.18)",
                borderRadius: 24, padding: "24px",
                boxShadow: "0 0 40px rgba(29,78,216,0.1), 0 0 0 1px rgba(255,255,255,0.04) inset",
                textAlign: "right",
              }}>
                <h2 style={{ fontSize: 17, fontWeight: 900, color: "#f8fafc", marginBottom: 4 }}>تاریخچه آزمون‌ها</h2>
                <p style={{ fontSize: 12, color: "#64748b", marginBottom: 18 }}>
                  هر آزمون به‌صورت جدا و با تاریخ مربوط به خودش نگه داشته می‌شود
                </p>

                {attempts.length === 0 ? (
                  <div style={{
                    border: "1px dashed rgba(59,130,246,0.25)", borderRadius: 16,
                    padding: "36px 20px", textAlign: "center",
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>🧭</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>هنوز هیچ آزمونی ثبت نکرده‌ای</div>
                    <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 18, lineHeight: 1.8 }}>
                      با شرکت در آزمون مسیریابی شغلی، نتایج اینجا به‌ترتیب زمان نمایش داده می‌شوند.
                    </div>
                    <button onClick={() => router.push("/quiz")} className="auth-submit" style={{
                      background: "linear-gradient(135deg,#1d4ed8,#1e40af)",
                      color: "#fff", border: "none", borderRadius: 12, padding: "10px 24px",
                      fontFamily: "Vazirmatn, sans-serif", fontSize: 13, fontWeight: 800,
                      cursor: "pointer", boxShadow: "0 6px 20px rgba(29,78,216,0.3)",
                      transition: "transform 0.18s, box-shadow 0.18s",
                    }}>شروع آزمون جدید ←</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {attempts.map((attempt, idx) => (
                      <div key={attempt.id} className="attempt-card"
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
                          }}>#{attempts.length - idx}</div>
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
