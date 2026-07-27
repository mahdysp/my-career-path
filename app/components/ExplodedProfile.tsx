"use client";

import { useEffect, useRef, useState } from "react";
import { RIASEC_AXES } from "@/lib/onet-profiles";
import {
  VIEW_H,
  VIEW_W,
  renderLeaders,
  renderScene,
  type Palette,
} from "./explodedGeometry";

/**
 * نمای انفجاری قطعات پروفایل شغلی.
 *
 * روایت با اسکرول:
 *   ۱. شش قطعه روی یک شفت در هم چفت‌اند و با هم می‌چرخند.
 *   ۲. مجموعه کمی بزرگ می‌شود.
 *   ۳. قطعات در امتداد همان محور جدا می‌شوند، خط راهنما از هر کدام
 *      پایین می‌آید و به توضیح آن بُعد وصل می‌شود.
 *
 * چرا canvas و نه SVG: قطعات باید سطح تو‌پُر داشته باشند و جلوی هم را
 * بگیرند. حدود ۳۰۰۰ وجه در هر فریم رسم می‌شود که برای canvas سبک است
 * ولی برای SVG (همان تعداد گره DOM در هر فریم) نبود.
 */

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const phase = (t: number, from: number, to: number) =>
  Math.max(0, Math.min(1, (t - from) / (to - from)));

/* رنگ قطعات از توکن‌های سایت نمی‌آید چون سایه‌پردازی به فضای HSL نیاز
   دارد؛ اما فام‌ها (۲۲۰ تا ۲۸۳ درجه) عمداً همان خانواده‌ی --accent
   (#5e6ad2 ≈ ۲۳۱ درجه) هستند. */
const DARK: Palette = {
  baseSat: 0.34,
  baseLum: 0.13,
  litSat: 0.4,
  litLum: 0.71,
  shaftBase: [36, 38, 47],
  shaftLit: [168, 173, 192],
  line: "rgba(255,255,255,0.26)",
  leader: "rgba(255,255,255,0.3)",
};

const LIGHT: Palette = {
  baseSat: 0.3,
  baseLum: 0.44,
  litSat: 0.36,
  litLum: 0.94,
  shaftBase: [132, 132, 140],
  shaftLit: [252, 252, 254],
  line: "rgba(26,26,31,0.3)",
  leader: "rgba(26,26,31,0.34)",
};

export default function ExplodedProfile() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progress = useRef(0);
  const spin = useRef(0.4);
  const [openT, setOpenT] = useState(0);

  /* اسکرول → پیشرفت */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let ticking = false;
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const startAt = vh * 0.55;
      const distance = Math.max(1, Math.min(r.height * 0.8, vh * 0.85));
      const p = Math.max(0, Math.min(1, (startAt - r.top) / distance));
      progress.current = p;
      setOpenT(easeInOut(phase(p, 0.22, 0.94)));
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

  /* حلقه‌ی رندر — فقط وقتی بخش در دید است */
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = false;
    let raf = 0;
    let last = performance.now();
    let dpr = 1;

    const palette = () =>
      document.documentElement.dataset.theme === "light" ? LIGHT : DARK;

    const resize = () => {
      const w = canvas.clientWidth;
      if (!w) return;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const h = Math.round((w * VIEW_H) / VIEW_W);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.height = `${h}px`;
    };

    const frame = (now: number) => {
      const dt = Math.min(80, now - last);
      last = now;
      if (!reduce) spin.current += dt * 0.00034;

      const w = canvas.clientWidth;
      const k = (w / VIEW_W) * dpr;
      const p = progress.current;
      const o = easeInOut(phase(p, 0.22, 0.94));
      const zoom = easeInOut(phase(p, 0, 0.26));
      const scale = 1.24 + 0.1 * zoom - 0.4 * o;
      const pal = palette();

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(k, 0, 0, k, 0, 0);
      renderScene(ctx, spin.current, o, scale, pal);
      renderLeaders(ctx, o, scale, phase(o, 0.45, 0.95), pal.leader);

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
      { rootMargin: "120px" }
    );
    io.observe(wrap);

    /* وقتی تم عوض می‌شود و بخش در دید نیست، یک فریم دوباره بکش */
    const mo = new MutationObserver(() => {
      if (!visible) {
        last = performance.now();
        requestAnimationFrame(frame);
        stop();
      }
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const onResize = () => {
      resize();
      if (!visible) {
        last = performance.now();
        requestAnimationFrame(frame);
        stop();
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", onResize);
      stop();
    };
  }, []);

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
        <canvas
          ref={canvasRef}
          className="k2-exp-canvas"
          role="img"
          aria-label="نمای انفجاری شش بُعد شخصیت شغلی روی یک محور"
        />

        {/* ستون‌ها دقیقاً زیر انتهای خطوط راهنما می‌نشینند؛ چیدمان با
            همان تقسیم‌بندی (i + 0.5) / 6 در renderLeaders هم‌راستاست. */}
        <div className="k2-exp-legend" dir="ltr">
          {RIASEC_AXES.map((ax, i) => {
            const shown = openT > 0.5 + i * 0.045;
            return (
              <div
                key={ax.key}
                className={`k2-exp-item ${shown ? "on" : ""}`}
                style={{ transitionDelay: `${i * 40}ms` }}
                dir="rtl"
              >
                <span className="k2-exp-num" data-axis={ax.key}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="k2-exp-name">{ax.label}</div>
                <div className="k2-exp-hint">{ax.hint}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
