"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { SiteContent } from "@/lib/site-content";
import { pillarsStyles } from "./pillarsStyles";

/**
 * بخش «پشتوانه» — بعد از نمایشگر روی صفحه‌ی اصلی.
 *
 * روایت با اسکرول: سه بلوک ایزومتریک ابتدا روی هم فشرده‌اند، بعد از هم
 * جدا می‌شوند و از هرکدام یک خط راهنما به ستون توضیح خودش کشیده می‌شود.
 * همان زبان بصری نمای انفجاری بالای صفحه، ولی عمودی.
 *
 * تصویر یک SVG درون‌خطی است نه فایل: چند کیلوبایت وزن دارد، در هر دو تم
 * درست کار می‌کند، و روی اینترنت کند بار اضافه نمی‌گذارد.
 *
 * محتوا از پنل مدیریت می‌آید (`/admin/content`).
 */

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

/** فام هر لایه — هم‌راستا با رنگ قطعات در نمای انفجاری */
const HUES = [193, 233, 280];

type LayerGeom = { y: number; w: number; t: number; hue: number };

const VIEW = 320;
const CX = 160;

/**
 * هندسه‌ی لایه‌ها در یک میزان بازشدگی مشخص.
 *
 * تابع خالص است تا هم رندر و هم محاسبه‌ی خطوط راهنما از یک منبع واحد
 * تغذیه شوند — بدون نوشتن روی ref حین رندر.
 *
 * @param open ۰ = کاملاً فشرده، ۱ = کاملاً باز
 * @param count تعداد ستون‌های محتوا (حداکثر سه لایه)
 */
function layersAt(open: number, count: number): LayerGeom[] {
  const n = Math.min(3, Math.max(1, count));
  /* بازه طوری انتخاب شده که در حالت کاملاً باز، بالای پهن‌ترین لایه
     (y − w/2 = 118 − 50 = 68) زیر هسته بماند و همپوشانی نکند. */
  const SPREAD = 42;
  return Array.from({ length: n }, (_, i) => {
    const from = 158 + i * 12; // فشرده
    const to = 132 + i * SPREAD; // باز
    return {
      y: from + (to - from) * open,
      w: 100 - i * 24,
      t: 20 - i * 2,
      hue: HUES[i] ?? HUES[HUES.length - 1],
    };
  });
}

/** نقطه‌ی اتصال خط راهنما روی لبه‌ی راست هر بلوک */
const anchorOf = (l: LayerGeom) => ({ x: CX + l.w, y: l.y + l.t * 0.5 });

function StackGraphic({ open, count }: { open: number; count: number }) {
  const layers = layersAt(open, count);
  const n = layers.length;

  const block = (l: LayerGeom, i: number) => {
    const h = l.w * 0.5; // نسبت ایزومتریک ۲:۱
    const { y, w, t, hue } = l;
    const top = `${CX},${y - h} ${CX + w},${y} ${CX},${y + h} ${CX - w},${y}`;
    const left = `${CX - w},${y} ${CX},${y + h} ${CX},${y + h + t} ${CX - w},${y + t}`;
    const right = `${CX + w},${y} ${CX},${y + h} ${CX},${y + h + t} ${CX + w},${y + t}`;

    /* لایه‌ها با تأخیر پله‌ای ظاهر می‌شوند تا حس «باز شدن» بدهند */
    const appear = clamp01((open - i * 0.12) / 0.5);

    return (
      <g key={`b${i}`} style={{ opacity: 0.35 + 0.65 * appear }}>
        <polygon points={top} fill={`hsl(${hue} 72% 62%)`} fillOpacity=".92" />
        <polygon points={left} fill={`hsl(${hue} 68% 44%)`} fillOpacity=".92" />
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

  const coreY = 48;
  const topLayer = layers[0];

  return (
    <svg viewBox={`0 0 ${VIEW} ${VIEW}`} role="img" aria-label="لایه‌های داده که پروفایل شغلی را می‌سازند">
      {/* هاله‌ی پشت */}
      <ellipse
        cx={CX}
        cy={layers[n - 1].y + 30}
        rx={104 + 14 * open}
        ry="52"
        fill="var(--accent)"
        fillOpacity=".08"
      />

      {/* از پایین به بالا رسم می‌شود تا لایه‌ی بالایی روی پایینی بیفتد */}
      {[...layers].reverse().map((l, k) => block(l, n - 1 - k))}

      {/* خط اتصال هسته به بالای پشته */}
      <line
        x1={CX}
        y1={coreY + 25}
        x2={CX}
        y2={topLayer.y - topLayer.w * 0.5}
        stroke="hsl(290 66% 66%)"
        strokeOpacity={0.2 + 0.35 * open}
        strokeWidth="1.6"
        strokeDasharray="3 4"
      />

      {/* هسته — نتیجه */}
      <g style={{ opacity: 0.5 + 0.5 * clamp01((open - 0.4) / 0.4) }}>
        <circle cx={CX} cy={coreY} r="25" fill="var(--background-deep)" />
        <circle
          cx={CX}
          cy={coreY}
          r="25"
          fill="hsl(308 66% 62%)"
          fillOpacity=".2"
          stroke="hsl(308 70% 68%)"
          strokeWidth="1.6"
        />
        <circle cx={CX} cy={coreY} r={5 + 2 * open} fill="hsl(308 70% 70%)" />
      </g>
    </svg>
  );
}

export default function Pillars({ data }: { data: SiteContent["pillars"] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLElement | null)[]>([]);

  const [open, setOpen] = useState(0);
  /* خطوط راهنما در مختصات پیکسلی ظرف رسم می‌شوند، نه داخل SVG، چون باید
     از تصویر تا ستون متن — دو المان جدا — کشیده شوند. */
  const [leaders, setLeaders] = useState<
    { x1: number; y1: number; x2: number; y2: number; hue: number }[]
  >([]);

  const itemCount = data.items.length;

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = requestAnimationFrame(() => setOpen(1));
      return () => cancelAnimationFrame(id);
    }

    let ticking = false;

    const update = () => {
      ticking = false;
      const r = wrap.getBoundingClientRect();
      const vh = window.innerHeight;

      /* باز شدن از وقتی بالای بخش وارد نیمه‌ی پایینی پنجره می‌شود
         تا وقتی مرکزش به وسط پنجره می‌رسد. */
      const start = vh * 0.85;
      const distance = Math.max(1, Math.min(r.height * 0.7, vh * 0.62));
      const openNow = easeOut(clamp01((start - r.top) / distance));
      setOpen(openNow);

      // خطوط راهنما فقط وقتی دو ستون کنار هم‌اند معنا دارند
      const visual = visualRef.current;
      if (!visual || window.innerWidth <= 880) {
        setLeaders([]);
        return;
      }

      const wrapBox = wrap.getBoundingClientRect();
      const vBox = visual.getBoundingClientRect();
      const scale = vBox.width / 320; // viewBox تصویر ۳۲۰ واحد است

      const next: typeof leaders = [];
      layersAt(openNow, itemCount).forEach((layer, i) => {
        const a = anchorOf(layer);
        const el = itemsRef.current[i];
        if (!el) return;
        const b = el.getBoundingClientRect();

        next.push({
          // مختصات SVG → مختصات ظرف
          x1: vBox.left - wrapBox.left + a.x * scale,
          y1: vBox.top - wrapBox.top + a.y * scale,
          // در RTL ستون متن سمت چپ تصویر است، پس به لبه‌ی راستش وصل می‌شویم
          x2: b.right - wrapBox.left,
          y2: b.top - wrapBox.top + 18,
          hue: HUES[i] ?? HUES[HUES.length - 1],
        });
      });
      setLeaders(next);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    /* اولین محاسبه در فریم بعد انجام می‌شود تا setState همگام با اجرای
       افکت نباشد (باعث رندر آبشاری می‌شود). */
    const first = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    /* چیدمان بعد از بارگذاری فونت جابه‌جا می‌شود؛ بدون این، خطوط
       راهنما به موقعیت قدیمی ستون‌ها وصل می‌مانند. */
    const ro = new ResizeObserver(onScroll);
    ro.observe(wrap);

    return () => {
      cancelAnimationFrame(first);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      ro.disconnect();
    };
  }, [itemCount]);

  if (data.items.length === 0) return null;

  /* خطوط با تأخیر پله‌ای کشیده می‌شوند، بعد از اینکه بلوک‌ها جا افتادند */
  const lineReveal = (i: number) => clamp01((open - 0.45 - i * 0.1) / 0.35);

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

      <div className="pl-split" ref={wrapRef}>
        {/* لایه‌ی خطوط راهنما — روی هر دو ستون کشیده می‌شود */}
        <svg className="pl-leaders" aria-hidden="true">
          {leaders.map((l, i) => {
            const t = lineReveal(i);
            if (t <= 0.001) return null;
            /* مسیر پله‌ای: افقی از بلوک، بعد عمودی، بعد افقی تا ستون.
               خط مستقیم مورب روی متن می‌افتاد و شلوغ می‌شد. */
            const midX = l.x1 + (l.x2 - l.x1) * 0.52;
            const d = `M${l.x1} ${l.y1} L${midX} ${l.y1} L${midX} ${l.y2} L${l.x2} ${l.y2}`;
            const len = Math.abs(midX - l.x1) + Math.abs(l.y2 - l.y1) + Math.abs(l.x2 - midX);
            return (
              <g key={i}>
                <path
                  d={d}
                  fill="none"
                  stroke={`hsl(${l.hue} 70% 62%)`}
                  strokeOpacity=".5"
                  strokeWidth="1.3"
                  strokeDasharray={len}
                  strokeDashoffset={len * (1 - t)}
                />
                <circle
                  cx={l.x1}
                  cy={l.y1}
                  r="3"
                  fill={`hsl(${l.hue} 70% 62%)`}
                  opacity={t}
                />
              </g>
            );
          })}
        </svg>

        <div className="pl-visual" ref={visualRef} aria-hidden="true">
          <StackGraphic open={open} count={data.items.length} />
        </div>

        <div className="pl-list">
          {data.items.map((it, i) => {
            const shown = open > 0.28 + i * 0.12;
            return (
              <article
                key={it.id}
                className={`pl-item ${shown ? "on" : ""}`}
                ref={(el) => {
                  itemsRef.current[i] = el;
                }}
                style={{ ["--pl-hue" as string]: `hsl(${HUES[i] ?? HUES[2]} 70% 62%)` }}
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
            <Link href={data.ctaHref} className="pl-cta">
              {data.ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
