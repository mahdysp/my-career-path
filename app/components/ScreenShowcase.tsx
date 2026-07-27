"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * بخش نمایشگر: قاب یک مانیتور که محتوای دلخواه داخلش پخش می‌شود.
 *
 * ── چطور تصویر خودتان را بگذارید ──────────────────────────────
 * فایل‌ها را در `public/showcase/` بریزید و فقط آرایه‌ی SLIDES پایین را
 * ویرایش کنید. مثال:
 *
 *   const SLIDES: Slide[] = [
 *     { src: "/showcase/dashboard.png", alt: "داشبورد Karex",
 *       title: "داشبورد شما", body: "...", label: "karex.ir/dashboard" },
 *   ];
 *
 * برای ویدیو کافی است `video: true` بگذارید (فرمت mp4 یا webm):
 *   { src: "/showcase/demo.mp4", video: true, alt: "...", title: "...", body: "..." }
 *
 * ابعاد پیشنهادی تصویر: ۱۶۰۰×۱۰۰۰ (نسبت ۱۶:۱۰) — همان نسبت قاب.
 * ─────────────────────────────────────────────────────────────
 */

type Slide = {
  /** آدرس فایل داخل public — اگر خالی باشد جای‌گیر نمایش داده می‌شود */
  src?: string;
  /** اگر ویدیو است */
  video?: boolean;
  alt: string;
  /** متنی که کنار نمایشگر نشان داده می‌شود */
  eyebrow: string;
  title: string;
  body: string;
  /** نوشته‌ی نوار بالای پنجره */
  label: string;
};

const SLIDES: Slide[] = [
  {
    alt: "نتیجه‌ی آزمون شخصیت شغلی",
    eyebrow: "نتیجه‌ی آزمون",
    title: "تصویری که از خودتان نداشتید",
    body: "پس از آزمون، شش بُعد شخصیت شغلی‌تان روی یک نمودار می‌نشیند و می‌بینید کدام مسیرها با شما هم‌جهت‌اند و کدام‌ها نه.",
    label: "karex.ir/result",
  },
  {
    alt: "داشبورد پیشرفت",
    eyebrow: "داشبورد",
    title: "مسیرتان را دنبال کنید",
    body: "هر آزمون ثبت می‌شود. تغییر علاقه‌ها در طول زمان، شغل‌های پیشنهادی و کارهایی که باید بعد انجام دهید — همه یک‌جا.",
    label: "karex.ir/dashboard",
  },
  {
    alt: "مقایسه‌ی مشاغل",
    eyebrow: "مقایسه‌ی مشاغل",
    title: "بر پایه‌ی داده، نه حدس",
    body: "درصد تطابق از داده‌های رسمی O*NET محاسبه می‌شود؛ حقوق، چشم‌انداز رشد و مهارت‌های لازم هر شغل کنار هم.",
    label: "karex.ir/careers",
  },
];

/** هر اسلاید چند میلی‌ثانیه بماند */
const DWELL = 5200;

export default function ScreenShowcase() {
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLElement>(null);
  const paused = useRef(false);

  /* چرخش خودکار — فقط وقتی بخش در دید است و کاربر دست نزده */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer = 0;
    const tick = () => {
      if (!paused.current) setActive((i) => (i + 1) % SLIDES.length);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        window.clearInterval(timer);
        if (e.isIntersecting) timer = window.setInterval(tick, DWELL);
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  const s = SLIDES[active];

  return (
    <section
      ref={wrapRef}
      className="k2-screen"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <div className="k2-screen-copy">
        <span className="k2-screen-eyebrow">
          <span className="k2-exp-tri" />
          {s.eyebrow}
        </span>
        <h2 className="k2-screen-title">{s.title}</h2>
        <p className="k2-screen-sub">{s.body}</p>

        <div className="k2-screen-dots" role="tablist" aria-label="انتخاب نما">
          {SLIDES.map((sl, i) => (
            <button
              key={sl.alt}
              role="tab"
              aria-selected={i === active}
              aria-label={sl.eyebrow}
              className={`k2-screen-dot ${i === active ? "on" : ""}`}
              onClick={() => {
                setActive(i);
                paused.current = true;
              }}
            />
          ))}
        </div>
      </div>

      <div className="k2-device">
        <div className="k2-device-frame">
          <div className="k2-device-bar">
            <span className="k2-device-lights">
              <i />
              <i />
              <i />
            </span>
            <span className="k2-device-label">{s.label}</span>
          </div>

          <div className="k2-device-viewport">
            {SLIDES.map((sl, i) => (
              <div
                key={sl.alt}
                className={`k2-device-slide ${i === active ? "on" : ""}`}
                aria-hidden={i !== active}
              >
                {!sl.src ? (
                  <div className="k2-device-placeholder">
                    <span>{sl.alt}</span>
                  </div>
                ) : sl.video ? (
                  <video src={sl.src} muted loop playsInline autoPlay aria-label={sl.alt} />
                ) : (
                  <Image
                    src={sl.src}
                    alt={sl.alt}
                    fill
                    sizes="(max-width: 900px) 100vw, 60vw"
                    style={{ objectFit: "cover" }}
                    priority={i === 0}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="k2-device-stand" />
        <div className="k2-device-base" />
      </div>
    </section>
  );
}
