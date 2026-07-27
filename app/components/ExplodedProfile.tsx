"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RIASEC_AXES } from "@/lib/onet-profiles";

/**
 * قطار چرخ‌دنده‌ی پروفایل شغلی.
 *
 * روایت با اسکرول:
 *   ۱. شش چرخ‌دنده در هم درگیرند و می‌چرخند (یک ماشین یکپارچه).
 *   ۲. مجموعه کمی بزرگ‌تر می‌شود.
 *   ۳. قطعات از هم جدا می‌شوند و شش بُعد RIASEC آشکار می‌گردد.
 *
 * نکات مهندسی که رعایت شده‌اند:
 *   • فاصله‌ی مراکز = مجموع شعاع گام، پس دندانه‌ها واقعاً درگیر می‌شوند
 *     (قبلاً چرخ‌دنده‌ها روی هم می‌افتادند چون فاصله دلخواه بود).
 *   • همه یک «ماژول» دارند، پس اندازه‌ی دندانه‌ها یکسان است و در هم می‌نشیند.
 *   • سرعت چرخش معکوس شعاع و جهت‌ها یک‌درمیان است — مثل قطار چرخ‌دنده‌ی واقعی.
 *   • هر قطعه سبک بدنه‌ی متفاوتی دارد (پره‌ای، توپر، مارپیچ، حلقه‌ای و…).
 *
 * رسم با تصویر سه‌بعدی واقعی انجام می‌شود، نه بیضی تخت.
 */

type Style = "spoke" | "solid" | "helix" | "pinion" | "ring" | "cross";

type Part = {
  key: string;
  r: number;
  depth: number;
  style: Style;
  /** مرکز در حالت درگیر (محاسبه‌شده) */
  cx: number;
  /** مرکز در حالت باز */
  ex: number;
  teeth: number;
  /** ضریب سرعت چرخش، منفی یعنی خلاف جهت */
  speed: number;
  /** آیا این قطعه دائماً می‌چرخد */
  live: boolean;
};

const RX = -0.19;
const RY_BASE = 0.36;
const CX = 450;
const CY = 200;
/** ماژول دنده — مشترک بین همه تا درگیری ممکن باشد */
const MODULE = 7;

const RAW: { r: number; depth: number; style: Style; live: boolean }[] = [
  { r: 92, depth: 74, style: "spoke", live: true },
  { r: 58, depth: 52, style: "solid", live: false },
  { r: 74, depth: 96, style: "helix", live: true },
  { r: 44, depth: 44, style: "pinion", live: false },
  { r: 66, depth: 60, style: "ring", live: true },
  { r: 50, depth: 70, style: "cross", live: false },
];

/** چیدمان درگیر: فاصله‌ی مراکز = مجموع شعاع‌ها */
const PARTS: Part[] = (() => {
  const centers: number[] = [0];
  for (let i = 1; i < RAW.length; i++) {
    centers.push(centers[i - 1] + RAW[i - 1].r + RAW[i].r);
  }
  const left = Math.min(...centers.map((c, i) => c - RAW[i].r));
  const right = Math.max(...centers.map((c, i) => c + RAW[i].r));
  const mid = (left + right) / 2;

  /* حالت باز: فاصله‌ها متناسب با اندازه‌ی قطعات، نه یکنواخت.
     پخش یکنواخت باعث می‌شد قطعات بزرگ کنار هم همپوشانی پیدا کنند. */
  const gap = 18;
  const widths = RAW.map((p) => p.r * 2);
  const total = widths.reduce((a, b) => a + b, 0) + gap * (RAW.length - 1);
  let cursor = -total / 2;
  const exploded = RAW.map((p, i) => {
    const c = cursor + p.r;
    cursor += widths[i] + gap;
    return c;
  });

  return RAW.map((p, i) => ({
    key: RIASEC_AXES[i].key,
    r: p.r,
    depth: p.depth,
    style: p.style,
    live: p.live,
    cx: centers[i] - mid,
    ex: exploded[i],
    teeth: Math.max(9, Math.round((2 * p.r) / MODULE)),
    speed: (i % 2 ? -1 : 1) * (RAW[0].r / p.r),
  }));
})();

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const phase = (t: number, from: number, to: number) =>
  Math.max(0, Math.min(1, (t - from) / (to - from)));

type P3 = [number, number, number];

function project([x, y, z]: P3, ry: number): [number, number] {
  const cx = Math.cos(RX), sx = Math.sin(RX);
  const cy = Math.cos(ry), sy = Math.sin(ry);
  const X = x * cy + z * sy;
  const Z = -x * sy + z * cy;
  const Y2 = y * cx - Z * sx;
  const Z2 = y * sx + Z * cx;
  const d = 1 / (1 + Z2 * 0.0008);
  return [CX + X * d, CY + Y2 * d];
}

const pts = (arr: P3[], ry: number) =>
  arr.map((p) => project(p, ry).map((v) => v.toFixed(1)).join(",")).join(" ");

const ringPts = (r: number, z: number, cx: number, n = 48, ph = 0): P3[] =>
  Array.from({ length: n }, (_, i) => {
    const a = ph + (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * r, Math.sin(a) * r, z] as P3;
  });

function Gear({
  part, x, spin, ry, dim,
}: {
  part: Part; x: number; spin: number; ry: number; dim: number;
}) {
  const { r, depth, teeth, style } = part;

  const nodes = useMemo(() => {
    const out: React.ReactNode[] = [];
    let k = 0;
    const hw = depth / 2;
    const ri = r - MODULE * 1.05;
    const hub = r * (style === "pinion" ? 0.3 : 0.22);

    const poly = (p: P3[], o: number, w: number) => (
      <polygon key={`p${k++}`} points={pts(p, ry)} fill="none" stroke="currentColor" strokeWidth={w} opacity={o} />
    );
    const seg = (a: P3, b: P3, o: number, w: number) => {
      const A = project(a, ry), B = project(b, ry);
      return <line key={`l${k++}`} x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke="currentColor" strokeWidth={w} opacity={o} />;
    };

    // دندانه‌ها — در سبک مارپیچ، وجه عقب پیچ می‌خورد
    const twist = style === "helix" ? 0.3 : 0;
    for (let i = 0; i < teeth; i++) {
      const a0 = spin + (i / teeth) * Math.PI * 2;
      const a1 = spin + ((i + 0.52) / teeth) * Math.PI * 2;
      const front: P3[] = [[a0, ri], [a0, r], [a1, r], [a1, ri]].map(
        ([a, rr]) => [x + Math.cos(a) * rr, Math.sin(a) * rr, -hw] as P3
      );
      const back: P3[] = [[a0 + twist, ri], [a0 + twist, r], [a1 + twist, r], [a1 + twist, ri]].map(
        ([a, rr]) => [x + Math.cos(a) * rr, Math.sin(a) * rr, hw] as P3
      );
      out.push(poly(front, 0.95, 0.9));
      out.push(poly(back, 0.3, 0.65));
      for (let j = 0; j < 4; j++) out.push(seg(front[j], back[j], 0.4, 0.6));
    }

    out.push(poly(ringPts(ri, -hw, x), 0.85, 1.1));
    out.push(poly(ringPts(ri, hw, x), 0.4, 1.1));

    // بدنه‌ی داخلی — هر سبک متفاوت
    if (style === "spoke" || style === "cross") {
      const n = style === "cross" ? 4 : 6;
      const w = style === "cross" ? 0.1 : 0.14;
      for (let i = 0; i < n; i++) {
        const a = spin + (i / n) * Math.PI * 2;
        const quad: [number, number][] = [[a - w, hub], [a - w, ri * 0.92], [a + w, ri * 0.92], [a + w, hub]];
        out.push(poly(quad.map(([A, R]) => [x + Math.cos(A) * R, Math.sin(A) * R, -hw * 0.55] as P3), 0.75, 0.8));
        out.push(poly(quad.map(([A, R]) => [x + Math.cos(A) * R, Math.sin(A) * R, hw * 0.55] as P3), 0.25, 0.6));
      }
    } else if (style === "ring") {
      out.push(poly(ringPts(ri * 0.66, -hw, x), 0.7, 0.9));
      out.push(poly(ringPts(ri * 0.66, hw, x), 0.25, 0.7));
      for (let i = 0; i < 10; i++) {
        const a = spin + (i / 10) * Math.PI * 2;
        const hx = x + Math.cos(a) * ri * 0.45;
        const hy = Math.sin(a) * ri * 0.45;
        out.push(poly(ringPts(ri * 0.14, -hw, hx, 14).map((p) => [p[0], p[1] + hy, p[2]] as P3), 0.5, 0.7));
      }
    } else if (style === "solid") {
      [0.78, 0.5].forEach((kk) => out.push(poly(ringPts(ri * kk, -hw, x), 0.6, 0.8)));
    } else {
      for (let i = 0; i < 8; i++) {
        const a = spin + (i / 8) * Math.PI * 2;
        out.push(seg(
          [x + Math.cos(a) * hub, Math.sin(a) * hub, -hw],
          [x + Math.cos(a) * ri * 0.9, Math.sin(a) * ri * 0.9, -hw],
          0.55, 0.7
        ));
      }
    }

    // توپی
    out.push(poly(ringPts(hub, -hw, x, 24), 0.9, 1));
    out.push(poly(ringPts(hub, hw, x, 24), 0.4, 0.9));
    out.push(poly(ringPts(hub * 0.42, -hw, x, 16), 0.8, 0.9));
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const px = x + Math.cos(a) * hub, py = Math.sin(a) * hub;
      out.push(seg([px, py, -hw], [px, py, hw], 0.3, 0.55));
    }

    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r, depth, teeth, style, x, spin, ry]);

  return <g style={{ opacity: dim }}>{nodes}</g>;
}

export default function ExplodedProfile() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  const [tick, setTick] = useState(0);
  const [visible, setVisible] = useState(false);

  /* پیشرفت اسکرول */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let ticking = false;
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      setVisible(r.top < vh && r.bottom > 0);
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

  /* چرخش دائمی — فقط وقتی بخش در دید است، تا باتری هدر نرود */
  useEffect(() => {
    if (!visible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      if (now - last > 40) {
        last = now;
        setTick((t) => t + 1);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  const zoomT = easeInOut(phase(p, 0, 0.3));
  const openT = easeInOut(phase(p, 0.28, 0.95));

  const scale = 0.84 + 0.16 * zoomT;
  const ry = RY_BASE + zoomT * 0.08;
  const opened = openT > 0.9;
  const t = tick * 0.04;

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
          aria-label="قطار چرخ‌دنده‌ی شش بُعد شخصیت شغلی"
        >
          <g
            style={{
              transform: `translate(${CX}px, ${CY}px) scale(${scale}) translate(-${CX}px, -${CY}px)`,
              transformOrigin: "0 0",
            }}
          >
            {PARTS.map((part, i) => {
              const delay = i * 0.04;
              const local = Math.max(0, Math.min(1, (openT - delay) / (1 - delay || 1)));
              const e = easeInOut(local);
              const x = part.cx + (part.ex - part.cx) * e;

              /* فاز درگیری: چرخ‌دنده‌های فرد نیم‌دندانه جابه‌جا می‌شوند تا
                 دندانه‌هایشان در فاصله‌ی همسایه بنشیند، نه روی آن. */
              const mesh = i % 2 ? Math.PI / part.teeth : 0;
              const live = part.live ? t * part.speed : 0;
              const spin = mesh + part.speed * 0.3 + live;

              return (
                <Gear key={part.key} part={part} x={x} spin={spin} ry={ry} dim={0.92 - 0.16 * e} />
              );
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
