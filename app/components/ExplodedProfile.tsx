"use client";

import { useEffect, useRef, useState } from "react";
import { RIASEC_AXES } from "@/lib/onet-profiles";

/**
 * «نمای انفجاری» پروفایل شغلی.
 *
 * ایده: شش بُعد RIASEC مثل قطعات یک ماشین‌اند. در ابتدای اسکرول از هم
 * پاشیده‌اند (شناختِ پراکنده)، و با پیش‌رفتن اسکرول کنار هم می‌نشینند و یک
 * پروفایل واحد می‌سازند — همان کاری که آزمون Karex انجام می‌دهد.
 *
 * پیاده‌سازی با SVG خالص و یک requestAnimationFrame؛ بدون کتابخانه و
 * بدون WebGL تا روی موبایل هم سبک بماند.
 */

type Part = {
  key: string;
  /** شعاع بیرونی چرخ‌دنده */
  r: number;
  /** عمق (ضخامت دیده‌شده در پرسپکتیو) */
  depth: number;
  /** جای نهایی وقتی مونتاژ شده */
  assembled: number;
  /** جای اولیه وقتی پاشیده */
  exploded: number;
  /** تعداد دندانه */
  teeth: number;
};

const PARTS: Part[] = [
  { key: "R", r: 104, depth: 34, assembled: 300, exploded: 96, teeth: 30 },
  { key: "I", r: 74, depth: 26, assembled: 356, exploded: 236, teeth: 22 },
  { key: "A", r: 46, depth: 18, assembled: 396, exploded: 350, teeth: 14 },
  { key: "S", r: 88, depth: 40, assembled: 452, exploded: 508, teeth: 26 },
  { key: "E", r: 60, depth: 24, assembled: 516, exploded: 644, teeth: 18 },
  { key: "C", r: 96, depth: 32, assembled: 570, exploded: 786, teeth: 28 },
];

const CY = 200;
/** فشردگی عمودی برای حس پرسپکتیو (بیضی به‌جای دایره) */
const SQUASH = 1;
/** نسبت عرض به ارتفاع بیضی — کوچک‌تر = پرسپکتیو عمیق‌تر */
const ELLIPSE = 0.3;

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function Gear({ part, x, dim }: { part: Part; x: number; dim: number }) {
  const { r, depth, teeth } = part;

  // دندانه‌های محیطی
  const spokes = Array.from({ length: teeth }, (_, i) => {
    const a = (i / teeth) * Math.PI * 2;
    const y1 = CY + Math.sin(a) * r * SQUASH;
    const y2 = CY + Math.sin(a) * (r - 9) * SQUASH;
    return (
      <line
        key={i}
        x1={x + Math.cos(a) * 3}
        y1={y1}
        x2={x + Math.cos(a) * 3}
        y2={y2}
        stroke="currentColor"
        strokeWidth="0.9"
        opacity={0.45}
      />
    );
  });

  return (
    <g style={{ opacity: dim }}>
      {/* بدنه‌ی استوانه‌ای: دو بیضی + خطوط جانبی */}
      <ellipse cx={x + depth} cy={CY} rx={r * ELLIPSE} ry={r * SQUASH} fill="var(--exp-fill)" stroke="currentColor" strokeWidth="1.1" />
      <line x1={x} y1={CY - r * SQUASH} x2={x + depth} y2={CY - r * SQUASH} stroke="currentColor" strokeWidth="1.1" />
      <line x1={x} y1={CY + r * SQUASH} x2={x + depth} y2={CY + r * SQUASH} stroke="currentColor" strokeWidth="1.1" />

      {/* صفحه‌ی جلویی */}
      <ellipse cx={x} cy={CY} rx={r * ELLIPSE} ry={r * SQUASH} fill="var(--exp-face)" stroke="currentColor" strokeWidth="1.3" />
      <ellipse cx={x} cy={CY} rx={r * ELLIPSE * 0.72} ry={r * 0.72 * SQUASH} fill="none" stroke="currentColor" strokeWidth="0.8" opacity={0.5} />
      <ellipse cx={x} cy={CY} rx={r * ELLIPSE * 0.3} ry={r * 0.3 * SQUASH} fill="none" stroke="currentColor" strokeWidth="1" opacity={0.7} />

      {spokes}

      {/* محور مرکزی */}
      <ellipse cx={x} cy={CY} rx={r * ELLIPSE * 0.1} ry={r * 0.1 * SQUASH} fill="currentColor" opacity={0.55} />
    </g>
  );
}

export default function ExplodedProfile() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    let ticking = false;
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // از ورود بخش به دید تا وقتی مرکزش از وسط صفحه رد شود
      const travelled = vh * 0.9 - r.top;
      const distance = Math.max(1, Math.min(r.height + vh * 0.35, vh * 0.95));
      setP(Math.max(0, Math.min(1, travelled / distance)));
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const t = easeInOut(p);
  // نزدیک انتها، برچسب‌ها و متن مرکزی ظاهر می‌شوند
  const assembled = t > 0.88;

  return (
    <div ref={wrapRef} className="k2-exp">
      <div className="k2-exp-head">
        <span className="k2-exp-eyebrow">
          <span className="k2-exp-tri" />
          پروفایل شغلی
        </span>
        <h2 className="k2-exp-title">شش قطعه، یک تصویر کامل</h2>
        <p className="k2-exp-sub">
          شخصیت شغلی شما از شش بُعد ساخته شده است. آزمون Karex این قطعات را
          کنار هم می‌گذارد تا ببینید کدام مسیر واقعاً به شما می‌آید.
        </p>
      </div>

      <div className="k2-exp-stage">
        <svg viewBox="0 0 900 400" className="k2-exp-svg" role="img" aria-label="نمای انفجاری شش بُعد شخصیت شغلی">
          {/* خط محور */}
          <line
            x1="60" y1={CY} x2="850" y2={CY}
            stroke="currentColor" strokeWidth="1"
            strokeDasharray="2 8" opacity={0.18 + 0.12 * t}
          />

          {PARTS.map((part, i) => {
            // هر قطعه با تأخیر کمی متفاوت جمع می‌شود (حس مکانیکی)
            const delay = i * 0.05;
            const local = Math.max(0, Math.min(1, (t - delay) / (1 - delay || 1)));
            const e = easeInOut(local);
            const x = part.exploded + (part.assembled - part.exploded) * e;
            return <Gear key={part.key} part={part} x={x} dim={0.55 + 0.45 * e} />;
          })}
        </svg>

        {/* برچسب مرکزی وقتی مونتاژ کامل شد */}
        <div className={`k2-exp-badge ${assembled ? "on" : ""}`}>
          <span>پروفایل شما</span>
        </div>
      </div>

      {/* شش بُعد، مثل زیرنویس قطعات */}
      <div className="k2-exp-legend">
        {RIASEC_AXES.map((ax, i) => {
          const shown = t > 0.15 + i * 0.1;
          return (
            <div key={ax.key} className={`k2-exp-item ${shown ? "on" : ""}`}>
              <span className="k2-exp-num">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <div className="k2-exp-name">{ax.label}</div>
                <div className="k2-exp-hint">{ax.hint}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
