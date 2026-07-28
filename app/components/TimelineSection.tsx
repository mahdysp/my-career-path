"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { SiteContent } from "@/lib/site-content";
import { timelineStyles } from "./timelineStyles";

/**
 * بخش «چه وقتی برای این تصمیم درست است؟» — قبل از پرسش‌های متداول.
 *
 * موضوعی که هیچ‌جای دیگر سایت به آن پرداخته نشده: علاقه‌های شغلی ثابت
 * نیستند، با گذر زمان تثبیت می‌شوند — و بحرانی‌ترین بازه (۱۸ تا ۲۲
 * سالگی) دقیقاً همان سنی است که بیشتر مردم باید رشته و شغل را انتخاب
 * کنند. این تنش، دلیل وجود Karex را از زاویه‌ای تازه توضیح می‌دهد.
 *
 * اعداد پایداری از فراتحلیل Low, Yoon, Roberts & Rounds (۲۰۰۵) روی ۶۶
 * پژوهش طولی می‌آید — همان منبعی که در صفحه‌ی /science نقل شده. هیچ
 * عددی ساختگی نیست.
 *
 * منحنی با SVG رسم می‌شود چون باید دقیقاً از نوک ستون‌ها بگذرد و با
 * تغییر تعداد مراحل خودش را تطبیق دهد.
 */

const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

/** فام هر مرحله — از سرد (ناپایدار) به گرم (تثبیت‌شده) */
const HUES = [199, 214, 243, 272, 296];

/**
 * منحنی نرم از میان نقاط، با درون‌یابی کاردینال.
 *
 * چرا نه خط شکسته: نمودار رشد تدریجی است، و خط شکسته آن را پله‌ای و
 * مصنوعی نشان می‌دهد.
 */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  const t = 0.22; // کشش — بیشتر از این، منحنی بیش از حد موج می‌خورد
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) * t;
    const c1y = p1.y + (p2.y - p0.y) * t;
    const c2x = p2.x - (p3.x - p1.x) * t;
    const c2y = p2.y - (p3.y - p1.y) * t;
    d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(
      1
    )}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export default function TimelineSection({
  data,
}: {
  data: SiteContent["timeline"];
}) {
  const wrapRef = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setP(1));
      return () => cancelAnimationFrame(id);
    }

    let ticking = false;
    const update = () => {
      ticking = false;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.86;
      const distance = Math.max(1, Math.min(r.height * 0.62, vh * 0.6));
      setP(clamp01((start - r.top) / distance));
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    const first = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(first);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const stages = data.stages;
  if (stages.length === 0) return null;

  const n = stages.length;
  /* مقیاس محور: از کف کمی پایین‌تر از کمترین مقدار شروع می‌شود تا
     اختلاف‌ها دیده شوند. با ۰ شروع کردن، همه‌ی ستون‌ها تقریباً هم‌قد
     می‌شدند و روند تثبیت گم می‌شد. */
  const FLOOR = 40;
  const CEIL = 85;
  const pctOf = (v: number) => clamp01((v - FLOOR) / (CEIL - FLOOR));

  /* نقاط منحنی در فضای درصدی؛ SVG با preserveAspectRatio="none" کشیده
     می‌شود، پس مختصات ۰..۱۰۰ کافی است. */
  const pts = stages.map((s, i) => ({
    x: ((i + 0.5) / n) * 100,
    y: 100 - pctOf(s.stability) * 100,
  }));
  const curve = smoothPath(pts);

  return (
    <section className="tl" ref={wrapRef}>
      <style>{timelineStyles}</style>

      <div className="tl-head">
        {data.eyebrow && (
          <span className="tl-eyebrow">
            <span className="tl-tri" />
            {data.eyebrow}
          </span>
        )}
        <h2 className="tl-title">{data.title}</h2>
        {data.lede && <p className="tl-lede">{data.lede}</p>}
      </div>

      <div
        className="tl-chart"
        style={{
          ["--tl-n" as string]: n,
          ["--tl-h" as string]: "clamp(190px, 26vw, 260px)",
        }}
      >
        {/* خطوط راهنمای افقی */}
        <div className="tl-grid" aria-hidden="true">
          {[0, 25, 50, 75, 100].map((g) => (
            <i key={g} style={{ top: `${100 - g}%` }} />
          ))}
        </div>

        {/* منحنی روند — پشت ستون‌ها */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          style={{
            position: "absolute",
            insetInline: "clamp(14px, 2.2vw, 26px)",
            top: "clamp(18px, 2.6vw, 30px)",
            height: "var(--tl-h)",
            width: "auto",
            pointerEvents: "none",
            overflow: "visible",
          }}
        >
          <path
            d={curve}
            fill="none"
            stroke="var(--accent)"
            strokeOpacity={0.32}
            strokeWidth="0.7"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeDasharray="1"
            pathLength={1}
            strokeDashoffset={1 - clamp01(p * 1.15)}
            style={{ transition: "stroke-dashoffset .5s linear" }}
          />
        </svg>

        <div className="tl-bars">
          {stages.map((s, i) => {
            const hue = HUES[i] ?? HUES[HUES.length - 1];
            /* ستون‌ها یکی‌یکی بالا می‌آیند، از چپ به راست روایت */
            const on = p > 0.1 + (i / n) * 0.55;
            return (
              <div
                key={s.id}
                className={`tl-col ${on ? "on" : ""} ${s.peak ? "peak" : ""}`}
                style={{ ["--tl-hue" as string]: `hsl(${hue} 72% 62%)` }}
              >
                {s.peak && (
                  <span className="tl-flag">
                    <span>نقطه‌ی عطف</span>
                  </span>
                )}
                <span className="tl-val">{s.stability}</span>
                <span
                  className="tl-bar"
                  style={{ height: on ? `${pctOf(s.stability) * 100}%` : 0 }}
                />
              </div>
            );
          })}
        </div>

        <div className="tl-axis">
          {stages.map((s, i) => {
            const on = p > 0.1 + (i / n) * 0.55;
            const hue = HUES[i] ?? HUES[HUES.length - 1];
            return (
              <div
                key={s.id}
                className={`tl-col ${on ? "on" : ""} ${s.peak ? "peak" : ""}`}
                style={{ ["--tl-hue" as string]: `hsl(${hue} 72% 62%)` }}
              >
                <span className="tl-age">{s.age} سال</span>
              </div>
            );
          })}
        </div>

        <div className="tl-axis-note">پایداری علاقه‌های شغلی (همبستگی × ۱۰۰)</div>
      </div>

      <div className="tl-cards">
        {stages.map((s, i) => {
          const hue = HUES[i] ?? HUES[HUES.length - 1];
          const on = p > 0.3 + (i / n) * 0.4;
          return (
            <article
              key={s.id}
              className={`tl-card ${on ? "on" : ""} ${s.peak ? "peak" : ""}`}
              style={{ ["--tl-hue" as string]: `hsl(${hue} 72% 62%)` }}
            >
              <span className="tl-card-age">{s.age} سال</span>
              <h3 className="tl-card-t">{s.title}</h3>
              <p className="tl-card-b">{s.body}</p>
            </article>
          );
        })}
      </div>

      {data.footnote && (
        <div className={`tl-foot ${p > 0.72 ? "on" : ""}`}>
          <span className="tl-foot-ico">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7.6v5" />
              <circle cx="12" cy="16.2" r=".9" fill="currentColor" />
            </svg>
          </span>
          <div>
            <p>{data.footnote}</p>
            {data.source && (
              <Link href={data.sourceHref || "/science"} className="tl-src">
                {data.source}
                <span aria-hidden="true">←</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
