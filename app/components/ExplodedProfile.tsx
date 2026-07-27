"use client";

import { useEffect, useRef, useState } from "react";
import { RIASEC_AXES } from "@/lib/onet-profiles";
import { VIEW_H, VIEW_W, renderScene, type Palette } from "./explodedGeometry";

/**
 * نمای انفجاری قطعات پروفایل شغلی.
 *
 * روایت با اسکرول:
 *   ۱. شش قطعه روی یک شفت سرهم‌اند و همه با هم می‌چرخند.
 *   ۲. مجموعه کمی بزرگ می‌شود.
 *   ۳. قطعات در امتداد همان محور از هم جدا می‌شوند و شش بُعد RIASEC آشکار می‌گردد.
 *
 * چرا canvas و نه SVG: قطعات باید سطح تو‌پُر داشته باشند و جلوی هم را
 * بگیرند. با خط تنها، در حالت سرهم خطوط پشتی از داخل قطعه‌ی جلویی دیده
 * می‌شد و تصویر به هم می‌ریخت. حدود ۶۰۰ وجه در هر فریم رسم می‌شود که برای
 * canvas سبک است ولی برای SVG (۶۰۰ گره DOM در هر فریم) نبود.
 */

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const phase = (t: number, from: number, to: number) =>
  Math.max(0, Math.min(1, (t - from) / (to - from)));

/* پالت‌ها: فلز مات. base سایه‌ی عمیق، lit سطحی که مستقیم زیر نور است. */
const DARK: Palette = {
  base: [24, 25, 32],
  lit: [200, 204, 218],
  line: "rgba(255,255,255,0.34)",
  lineSoft: "rgba(255,255,255,0.08)",
};

const LIGHT: Palette = {
  base: [126, 124, 120],
  lit: [252, 251, 248],
  line: "rgba(26,26,31,0.42)",
  lineSoft: "rgba(26,26,31,0.10)",
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
      if (!reduce) spin.current += dt * 0.00038;

      const w = canvas.clientWidth;
      const k = (w / VIEW_W) * dpr;
      const o = easeInOut(phase(progress.current, 0.22, 0.94));
      const zoom = easeInOut(phase(progress.current, 0, 0.26));
      const scale = 1.28 + 0.12 * zoom - 0.42 * o;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(k, 0, 0, k, 0, 0);
      renderScene(ctx, spin.current, o, scale, palette());

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

    const onResize = () => {
      resize();
      if (!visible) {
        // یک فریم ثابت بکش تا قاب خالی نماند
        last = performance.now();
        requestAnimationFrame(frame);
        stop();
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      io.disconnect();
      window.removeEventListener("resize", onResize);
      stop();
    };
  }, []);

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
        <canvas
          ref={canvasRef}
          className="k2-exp-canvas"
          role="img"
          aria-label="نمای انفجاری شش بُعد شخصیت شغلی روی یک محور"
        />
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
