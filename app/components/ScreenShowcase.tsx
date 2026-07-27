"use client";

import { useEffect, useRef, useState } from "react";
import type { ShowcaseSlide } from "@/lib/site-content";

/**
 * بخش نمایشگر: قاب یک مانیتور که محتوای دلخواه داخلش پخش می‌شود.
 *
 * محتوا از پنل مدیریت می‌آید (`/admin/content`) و در جدول `site_content`
 * ذخیره می‌شود. صفحه‌ی اصلی آن را سمت سرور می‌خواند و به‌عنوان prop
 * می‌فرستد، پس تغییرات بدون دیپلوی مجدد اعمال می‌شود.
 *
 * تصاویر با <img> ساده رندر می‌شوند نه next/image: آدرس‌ها از Supabase
 * Storage می‌آیند و از پنل قابل تغییرند، پس دامنه‌شان در زمان بیلد
 * مشخص نیست و نمی‌توان در next.config محدودشان کرد.
 */

/** هر اسلاید چند میلی‌ثانیه بماند */
const DWELL = 5200;

export default function ScreenShowcase({ slides }: { slides: ShowcaseSlide[] }) {
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLElement>(null);
  const paused = useRef(false);

  /* چرخش خودکار — فقط وقتی بخش در دید است و کاربر دست نزده */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer = 0;
    const tick = () => {
      if (!paused.current) setActive((i) => (i + 1) % slides.length);
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
  }, [slides.length]);

  /* اگر اسلایدی از پنل حذف شد، اندیس فعال ممکن است بیرون از بازه بماند.
     به‌جای اصلاح با افکت (که یک رندر اضافه می‌سازد) هنگام خواندن مهار
     می‌شود. */
  if (slides.length === 0) return null;
  const index = Math.min(active, slides.length - 1);
  const s = slides[index];

  return (
    <section
      ref={wrapRef}
      className="k2-screen"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <div className="k2-screen-copy">
        {s.eyebrow && (
          <span className="k2-screen-eyebrow">
            <span className="k2-exp-tri" />
            {s.eyebrow}
          </span>
        )}
        <h2 className="k2-screen-title">{s.title}</h2>
        <p className="k2-screen-sub">{s.body}</p>

        {slides.length > 1 && (
          <div className="k2-screen-dots" role="tablist" aria-label="انتخاب نما">
            {slides.map((sl, i) => (
              <button
                key={sl.id}
                role="tab"
                aria-selected={i === index}
                aria-label={sl.eyebrow || sl.title}
                className={`k2-screen-dot ${i === index ? "on" : ""}`}
                onClick={() => {
                  setActive(i);
                  paused.current = true;
                }}
              />
            ))}
          </div>
        )}
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
            {slides.map((sl, i) => (
              <div
                key={sl.id}
                className={`k2-device-slide ${i === index ? "on" : ""}`}
                aria-hidden={i !== index}
              >
                {!sl.src ? (
                  <div className="k2-device-placeholder">
                    <span>{sl.alt || sl.title}</span>
                  </div>
                ) : sl.video ? (
                  <video src={sl.src} muted loop playsInline autoPlay aria-label={sl.alt} />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sl.src} alt={sl.alt} loading={i === 0 ? "eager" : "lazy"} />
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
