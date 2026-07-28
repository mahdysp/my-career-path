"use client";

import Link from "next/link";
import SiteNav from "@/app/components/SiteNav";
import { useScrollTrack } from "@/app/components/useScrollTrack";
import type { FeaturePage } from "@/lib/feature-content";
import { featureStyles } from "./featureStyles";

/**
 * قالب مشترک چهار صفحه‌ی «امکانات».
 *
 * چرا یک کامپوننت برای هر چهار صفحه: ساختارشان یکسان است. اگر هرکدام
 * فایل جدا داشتند، هر تغییر چیدمانی باید چهار بار تکرار می‌شد و
 * ناهماهنگی حتمی بود. تفاوت‌ها همه در داده است، نه در ساختار.
 */
export default function FeatureClient({ page }: { page: FeaturePage }) {
  const { trackRef, fill, reached } = useScrollTrack(page.blocks.length);

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
      <style>{featureStyles}</style>

      <SiteNav />
      <div className="kn-spacer" />

      <div className="fw">
        <header className="fw-hero">
          <nav className="fw-crumb" aria-label="مسیر">
            <Link href="/">خانه</Link>
            <span>/</span>
            <span>امکانات</span>
            <span>/</span>
            <span style={{ color: "var(--foreground-muted)", opacity: 1 }}>
              {page.eyebrow}
            </span>
          </nav>

          <span className="fw-eyebrow">
            <span className="fw-tri" />
            {page.eyebrow}
          </span>
          <h1 className="fw-h1">{page.title}</h1>
          <p className="fw-lede">{page.lede}</p>

          <div className="fw-quick">
            {page.quick.map((q) => (
              <div key={q.k} className="fw-quick-i">
                <div className="fw-quick-k">{q.k}</div>
                <div className="fw-quick-v">{q.v}</div>
              </div>
            ))}
          </div>
        </header>

        <div className="fw-layout">
          <nav className="fw-toc" aria-label="فهرست مطالب">
            {page.blocks.map((b, i) => (
              <a key={b.id} href={`#${b.id}`} className={reached === i ? "on" : ""}>
                {b.short}
              </a>
            ))}
          </nav>

          <div>
            <div className="fw-track" ref={trackRef}>
              <span className="fw-fill" style={{ height: fill }} aria-hidden="true" />

            {page.blocks.map((b, i) => (
              <section
                key={b.id}
                id={b.id}
                data-stage={b.id}
                className={`fw-sec ${i <= reached ? "on" : ""}`}
              >
                <span className="fw-dot" aria-hidden="true" />
                <h2 className="fw-h2">{b.title}</h2>
                {b.gist && <p className="fw-gist">{b.gist}</p>}

                <div className="fw-body">
                  {b.body.map((p) => (
                    <p key={p.slice(0, 24)}>{p}</p>
                  ))}
                </div>

                {b.detail && (
                  <div className="fw-detail">
                    {b.detail.map((d) => (
                      <div key={d.label} className="fw-detail-r">
                        <span className="fw-detail-k">{d.label}</span>
                        <span className="fw-detail-v">{d.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {b.bullets && (
                  <div className="fw-bullets">
                    {b.bullets.map((x) => (
                      <div key={x.t} className="fw-bullet">
                        <b>{x.t}</b>
                        <span>{x.d}</span>
                      </div>
                    ))}
                  </div>
                )}

                {b.why && (
                  <div className="fw-why">
                    <div className="fw-why-q">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9.2" />
                        <path d="M9.4 9.2a2.7 2.7 0 1 1 3.4 2.6c-.5.2-.8.7-.8 1.2v.6" />
                        <circle cx="12" cy="16.8" r=".9" fill="currentColor" />
                      </svg>
                      {b.why.q}
                    </div>
                    <p className="fw-why-a">{b.why.a}</p>
                  </div>
                )}
              </section>
            ))}
            </div>

            <div className="fw-related">
              <div className="fw-related-t">صفحات مرتبط</div>
              <div className="fw-related-grid">
                {page.related.map((r) => (
                  <Link key={r.href} href={r.href} className="fw-related-c">
                    <b>{r.label}</b>
                    <span>{r.desc}</span>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
