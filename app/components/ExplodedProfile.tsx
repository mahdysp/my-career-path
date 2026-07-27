"use client";

import { useEffect, useRef, useState } from "react";
import { RIASEC_AXES } from "@/lib/onet-profiles";

/**
 * پروفایل شغلی به‌صورت یک ماشین سه‌مرحله‌ای که با اسکرول باز می‌شود.
 *
 * روایت:
 *   ۱. ابتدا فقط عنوان دیده می‌شود و قطعات کاملاً سرهم‌اند (پروفایل یکپارچه).
 *   ۲. با اسکرول، مجموعه کمی می‌چرخد و بزرگ‌تر می‌شود (نزدیک شدن دوربین).
 *   ۳. سپس قطعات از هم جدا می‌شوند و شش بُعد RIASEC آشکار می‌گردد.
 *
 * با SVG خالص رسم می‌شود (بدون کتابخانه و بدون WebGL) تا روی موبایل سبک بماند.
 */

type Part = {
  key: string;
  /** شعاع بیرونی */
  r: number;
  /** عمق دیده‌شده در پرسپکتیو */
  depth: number;
  /** جای اولیه وقتی سرهم است */
  assembled: number;
  /** جای نهایی وقتی باز شده */
  exploded: number;
  /** تعداد دندانه */
  teeth: number;
};

const PARTS: Part[] = [
  { key: "R", r: 104, depth: 34, assembled: 372, exploded: 96, teeth: 34 },
  { key: "I", r: 74, depth: 26, assembled: 410, exploded: 236, teeth: 26 },
  { key: "A", r: 46, depth: 18, assembled: 438, exploded: 350, teeth: 16 },
  { key: "S", r: 88, depth: 40, assembled: 462, exploded: 508, teeth: 30 },
  { key: "E", r: 60, depth: 24, assembled: 506, exploded: 644, teeth: 20 },
  { key: "C", r: 96, depth: 32, assembled: 536, exploded: 786, teeth: 32 },
];

const CY = 200;
/** نسبت عرض به ارتفاع بیضی — کوچک‌تر یعنی پرسپکتیو عمیق‌تر */
const E = 0.3;

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** نگاشت خطی یک بازه به ۰..۱ */
const phase = (t: number, from: number, to: number) =>
  Math.max(0, Math.min(1, (t - from) / (to - from)));

/** دندانه‌های واقعی: چهارضلعی‌های بیرون‌زده از لبه، نه خط ساده */
function teethPath(x: number, r: number, n: number) {
  let d = "";
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 0.42) / n) * Math.PI * 2;
    const ro = r * 1.09;
    const px = (a: number, rad: number) => x + Math.cos(a) * rad * E;
    const py = (a: number, rad: number) => CY + Math.sin(a) * rad;
    d += `M${px(a0, r).toFixed(1)},${py(a0, r).toFixed(1)} L${px(a0, ro).toFixed(1)},${py(a0, ro).toFixed(1)} L${px(a1, ro).toFixed(1)},${py(a1, ro).toFixed(1)} L${px(a1, r).toFixed(1)},${py(a1, r).toFixed(1)}Z `;
  }
  return d;
}

function Gear({
  part,
  x,
  dim,
  spin,
}: {
  part: Part;
  x: number;
  dim: number;
  spin: number;
}) {
  const { r, depth, teeth } = part;
  const teethD = teethPath(x, r, teeth);

  // پره‌های شعاعی داخل صفحه — با چرخش مجموعه می‌چرخند
  const spokes = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 + spin;
    return (
      <line
        key={i}
        x1={x + Math.cos(a) * r * E * 0.34}
        y1={CY + Math.sin(a) * r * 0.34}
        x2={x + Math.cos(a) * r * E * 0.62}
        y2={CY + Math.sin(a) * r * 0.62}
        stroke="currentColor"
        strokeWidth="1"
        opacity={0.5}
      />
    );
  });

  return (
    <g style={{ opacity: dim }}>
      <ellipse cx={x + depth} cy={CY} rx={r * E} ry={r} fill="none" stroke="currentColor" strokeWidth="1.2" opacity={0.55} />
      <line x1={x} y1={CY - r} x2={x + depth} y2={CY - r} stroke="currentColor" strokeWidth="1.2" opacity={0.7} />
      <line x1={x} y1={CY + r} x2={x + depth} y2={CY + r} stroke="currentColor" strokeWidth="1.2" opacity={0.7} />

      <g opacity={0.35} transform={`translate(${depth},0)`}>
        <path d={teethD} fill="none" stroke="currentColor" strokeWidth="1" />
      </g>
      <path d={teethD} fill="none" stroke="currentColor" strokeWidth="1" />

      <ellipse cx={x} cy={CY} rx={r * E} ry={r} fill="var(--exp-face)" stroke="currentColor" strokeWidth="1.5" />

      {[0.82, 0.62, 0.34].map((k, i) => (
        <ellipse
          key={k}
          cx={x} cy={CY} rx={r * E * k} ry={r * k}
          fill="none" stroke="currentColor"
          strokeWidth={i === 1 ? 1.2 : 0.8}
          opacity={0.75 - i * 0.12}
        />
      ))}

      {spokes}

      <ellipse cx={x} cy={CY} rx={r * E * 0.13} ry={r * 0.13} fill="currentColor" opacity={0.8} />
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
      // انیمیشن وقتی آغاز می‌شود که بخش واقعاً در میدان دید نشسته باشد
      const startAt = vh * 0.55;
      const distance = Math.max(1, Math.min(r.height * 0.8, vh * 0.85));
      setP(Math.max(0, Math.min(1, (startAt - r.top) / distance)));
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

  /* سه مرحله‌ی پشت‌سرهم:
     ۰٪–۳۰٪  → سرهم، فقط کمی می‌چرخد و بزرگ می‌شود
     ۳۰٪–۹۵٪ → قطعات از هم باز می‌شوند
     برچسب‌ها همراه باز شدن یکی‌یکی ظاهر می‌شوند */
  const zoomT = easeInOut(phase(p, 0, 0.32));
  const openT = easeInOut(phase(p, 0.3, 0.95));

  const scale = 0.86 + 0.14 * zoomT;
  const spin = zoomT * 0.42; // رادیان
  const opened = openT > 0.9;

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
        <svg
          viewBox="0 0 900 400"
          className="k2-exp-svg"
          role="img"
          aria-label="شش بُعد شخصیت شغلی که با اسکرول از هم باز می‌شوند"
        >
          {/* کل مجموعه با هم می‌چرخد و بزرگ می‌شود */}
          <g
            style={{
              transform: `translate(450px, ${CY}px) scale(${scale}) rotate(${(-spin * 8).toFixed(2)}deg) translate(-450px, -${CY}px)`,
              transformOrigin: "0 0",
            }}
          >
            {PARTS.map((part, i) => {
              // قطعات بیرونی زودتر جدا می‌شوند
              const delay = i * 0.045;
              const local = Math.max(0, Math.min(1, (openT - delay) / (1 - delay || 1)));
              const e = easeInOut(local);
              const x = part.assembled + (part.exploded - part.assembled) * e;
              return <Gear key={part.key} part={part} x={x} dim={1 - 0.28 * e} spin={spin} />;
            })}
          </g>
        </svg>

        <div className={`k2-exp-badge ${opened ? "on" : ""}`}>
          <span>شش بُعد شخصیت شغلی</span>
        </div>
      </div>

      <div className="k2-exp-legend">
        {RIASEC_AXES.map((ax, i) => {
          const shown = openT > 0.1 + i * 0.1;
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
