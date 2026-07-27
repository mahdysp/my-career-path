"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import SiteNav from "@/app/components/SiteNav";
import { STAGES } from "@/lib/method-content";
import { methodStyles } from "./methodStyles";

/**
 * صفحه‌ی «روش کار».
 *
 * ساختار: یک خط زمانی عمودی که با اسکرول پر می‌شود و هر ایستگاه در
 * زمان رسیدن روشن می‌شود — همان استعاره‌ی «مسیر» بخش سه‌گام صفحه‌ی اصلی،
 * ولی با جزئیات کامل.
 *
 * محتوا در lib/method-content.ts است تا بازبینی‌اش در برابر کد واقعی
 * آسان باشد. این صفحه توضیح می‌دهد **چه اتفاقی می‌افتد**؛ صفحه‌ی
 * /science توضیح می‌دهد **چرا از نظر علمی معتبر است**.
 */

export default function MethodClient() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [fill, setFill] = useState(0);
  /** ایندکس آخرین ایستگاهی که از خط میانی پنجره رد شده (-1 = هیچ‌کدام) */
  const [reached, setReached] = useState(-1);

  /* پر شدن خط زمانی همراه با اسکرول */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let ticking = false;
    const update = () => {
      const stages = Array.from(
        track.querySelectorAll<HTMLElement>("[data-stage]")
      );
      if (!stages.length) return;

      /* خط تا نقطه‌ای پر می‌شود که آخرین ایستگاهِ ردشده از خط میانی
         پنجره است. اگر از ارتفاع کل استفاده می‌کردیم، خط زودتر از
         ایستگاه‌ها پر می‌شد و حس هم‌زمانی از بین می‌رفت. */
      const mid = window.innerHeight * 0.55;
      const top = track.getBoundingClientRect().top;

      let last = -1;
      let filled = 0;
      stages.forEach((el, i) => {
        const dot = el.getBoundingClientRect().top + 14;
        if (dot <= mid) {
          last = i;
          filled = el.offsetTop + 14;
        }
      });

      // بین دو ایستگاه، خط را نرم پیش ببر
      const next = stages[last + 1];
      if (next && last >= 0) {
        const a = stages[last].getBoundingClientRect().top + 14;
        const b = next.getBoundingClientRect().top + 14;
        const t = Math.max(0, Math.min(1, (mid - a) / Math.max(1, b - a)));
        filled += (next.offsetTop - stages[last].offsetTop) * t;
      } else if (last < 0) {
        filled = Math.max(0, Math.min(stages[0].offsetTop, mid - top));
      }

      setFill(Math.max(0, filled));
      setReached(last);
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

  return (
    <main
      dir="rtl"
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "var(--page-gradient)",
        fontFamily: "var(--font-sans)",
        overflowX: "clip",
      }}
    >
      <style>{methodStyles}</style>

      <SiteNav />
      <div className="kn-spacer" />

      <div className="mw">
        <header className="mw-hero">
          <span className="mw-eyebrow">
            <span className="mw-tri" />
            روش کار
          </span>
          <h1 className="mw-h1">از یک کلمه تا نقشه‌ی مسیر</h1>
          <p className="mw-lede">
            شش مرحله از لحظه‌ای که حوزه‌ی کاری‌تان را می‌نویسید تا وقتی نتیجه در
            داشبورد می‌نشیند. هیچ جعبه‌ی سیاهی در کار نیست — هر مرحله دقیقاً همان
            چیزی است که در کد اتفاق می‌افتد.
          </p>

          <div className="mw-quick">
            <div className="mw-quick-i">
              <div className="mw-quick-k">زمان</div>
              <div className="mw-quick-v">5–10 دقیقه</div>
            </div>
            <div className="mw-quick-i">
              <div className="mw-quick-k">تعداد سؤال</div>
              <div className="mw-quick-v">10 · 15 · 20</div>
            </div>
            <div className="mw-quick-i">
              <div className="mw-quick-k">مبنای سنجش</div>
              <div className="mw-quick-v">RIASEC</div>
            </div>
            <div className="mw-quick-i">
              <div className="mw-quick-k">هزینه</div>
              <div className="mw-quick-v">رایگان</div>
            </div>
          </div>
        </header>

        <div className="mw-layout">
          <nav className="mw-toc" aria-label="فهرست مراحل">
            {STAGES.map((s, i) => (
              <a
                key={s.n}
                href={`#stage-${s.n}`}
                className={reached === i ? "on" : ""}
              >
                <i>{s.n}</i>
                {s.short}
              </a>
            ))}
          </nav>

          <div>
            <div className="mw-track" ref={trackRef}>
              <span className="mw-fill" style={{ height: fill }} aria-hidden="true" />

              {STAGES.map((s, i) => (
                <section
                  key={s.n}
                  id={`stage-${s.n}`}
                  data-stage={s.n}
                  className={`mw-stage ${i <= reached ? "on" : ""}`}
                >
                  <span className="mw-dot" aria-hidden="true" />
                  <span className="mw-n">مرحله {s.n}</span>
                  <h2 className="mw-t">{s.title}</h2>
                  <p className="mw-gist">{s.gist}</p>

                  <div className="mw-body">
                    {s.body.map((p) => (
                      <p key={p.slice(0, 24)}>{p}</p>
                    ))}
                  </div>

                  {s.detail && (
                    <div className="mw-detail">
                      {s.detail.map((d) => (
                        <div key={d.label} className="mw-detail-r">
                          <span className="mw-detail-k">{d.label}</span>
                          <span className="mw-detail-v">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {s.why && (
                    <div className="mw-why">
                      <div className="mw-why-q">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent)" }}>
                          <circle cx="12" cy="12" r="9.2" />
                          <path d="M9.4 9.2a2.7 2.7 0 1 1 3.4 2.6c-.5.2-.8.7-.8 1.2v.6" />
                          <circle cx="12" cy="16.8" r=".9" fill="currentColor" />
                        </svg>
                        {s.why.q}
                      </div>
                      <p className="mw-why-a">{s.why.a}</p>
                    </div>
                  )}
                </section>
              ))}
            </div>

            {/* صفحات مرتبط — هر مرحله جزئیات بیشتری در بخش امکانات دارد */}
            <div className="mw-crossref" style={{ display: "block" }}>
              <h3>جزئیات بیشتر هر بخش</h3>
              <p style={{ maxWidth: "100%" }}>
                هر مرحله صفحه‌ی مفصل خودش را دارد.
              </p>
              <div
                style={{
                  display: "grid",
                  gap: 8,
                  marginTop: 14,
                  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                }}
              >
                {[
                  { h: "/features/assessment", t: "آزمون شخصیت شغلی" },
                  { h: "/features/profile", t: "پروفایل شغلی" },
                  { h: "/features/compare", t: "مقایسه‌ی مشاغل" },
                  { h: "/features/path", t: "مسیر پیشنهادی" },
                ].map((x) => (
                  <Link
                    key={x.h}
                    href={x.h}
                    style={{
                      display: "block",
                      padding: "11px 14px",
                      borderRadius: 10,
                      textDecoration: "none",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--foreground)",
                      background: "var(--background-elevated)",
                      border: "1px solid var(--border-default)",
                    }}
                  >
                    {x.t}
                  </Link>
                ))}
              </div>
            </div>

            {/* ارجاع به صفحه‌ی علمی */}
            <div className="mw-crossref" style={{ marginTop: 12 }}>
              <div>
                <h3>چرا این روش معتبر است؟</h3>
                <p>
                  این صفحه توضیح می‌دهد <strong>چه اتفاقی می‌افتد</strong>. اگر
                  می‌خواهید بدانید پشتوانه‌ی پژوهشی این روش چیست، اعداد از کجا
                  می‌آیند و محدودیت‌هایش کدام‌اند، صفحه‌ی پشتوانه‌ی علمی را ببینید.
                </p>
              </div>
              <Link href="/science" className="mw-btn ghost">
                پشتوانه‌ی علمی
              </Link>
            </div>

            <div className="mw-cta">
              <h2>آماده‌اید شروع کنید؟</h2>
              <p>
                حوزه‌ی کاری‌تان را بنویسید و ده دقیقه وقت بگذارید. نتیجه یک نقطه‌ی
                شروع برای فکر کردن است، نه یک حکم قطعی.
              </p>
              <div className="mw-row">
                <Link href="/quiz" className="mw-btn primary">
                  شروع آزمون
                </Link>
                <Link href="/" className="mw-btn ghost">
                  بازگشت به صفحه‌ی اصلی
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
