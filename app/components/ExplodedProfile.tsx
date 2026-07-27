"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RIASEC_AXES } from "@/lib/onet-profiles";

/**
 * نمای انفجاری قطعات پروفایل شغلی.
 *
 * روایت با اسکرول:
 *   ۱. قطعات سرهم‌اند و مجموعه یک واحد به‌نظر می‌رسد.
 *   ۲. کمی بزرگ‌تر می‌شود و زاویه‌ی دید باز می‌شود.
 *   ۳. قطعات از هم جدا می‌شوند و شش بُعد RIASEC آشکار می‌گردد.
 *
 * چرا این‌طور رسم شده: نسخه‌های قبلی شش چرخ‌دنده‌ی تقریباً یکسان بودند که
 * روی هم می‌افتادند. حالا هر قطعه یک شکل مکانیکی متفاوت است (درام، مهره،
 * بلوک، پشته‌ی دیسک، شفت، درپوش) که با تصویر سه‌بعدی واقعی رسم می‌شود.
 */

const RX = -0.34; // شیب دید — دایره‌ها را به بیضی افقی تبدیل می‌کند
const CX = 450;
const CY = 200;

type P3 = [number, number, number];

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const phase = (t: number, from: number, to: number) =>
  Math.max(0, Math.min(1, (t - from) / (to - from)));

function project([x, y, z]: P3, ry: number): [number, number] {
  const cx = Math.cos(RX), sx = Math.sin(RX);
  const cy = Math.cos(ry), sy = Math.sin(ry);
  const X = x * cy + z * sy;
  const Z = -x * sy + z * cy;
  const Y2 = y * cx - Z * sx;
  const Z2 = y * sx + Z * cx;
  const d = 1 / (1 + Z2 * 0.0007);
  return [CX + X * d, CY + Y2 * d];
}

/** دایره در صفحه‌ی XY با مرکز (cx, 0) و عمق z */
const circle = (cx: number, r: number, z: number, n = 56, ph = 0): P3[] =>
  Array.from({ length: n }, (_, i) => {
    const a = ph + (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * r, Math.sin(a) * r, z] as P3;
  });

/** سازنده‌ی اجزای یک قطعه؛ خروجی آرایه‌ی المان‌های SVG */
function buildPart(
  kind: string,
  cx: number,
  r: number,
  depth: number,
  spin: number,
  ry: number
): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let k = 0;
  const z0 = -depth / 2;
  const z1 = depth / 2;

  const pts = (p: P3[]) =>
    p.map((q) => project(q, ry).map((v) => v.toFixed(1)).join(",")).join(" ");

  const poly = (p: P3[], o: number, w: number) => {
    out.push(
      <polygon key={`p${k++}`} points={pts(p)} fill="none" stroke="currentColor" strokeWidth={w} opacity={o} />
    );
  };
  const line = (a: P3, b: P3, o: number, w: number) => {
    const A = project(a, ry), B = project(b, ry);
    out.push(
      <line key={`l${k++}`} x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke="currentColor" strokeWidth={w} opacity={o} />
    );
  };

  if (kind === "drum") {
    // درام با پره‌های محیطی متراکم
    const n = 44;
    poly(circle(cx, r, z0), 0.95, 1.2);
    poly(circle(cx, r, z1), 0.45, 1);
    poly(circle(cx, r * 0.55, z0), 0.8, 1);
    poly(circle(cx, r * 0.55, z1), 0.3, 0.8);
    for (let i = 0; i < n; i++) {
      const a = spin + (i / n) * Math.PI * 2;
      const X = cx + Math.cos(a) * r, Y = Math.sin(a) * r;
      const xi = cx + Math.cos(a) * r * 0.55, yi = Math.sin(a) * r * 0.55;
      line([xi, yi, z0], [X, Y, z0], 0.5, 0.55);
      line([X, Y, z0], [X, Y, z1], 0.55, 0.6);
      if (i % 2 === 0) line([xi, yi, z1], [X, Y, z1], 0.22, 0.5);
    }
  } else if (kind === "nut") {
    // مهره‌ی چندضلعی ضخیم
    const sides = 9;
    const A = circle(cx, r, z0, sides, spin + 0.2);
    const B = circle(cx, r, z1, sides, spin + 0.2);
    poly(A, 0.95, 1.35);
    poly(B, 0.45, 1.1);
    A.forEach((p, i) => line(p, B[i], 0.6, 0.85));
    poly(circle(cx, r * 0.44, z0), 0.85, 1);
    poly(circle(cx, r * 0.44, z1), 0.32, 0.85);
    for (let i = 0; i < 14; i++) {
      const a = spin + (i / 14) * Math.PI * 2;
      const px = cx + Math.cos(a) * r * 0.44, py = Math.sin(a) * r * 0.44;
      line([px, py, z0], [px, py, z1], 0.25, 0.5);
    }
  } else if (kind === "block") {
    // بلوک مکعبی با سوراخ مرکزی
    const w = r * 0.5, h = r * 0.55;
    const sq = (z: number): P3[] => [
      [cx - w, -h, z], [cx + w, -h, z], [cx + w, h, z], [cx - w, h, z],
    ];
    poly(sq(z0), 0.95, 1.25);
    poly(sq(z1), 0.45, 1);
    sq(z0).forEach((p, i) => line(p, sq(z1)[i], 0.6, 0.8));
    poly(circle(cx, h * 0.42, z0), 0.75, 0.9);
    poly(circle(cx, h * 0.42, z1), 0.3, 0.7);
  } else if (kind === "stack") {
    // پشته‌ی سه دیسک نازک
    const gap = depth / 2.4;
    for (let i = 0; i < 3; i++) {
      const z = -gap + i * gap;
      const rr = r * (i === 1 ? 0.68 : 1);
      poly(circle(cx, rr, z), 0.9 - i * 0.06, 1.1);
      poly(circle(cx, rr, z + gap * 0.22), 0.3, 0.7);
      for (let j = 0; j < 30; j++) {
        const a = spin + (j / 30) * Math.PI * 2;
        line(
          [cx + Math.cos(a) * rr * 0.78, Math.sin(a) * rr * 0.78, z],
          [cx + Math.cos(a) * rr, Math.sin(a) * rr, z],
          0.42, 0.5
        );
      }
      poly(circle(cx, rr * 0.2, z), 0.7, 0.9);
    }
  } else if (kind === "shaft") {
    // شفت با فلنج
    const sr = r * 0.15;
    const sz0 = -depth * 1.5, sz1 = depth * 1.5;
    poly(circle(cx, sr, sz0), 0.75, 0.9);
    poly(circle(cx, sr, sz1), 0.5, 0.85);
    for (let i = 0; i < 10; i++) {
      const a = spin + (i / 10) * Math.PI * 2;
      const px = cx + Math.cos(a) * sr, py = Math.sin(a) * sr;
      line([px, py, sz0], [px, py, sz1], 0.45, 0.55);
    }
    const fz = -depth * 0.2;
    poly(circle(cx, r, fz), 0.95, 1.25);
    poly(circle(cx, r, fz + depth * 0.4), 0.42, 1);
    circle(cx, r, fz, 56).forEach((p, i) => {
      if (i % 4 === 0) line(p, [p[0], p[1], fz + depth * 0.4], 0.4, 0.55);
    });
    poly(circle(cx, r * 0.62, fz), 0.6, 0.8);
  } else {
    // درپوش با بوس‌های پیچ
    const bolts = 7;
    poly(circle(cx, r, z0), 0.95, 1.3);
    poly(circle(cx, r * 0.82, z1), 0.5, 1.05);
    circle(cx, r, z0, 56).forEach((p, i) => {
      if (i % 3 === 0) line(p, [cx + (p[0] - cx) * 0.82, p[1] * 0.82, z1], 0.4, 0.6);
    });
    for (let i = 0; i < bolts; i++) {
      const a = spin + (i / bolts) * Math.PI * 2;
      const bx = cx + Math.cos(a) * r * 0.6;
      const by = Math.sin(a) * r * 0.6;
      const br = r * 0.16;
      const h1 = circle(bx, br, z0 - depth * 0.25, 6).map((p) => [p[0], p[1] + by, p[2]] as P3);
      const h2 = circle(bx, br, z0, 6).map((p) => [p[0], p[1] + by, p[2]] as P3);
      poly(h1, 0.85, 0.9);
      poly(h2, 0.45, 0.7);
      h1.forEach((p, j) => line(p, h2[j], 0.45, 0.55));
    }
    poly(circle(cx, r * 0.3, z0 - depth * 0.25), 0.8, 1);
    poly(circle(cx, r * 0.3, z0), 0.5, 0.8);
  }

  return out;
}

type Spec = {
  key: string;
  kind: string;
  r: number;
  depth: number;
  /** مرکز در حالت سرهم */
  cx: number;
  /** مرکز در حالت باز */
  ex: number;
  /** آیا دائماً می‌چرخد */
  live: boolean;
  speed: number;
};

/* اندازه‌ها عمداً ریتم دارند (بزرگ ← ریز ← بزرگ) تا ردیف یکنواخت نشود */
const RAW: Omit<Spec, "key" | "cx" | "ex">[] = [
  { kind: "drum", r: 84, depth: 62, live: true, speed: 1 },
  { kind: "nut", r: 50, depth: 46, live: false, speed: 0 },
  { kind: "block", r: 38, depth: 36, live: false, speed: 0 },
  { kind: "stack", r: 72, depth: 54, live: true, speed: -1.4 },
  { kind: "shaft", r: 44, depth: 34, live: false, speed: 0 },
  { kind: "cap", r: 78, depth: 52, live: true, speed: 0.8 },
];

const SPECS: Spec[] = (() => {
  /* فاصله‌ها متناسب با اندازه‌ی همسایه‌ها، نه یک عدد ثابت */
  const widths = RAW.map((p) => p.r * 2);
  const gapAt = (i: number) => 14 + (RAW[i].r + RAW[i + 1].r) * 0.1;
  const totalGaps = RAW.slice(0, -1).reduce((a, _, i) => a + gapAt(i), 0);
  const total = widths.reduce((a, b) => a + b, 0) + totalGaps;
  let cursor = -total / 2;
  const ex = RAW.map((p, i) => {
    const c = cursor + p.r;
    cursor += widths[i] + (i < RAW.length - 1 ? gapAt(i) : 0);
    return c;
  });

  // حالت سرهم: قطعات نزدیک هم، با کمی همپوشانی عمدی
  const tightAt = (i: number) => -(RAW[i].r + RAW[i + 1].r) * 0.22;
  const totalTight = RAW.slice(0, -1).reduce((a, _, i) => a + tightAt(i), 0);
  const totalT = widths.reduce((a, b) => a + b, 0) + totalTight;
  let c2 = -totalT / 2;
  const cx = RAW.map((p, i) => {
    const c = c2 + p.r;
    c2 += widths[i] + (i < RAW.length - 1 ? tightAt(i) : 0);
    return c;
  });

  return RAW.map((p, i) => ({
    ...p,
    key: RIASEC_AXES[i].key,
    cx: cx[i],
    ex: ex[i],
  }));
})();

function Part({
  spec, x, spin, ry, dim,
}: {
  spec: Spec; x: number; spin: number; ry: number; dim: number;
}) {
  const nodes = useMemo(
    () => buildPart(spec.kind, x, spec.r, spec.depth, spin, ry),
    [spec.kind, spec.r, spec.depth, x, spin, ry]
  );
  return <g style={{ opacity: dim }}>{nodes}</g>;
}

export default function ExplodedProfile() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  const [tick, setTick] = useState(0);
  const [visible, setVisible] = useState(false);

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

  /* چرخش دائمی — فقط وقتی بخش در دید است */
  useEffect(() => {
    if (!visible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      if (now - last > 50) {
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

  const scale = 0.86 + 0.14 * zoomT;
  /* چرخش حول محور Y روی چیدمانی که خودش روی X است، قطعات را کج می‌کند
     و هر کدام را به اندازه‌ی متفاوتی جابه‌جا می‌کند. زاویه ثابت می‌ماند. */
  const ry = 0;
  const opened = openT > 0.9;
  const t = tick * 0.05;

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
          aria-label="نمای انفجاری شش بُعد شخصیت شغلی"
        >
          <g
            style={{
              transform: `translate(${CX}px, ${CY}px) scale(${scale}) translate(-${CX}px, -${CY}px)`,
              transformOrigin: "0 0",
            }}
          >
            {SPECS.map((spec, i) => {
              const delay = i * 0.04;
              const local = Math.max(0, Math.min(1, (openT - delay) / (1 - delay || 1)));
              const e = easeInOut(local);
              const x = spec.cx + (spec.ex - spec.cx) * e;
              const spin = spec.live ? t * spec.speed : i * 0.3;
              return (
                <Part key={spec.key} spec={spec} x={x} spin={spin} ry={ry} dim={0.92 - 0.12 * e} />
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
