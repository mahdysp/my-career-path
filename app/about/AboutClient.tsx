"use client";

import SiteNav from "@/app/components/SiteNav";
import type { SiteContent } from "@/lib/site-content";
import { aboutStyles } from "./aboutStyles";

/**
 * صفحه‌ی «درباره‌ی ما و راه‌های ارتباطی».
 *
 * تمام محتوا از پنل مدیریت می‌آید (`/admin/content`) و در جدول
 * `site_content` ذخیره می‌شود — پس ویرایشش نیازی به دیپلوی ندارد.
 */

const ICONS: Record<string, React.ReactNode> = {
  email: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  ),
  telegram: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 4.5 2.8 11.4l5.4 1.9 1.9 5.4L21 4.5z" />
      <path d="m8.2 13.3 4.2-4.2" />
    </svg>
  ),
  instagram: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17" cy="7" r="1" fill="currentColor" />
    </svg>
  ),
  phone: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 3.5h3l1.5 4-2 1.4a12 12 0 0 0 5.1 5.1l1.4-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z" />
    </svg>
  ),
  address: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  ),
  link: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13.5a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 1 0-5.7-5.7L11.5 6.3" />
      <path d="M14 10.5a4 4 0 0 0-5.7 0l-2.8 2.8a4 4 0 1 0 5.7 5.7l1.3-1.3" />
    </svg>
  ),
};

/** آدرس مقصد را از نوع کانال می‌سازد، مگر اینکه دستی داده شده باشد */
function hrefFor(kind: string, value: string, explicit: string): string | null {
  if (explicit.trim()) return explicit.trim();
  const v = value.trim();
  if (!v) return null;
  switch (kind) {
    case "email":
      return `mailto:${v}`;
    case "phone":
      return `tel:${v.replace(/[^\d+]/g, "")}`;
    case "telegram":
      return `https://t.me/${v.replace(/^@/, "")}`;
    case "instagram":
      return `https://instagram.com/${v.replace(/^@/, "")}`;
    case "link":
      return v.startsWith("http") ? v : `https://${v}`;
    default:
      return null; // address و هر چیز دیگری فقط متن است
  }
}

export default function AboutClient({ about }: { about: SiteContent["about"] }) {
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
      <style>{aboutStyles}</style>

      <SiteNav />
      <div className="kn-spacer" />

      <div className="ab">
        <header className="ab-hero">
          {about.eyebrow && (
            <span className="ab-eyebrow">
              <span className="ab-tri" />
              {about.eyebrow}
            </span>
          )}
          <h1 className="ab-h1">{about.title}</h1>
          {about.lede && <p className="ab-lede">{about.lede}</p>}
        </header>

        {about.story.length > 0 && (
          <section className="ab-sec" id="story">
            <h2 className="ab-h2">داستان ما</h2>
            <div className="ab-body">
              {about.story.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </section>
        )}

        {about.values.length > 0 && (
          <section className="ab-sec" id="values">
            <h2 className="ab-h2">اصولی که رعایت می‌کنیم</h2>
            <div className="ab-values">
              {about.values.map((v) => (
                <div key={v.id} className="ab-value">
                  <b>{v.title}</b>
                  <span>{v.body}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="ab-sec" id="contact">
          <h2 className="ab-h2">{about.contactTitle || "راه‌های ارتباطی"}</h2>
          {about.contactBody && (
            <div className="ab-body">
              <p>{about.contactBody}</p>
            </div>
          )}

          {about.channels.length > 0 && (
            <div className="ab-channels">
              {about.channels.map((c) => {
                const href = hrefFor(c.kind, c.value, c.href);
                const inner = (
                  <>
                    <span className="ab-ch-ico">{ICONS[c.kind] ?? ICONS.link}</span>
                    <span className="ab-ch-t">
                      <b>{c.label}</b>
                      <span>{c.value}</span>
                    </span>
                  </>
                );

                return href ? (
                  <a
                    key={c.id}
                    href={href}
                    className="ab-ch"
                    {...(href.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={c.id} className="ab-ch static">
                    {inner}
                  </div>
                );
              })}
            </div>
          )}

          {about.responseTime && <p className="ab-note">{about.responseTime}</p>}
        </section>
      </div>
    </main>
  );
}
