"use client";

import Link from "next/link";
import type { SiteContent } from "@/lib/site-content";
import { pillarsStyles } from "./pillarsStyles";

/**
 * بخش «پشتوانه» — بعد از نمایشگر روی صفحه‌ی اصلی.
 *
 * چیدمان دو ستونه: تصویر ایزومتریک در یک سمت، سه ستون پشتوانه در سمت
 * دیگر با خط جداکننده. الگو از مرجع طراحی گرفته شده ولی محتوا و تصویر
 * متناسب با همین پروژه است.
 *
 * تصویر یک SVG درون‌خطی است نه فایل: چند کیلوبایت وزن دارد، در هر دو تم
 * درست کار می‌کند، و روی اینترنت کند بار اضافه نمی‌گذارد.
 *
 * محتوا از پنل مدیریت می‌آید (`/admin/content`).
 */

/**
 * بلوک‌های ایزومتریک که به سمت یک هسته‌ی مرکزی جمع می‌شوند.
 *
 * استعاره: لایه‌های داده (O*NET، مدل هالند، پاسخ‌های شما) که روی هم
 * می‌نشینند و نتیجه را می‌سازند — هم‌راستا با زبان بصری قطعات مکانیکی
 * که بالاتر در صفحه دیده می‌شود.
 */
function StackGraphic() {
  /* تصویر ایزومتریک: هر لایه یک شش‌ضلعی است که با آفست عمودی چیده شده */
  const W = 320;
  const CX = 160;

  /** یک بلوک ایزومتریک در ارتفاع y با نصف‌عرض w و ضخامت t */
  const block = (y: number, w: number, t: number, hue: number, key: string) => {
    const h = w * 0.5; // نسبت ایزومتریک ۲:۱
    const top = `${CX},${y - h} ${CX + w},${y} ${CX},${y + h} ${CX - w},${y}`;
    const left = `${CX - w},${y} ${CX},${y + h} ${CX},${y + h + t} ${CX - w},${y + t}`;
    const right = `${CX + w},${y} ${CX},${y + h} ${CX},${y + h + t} ${CX + w},${y + t}`;
    return (
      <g key={key}>
        {/* وجه بالا — روشن‌ترین */}
        <polygon points={top} fill={`hsl(${hue} 72% 62%)`} fillOpacity=".92" />
        {/* وجه چپ — سایه‌ی متوسط */}
        <polygon points={left} fill={`hsl(${hue} 68% 44%)`} fillOpacity=".92" />
        {/* وجه راست — تاریک‌ترین */}
        <polygon points={right} fill={`hsl(${hue} 66% 32%)`} fillOpacity=".92" />
        {/* خط لبه برای وضوح در تم روشن */}
        <polygon
          points={top}
          fill="none"
          stroke={`hsl(${hue} 80% 78%)`}
          strokeOpacity=".55"
          strokeWidth="1"
        />
      </g>
    );
  };

  return (
    <svg viewBox={`0 0 ${W} ${W}`} role="img" aria-label="لایه‌های داده که پروفایل شغلی را می‌سازند">
      {/* هاله‌ی پشت */}
      <ellipse cx={CX} cy="196" rx="112" ry="56" fill="var(--accent)" fillOpacity=".08" />

      {/* سه لایه از پایین به بالا — از پهن به باریک */}
      {block(196, 104, 20, 193, "b1")}
      {block(148, 78, 18, 233, "b2")}
      {block(104, 52, 16, 280, "b3")}

      {/* هسته‌ی بالا — نتیجه */}
      <g>
        <circle cx={CX} cy="58" r="25" fill="var(--background-deep)" />
        <circle
          cx={CX} cy="58" r="25"
          fill="hsl(308 66% 62%)" fillOpacity=".2"
          stroke="hsl(308 70% 68%)" strokeWidth="1.6"
        />
        <circle cx={CX} cy="58" r="7" fill="hsl(308 70% 70%)" />
      </g>

      {/* خط اتصال هسته به بالای پشته */}
      <line
        x1={CX} y1="83" x2={CX} y2="98"
        stroke="hsl(290 66% 66%)" strokeOpacity=".5"
        strokeWidth="1.6" strokeDasharray="3 4"
      />
    </svg>
  );
}

export default function Pillars({ data }: { data: SiteContent["pillars"] }) {
  if (data.items.length === 0) return null;

  return (
    <section className="pl">
      <style>{pillarsStyles}</style>

      <div className="pl-head">
        {data.eyebrow && (
          <span className="pl-eyebrow">
            <span className="pl-tri" />
            {data.eyebrow}
          </span>
        )}
        <h2 className="pl-title">{data.title}</h2>
      </div>

      <div className="pl-split">
        <div className="pl-visual" aria-hidden="true">
          <StackGraphic />
        </div>

        <div>
          {data.items.map((it) => (
            <article key={it.id} className="pl-item">
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
          ))}

          {data.ctaLabel && data.ctaHref && (
            <Link href={data.ctaHref} className="pl-cta">
              {data.ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
