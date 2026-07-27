"use client";

import Link from "next/link";
import SiteNav from "@/app/components/SiteNav";
import type { SiteContent } from "@/lib/site-content";
import { dataStyles } from "./dataStyles";

/**
 * صفحه‌ی «داده و یکپارچگی».
 *
 * چیدمان دو ستونه: تصویر چسبان در یک سمت، فهرست منابع در سمت دیگر.
 * تصویر یک SVG درون‌خطی است نه فایل — چند کیلوبایت است، در هر دو تم
 * درست کار می‌کند و روی اینترنت کند بار اضافه نمی‌گذارد.
 *
 * محتوا از پنل مدیریت می‌آید و در جدول `site_content` ذخیره می‌شود.
 */

/** نمودار مرکزی: هسته‌ی Karex با منابع داده‌ی متصل به آن */
function HubGraphic() {
  /* شش گره روی دایره — هم‌راستا با شش بُعد RIASEC */
  const nodes = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    return { x: 160 + Math.cos(a) * 108, y: 160 + Math.sin(a) * 108, i };
  });

  const hues = [193, 213, 233, 256, 280, 308];

  return (
    <svg viewBox="0 0 320 320" role="img" aria-label="نمودار اتصال منابع داده به هسته‌ی Karex">
      {/* حلقه‌های راهنما */}
      <circle cx="160" cy="160" r="108" fill="none" stroke="currentColor" strokeOpacity=".12" strokeWidth="1" />
      <circle cx="160" cy="160" r="66" fill="none" stroke="currentColor" strokeOpacity=".08" strokeWidth="1" strokeDasharray="3 6" />

      {/* خطوط اتصال */}
      {nodes.map((n) => (
        <line
          key={`l${n.i}`}
          x1="160" y1="160" x2={n.x} y2={n.y}
          stroke={`hsl(${hues[n.i]} 70% 62%)`}
          strokeOpacity=".38"
          strokeWidth="1.4"
        />
      ))}

      {/* گره‌ها */}
      {nodes.map((n) => (
        <g key={`n${n.i}`}>
          <circle cx={n.x} cy={n.y} r="17" fill="var(--background-elevated)" />
          <circle
            cx={n.x} cy={n.y} r="17"
            fill={`hsl(${hues[n.i]} 70% 62%)`}
            fillOpacity=".18"
            stroke={`hsl(${hues[n.i]} 70% 62%)`}
            strokeWidth="1.6"
          />
          <circle cx={n.x} cy={n.y} r="5" fill={`hsl(${hues[n.i]} 70% 62%)`} />
        </g>
      ))}

      {/* هسته */}
      <circle cx="160" cy="160" r="42" fill="var(--background-elevated)" />
      <circle cx="160" cy="160" r="42" fill="var(--accent)" fillOpacity=".14" stroke="var(--accent)" strokeWidth="1.8" />
      <text
        x="160" y="160"
        textAnchor="middle" dominantBaseline="central"
        fill="var(--foreground)"
        style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em" }}
      >
        Karex
      </text>
    </svg>
  );
}

export default function DataClient({
  integrations,
}: {
  integrations: SiteContent["integrations"];
}) {
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
      <style>{dataStyles}</style>

      <SiteNav />
      <div className="kn-spacer" />

      <div className="dt">
        <header className="dt-hero">
          {integrations.eyebrow && (
            <span className="dt-eyebrow">
              <span className="dt-tri" />
              {integrations.eyebrow}
            </span>
          )}
          <h1 className="dt-h1">{integrations.title}</h1>
          {integrations.lede && <p className="dt-lede">{integrations.lede}</p>}
        </header>

        <div className="dt-split">
          <div className="dt-visual" style={{ color: "var(--foreground)" }}>
            <HubGraphic />
          </div>

          <div>
            {integrations.items.map((it) => (
              <article key={it.id} className="dt-item">
                <h2 className="dt-item-t">{it.title}</h2>
                <p className="dt-item-b">{it.body}</p>
                {it.tags.length > 0 && (
                  <div className="dt-tags">
                    {it.tags.map((t) => (
                      <span key={t} className="dt-tag">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>

        <div className="dt-note">
          <h2>همه‌چیز قابل بررسی است</h2>
          <p>
            هر عددی که در نتیجه می‌بینید یا از فرمول ثابت می‌آید یا از پایگاه
            رسمی O*NET. فرمول محاسبه، منبع داده‌ها و محدودیت‌های این روش را
            کامل در صفحه‌ی پشتوانه‌ی علمی نوشته‌ایم — با ارجاع به مقالات
            داوری‌شده.
          </p>
          <div className="dt-note-row">
            <Link href="/science" className="dt-btn primary">
              پشتوانه‌ی علمی
            </Link>
            <Link href="/how-it-works" className="dt-btn ghost">
              روش کار
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
