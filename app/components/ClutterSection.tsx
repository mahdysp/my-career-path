"use client";

import { useEffect, useRef, useState } from "react";
import type { SiteContent } from "@/lib/site-content";
import { clutterStyles } from "./clutterStyles";

/**
 * بخش «به‌جای این‌همه حدس، یک نقشه» — قبل از پرسش‌های متداول.
 *
 * روایت با اسکرول: شش کاشی (راه‌های حدسی انتخاب شغل) یکی‌یکی ظاهر
 * می‌شوند، بعد پشت سر هم ضربدر می‌خورند و خطی روی برچسبشان کشیده
 * می‌شود، و در پایان یک کارت واحد جایشان را می‌گیرد.
 *
 * نکته‌ی مهم در پیاده‌سازی: شفافیت روی *کل* کاشی اعمال نمی‌شود، چون
 * آن‌وقت ضربدر قرمز هم محو می‌شد (کنتراست ۲.۷ — عملاً نامرئی). فقط
 * آیکن و برچسب کم‌رنگ می‌شوند.
 *
 * چرا این استعاره: مرجع طراحی لوگوی رقبا را خط می‌زد. اینجا رقیب ما
 * یک محصول نیست — عادت‌های حدسیِ انتخاب شغل است. همان را خط می‌زنیم.
 *
 * محتوا از پنل مدیریت می‌آید (`/admin/content`).
 */

const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

const ICONS: Record<string, React.ReactNode> = {
  chat: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12a7.5 7.5 0 0 1-7.5 7.5H8L4 22v-4.2A7.5 7.5 0 0 1 11.5 4.5h1A7.5 7.5 0 0 1 20 12z" />
    </svg>
  ),
  quiz: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="2.5" />
      <path d="M9.2 9.3a2.8 2.8 0 1 1 3.6 2.7c-.5.2-.8.7-.8 1.2v.5" />
      <circle cx="12" cy="17" r=".9" fill="currentColor" />
    </svg>
  ),
  money: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  ),
  megaphone: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10v4a2 2 0 0 0 2 2h2l8 4V4L8 8H6a2 2 0 0 0-2 2z" />
      <path d="M19 9.5a3.5 3.5 0 0 1 0 5" />
    </svg>
  ),
  list: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6.5h11M9 12h11M9 17.5h11" />
      <circle cx="4.5" cy="6.5" r="1.2" fill="currentColor" />
      <circle cx="4.5" cy="12" r="1.2" fill="currentColor" />
      <circle cx="4.5" cy="17.5" r="1.2" fill="currentColor" />
    </svg>
  ),
  clock: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5.3l3.3 2" />
    </svg>
  ),
};

export default function ClutterSection({
  data,
}: {
  data: SiteContent["clutter"];
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
      /* از وقتی بالای بخش وارد نیمه‌ی پایینی پنجره می‌شود تا وقتی
         بیشترش دیده شده. بخش قفل نمی‌شود — کوتاه است و قفل‌کردنش
         فقط اسکرول را کند می‌کند. */
      const start = vh * 0.88;
      const distance = Math.max(1, Math.min(r.height * 0.8, vh * 0.72));
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

  if (data.items.length === 0) return null;

  const n = data.items.length;
  /* سه فاز پشت سر هم: ظاهر شدن → خط خوردن → جایگزینی */
  const APPEAR_END = 0.34;
  const CROSS_END = 0.68;

  return (
    <section className="cl" ref={wrapRef}>
      <style>{clutterStyles}</style>

      {data.eyebrow && (
        <span className="cl-eyebrow">
          <span className="cl-tri" />
          {data.eyebrow}
        </span>
      )}
      <h2 className="cl-title">{data.title}</h2>
      {data.lede && <p className="cl-lede">{data.lede}</p>}

      <div className="cl-grid">
        {data.items.map((it, i) => {
          const step = i / n;
          const shown = p > step * APPEAR_END;
          const crossed = p > APPEAR_END + step * (CROSS_END - APPEAR_END);
          return (
            <div
              key={it.id}
              className={`cl-item ${shown ? "in" : ""} ${crossed ? "out" : ""}`}
            >
              <span className="cl-x" aria-hidden="true">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </span>
              <span className="cl-ico">{ICONS[it.icon] ?? ICONS.list}</span>
              <span className="cl-label">{it.label}</span>
            </div>
          );
        })}
      </div>

      <div className={`cl-bridge ${p > CROSS_END ? "on" : ""}`} aria-hidden="true">
        <span className="cl-bridge-line" />
        <span className="cl-bridge-dot" />
      </div>

      <div className={`cl-result ${p > CROSS_END + 0.04 ? "on" : ""}`}>
        <span className="cl-result-ico">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="m15.6 8.4-2.2 5.6-5.6 2.2 2.2-5.6z" fill="currentColor" stroke="none" />
          </svg>
        </span>
        <h3 className="cl-result-t">{data.resultTitle}</h3>
        <p className="cl-result-b">{data.resultBody}</p>
      </div>
    </section>
  );
}
