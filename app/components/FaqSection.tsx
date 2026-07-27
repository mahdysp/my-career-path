"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { SiteContent } from "@/lib/site-content";
import { faqStyles } from "./faqStyles";

/**
 * بخش پرسش‌های متداول — انتهای صفحه‌ی اصلی.
 *
 * آکاردئون تک‌بازشو: باز کردن یک پرسش، قبلی را می‌بندد. دلیلش این است که
 * با چند پاسخ باز هم‌زمان، صفحه بلند می‌شود و پیدا کردن بقیه‌ی پرسش‌ها
 * سخت می‌شود.
 *
 * انیمیت ارتفاع با `grid-template-rows: 0fr → 1fr` انجام می‌شود تا نیازی
 * به اندازه‌گیری ارتفاع با جاوااسکریپت نباشد.
 *
 * محتوا از پنل مدیریت می‌آید و در جدول `site_content` ذخیره می‌شود.
 */
export default function FaqSection({ faq }: { faq: SiteContent["faq"] }) {
  const [open, setOpen] = useState<string | null>(faq.items[0]?.id ?? null);
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faq.items;
    return faq.items.filter(
      (i) => i.q.toLowerCase().includes(q) || i.a.toLowerCase().includes(q)
    );
  }, [faq.items, query]);

  return (
    <section className="fq" id="faq">
      <style>{faqStyles}</style>

      <header className="fq-hero">
        {faq.eyebrow && (
          <span className="fq-eyebrow">
            <span className="fq-tri" />
            {faq.eyebrow}
          </span>
        )}
        <h2 className="fq-h1">{faq.title}</h2>
        {faq.lede && <p className="fq-lede">{faq.lede}</p>}

        {faq.items.length > 5 && (
          <div className="fq-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m16.5 16.5 4 4" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جست‌وجو در پرسش‌ها…"
              aria-label="جست‌وجو در پرسش‌ها"
            />
          </div>
        )}
      </header>

      <div className="fq-list">
        {shown.length === 0 && (
          <div className="fq-empty">
            پرسشی با «{query}» پیدا نشد.
            <br />
            می‌توانید سؤالتان را مستقیم برای ما بفرستید.
          </div>
        )}

        {shown.map((item) => {
          const isOpen = open === item.id;
          return (
            <div key={item.id} className={`fq-item ${isOpen ? "open" : ""}`}>
              <button
                className="fq-q"
                aria-expanded={isOpen}
                aria-controls={`a-${item.id}`}
                onClick={() => setOpen(isOpen ? null : item.id)}
              >
                {item.q}
                <span className="fq-sign" aria-hidden="true" />
              </button>

              <div className="fq-a" id={`a-${item.id}`} role="region">
                <div className="fq-a-in">
                  <p>{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="fq-more">
        <p>
          <b>پاسخ سؤالتان را پیدا نکردید؟</b>
          اگر پیشنهادی دارید یا ایرادی دیدید، حتماً بگویید — پیام‌ها را می‌خوانیم.
        </p>
      <Link href="/about#contact" className="fq-btn">
        تماس با ما
      </Link>
      </div>
    </section>
  );
}
