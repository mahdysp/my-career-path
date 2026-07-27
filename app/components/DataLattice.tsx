"use client";

import { useEffect, useRef } from "react";

/**
 * صحنه‌ی «از پراکندگی به ساختار».
 *
 * استعاره: حدس = نقطه‌های پراکنده و بی‌نظم. داده = شبکه‌ی منظم و متصل.
 * با اسکرول، ابری از نقطه‌های تصادفی در فضا به یک شبکه‌ی سه‌بعدی دقیق
 * قفل می‌شوند و یال‌ها بینشان کشیده می‌شود.
 *
 * چرا canvas و نه SVG: در هر فریم ۲۷ گره و ۵۴ یال با تصویر سه‌بعدی
 * رسم می‌شود. با SVG یعنی ۸۱ گره DOM که در هر فریم به‌روز می‌شوند.
 *
 * موقعیت‌های پراکنده با یک مولد شبه‌تصادفیِ بذردار ساخته می‌شوند تا در
 * هر بار رندر یکسان بمانند — انیمیشن نباید بین رفرش‌ها بپرد.
 */

const VIEW = 420;
const CX = VIEW / 2;
const CY = VIEW / 2;

/** اندازه‌ی شبکه در هر محور */
const N = 3;
/** فاصله‌ی گره‌ها */
const STEP = 78;

const RX = 0.34; // شیب دید

/** مولد شبه‌تصادفی بذردار — خروجی همیشه یکسان */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

type Node = {
  /** موقعیت نهایی در شبکه */
  ox: number;
  oy: number;
  oz: number;
  /** موقعیت پراکنده‌ی اولیه */
  sx: number;
  sy: number;
  sz: number;
  hue: number;
};

/* شبکه و یال‌ها یک‌بار ساخته می‌شوند — توپولوژی ثابت است */
const { NODES, EDGES } = (() => {
  const rnd = seeded(20260727);
  const nodes: Node[] = [];
  const half = ((N - 1) * STEP) / 2;

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      for (let k = 0; k < N; k++) {
        const ox = i * STEP - half;
        const oy = j * STEP - half;
        const oz = k * STEP - half;

        /* پراکندگی: هر گره در یک پوسته‌ی کروی بزرگ‌تر پرت می‌شود.
           از مختصات کروی استفاده می‌شود تا توزیع یکنواخت باشد و
           گره‌ها در یک گوشه جمع نشوند. */
        const r = 165 + rnd() * 125;
        const theta = rnd() * Math.PI * 2;
        const phi = Math.acos(2 * rnd() - 1);

        nodes.push({
          ox,
          oy,
          oz,
          sx: r * Math.sin(phi) * Math.cos(theta),
          sy: r * Math.sin(phi) * Math.sin(theta),
          sz: r * Math.cos(phi),
          /* فام بر اساس ارتفاع گره — هم‌خانواده با قطعات نمای انفجاری */
          hue: 193 + (j / (N - 1)) * 100 + (i / (N - 1)) * 15,
        });
      }
    }
  }

  /* یال فقط بین گره‌های همسایه در راستای محورها */
  const idx = (i: number, j: number, k: number) => (i * N + j) * N + k;
  const edges: [number, number][] = [];
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      for (let k = 0; k < N; k++) {
        if (i + 1 < N) edges.push([idx(i, j, k), idx(i + 1, j, k)]);
        if (j + 1 < N) edges.push([idx(i, j, k), idx(i, j + 1, k)]);
        if (k + 1 < N) edges.push([idx(i, j, k), idx(i, j, k + 1)]);
      }
    }
  }

  return { NODES: nodes, EDGES: edges };
})();

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

/* بافرهای بازاستفاده تا در هر فریم حافظه تخصیص ندهیم */
const px = new Float32Array(NODES.length);
const py = new Float32Array(NODES.length);
const pz = new Float32Array(NODES.length);
const pr = new Float32Array(NODES.length);

export default function DataLattice({
  /** ۰ = پراکنده، ۱ = شبکه‌ی کامل */
  order,
  dark,
}: {
  order: number;
  dark: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /* حلقه‌ی رندر باید همیشه تازه‌ترین مقدار را ببیند بدون اینکه با هر
     تغییر، افکت از نو اجرا شود. نوشتن در افکت انجام می‌شود نه حین
     رندر — دسترسی به ref در فاز رندر مجاز نیست. */
  const orderRef = useRef(order);
  const darkRef = useRef(dark);

  useEffect(() => {
    orderRef.current = order;
  }, [order]);

  useEffect(() => {
    darkRef.current = dark;
  }, [dark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let visible = false;
    let spin = 0.5;
    let last = performance.now();
    let dpr = 1;
    let cssW = 0;

    const resize = () => {
      const box = canvas.parentElement;
      if (!box) return;
      const w = box.clientWidth;
      if (!w) return;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cssW = w;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(w * dpr);
      canvas.style.height = `${w}px`;
    };

    const frame = (now: number) => {
      const dt = Math.min(80, now - last);
      last = now;
      if (!reduce) spin += dt * 0.00019;

      const t = easeInOut(clamp01(orderRef.current));
      const k = (cssW / VIEW) * dpr;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(k, 0, 0, k, 0, 0);

      const cs = Math.cos(spin);
      const sn = Math.sin(spin);
      const cx = Math.cos(RX);
      const sx = Math.sin(RX);

      /* در حالت پراکنده کمی دورتر است و با منظم شدن نزدیک می‌آید */
      const zoom = 0.82 + 0.28 * t;

      for (let n = 0; n < NODES.length; n++) {
        const nd = NODES[n];
        // درون‌یابی بین حالت پراکنده و شبکه
        const x0 = nd.sx + (nd.ox - nd.sx) * t;
        const y0 = nd.sy + (nd.oy - nd.sy) * t;
        const z0 = nd.sz + (nd.oz - nd.sz) * t;

        // چرخش حول محور عمودی، بعد شیب دید
        const X = x0 * cs + z0 * sn;
        const Z = -x0 * sn + z0 * cs;
        const Y2 = y0 * cx - Z * sx;
        const Z2 = y0 * sx + Z * cx;

        // پرسپکتیو ملایم
        const d = 1 / (1 + Z2 * 0.0011);
        px[n] = CX + X * d * zoom;
        py[n] = CY + Y2 * d * zoom;
        pz[n] = Z2;
        pr[n] = d;
      }

      /* یال‌ها — فقط وقتی ساختار شکل گرفته دیده می‌شوند.
         در حالت پراکنده کشیدنشان فقط شلوغی است. */
      const edgeT = clamp01((t - 0.32) / 0.5);
      if (edgeT > 0.01) {
        ctx.lineWidth = 1.1;
        for (const [a, b] of EDGES) {
          const depth = (pz[a] + pz[b]) * 0.5;
          // یال‌های دورتر کم‌رنگ‌تر
          const fade = clamp01(1 - (depth + 160) / 340);
          const alpha = edgeT * (0.14 + 0.4 * fade);
          ctx.strokeStyle = darkRef.current
            ? `rgba(190,200,255,${alpha})`
            : `rgba(60,66,110,${alpha * 0.9})`;
          ctx.beginPath();
          ctx.moveTo(px[a], py[a]);
          ctx.lineTo(px[b], py[b]);
          ctx.stroke();
        }
      }

      /* گره‌ها از دور به نزدیک تا جلویی‌ها روی عقبی‌ها بیفتند */
      const order2 = Array.from({ length: NODES.length }, (_, i) => i).sort(
        (a, b) => pz[b] - pz[a]
      );

      for (const n of order2) {
        const nd = NODES[n];
        const depth = pz[n];
        const near = clamp01(1 - (depth + 160) / 340);
        // در حالت پراکنده نقطه‌ها ریزتر و کم‌جان‌ترند
        const r = (2.4 + 3.4 * near) * (0.62 + 0.38 * t) * pr[n];
        const light = darkRef.current ? 62 + near * 12 : 44 + near * 10;
        const sat = 30 + 45 * t;
        const alpha = 0.4 + 0.6 * near;

        ctx.beginPath();
        ctx.arc(px[n], py[n], Math.max(0.6, r), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${nd.hue}, ${sat}%, ${light}%, ${alpha})`;
        ctx.fill();

        // هاله‌ی نرم روی گره‌های نزدیک، فقط وقتی ساختار جا افتاده
        if (t > 0.55 && near > 0.6) {
          ctx.beginPath();
          ctx.arc(px[n], py[n], r * 2.6, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${nd.hue}, ${sat}%, ${light}%, ${
            0.09 * (t - 0.55) * 2.2
          })`;
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    resize();
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) start();
        else stop();
      },
      { rootMargin: "140px" }
    );
    io.observe(canvas);

    const ro = new ResizeObserver(() => {
      resize();
      if (!visible) {
        last = performance.now();
        requestAnimationFrame(frame);
        stop();
      }
    });
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    return () => {
      io.disconnect();
      ro.disconnect();
      stop();
    };
  }, [dark]);

  return (
    <canvas
      ref={canvasRef}
      className="pl-canvas"
      role="img"
      aria-label="نقطه‌های پراکنده که به یک شبکه‌ی منظم داده تبدیل می‌شوند"
    />
  );
}
