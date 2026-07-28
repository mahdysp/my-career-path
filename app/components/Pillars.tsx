"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { SiteContent } from "@/lib/site-content";
import DataLattice from "./DataLattice";
import { pillarsStyles } from "./pillarsStyles";

/**
 * بخش «پشتوانه» — بعد از نمایشگر روی صفحه‌ی اصلی.
 *
 * بخش چسبان است، مثل نمای انفجاری: تا وقتی روایت تمام نشده صحنه در
 * پنجره قفل می‌ماند.
 *
 * روایت: ابری از نقطه‌های پراکنده (حدس) با اسکرول به یک شبکه‌ی منظم
 * سه‌بعدی (داده) قفل می‌شوند. هم‌زمان سه ستون پشتوانه یکی‌یکی ظاهر
 * می‌شوند. استعاره مستقیماً از تیتر بخش می‌آید: «روی داده ساخته شده،
 * نه حدس».
 *
 * محتوا از پنل مدیریت می‌آید (`/admin/content`).
 */

const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** فام هر ستون — هم‌راستا با رنگ گره‌های شبکه */
const HUES = [196, 236, 288];

export default function Pillars({ data }: { data: SiteContent["pillars"] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState(0);
  const [dark, setDark] = useState(true);

  /* اسکرول → میزان نظم‌یافتن شبکه */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    let ticking = false;
    const update = () => {
      ticking = false;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;

      /* دو حالت داریم:
         • چسبان (دسکتاپ): بخش بلندتر از پنجره است و بازه‌ی پیشرفت،
           همان مدتی است که قفل می‌ماند.
         • غیرچسبان (موبایل و نمایشگر کوتاه): بخش کوتاه‌تر از پنجره
           است، پس r.height - vh منفی می‌شود و انیمیشن به‌جای حرکت نرم
           می‌پرد. آنجا معیار را «ورود بخش به قاب دید» می‌گیریم. */
      const pinned = r.height > vh + 40;

      let p: number;
      if (pinned) {
        p = clamp01(-r.top / Math.max(1, r.height - vh)) / 0.55;
      } else {
        const start = vh * 0.9;
        const distance = Math.max(1, Math.min(r.height * 0.85, vh * 0.7));
        p = (start - r.top) / distance;
      }

      setOrder(easeInOut(clamp01(p)));
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

  /* تم برای رنگ‌آمیزی بوم — CSS به داخل canvas نمی‌رسد */
  useEffect(() => {
    const read = () =>
      setDark(document.documentElement.dataset.theme !== "light");
    const id = requestAnimationFrame(read);
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => {
      cancelAnimationFrame(id);
      mo.disconnect();
    };
  }, []);

  if (data.items.length === 0) return null;

  return (
    <div ref={wrapRef} className="pl-wrap">
      <style>{pillarsStyles}</style>

      <section className="pl">
        <div className="pl-head">
          {data.eyebrow && (
            <span className="pl-eyebrow">
              <span className="pl-tri" />
              {data.eyebrow}
            </span>
          )}
          <h2 className="pl-title">{data.title}</h2>

          {/* برچسب وضعیت: از حدس به داده */}
          <div className="pl-shift" aria-hidden="true">
            <span className={`pl-shift-s ${order < 0.5 ? "on" : ""}`}>حدس</span>
            <span className="pl-shift-arrow">←</span>
            <span className={`pl-shift-s ${order >= 0.5 ? "on" : ""}`}>داده</span>
          </div>
        </div>

        <div className="pl-split">
          <div className="pl-visual">
            <DataLattice order={order} dark={dark} />
          </div>

          <div className="pl-list">
            {data.items.map((it, i) => {
              /* ستون‌ها بعد از شکل‌گرفتن شبکه یکی‌یکی می‌آیند */
              const shown = order > 0.35 + i * 0.16;
              return (
                <article
                  key={it.id}
                  className={`pl-item ${shown ? "on" : ""}`}
                  style={{
                    ["--pl-hue" as string]: `hsl(${HUES[i] ?? HUES[2]} 70% 62%)`,
                  }}
                >
                  <h3 className="pl-item-t">{it.title}</h3>
                  <p className="pl-item-b">{it.body}</p>
                  {it.tags.length > 0 && (
                    <div className="pl-tags">
                      {it.tags.map((t) => (
                        <span key={t} className="pl-tag">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}

            {data.ctaLabel && data.ctaHref && (
              <Link
                href={data.ctaHref}
                className={`pl-cta ${order > 0.8 ? "on" : ""}`}
              >
                {data.ctaLabel}
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
