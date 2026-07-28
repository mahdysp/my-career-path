"use client";

import { useEffect, useRef, useState } from "react";
import type { ShowcaseSlide } from "@/lib/site-content";

/**
 * بخش نمایشگر: قاب یک مانیتور که محتوای دلخواه داخلش پخش می‌شود.
 *
 * بخش «چسبان» است — مثل نمای انفجاری. تا وقتی همه‌ی اسلایدها دیده نشده‌اند
 * صحنه در پنجره قفل می‌ماند، پس در هر لحظه فقط متعلقات همین بخش در قاب
 * دید هستند و چیزی از بخش بعدی وسط روایت پیدا نمی‌شود.
 *
 * اسلایدها با اسکرول عوض می‌شوند نه با تایمر. دلیلش: با تایمر ممکن بود
 * کاربر وسط خواندن یک اسلاید، اسلاید بعدی را ببیند. حالا کنترل دست اوست.
 *
 * محتوا از پنل مدیریت می‌آید (`/admin/content`) و در جدول `site_content`
 * ذخیره می‌شود، پس تغییرش نیازی به دیپلوی ندارد.
 */

export default function ScreenShowcase({ slides }: { slides: ShowcaseSlide[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  /** وقتی کاربر روی نقطه‌ها کلیک کند، اسکرول موقتاً کنترل را پس می‌گیرد */
  const manual = useRef<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || slides.length < 2) return;

    let ticking = false;
    const update = () => {
      ticking = false;
      if (manual.current !== null) return;

      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      /* بازه‌ی قفل‌بودن بخش = از وقتی بالایش به سقف می‌رسد تا وقتی
         پایینش به کف می‌رسد. */
      const travel = Math.max(1, r.height - vh);
      const p = Math.max(0, Math.min(0.9999, -r.top / travel));

      setActive(Math.floor(p * slides.length));
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
  }, [slides.length]);

  /** کلیک روی نقطه: به موقعیت اسکرول همان اسلاید می‌پرد */
  const goTo = (i: number) => {
    const el = wrapRef.current;
    setActive(i);
    if (!el) return;

    const vh = window.innerHeight;
    const travel = Math.max(1, el.offsetHeight - vh);
    // وسط بازه‌ی همان اسلاید تا دقیقاً روی آن بنشیند
    const target =
      el.offsetTop + travel * ((i + 0.5) / slides.length);

    /* در حین پرش، محاسبه‌ی اسکرول موقتاً خاموش می‌شود وگرنه
       اسلایدهای میانی به‌سرعت رد می‌شوند. */
    if (manual.current !== null) window.clearTimeout(manual.current);
    manual.current = window.setTimeout(() => {
      manual.current = null;
    }, 700);

    window.scrollTo({ top: target, behavior: "smooth" });
  };

  if (slides.length === 0) return null;
  const index = Math.min(active, slides.length - 1);
  const s = slides[index];

  return (
    <div ref={wrapRef} className="k2-screen-wrap">
      <section className="k2-screen">
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
                  onClick={() => goTo(i)}
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
    </div>
  );
}
