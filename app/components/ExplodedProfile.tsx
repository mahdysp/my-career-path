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
 * بخش «چسبان» است: تا وقتی روایت تمام نشده صحنه در وسط صفحه قفل می‌ماند.
 * روایت با اسکرول:
 *   ۱. شش قطعه در هم چفت‌اند و با هم می‌چرخند.
 *   ۲. قطعات در امتداد محور جدا می‌شوند، خط راهنما از هر کدام پایین
 *      می‌آید و به توضیح آن بُعد وصل می‌شود.
 *   ۳. دوباره جمع می‌شوند و مجموعه یکپارچه به بخش بعدی تحویل داده می‌شود.
 *
 * چرا canvas و نه SVG: قطعات باید سطح تو‌پُر داشته باشند و جلوی هم را
 * بگیرند. حدود ۳۰۰۰ وجه در هر فریم رسم می‌شود که برای canvas سبک است
 * ولی برای SVG (همان تعداد گره DOM در هر فریم) نبود.
 */

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const phase = (t: number, from: number, to: number) =>
  Math.max(0, Math.min(1, (t - from) / (to - from)));

/* نگاشت پیشرفت کل بخش به «میزان باز بودن».
   قفل‌شدن بخش کمی قبل از رسیدن به بالای پنجره شروع می‌شود، پس بازشدن
   هم باید زود آغاز شود؛ وگرنه کاربر مدت زیادی یک تصویر ثابت می‌بیند. */
function openness(p: number) {
  if (p < 0.06) return 0; // تازه قفل شده — هنوز سرهم
  if (p < 0.42) return easeInOut(phase(p, 0.06, 0.42));
  if (p < 0.74) return 1; // مکث برای خواندن توضیحات
  return 1 - easeInOut(phase(p, 0.74, 1));
}

/* رنگ قطعات از توکن‌های CSS نمی‌آید چون سایه‌پردازی به فضای HSL نیاز
   دارد؛ اما فام‌ها حول --accent (#5e6ad2 ≈ ۲۳۱ درجه) چیده شده‌اند.
   baseLum بالا نگه داشته شده تا سایه‌ها هم رنگی و روشن بمانند و قطعات
   به توده‌ی تیره تبدیل نشوند. */
const DARK: Palette = {
  baseSat: 0.62,
  baseLum: 0.34,
  litSat: 0.8,
  litLum: 0.82,
  line: "rgba(255,255,255,0.3)",
  leader: "rgba(255,255,255,0.28)",
};

const LIGHT: Palette = {
  baseSat: 0.5,
  baseLum: 0.55,
  litSat: 0.72,
  litLum: 0.93,
  line: "rgba(26,26,31,0.26)",
  leader: "rgba(26,26,31,0.3)",
};

export default function ExplodedProfile({
  copy,
}: {
  /** متن‌های بخش — از پنل مدیریت می‌آید */
  copy?: { eyebrow: string; title: string; subtitle: string };
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);
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
      /* نوار پیشرفت دقیقاً بازه‌ی قفل‌بودن بخش است: از لحظه‌ای که بالای
         بخش به زیر ناوبار می‌رسد تا لحظه‌ای که پایینش به کف می‌رسد.
         NAV باید با top در .k2-exp-sticky یکی باشد. */
      const NAV = 64;
      const travel = Math.max(1, r.height - (vh - NAV));
      const p = Math.max(0, Math.min(1, (NAV - r.top) / travel));
      progress.current = p;
      setOpenT(openness(p));
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

    /* بوم باید هم در عرض و هم در ارتفاعِ موجود جا شود. اگر فقط از روی
       عرض محاسبه شود، روی نمایشگرهای کوتاه بلندتر از فضای موجود می‌شود
       و ستون توضیحات زیرش از قاب بیرون می‌ماند. */
    let cssW = 0;
    const resize = () => {
      const stage = canvas.parentElement;
      if (!stage) return;
      const availW = stage.clientWidth;
      if (!availW) return;
      const legendH = legendRef.current?.offsetHeight ?? 0;
      const availH = stage.clientHeight - legendH;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const k = Math.min(
        availW / VIEW_W,
        availH > 40 ? availH / VIEW_H : Infinity
      );
      cssW = Math.max(1, Math.round(VIEW_W * k));
      const cssH = Math.max(1, Math.round(VIEW_H * k));
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      // ستون‌ها هم‌عرض بوم بمانند تا با انتهای خطوط راهنما بخوانند
      if (legendRef.current) legendRef.current.style.width = `${cssW}px`;
    };

    const frame = (now: number) => {
      const dt = Math.min(80, now - last);
      last = now;
      if (!reduce) spin.current += dt * 0.00034;

      const k = (cssW / VIEW_W) * dpr;
      const p = progress.current;
      const o = openness(p);
      const zoom = easeInOut(phase(p, 0, 0.12));
      const scale = 1.24 + 0.1 * zoom - 0.4 * o;
      const pal = palette();

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(k, 0, 0, k, 0, 0);
      renderScene(ctx, spin.current, o, scale, pal);
      renderLeaders(ctx, o, scale, phase(o, 0.3, 0.85), pal.leader);

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
    /* اندازه‌ی صحنه با ارتفاع پنجره عوض می‌شود، نه فقط با عرض */
    const ro = new ResizeObserver(() => {
      resize();
      if (!visible) {
        last = performance.now();
        requestAnimationFrame(frame);
        stop();
      }
    });
    if (canvas.parentElement) ro.observe(canvas.parentElement);

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
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      stop();
    };
  }, []);

  return (
    <div ref={wrapRef} className="k2-exp">
      <div ref={stickyRef} className="k2-exp-sticky">
        <div className="k2-exp-head">
          {copy?.eyebrow !== "" && (
            <span className="k2-exp-eyebrow">
              <span className="k2-exp-tri" />
              {copy?.eyebrow || "پروفایل شغلی"}
            </span>
          )}
          <h2 className="k2-exp-title">{copy?.title || "شش قطعه، یک تصویر کامل"}</h2>
          <p className="k2-exp-sub">
            {copy?.subtitle ||
              "شخصیت شغلی شما از شش بُعد ساخته شده است. آزمون Karex این قطعات را کنار هم می‌گذارد تا ببینید کدام مسیر واقعاً به شما می‌آید."}
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
              همان تقسیم‌بندی (i + 0.5) / 6 در renderLeaders هم‌راستاست.
              عرضشان به بوم گره خورده تا با جابه‌جایی خطوط هم‌راستا بماند. */}
          <div className="k2-exp-legend" dir="ltr" ref={legendRef}>
            {RIASEC_AXES.map((ax, i) => {
              const shown = openT > 0.34 + i * 0.05;
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
    </div>
  );
}
