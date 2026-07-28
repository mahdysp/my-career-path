// مسیر فایل: app/dashboard/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RIASEC_AXES, matchProfile } from "@/lib/onet-profiles";
import SiteNav from "@/app/components/SiteNav";
import { agoFa, dateFa, monthFa, num } from "@/lib/format";

/* ─────────────────────────── انواع ─────────────────────────── */

type CareerPath = {
  title?: string;
  match_percentage?: number;
  description?: string;
  required_skills?: string[];
  avg_salary?: string;
};

type Trait = { trait?: string; description?: string; score?: number };

type ResultData = {
  summary?: string;
  personality_traits?: Trait[];
  career_paths?: CareerPath[];
  strengths?: string[];
  areas_to_improve?: string[];
};

type QuizAttempt = {
  id: string;
  created_at: string;
  query: string | null;
  result_summary: string | null;
  result_data?: ResultData | null;
};

type UserData = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  education: string;
  memberSince?: string | null;
};

/* ─────────────────────────── استایل ─────────────────────────── */

const styles = `
  @keyframes k2Float1 { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(20px,-30px) rotate(2deg); } }
  @keyframes k2Float2 { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(-24px,20px) rotate(-2deg); } }
  @keyframes k2FadeUp { from { opacity:0; transform: translateY(18px); } to { opacity:1; transform: translateY(0); } }
  @keyframes k2Spin { to { transform: rotate(360deg); } }
  @keyframes k2Pulse { 0%,100% { opacity:1; transform: scale(1); } 50% { opacity:.35; transform: scale(.72); } }
  @keyframes k2Shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  @keyframes k2Shake {
    10%,90% { transform: translateX(-1px); } 20%,80% { transform: translateX(2px); }
    30%,50%,70% { transform: translateX(-3px); } 40%,60% { transform: translateX(3px); }
  }

  .k2-f1 { animation: k2FadeUp .6s cubic-bezier(.16,1,.3,1) both; }
  .k2-f2 { animation: k2FadeUp .6s cubic-bezier(.16,1,.3,1) both; animation-delay: .07s; }
  .k2-f3 { animation: k2FadeUp .6s cubic-bezier(.16,1,.3,1) both; animation-delay: .14s; }
  .k2-f4 { animation: k2FadeUp .6s cubic-bezier(.16,1,.3,1) both; animation-delay: .21s; }

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
  .k2-btn:disabled { cursor: not-allowed; opacity: .5; }
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
    overflow: hidden;
  }
  .k2-card::before {
    content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
    background: radial-gradient(340px circle at var(--mx,50%) var(--my,50%), rgba(94,106,210,.13), transparent 60%);
    opacity: 0; transition: opacity .3s ease;
  }
  @media (hover: hover) and (pointer: fine) {
    .k2-card:hover::before { opacity: 1; }
  }

  .k2-sec-label {
    font-family: var(--font-mono); font-size: 11px; letter-spacing: .1em; color: var(--accent);
  }
  .k2-sec-title {
    font-weight: 700; font-size: 17px; letter-spacing: -.01em; color: var(--foreground); margin: 6px 0 0;
  }

  .k2-icon-box {
    width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0;
    border: 1px solid var(--border-hover); background: var(--surface);
    display: flex; align-items: center; justify-content: center; color: var(--accent);
  }

  /* چیدمان */
  .k2-shell { max-width: 1180px; margin: 0 auto; padding: 0 clamp(16px,4vw,36px); }
  .k2-grid {
    display: grid; grid-template-columns: minmax(0,1.3fr) minmax(300px,.85fr);
    gap: 18px; align-items: start;
  }
  .k2-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
  .k2-stats > * { min-width: 0; }
  .k2-grid > * { min-width: 0; }

  /* DNA: نمودار با عرض ثابت، نوارها بقیه فضا — بدون کِش آمدن */
  .k2-dna {
    display: grid; grid-template-columns: 210px minmax(0,1fr);
    gap: 20px; align-items: center; margin-top: 14px;
  }
  .k2-dna-chart { width: 210px; height: 186px; overflow: visible; }
  .k2-dna-bars { min-width: 0; }

  .k2-stat {
    padding: 16px 18px; text-align: right;
  }
  .k2-stat-num { font-family: var(--font-mono); font-size: 24px; color: var(--foreground); line-height: 1.2; }
  .k2-stat-lbl { font-size: 11.5px; color: var(--foreground-subtle); margin-top: 6px; }

  /* لیست آزمون‌ها */
  .k2-row {
    display: flex; align-items: center; gap: 14px; width: 100%; text-align: right;
    padding: 15px 18px; background: transparent; border: none; cursor: pointer;
    border-bottom: 1px solid var(--border-default);
    transition: background .2s ease;
    font-family: var(--font-sans);
  }
  .k2-row:last-child { border-bottom: none; }
  .k2-row:hover { background: rgba(255,255,255,.03); }
  .k2-row:hover .k2-row-go { opacity: 1; transform: translateX(-3px); }
  .k2-row-go { opacity: 0; transition: all .2s ease; color: var(--accent); flex-shrink: 0; }
  .k2-row-idx {
    width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-mono); font-size: 11.5px;
    background: var(--surface); border: 1px solid var(--border-default); color: var(--foreground-muted);
  }

  /* تراشه */
  .k2-chip {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11.5px; color: var(--foreground-muted);
    background: var(--surface); border: 1px solid var(--border-default);
    border-radius: 100px; padding: 4px 10px;
  }

  /* نوار افقی */
  .k2-bar { height: 6px; border-radius: 100px; background: var(--track); overflow: hidden; }
  .k2-bar > i {
    display: block; height: 100%; border-radius: 100px;
    background: linear-gradient(90deg,#5e6ad2,#a855f7);
    box-shadow: 0 0 10px rgba(94,106,210,.45);
    transition: width .9s cubic-bezier(.16,1,.3,1);
  }

  /* تقویم فعالیت */
  /* تقویم فعالیت */
  .k2-heat-wrap { display: flex; gap: 7px; direction: rtl; }
  .k2-heat-dows {
    display: grid; grid-template-rows: repeat(7, 13px); gap: 3px;
    font-size: 9px; color: var(--foreground-subtle); flex-shrink: 0;
  }
  .k2-heat-dows span { line-height: 13px; height: 13px; text-align: left; }
  .k2-heat-scroll { overflow-x: auto; padding-bottom: 2px; }
  .k2-heat-months {
    display: grid; gap: 3px; direction: rtl;
    font-size: 9.5px; color: var(--foreground-subtle); margin-bottom: 4px; height: 13px;
  }
  .k2-heat-months span { white-space: nowrap; line-height: 13px; }
  .k2-heat {
    display: grid; grid-template-rows: repeat(7, 13px);
    grid-auto-flow: column; gap: 3px; direction: rtl;
  }
  .k2-heat i {
    width: 13px; height: 13px; border-radius: 3px; display: block;
    background: var(--heat-0);
    box-shadow: inset 0 0 0 1px var(--heat-edge);
    transition: transform .14s ease, filter .14s ease;
  }
  .k2-heat i:hover { transform: scale(1.25); filter: brightness(1.12); }
  .k2-heat i.is-future { background: transparent; box-shadow: none; }
  .k2-heat i.is-today { box-shadow: inset 0 0 0 1.4px var(--foreground-muted); }
  .k2-legend i {
    width: 11px; height: 11px; border-radius: 2.5px; display: inline-block;
    box-shadow: inset 0 0 0 1px var(--heat-edge);
  }

  /* اسکلت بارگذاری */
  .k2-skel {
    background: linear-gradient(90deg, rgba(255,255,255,.04) 25%, rgba(255,255,255,.09) 50%, rgba(255,255,255,.04) 75%);
    background-size: 200% 100%; animation: k2Shimmer 1.4s linear infinite; border-radius: 10px;
  }

  .k2-input {
    width: 100%; background: var(--input-bg); border: 1px solid var(--border-default);
    border-radius: 10px; padding: 11px 13px; color: var(--foreground);
    font-family: var(--font-sans); font-size: 14px; outline: none;
    transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
  }
  .k2-input:focus {
    border-color: var(--border-accent); background: var(--input-bg-focus);
    box-shadow: 0 0 0 3px rgba(94,106,210,.12);
  }
  select.k2-input { appearance: none; -webkit-appearance: none; cursor: pointer; }
  select.k2-input option { background: var(--option-bg); color: var(--foreground); }

  .k2-alert {
    display: flex; align-items: flex-start; gap: 9px; text-align: right;
    font-size: 12.5px; line-height: 1.7; padding: 10px 12px; border-radius: 9px;
  }
  .k2-alert.err { background: rgba(248,113,113,.08); border: 1px solid rgba(248,113,113,.25); color: #fca5a5; animation: k2Shake .4s ease both; }
  .k2-alert.ok  { background: rgba(74,222,128,.08);  border: 1px solid rgba(74,222,128,.25);  color: #86efac; }

  .k2-spinner {
    width: 15px; height: 15px; border: 2px solid rgba(255,255,255,.25);
    border-top-color: #fff; border-radius: 50%; animation: k2Spin .7s linear infinite;
  }

  .k2-link { color: var(--accent); text-decoration: none; transition: color .2s ease; }
  .k2-link:hover { color: var(--accent-bright); text-decoration: underline; }

  /* ── واکنش‌گرایی: از بزرگ به کوچک، تا قانون بعدی قبلی را بازنویسی کند ── */
  @media (max-width: 940px) {
    .k2-grid { grid-template-columns: 1fr !important; }
    .k2-stats { grid-template-columns: repeat(2,1fr) !important; }
    .k2-nav-hide { display: none !important; }
  }

  @media (max-width: 620px) {
    /* نمودار و نوارها زیر هم — در غیر این صورت نوارها له می‌شوند */
    .k2-dna { grid-template-columns: 1fr !important; justify-items: center; gap: 16px; }
    .k2-dna-bars { width: 100%; }
    .k2-shell { padding: 0 14px; }
    .k2-card-pad-sm { padding: 18px 16px !important; }
    .k2-heat-scroll { -webkit-overflow-scrolling: touch; }
  }

  @media (max-width: 380px) {
    .k2-stats { grid-template-columns: 1fr !important; }
    .k2-dna-chart { width: 100%; max-width: 210px; height: auto; }
    .k2-shell { padding: 0 12px; }
  }
`;

/* ─────────────────────────── کمکی‌ها ─────────────────────────── */

const EDU_LABEL: Record<string, string> = {
  student: "دانش‌آموز",
  university: "دانشجو",
  graduate: "فارغ‌التحصیل",
};

/* قالب‌بندی مشترک — ارقام در کل سایت لاتین‌اند (lib/format.ts) */
const toFa = (n: number | string) =>
  typeof n === "number" ? num(n) : String(n);
const faDate = (d: Date) => dateFa(d, { weekday: true });
const fmtDate = (iso: string) => dateFa(iso);
const relTime = (iso: string) => agoFa(iso);

/* ─────────────────────────── صفحه ─────────────────────────── */

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", education: "" });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  const [hoverAxis, setHoverAxis] = useState<number | null>(null);

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

  const spotlight = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  }, []);


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
      setSaveMessage(data.message || "اطلاعات به‌روزرسانی شد.");
      setEditMode(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "خطایی پیش آمده است.");
    } finally {
      setSaving(false);
    }
  };

  /* ── DNA مهارتی: تجمیع همه آزمون‌ها روی محورهای RIASEC ── */
  const dna = useMemo(() => {
    const sums = new Array(RIASEC_AXES.length).fill(0);
    let matched = 0;

    for (const a of attempts) {
      const prof = matchProfile(a.query || "");
      if (!prof) continue;
      matched++;
      RIASEC_AXES.forEach((ax, i) => {
        sums[i] += prof.scores[ax.key];
      });
    }
    if (!matched) return null;
    return sums.map((s) => Math.round(s / matched));
  }, [attempts]);

  /* ── جدول مسیرهای شغلی از تحلیل‌های ذخیره‌شده ── */
  const topCareers = useMemo(() => {
    const map = new Map<string, { title: string; best: number; times: number }>();
    for (const a of attempts) {
      for (const c of a.result_data?.career_paths ?? []) {
        if (!c?.title) continue;
        const key = c.title.trim();
        const pct = typeof c.match_percentage === "number" ? c.match_percentage : 0;
        const cur = map.get(key);
        if (cur) {
          cur.best = Math.max(cur.best, pct);
          cur.times += 1;
        } else {
          map.set(key, { title: key, best: pct, times: 1 });
        }
      }
    }
    return [...map.values()].sort((x, y) => y.best - x.best).slice(0, 5);
  }, [attempts]);

  /* ── نقاط قوت پرتکرار ── */
  const topStrengths = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of attempts) {
      for (const s of a.result_data?.strengths ?? []) {
        if (!s) continue;
        map.set(s.trim(), (map.get(s.trim()) ?? 0) + 1);
      }
    }
    return [...map.entries()].sort((x, y) => y[1] - x[1]).slice(0, 6).map(([t]) => t);
  }, [attempts]);

  /* ── تقویم فعالیت ──
     نکته‌ها:
     • کلید روز به وقت محلی ساخته می‌شود؛ toISOString() چون UTC است در ایران
       (UTC+3:30) فعالیت‌های بعدازظهر را به روز بعد منتقل می‌کرد.
     • هفته از «شنبه» شروع می‌شود (تقویم ایرانی)، نه یکشنبه.                       */
  const heat = useMemo(() => {
    const dayKey = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    // شنبه = ۰ … جمعه = ۶
    const persianDow = (d: Date) => (d.getDay() + 1) % 7;

    const counts = new Map<string, number>();
    for (const a of attempts) {
      counts.set(dayKey(new Date(a.created_at)), (counts.get(dayKey(new Date(a.created_at))) ?? 0) + 1);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // آخرین ستون کامل شود: تا پایان همین هفته جلو می‌رویم
    const end = new Date(today);
    end.setDate(end.getDate() + (6 - persianDow(today)));

    const WEEKS = 18;
    const start = new Date(end);
    start.setDate(start.getDate() - (WEEKS * 7 - 1));

    const cells: { key: string; date: Date; n: number; future: boolean; isToday: boolean }[] = [];
    for (let i = 0; i < WEEKS * 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      cells.push({
        key: dayKey(d),
        date: d,
        n: counts.get(dayKey(d)) ?? 0,
        future: d.getTime() > today.getTime(),
        isToday: d.getTime() === today.getTime(),
      });
    }

    // برچسب ماه شمسی بالای هر ستونی که ماه در آن عوض می‌شود
    const monthOf = (d: Date) => monthFa(d);
    const months: { col: number; label: string }[] = [];
    for (let w = 0; w < WEEKS; w++) {
      const first = cells[w * 7];
      const label = monthOf(first.date);
      if (w === 0 || label !== months[months.length - 1]?.label) {
        months.push({ col: w, label });
      }
    }

    const total = attempts.length;
    const activeDays = [...counts.values()].filter(Boolean).length;

    return { cells, months, weeks: WEEKS, total, activeDays };
  }, [attempts]);

  const uniqueFields = useMemo(
    () => new Set(attempts.map((a) => (a.query || "").trim()).filter(Boolean)).size,
    [attempts]
  );

  const bestMatch = useMemo(
    () => (topCareers.length ? topCareers[0].best : 0),
    [topCareers]
  );

  /* ── هندسه رادار ── */
  const R = 74, CX = 110, CY = 104;
  const axisPt = (i: number, r: number) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / RIASEC_AXES.length;
    return [CX + Math.cos(ang) * r, CY + Math.sin(ang) * r] as const;
  };
  const poly = (vals: number[]) => vals.map((v, i) => axisPt(i, (R * v) / 100).join(",")).join(" ");

  /* ─────────────── بارگذاری ─────────────── */
  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <main dir="rtl" style={shellStyle}>
          <div className="k2-grid-overlay" />
          <div className="k2-shell" style={{ position: "relative", zIndex: 10, paddingTop: 90 }}>
            <div className="k2-skel" style={{ height: 34, width: 220, marginBottom: 26 }} />
            <div className="k2-stats" style={{ marginBottom: 18 }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="k2-skel" style={{ height: 92 }} />
              ))}
            </div>
            <div className="k2-grid">
              <div className="k2-skel" style={{ height: 340 }} />
              <div className="k2-skel" style={{ height: 340 }} />
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!user) return null;

  const fullName = `${user.firstName} ${user.lastName}`.trim() || user.email;
  const initials = (user.firstName?.[0] || user.email[0] || "K").toUpperCase();

  return (
    <>
      <style>{styles}</style>

      <main dir="rtl" style={shellStyle}>
        <div
          style={{
            position: "absolute", top: "-260px", left: "50%", transform: "translateX(-50%)",
            width: 1100, height: 700, borderRadius: "50%",
            background: "radial-gradient(circle, var(--blob-1), transparent 70%)",
            filter: "blur(140px)", pointerEvents: "none", animation: "k2Float1 9s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute", top: "40%", left: "-240px",
            width: 620, height: 800, borderRadius: "50%",
            background: "radial-gradient(circle, var(--blob-2), transparent 70%)",
            filter: "blur(120px)", pointerEvents: "none", animation: "k2Float2 11s ease-in-out infinite",
          }}
        />
        <div className="k2-grid-overlay" />
        <div className="k2-noise" />

        <div style={{ position: "relative", zIndex: 10 }}>
          {/* ── ناوبار ── */}
          <SiteNav />
          <div className="kn-spacer" />

          <div className="k2-shell" style={{ padding: "clamp(28px,5vw,44px) clamp(16px,4vw,36px) 72px" }}>
            {/* ── سربرگ ── */}
            <div className="k2-f1" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 26, flexWrap: "wrap" }}>
              <div
                style={{
                  width: 54, height: 54, borderRadius: 16, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 21, fontWeight: 700, color: "#fff",
                  background: "linear-gradient(135deg,#5e6ad2,#a855f7)",
                  boxShadow: "0 6px 22px rgba(94,106,210,.4)",
                }}
              >
                {initials}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h1 className="k2-gradient-text" style={{ fontWeight: 700, fontSize: 25, letterSpacing: "-.02em", margin: 0, lineHeight: 1.3 }}>
                  سلام، {fullName}
                </h1>
                <p style={{ fontSize: 13, color: "var(--foreground-muted)", margin: "5px 0 0" }}>
                  {attempts.length > 0
                    ? `تا حالا ${attempts.length} آزمون داده‌اید — پروفایل شغلی‌تان در حال شکل‌گیری است.`
                    : "برای ساختن پروفایل شغلی‌تان، اولین آزمون را شروع کنید."}
                </p>
              </div>
            </div>

            {/* ── آمار ── */}
            <div className="k2-stats k2-f2" style={{ marginBottom: 18 }}>
              {[
                { num: attempts.length, lbl: "آزمون انجام‌شده" },
                { num: uniqueFields, lbl: "حوزه بررسی‌شده" },
                { num: bestMatch ? `٪${bestMatch}` : "—", lbl: "بالاترین تطابق" },
                { num: attempts.length ? fmtDate(attempts[0].created_at) : "—", lbl: "آخرین فعالیت", small: true },
              ].map((s) => (
                <div key={s.lbl} className="k2-card k2-stat" onMouseMove={spotlight}>
                  <div className="k2-stat-num" style={s.small ? { fontSize: 15, lineHeight: 1.9 } : undefined}>{s.num}</div>
                  <div className="k2-stat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>

            {/* ── شبکه اصلی ── */}
            <div className="k2-grid">
              {/* ستون راست (اصلی) */}
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {/* DNA مهارتی */}
                <div className="k2-card k2-f3 k2-card-pad-sm" onMouseMove={spotlight} style={{ padding: "22px 24px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
                    <div>
                      <span className="k2-sec-label">DNA شغلی شما</span>
                      <h2 className="k2-sec-title">پروفایل تجمیعی علاقه</h2>
                    </div>
                    <span className="k2-chip">
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 8px var(--accent-glow)" }} />
                      RIASEC
                    </span>
                  </div>

                  {dna ? (
                    <div className="k2-dna">
                      <svg viewBox="-8 0 244 210" className="k2-dna-chart">
                        <defs>
                          <radialGradient id="dnaFill" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#5e6ad2" stopOpacity=".45" />
                            <stop offset="100%" stopColor="#a855f7" stopOpacity=".12" />
                          </radialGradient>
                        </defs>
                        {[25, 50, 75, 100].map((k) => (
                          <polygon key={k} points={poly(RIASEC_AXES.map(() => k))} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="1" />
                        ))}
                        {RIASEC_AXES.map((ax, i) => {
                          const [x, y] = axisPt(i, R);
                          const [lx, ly] = axisPt(i, R + 21);
                          const hot = hoverAxis === i;
                          return (
                            <g key={ax.key} onMouseEnter={() => setHoverAxis(i)} onMouseLeave={() => setHoverAxis(null)}>
                              <line x1={CX} y1={CY} x2={x} y2={y} stroke="rgba(255,255,255,.05)" strokeWidth="1" />
                              <circle cx={lx} cy={ly - 4} r="18" fill="transparent" />
                              <text
                                x={lx} y={ly}
                                textAnchor={Math.abs(lx - CX) < 8 ? "middle" : lx > CX ? "start" : "end"}
                                fill={hot ? "var(--foreground)" : "var(--foreground-muted)"} fontSize="10"
                                style={{ transition: "fill .2s ease" }}
                              >
                                {ax.label}
                              </text>
                            </g>
                          );
                        })}
                        <polygon points={poly(dna)} fill="url(#dnaFill)" stroke="#6872d9" strokeWidth="1.9" strokeLinejoin="round" />
                        {dna.map((v, i) => {
                          const [x, y] = axisPt(i, (R * v) / 100);
                          return <circle key={i} cx={x} cy={y} r={hoverAxis === i ? 4.6 : 3} fill="var(--node-fill)" stroke={hoverAxis === i ? "#a855f7" : "#5e6ad2"} strokeWidth="1.6" style={{ transition: "all .18s ease" }} />;
                        })}
                      </svg>

                      <div className="k2-dna-bars">
                        {RIASEC_AXES.map((ax, i) => (
                          <div
                            key={ax.key}
                            onMouseEnter={() => setHoverAxis(i)}
                            onMouseLeave={() => setHoverAxis(null)}
                            style={{ marginBottom: 9, opacity: hoverAxis === null || hoverAxis === i ? 1 : 0.45, transition: "opacity .2s ease" }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 }}>
                              <span style={{ color: "var(--foreground-muted)" }}>{ax.label}</span>
                              <span style={{ fontFamily: "var(--font-mono)", color: "var(--foreground-subtle)" }}>{dna[i]}</span>
                            </div>
                            <div className="k2-bar"><i style={{ width: `${dna[i]}%` }} /></div>
                          </div>
                        ))}
                        <p style={{ fontSize: 10.5, color: "var(--foreground-subtle)", lineHeight: 1.7, margin: "10px 0 0" }}>
                          میانگین پروفایل حوزه‌هایی که آزمون داده‌اید، بر پایه داده‌های O*NET
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, color: "var(--foreground-muted)", lineHeight: 1.9, margin: "12px 0 0" }}>
                      پس از اولین آزمون، نمودار DNA شغلی شما اینجا ساخته می‌شود.
                    </p>
                  )}
                </div>

                {/* تاریخچه آزمون‌ها */}
                <div className="k2-card k2-f3" onMouseMove={spotlight}>
                  <div style={{ padding: "20px 24px 14px", borderBottom: attempts.length ? "1px solid var(--border-default)" : "none" }}>
                    <span className="k2-sec-label">تاریخچه</span>
                    <h2 className="k2-sec-title">آزمون‌های شما</h2>
                  </div>

                  {attempts.length === 0 ? (
                    <div style={{ padding: "34px 24px", textAlign: "center" }}>
                      <div className="k2-icon-box" style={{ margin: "0 auto 14px", width: 46, height: 46 }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                          <path d="M9 5h6M7 5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                          <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                        </svg>
                      </div>
                      <p style={{ fontSize: 13.5, color: "var(--foreground-muted)", lineHeight: 1.9, margin: "0 0 18px" }}>
                        هنوز آزمونی انجام نداده‌اید.
                      </p>
                      <button className="k2-btn k2-btn-primary" onClick={() => router.push("/quiz")} style={{ height: 42, padding: "0 24px", fontSize: 14 }}>
                        شروع اولین آزمون
                      </button>
                    </div>
                  ) : (
                    <div>
                      {attempts.map((a, i) => (
                        <button key={a.id} className="k2-row" onClick={() => router.push(`/result?attempt=${a.id}`)}>
                          <span className="k2-row-idx">{String(attempts.length - i).padStart(2, "0")}</span>
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span
                              style={{
                                display: "block", fontWeight: 500, fontSize: 14, color: "var(--foreground)",
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                              }}
                            >
                              {a.query || "آزمون مسیریابی شغلی"}
                            </span>
                            <span
                              style={{
                                display: "block", fontSize: 12, color: "var(--foreground-muted)", marginTop: 3,
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                              }}
                            >
                              {a.result_summary || "بدون خلاصه"}
                            </span>
                          </span>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--foreground-subtle)", flexShrink: 0 }}>
                            {relTime(a.created_at)}
                          </span>
                          <svg className="k2-row-go" width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path d="M14 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ستون چپ (کناری) */}
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {/* مسیرهای برتر */}
                {topCareers.length > 0 && (
                  <div className="k2-card k2-f2 k2-card-pad-sm" onMouseMove={spotlight} style={{ padding: "20px 22px" }}>
                    <span className="k2-sec-label">بر اساس تحلیل‌ها</span>
                    <h2 className="k2-sec-title" style={{ marginBottom: 16 }}>مسیرهای برتر شما</h2>

                    {topCareers.map((c, i) => (
                      <div key={c.title} style={{ marginBottom: i === topCareers.length - 1 ? 0 : 13 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 5 }}>
                          <span style={{ fontSize: 13, color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {c.title}
                          </span>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: i === 0 ? "var(--accent)" : "var(--foreground-subtle)", flexShrink: 0 }}>
                            ٪{num(c.best)}
                          </span>
                        </div>
                        <div className="k2-bar"><i style={{ width: `${c.best}%` }} /></div>
                      </div>
                    ))}
                  </div>
                )}

                {/* نقاط قوت */}
                {topStrengths.length > 0 && (
                  <div className="k2-card k2-f3 k2-card-pad-sm" onMouseMove={spotlight} style={{ padding: "20px 22px" }}>
                    <span className="k2-sec-label">تکرارشونده</span>
                    <h2 className="k2-sec-title" style={{ marginBottom: 14 }}>نقاط قوت شما</h2>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {topStrengths.map((s) => (
                        <span key={s} className="k2-chip">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ color: "#4ade80" }}>
                            <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* تقویم فعالیت */}
                <div className="k2-card k2-f3 k2-card-pad-sm" onMouseMove={spotlight} style={{ padding: "20px 22px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
                    <div>
                      <span className="k2-sec-label">۱۸ هفته اخیر</span>
                      <h2 className="k2-sec-title">فعالیت شما</h2>
                    </div>
                    {heat.total > 0 && (
                      <span className="k2-chip" style={{ flexShrink: 0 }}>
                        {toFa(heat.total)} آزمون در {toFa(heat.activeDays)} روز
                      </span>
                    )}
                  </div>

                  <div className="k2-heat-wrap">
                    {/* روزهای هفته — شنبه بالا */}
                    <div className="k2-heat-dows" aria-hidden="true">
                      {["ش", "", "د", "", "چ", "", "ج"].map((d, i) => (
                        <span key={i}>{d}</span>
                      ))}
                    </div>

                    <div className="k2-heat-scroll">
                      {/* برچسب ماه‌های شمسی */}
                      <div
                        className="k2-heat-months"
                        style={{ gridTemplateColumns: `repeat(${heat.weeks}, 13px)` }}
                        aria-hidden="true"
                      >
                        {heat.months.map((m) => (
                          <span key={`${m.col}-${m.label}`} style={{ gridColumn: `${m.col + 1} / span 4` }}>
                            {m.label}
                          </span>
                        ))}
                      </div>

                      <div className="k2-heat" role="img" aria-label={`تقویم فعالیت: ${heat.total} آزمون در ${heat.activeDays} روز`}>
                        {heat.cells.map((d) => (
                          <i
                            key={d.key}
                            className={d.future ? "is-future" : d.isToday ? "is-today" : undefined}
                            title={d.future ? undefined : `${faDate(d.date)}${d.n ? ` — ${toFa(d.n)} آزمون` : " — بدون فعالیت"}`}
                            style={d.n ? { background: `var(--heat-${Math.min(d.n, 4)})` } : undefined}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div
                    className="k2-legend"
                    style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5, marginTop: 12, fontSize: 10.5, color: "var(--foreground-subtle)" }}
                  >
                    <span>کمتر</span>
                    <i style={{ background: "var(--heat-0)" }} />
                    <i style={{ background: "var(--heat-1)" }} />
                    <i style={{ background: "var(--heat-2)" }} />
                    <i style={{ background: "var(--heat-3)" }} />
                    <i style={{ background: "var(--heat-4)" }} />
                    <span>بیشتر</span>
                  </div>
                </div>

                {/* پروفایل */}
                <div className="k2-card k2-f4 k2-card-pad-sm" onMouseMove={spotlight} style={{ padding: "20px 22px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
                    <div>
                      <span className="k2-sec-label">حساب کاربری</span>
                      <h2 className="k2-sec-title">اطلاعات شما</h2>
                    </div>
                    {!editMode && (
                      <button
                        className="k2-btn k2-btn-secondary"
                        onClick={() => { setEditMode(true); setSaveMessage(""); setSaveError(""); }}
                        style={{ fontSize: 12.5, height: 32, padding: "0 12px" }}
                      >
                        ویرایش
                      </button>
                    )}
                  </div>

                  {saveMessage && (
                    <div className="k2-alert ok" style={{ marginBottom: 12 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                        <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>{saveMessage}</span>
                    </div>
                  )}
                  {saveError && (
                    <div className="k2-alert err" style={{ marginBottom: 12 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                        <path d="M12 7.5v5.5M12 16.2v.3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                      </svg>
                      <span>{saveError}</span>
                    </div>
                  )}

                  {!editMode ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                      {[
                        { k: "نام و نام خانوادگی", v: fullName },
                        { k: "ایمیل", v: user.email, mono: true },
                        { k: "وضعیت تحصیلی", v: EDU_LABEL[user.education] || "—" },
                        ...(user.memberSince ? [{ k: "عضو از", v: fmtDate(user.memberSince) }] : []),
                      ].map((r) => (
                        <div key={r.k} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12.5 }}>
                          <span style={{ color: "var(--foreground-subtle)", flexShrink: 0 }}>{r.k}</span>
                          <span
                            style={{
                              color: "var(--foreground)", textAlign: "left", minWidth: 0,
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                              fontFamily: r.mono ? "var(--font-mono)" : undefined,
                              fontSize: r.mono ? 11.5 : undefined,
                              direction: r.mono ? "ltr" : undefined,
                            }}
                            title={r.v}
                          >
                            {r.v}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                      <input
                        className="k2-input"
                        placeholder="نام"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                      <input
                        className="k2-input"
                        placeholder="نام خانوادگی"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                      <select
                        className="k2-input"
                        required
                        value={formData.education}
                        onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      >
                        <option value="">وضعیت تحصیلی…</option>
                        <option value="student">دانش‌آموز</option>
                        <option value="university">دانشجو</option>
                        <option value="graduate">فارغ‌التحصیل</option>
                      </select>
                      <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
                        <button type="submit" disabled={saving} className="k2-btn k2-btn-primary" style={{ flex: 1, height: 40, fontSize: 13.5 }}>
                          {saving ? <><span className="k2-spinner" />ذخیره…</> : "ذخیره"}
                        </button>
                        <button
                          type="button"
                          className="k2-btn k2-btn-secondary"
                          onClick={() => {
                            setEditMode(false);
                            setSaveError("");
                            setFormData({ firstName: user.firstName, lastName: user.lastName, education: user.education });
                          }}
                          style={{ height: 40, padding: "0 16px", fontSize: 13.5 }}
                        >
                          انصراف
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>

          <footer style={{ borderTop: "1px solid var(--border-default)", padding: "22px clamp(16px,4vw,36px)", textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "var(--foreground-subtle)", fontFamily: "var(--font-mono)", margin: 0 }}>
              © Karex — تمامی حقوق محفوظ است
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}

const shellStyle: React.CSSProperties = {
  position: "relative",
  minHeight: "100vh",
  width: "100%",
  background: "var(--page-gradient)",
  fontFamily: "var(--font-sans)",
  overflow: "hidden",
};
