"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RIASEC_AXES } from "@/lib/onet-profiles";
import { buildScene, CX, CY, VIEW_H, VIEW_W } from "./explodedGeometry";

/**
 * نمای انفجاری قطعات پروفایل شغلی.
 *
 * روایت با اسکرول:
 *   ۱. شش قطعه روی یک شفت سرهم‌اند و همه با هم می‌چرخند.
 *   ۲. مجموعه کمی بزرگ می‌شود.
 *   ۳. قطعات در امتداد همان محور از هم جدا می‌شوند و شش بُعد RIASEC آشکار می‌گردد.
 *
 * تفاوت با نسخه‌ی قبلی: قبلاً هر قطعه یک دیسکِ روبه‌رو بود که کنار بقیه چیده
 * شده بود؛ حالا صفحه‌ی هر قطعه عمود بر یک محور مشترک است و چرخش، چرخشِ
 * همان محور است — دقیقاً مثل یک مجموعه‌ی مکانیکی واقعی.
 */

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const phase = (t: number, from: number, to: number) =>
  Math.max(0, Math.min(1, (t - from) / (to - from)));

export default function ExplodedProfile() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  const [spin, setSpin] = useState(0.35);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let ticking = false;
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      setVisible(r.top < vh + 200 && r.bottom > -200);
      const startAt = vh * 0.55;
      const distance = Math.max(1, Math.min(r.height * 0.8, vh * 0.85));
      setP(Math.max(0, Math.min(1, (startAt - r.top) / distance)));
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

  /* چرخش پیوسته‌ی شفت — فقط وقتی بخش در دید است */
  useEffect(() => {
    if (!visible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(80, now - last);
      last = now;
      setSpin((s) => s + dt * 0.00042);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  const zoomT = easeInOut(phase(p, 0, 0.26));
  const openT = easeInOut(phase(p, 0.22, 0.94));

  /* سرهم که هست کوچک‌تر دیده می‌شود، پس اول بزرگ‌نمایی می‌کنیم و
     هرچه باز می‌شود مقیاس را برمی‌گردانیم تا از قاب بیرون نزند. */
  const scale = 1.34 + 0.1 * zoomT - 0.44 * openT;

  const scene = useMemo(() => buildScene(spin, openT), [spin, openT]);
  const opened = openT > 0.9;

  return (
    <div ref={wrapRef} className="k2-exp">
      <div className="k2-exp-head">
        <span className="k2-exp-eyebrow">
          <span className="k2-exp-tri" />
          پروفایل شغلی
        </span>
        <h2 className="k2-exp-title">شش قطعه، یک تصویر کامل</h2>
        <p className="k2-exp-sub">
          شخصیت شغلی شما از شش بُعد ساخته شده است. آزمون Karex این قطعات را
          کنار هم می‌گذارد تا ببینید کدام مسیر واقعاً به شما می‌آید.
        </p>
      </div>

      <div className="k2-exp-stage">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="k2-exp-svg"
          role="img"
          aria-label="نمای انفجاری شش بُعد شخصیت شغلی روی یک محور"
        >
          <g
            style={{
              transform: `translate(${CX}px, ${CY}px) scale(${scale.toFixed(
                3
              )}) translate(${-CX}px, ${-CY}px)`,
              transformOrigin: "0 0",
            }}
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          >
            <path d={scene.far} opacity={0.2} strokeWidth={0.7} />
            <path d={scene.mid} opacity={0.55} strokeWidth={0.85} />
            <path d={scene.near} opacity={0.95} strokeWidth={1.1} />
          </g>
        </svg>

        <div className={`k2-exp-badge ${opened ? "on" : ""}`}>
          <span>شش بُعد شخصیت شغلی</span>
        </div>
      </div>

      <div className="k2-exp-legend">
        {RIASEC_AXES.map((ax, i) => {
          const shown = openT > 0.1 + i * 0.1;
          return (
            <div key={ax.key} className={`k2-exp-item ${shown ? "on" : ""}`}>
              <span className="k2-exp-num">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <div className="k2-exp-name">{ax.label}</div>
                <div className="k2-exp-hint">{ax.hint}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
