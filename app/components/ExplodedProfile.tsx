"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RIASEC_AXES } from "@/lib/onet-profiles";

/**
 * پروفایل شغلی به‌صورت یک مجموعه‌ی چرخ‌دنده که با اسکرول باز می‌شود.
 *
 * روایت:
 *   ۱. ابتدا فقط عنوان دیده می‌شود و قطعات کاملاً سرهم‌اند.
 *   ۲. با اسکرول، مجموعه می‌چرخد و بزرگ‌تر می‌شود.
 *   ۳. سپس قطعات از هم جدا می‌شوند و شش بُعد RIASEC آشکار می‌گردد.
 *
 * روش رسم: به‌جای کشیدن بیضی‌های تخت (که ظاهر شماتیک و ساده می‌داد)، نقاط
 * سه‌بعدی واقعی ساخته و با ماتریس چرخش تصویر می‌شوند — همان کاری که یک
 * نرم‌افزار CAD انجام می‌دهد. نتیجه: دندانه‌ها و پره‌ها حجم واقعی دارند.
 */

type Part = {
  key: string;
  /** شعاع بیرونی */
  r: number;
  /** ضخامت روی محور Z */
  depth: number;
  /** جای اولیه روی محور X وقتی سرهم است */
  assembled: number;
  /** جای نهایی وقتی باز شده */
  exploded: number;
  teeth: number;
};

const PARTS: Part[] = [
  { key: "R", r: 98, depth: 80, assembled: -134, exploded: -345, teeth: 30 },
  { key: "I", r: 72, depth: 62, assembled: -72, exploded: -190, teeth: 22 },
  { key: "A", r: 46, depth: 44, assembled: -26, exploded: -62, teeth: 16 },
  { key: "S", r: 86, depth: 76, assembled: 24, exploded: 68, teeth: 26 },
  { key: "E", r: 60, depth: 54, assembled: 84, exploded: 210, teeth: 20 },
  { key: "C", r: 94, depth: 72, assembled: 138, exploded: 345, teeth: 28 },
];

/** زاویه‌ی دید ثابت — همه‌ی قطعات از یک زاویه دیده می‌شوند */
const RX = -0.17;
const RY = 0.34;
const CX = 450;
const CY = 200;

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const phase = (t: number, from: number, to: number) =>
  Math.max(0, Math.min(1, (t - from) / (to - from)));

type P3 = [number, number, number];

/** تصویر یک نقطه‌ی سه‌بعدی روی صفحه */
function project([x, y, z]: P3, ry: number): [number, number] {
  const cx = Math.cos(RX), sx = Math.sin(RX);
  const cy = Math.cos(ry), sy = Math.sin(ry);
  const X = x * cy + z * sy;
  const Z = -x * sy + z * cy;
  const Y2 = y * cx - Z * sx;
  const Z2 = y * sx + Z * cx;
  const d = 1 / (1 + Z2 * 0.0009); // پرسپکتیو ملایم
  return [CX + X * d, CY + Y2 * d];
}

const toPoints = (pts: P3[], ry: number) =>
  pts.map((p) => project(p, ry).map((v) => v.toFixed(1)).join(",")).join(" ");

function ring(r: number, z: number, n = 56, phaseOff = 0): P3[] {
  return Array.from({ length: n }, (_, i) => {
    const a = phaseOff + (i / n) * Math.PI * 2;
    return [Math.cos(a) * r, Math.sin(a) * r, z] as P3;
  });
}

function Gear({
  part,
  x,
  dim,
  spin,
  ry,
}: {
  part: Part;
  x: number;
  dim: number;
  spin: number;
  ry: number;
}) {
  const { r, depth, teeth } = part;
  const hw = depth / 2;

  const shift = (pts: P3[]): P3[] => pts.map(([px, py, pz]) => [px + x, py, pz]);

  const els = useMemo(() => {
    const out: React.ReactNode[] = [];
    let k = 0;
    const poly = (pts: P3[], o: number, w: number) => (
      <polygon key={`p${k++}`} points={toPoints(pts, ry)} fill="none" stroke="currentColor" strokeWidth={w} opacity={o} />
    );
    const seg = (a: P3, b: P3, o: number, w: number) => {
      const A = project(a, ry), B = project(b, ry);
      return <line key={`l${k++}`} x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke="currentColor" strokeWidth={w} opacity={o} />;
    };

    // حلقه‌ی بدنه، جلو و عقب
    out.push(poly(shift(ring(r * 0.72, -hw)), 0.85, 1.1));
    out.push(poly(shift(ring(r * 0.72, hw)), 0.5, 1.1));

    // دندانه‌های سه‌بعدی: وجه جلو، وجه عقب، و یال‌های اتصال
    for (let i = 0; i < teeth; i++) {
      const a0 = spin + (i / teeth) * Math.PI * 2;
      const a1 = spin + ((i + 0.5) / teeth) * Math.PI * 2;
      const ri = r * 0.72;
      const quad: [number, number][] = [
        [Math.cos(a0) * ri, Math.sin(a0) * ri],
        [Math.cos(a0) * r, Math.sin(a0) * r],
        [Math.cos(a1) * r, Math.sin(a1) * r],
        [Math.cos(a1) * ri, Math.sin(a1) * ri],
      ];
      out.push(poly(quad.map(([qx, qy]) => [qx + x, qy, -hw] as P3), 0.9, 0.85));
      out.push(poly(quad.map(([qx, qy]) => [qx + x, qy, hw] as P3), 0.32, 0.7));
      quad.forEach(([qx, qy]) => {
        out.push(seg([qx + x, qy, -hw], [qx + x, qy, hw], 0.38, 0.6));
      });
    }

    // پره‌های داخلی با حجم
    const spokes = 6;
    for (let i = 0; i < spokes; i++) {
      const a = spin + (i / spokes) * Math.PI * 2;
      const w = 0.13;
      const rin = r * 0.2, rout = r * 0.7;
      const quad: [number, number][] = [
        [Math.cos(a - w) * rin, Math.sin(a - w) * rin],
        [Math.cos(a - w) * rout, Math.sin(a - w) * rout],
        [Math.cos(a + w) * rout, Math.sin(a + w) * rout],
        [Math.cos(a + w) * rin, Math.sin(a + w) * rin],
      ];
      out.push(poly(quad.map(([qx, qy]) => [qx + x, qy, -hw * 0.5] as P3), 0.7, 0.8));
      out.push(poly(quad.map(([qx, qy]) => [qx + x, qy, hw * 0.5] as P3), 0.26, 0.6));
    }

    // توپی مرکزی
    out.push(poly(shift(ring(r * 0.2, -hw, 28)), 0.9, 1));
    out.push(poly(shift(ring(r * 0.2, hw, 28)), 0.45, 1));
    out.push(poly(shift(ring(r * 0.09, -hw, 20)), 0.8, 1));
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const px = x + Math.cos(a) * r * 0.2, py = Math.sin(a) * r * 0.2;
      out.push(seg([px, py, -hw], [px, py, hw], 0.28, 0.6));
    }

    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r, depth, teeth, x, spin, ry]);

  return <g style={{ opacity: dim }}>{els}</g>;
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

  /* ۰–۳۲٪: سرهم، می‌چرخد و بزرگ می‌شود
     ۳۰–۹۵٪: قطعات از هم جدا می‌شوند */
  const zoomT = easeInOut(phase(p, 0, 0.32));
  const openT = easeInOut(phase(p, 0.3, 0.95));

  const scale = 0.82 + 0.18 * zoomT;
  const spin = zoomT * 0.5;
  const ry = RY + zoomT * 0.1;
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
          <g
            style={{
              transform: `translate(${CX}px, ${CY}px) scale(${scale}) translate(-${CX}px, -${CY}px)`,
              transformOrigin: "0 0",
            }}
          >
            {PARTS.map((part, i) => {
              const delay = i * 0.045;
              const local = Math.max(0, Math.min(1, (openT - delay) / (1 - delay || 1)));
              const e = easeInOut(local);
              const x = part.assembled + (part.exploded - part.assembled) * e;
              return (
                <Gear
                  key={part.key}
                  part={part}
                  x={x}
                  dim={0.9 - 0.18 * e}
                  spin={spin + i * 0.18}
                  ry={ry}
                />
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
