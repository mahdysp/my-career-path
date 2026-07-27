"use client"; 

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/app/components/ThemeToggle";
import ExplodedProfile from "@/app/components/ExplodedProfile";
import ScreenShowcase from "@/app/components/ScreenShowcase";

/* مسیر عمودی که بین گام‌ها می‌پیچد. عمداً کاملاً صاف نیست تا حس
   خط کشیده‌شده با دست بدهد نه یک خط برداری بی‌روح. */
const JOURNEY_PATH =
  "M30 8 C 44 62, 16 96, 30 148 S 48 214, 30 266 S 12 330, 30 382 S 46 448, 29 512";
const JOURNEY_LEN = 516;

export default function CareerHub() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // پیشرفت رسم مسیر «سه گام» (۰ تا ۱) و گام فعال
  const stepsRef = useRef<HTMLDivElement | null>(null);
  const [pathProgress, setPathProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
    router.prefetch("/quiz");

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [router]);

  /* رسم تدریجی مسیر هنگام عبور بخش «سه گام» از دید.
     از موقعیت خود بخش نسبت به پنجره استفاده می‌شود تا مسیر دقیقاً همراه
     حرکت انگشت/اسکرول کشیده شود، نه با یک انیمیشن زمان‌بندی‌شده. */
  useEffect(() => {
    const el = stepsRef.current;
    if (!el) return;

    let ticking = false;
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;

      /* مسیر از لحظه‌ای شروع می‌شود که بالای بخش وارد ۸۰٪ ارتفاع پنجره شود،
         و وقتی کامل است که پایین بخش به ۴۵٪ پنجره برسد. فاصله‌ی بین این دو
         حالت، «مسافت اسکرول» است؛ باید ارتفاع خود بخش را هم شامل شود وگرنه
         مسیر خیلی زودتر از دیده‌شدن گام آخر تمام می‌شود. */
      /* مسافت بر پایه‌ی «چقدر از بخش دیده شده» حساب می‌شود، نه موقعیت مطلق.
         قبلاً اگر بعد از این بخش فضای اسکرول کافی نبود (اینجا فقط یک دکمه و
         فوتر هست)، پیشرفت هرگز به ۱۰۰٪ نمی‌رسید و گام سوم فعال نمی‌شد. */
      const startAt = vh * 0.92;
      const distance = Math.max(1, Math.min(r.height, vh * 0.6));
      const travelled = startAt - r.top;

      setPathProgress(Math.max(0, Math.min(1, travelled / distance)));
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const handleStart = () => {
    setIsLoading(true);
    setTimeout(() => router.push("/quiz"), 400);
  };

  const handleSpotlight = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }, []);

  const heroOpacity = Math.max(1 - scrollY / 480, 0);
  const heroScale = Math.max(1 - scrollY / 4000, 0.94);
  const heroTranslate = Math.min(scrollY * 0.18, 90);

  const steps = [
    { num: "01", title: "پاسخ به سؤالات کوتاه", desc: "چند سؤال ساده درباره‌ی علایق، مهارت‌ها و اهدافتان." },
    { num: "02", title: "تحلیل پاسخ‌ها", desc: "سیستم پاسخ‌های شما را در چند ثانیه تحلیل می‌کند." },
    { num: "03", title: "دریافت نقشه راه", desc: "مسیرهای شغلی پیشنهادی به‌همراه برنامه یادگیری را می‌بینید." },
  ];

  return (
    <>
      <style>{`
        @keyframes k2Float1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(20px, -30px) rotate(2deg); }
        }
        @keyframes k2Float2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-24px, 20px) rotate(-2deg); }
        }
        @keyframes k2Float3 {
          0%, 100% { transform: translate(0, 0); opacity: 0.5; }
          50% { transform: translate(10px, -14px); opacity: 0.8; }
        }
        @keyframes k2FadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .k2-fade-1 { animation: k2FadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.05s; }
        .k2-fade-2 { animation: k2FadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.14s; }
        .k2-fade-3 { animation: k2FadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.23s; }
        .k2-fade-4 { animation: k2FadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.32s; }

        .k2-nav-link {
          font-family: var(--font-sans);
          font-size: 14px;
          color: var(--foreground-muted);
          text-decoration: none;
          padding: 8px 14px;
          border-radius: 8px;
          transition: color 0.2s ease, background 0.2s ease;
        }
        .k2-nav-link:hover { color: var(--foreground); background: var(--surface); }

        .k2-btn {
          font-family: var(--font-sans);
          font-weight: 500;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s ease, background 0.2s ease;
        }
        .k2-btn:active:not(:disabled) { transform: scale(0.98); }
        .k2-btn:disabled { cursor: wait; opacity: 0.7; }

        .k2-btn-primary {
          background: var(--accent);
          color: #fff;
          border-radius: 8px;
          box-shadow:
            0 0 0 1px rgba(94,106,210,0.5),
            0 4px 12px rgba(94,106,210,0.3),
            inset 0 1px 0 0 rgba(255,255,255,0.2);
        }
        .k2-btn-primary:hover:not(:disabled) {
          background: var(--accent-bright);
          box-shadow:
            0 0 0 1px rgba(94,106,210,0.7),
            0 6px 24px rgba(94,106,210,0.45),
            inset 0 1px 0 0 rgba(255,255,255,0.25);
          transform: translateY(-2px);
        }

        .k2-btn-secondary {
          background: var(--surface);
          color: var(--foreground);
          border-radius: 8px;
          box-shadow: inset 0 0 0 1px var(--border-default);
        }
        .k2-btn-secondary:hover { background: var(--surface-hover); box-shadow: inset 0 0 0 1px var(--border-hover); }

        .k2-btn-ghost {
          background: transparent;
          color: var(--foreground-muted);
          border-radius: 8px;
        }
        .k2-btn-ghost:hover { background: var(--surface); color: var(--foreground); }

        .k2-grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(to right, var(--grid-line) 1px, transparent 1px),
            linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px);
          background-size: 64px 64px;
          pointer-events: none;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%);
        }

        .k2-noise {
          position: fixed;
          inset: 0;
          opacity: var(--noise-opacity);
          pointer-events: none;
          z-index: 1;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        .k2-gradient-text {
          background: var(--heading-gradient);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .k2-card {
          position: relative;
          background: var(--card-gradient);
          border: 1px solid var(--border-default);
          border-radius: 16px;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.03),
            0 2px 20px rgba(0,0,0,0.4),
            0 0 40px rgba(0,0,0,0.15);
          transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease, border-color 0.25s ease;
        }
        /* بالا پریدن فقط روی دستگاه‌های دارای اشاره‌گر واقعی.
           روی لمسی، :hover بعد از تپ می‌چسبد و کارت روی کارت بعدی می‌افتد. */
        @media (hover: hover) and (pointer: fine) {
          .k2-card:hover {
            transform: translateY(-6px);
            border-color: var(--border-hover);
            box-shadow:
              0 0 0 1px rgba(255,255,255,0.08),
              0 12px 40px rgba(0,0,0,0.5),
              0 0 60px var(--blob-3);
          }
        }
        .k2-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(300px circle at var(--mx, 50%) var(--my, 50%), rgba(94,106,210,0.16), transparent 60%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        @media (hover: hover) and (pointer: fine) {
          .k2-card:hover::before { opacity: 1; }
        }

        .k2-icon-box {
          width: 44px; height: 44px;
          border-radius: 12px;
          border: 1px solid var(--border-hover);
          background: var(--surface);
          display: flex; align-items: center; justify-content: center;
          color: var(--accent);
          flex-shrink: 0;
        }

        /* ── مسیر سه‌گام ── */
        .k2-journey {
          position: relative;
          padding-right: 62px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .k2-journey-line {
          position: absolute;
          top: 4px;
          right: 8px;
          width: 46px;
          height: 100%;
          pointer-events: none;
          overflow: visible;
        }

        .k2-journey-step {
          position: relative;
          opacity: 0;
          transform: translateY(16px);
          transition:
            opacity .5s cubic-bezier(.16,1,.3,1),
            transform .55s cubic-bezier(.16,1,.3,1);
        }
        .k2-journey-step.on {
          opacity: 1;
          transform: translateY(0);
        }

        /* نقطه‌ی روی مسیر */
        .k2-journey-dot {
          position: absolute;
          top: 26px;
          right: -40px;
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: var(--background-base);
          border: 2px solid var(--border-hover);
          transition: all .35s cubic-bezier(.16,1,.3,1);
        }
        .k2-journey-step.on .k2-journey-dot {
          background: var(--accent);
          border-color: var(--accent);
          box-shadow: 0 0 0 4px var(--background-base), 0 0 14px var(--accent-glow);
          transform: scale(1.15);
        }

        .k2-journey-card {
          display: flex;
          align-items: flex-start;
          gap: 18px;
          padding: 20px 22px;
          border-radius: 14px;
          background: var(--card-gradient);
          border: 1px solid var(--border-default);
          box-shadow: var(--card-shadow);
          transition: border-color .3s ease, box-shadow .3s ease, transform .3s ease;
        }
        .k2-journey-step.on .k2-journey-card {
          border-color: var(--border-hover);
        }
        /* با هاور، کارت صاف می‌شود — انگار دست رویش گذاشته‌اید */
        .k2-journey-step:hover { transform: translateY(-2px); }
        .k2-journey-step:hover .k2-journey-card {
          box-shadow: var(--card-shadow-hover);
        }

        .k2-journey-num {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--foreground-subtle);
          padding-top: 3px;
          min-width: 22px;
          transition: color .3s ease;
        }
        .k2-journey-step.on .k2-journey-num { color: var(--accent); }
        .k2-journey-title {
          font-weight: 700;
          font-size: 15.5px;
          color: var(--foreground);
          margin-bottom: 5px;
        }
        .k2-journey-desc {
          font-size: 13px;
          line-height: 1.9;
          color: var(--foreground-muted);
        }

        @media (max-width: 560px) {
          .k2-journey { padding-right: 42px; }
          .k2-journey-line { width: 32px; right: 4px; }
          .k2-journey-dot { right: -28px; top: 24px; }
          .k2-journey-card { padding: 17px 16px; gap: 13px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .k2-journey-step { opacity: 1; transform: none; transition: none; }
        }

        /* هیرو دقیقاً یک صفحه است؛ ویژگی‌ها بعد از اسکرول شروع می‌شوند */
        .k2-hero {
          position: relative;
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          padding: 0 clamp(16px, 4vw, 40px);
          text-align: center;
          min-height: calc(100svh - 64px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }


        /* ── نمای انفجاری پروفایل ── */
        /* بخش بلند است تا اسکرول جا برای روایت داشته باشد؛ محتوا داخلش
           چسبان می‌ماند. ارتفاع اضافی = طول نوار پیشرفت روایت. */
        .k2-exp {
          color: var(--foreground-muted);
          height: 215vh;
          position: relative;
        }
        .k2-exp-sticky {
          position: sticky;
          top: 0;
          height: 100svh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: clamp(10px, 2vh, 26px);
          max-width: 1080px;
          margin: 0 auto;
          padding: clamp(16px, 3vh, 36px) clamp(16px, 4vw, 40px);
          text-align: center;
        }
        .k2-exp-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: var(--font-mono); font-size: 11px;
          letter-spacing: .18em; color: var(--accent);
        }
        .k2-exp-tri {
          width: 0; height: 0;
          border-left: 4.5px solid transparent;
          border-right: 4.5px solid transparent;
          border-bottom: 7px solid var(--accent);
        }
        .k2-exp-title {
          font-weight: 700; font-size: clamp(28px, 4.4vw, 44px);
          letter-spacing: -.025em; color: var(--foreground);
          margin: 14px 0 0; line-height: 1.25;
        }
        .k2-exp-sub {
          font-size: 15px; line-height: 1.95; color: var(--foreground-muted);
          max-width: 560px; margin: 16px auto 0;
        }

        /* صحنه فضای باقی‌مانده را می‌گیرد و بوم داخلش نسبتش را حفظ
           می‌کند، پس روی نمایشگرهای کوتاه هم توضیحات از قاب بیرون نمی‌زند. */
        .k2-exp-stage {
          position: relative;
          flex: 1 1 auto;
          min-height: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }
        /* ابعاد را جاوااسکریپت ست می‌کند (متناسب با عرض و ارتفاع موجود) */
        .k2-exp-canvas { display: block; margin: 0 auto; }

        /* ستون‌ها با ترتیب LTR چیده می‌شوند تا با ترتیب قطعات روی محور
           (چپ به راست) هم‌راستا بمانند؛ متن هر ستون خودش RTL است. */
        .k2-exp-legend {
          display: grid; grid-template-columns: repeat(6, 1fr);
          margin: -4px auto 0;
          flex: 0 0 auto;
          text-align: right;
        }
        .k2-exp-item {
          padding: 0 clamp(6px, 1vw, 12px);
          opacity: 0; transform: translateY(8px);
          transition: opacity .5s ease, transform .55s cubic-bezier(.16,1,.3,1);
        }
        .k2-exp-item.on { opacity: 1; transform: translateY(0); }
        .k2-exp-num {
          display: block;
          font-family: var(--font-mono); font-size: 10.5px;
          letter-spacing: .08em;
          color: var(--exp-hue);
        }
        /* فام‌ها دقیقاً همان HUES در explodedGeometry.ts است */
        .k2-exp-num[data-axis="R"] { --exp-hue: hsl(193 78% 62%); }
        .k2-exp-num[data-axis="I"] { --exp-hue: hsl(213 78% 66%); }
        .k2-exp-num[data-axis="A"] { --exp-hue: hsl(233 78% 72%); }
        .k2-exp-num[data-axis="S"] { --exp-hue: hsl(256 72% 74%); }
        .k2-exp-num[data-axis="E"] { --exp-hue: hsl(280 68% 74%); }
        .k2-exp-num[data-axis="C"] { --exp-hue: hsl(308 66% 72%); }
        :root[data-theme="light"] .k2-exp-num[data-axis="R"] { --exp-hue: hsl(193 72% 32%); }
        :root[data-theme="light"] .k2-exp-num[data-axis="I"] { --exp-hue: hsl(213 68% 42%); }
        :root[data-theme="light"] .k2-exp-num[data-axis="A"] { --exp-hue: hsl(233 64% 50%); }
        :root[data-theme="light"] .k2-exp-num[data-axis="S"] { --exp-hue: hsl(256 58% 52%); }
        :root[data-theme="light"] .k2-exp-num[data-axis="E"] { --exp-hue: hsl(280 54% 48%); }
        :root[data-theme="light"] .k2-exp-num[data-axis="C"] { --exp-hue: hsl(308 56% 44%); }

        .k2-exp-name {
          font-weight: 700; font-size: 13.5px; color: var(--foreground);
          margin-top: 5px;
        }
        .k2-exp-hint {
          font-size: 11.5px; line-height: 1.7;
          color: var(--foreground-subtle); margin-top: 5px;
        }

        @media (max-width: 720px) {
          .k2-exp { height: 240vh; }
          .k2-exp-hint { display: none; }
          .k2-exp-name { font-size: 12px; }
          .k2-exp-item { padding: 0 4px; }
        }
        @media (max-width: 440px) {
          .k2-exp-name { font-size: 10.5px; letter-spacing: -.01em; }
          .k2-exp-num { font-size: 9px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .k2-exp-item { opacity: 1; transform: none; }
        }

        /* ── نمایشگر: قاب دستگاه با محتوای دلخواه ── */
        .k2-screen {
          position: relative;
          max-width: 1280px;
          margin: 0 auto;
          padding: clamp(8px, 2vw, 28px) clamp(16px, 4vw, 40px)
            clamp(72px, 10vw, 130px);
          display: grid;
          grid-template-columns: minmax(280px, 0.78fr) minmax(0, 1.22fr);
          gap: clamp(28px, 5vw, 72px);
          align-items: center;
        }
        .k2-screen-copy { text-align: right; }
        .k2-screen-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: var(--font-mono); font-size: 11px;
          letter-spacing: .18em; color: var(--accent);
        }
        .k2-screen-title {
          font-weight: 700; font-size: clamp(30px, 4.6vw, 48px);
          letter-spacing: -.03em; color: var(--foreground);
          margin: 14px 0 0; line-height: 1.2;
        }
        .k2-screen-sub {
          font-size: 15px; line-height: 2; color: var(--foreground-muted);
          margin: 18px 0 0; max-width: 40ch;
        }
        .k2-screen-dots {
          display: flex; gap: 7px; margin-top: 26px;
          justify-content: flex-start;
        }
        .k2-screen-dot {
          width: 7px; height: 7px; border-radius: 100px;
          background: var(--border-hover);
          border: 0; padding: 0; cursor: pointer;
          transition: width .35s cubic-bezier(.16,1,.3,1), background .3s ease;
        }
        .k2-screen-dot.on { width: 26px; background: var(--accent); }

        /* قاب دستگاه: از لبه‌ی راست بیرون می‌زند، مثل مرجع طراحی */
        .k2-device { position: relative; }
        /* بدنه‌ی دستگاه از خود پس‌زمینه رنگ نمی‌گیرد؛ در تم روشن باید
           تیره‌تر از کاغذ باشد وگرنه حاشیه‌اش گم می‌شود. */
        .k2-device-frame {
          position: relative;
          border-radius: 15px;
          padding: 11px 11px 0;
          background: var(--device-body);
          border: 1px solid var(--device-edge);
          box-shadow:
            inset 0 1px 0 var(--device-sheen),
            0 40px 90px -34px var(--device-shadow),
            0 10px 26px -12px var(--device-shadow);
        }
        .k2-device-bar {
          display: flex; align-items: center; gap: 8px;
          padding: 0 4px 10px;
        }
        .k2-device-lights { display: flex; gap: 5px; }
        .k2-device-lights i {
          width: 8px; height: 8px; border-radius: 100px;
          background: var(--device-dot); display: block;
        }
        .k2-device-label {
          font-family: var(--font-mono); font-size: 10.5px;
          color: var(--device-label); letter-spacing: .04em;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .k2-device-viewport {
          position: relative;
          aspect-ratio: 16 / 10;
          border-radius: 8px 8px 0 0;
          overflow: hidden;
          background: var(--background-deep);
        }
        .k2-device-slide {
          position: absolute; inset: 0;
          opacity: 0;
          transform: scale(1.03);
          transition: opacity .7s ease, transform 1.1s cubic-bezier(.16,1,.3,1);
        }
        .k2-device-slide.on { opacity: 1; transform: scale(1); }
        .k2-device-slide img,
        .k2-device-slide video {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
        }
        /* جای‌گیر تا وقتی تصویری گذاشته نشده قاب خالی نماند */
        .k2-device-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background:
            radial-gradient(120% 90% at 30% 0%, var(--blob-1), transparent 62%),
            radial-gradient(100% 80% at 90% 100%, var(--blob-2), transparent 60%),
            var(--background-deep);
        }
        .k2-device-placeholder span {
          font-family: var(--font-mono); font-size: 11px;
          letter-spacing: .12em; color: var(--foreground-subtle);
        }
        /* پایه‌ی نمایشگر */
        .k2-device-stand {
          width: clamp(90px, 16%, 170px);
          height: clamp(30px, 4.4vw, 50px);
          margin: 0 auto;
          background: var(--device-stand);
          border-inline: 1px solid var(--device-edge);
        }
        .k2-device-base {
          width: clamp(160px, 30%, 300px);
          height: 8px; margin: 0 auto;
          border-radius: 100px;
          background: var(--device-body);
          border: 1px solid var(--device-edge);
          box-shadow: 0 14px 28px -14px var(--device-shadow);
        }

        @media (max-width: 900px) {
          .k2-screen {
            grid-template-columns: 1fr;
            gap: clamp(28px, 6vw, 44px);
          }
          .k2-screen-copy { text-align: center; }
          .k2-screen-sub { margin-inline: auto; }
          .k2-screen-dots { justify-content: center; }
        }

        .k2-mobile-actions { display: none; gap: 8px; align-items: center; }

        .k2-mobile-menu {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height 0.3s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease;
        }
        .k2-mobile-menu.open { max-height: 70vh; opacity: 1; overflow-y: auto; }

        .k2-bento {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 20px;
        }

        @media (max-width: 860px) {
          .k2-nav-links { display: none !important; }
          .k2-hero-title { font-size: 42px !important; }
          .k2-hero-sub { font-size: 15px !important; }
          .k2-stats-row { gap: 28px !important; flex-wrap: wrap; }
          .k2-mobile-actions { display: flex !important; }
          .k2-desktop-actions { display: none !important; }
          .k2-bento {
            grid-template-columns: 1fr !important;
          }
          .k2-bento > * {
            grid-column: 1 !important;
            grid-row: auto !important;
          }
        }

        @media (max-width: 430px) {
          .k2-hero-title { font-size: 33px !important; line-height: 1.3 !important; }
          .k2-card { padding: 22px 18px !important; }
        }

        @media (max-width: 360px) {
          .k2-hero-title { font-size: 29px !important; }
        }
      `}</style>

      <main
        dir="rtl"
        style={{
          position: "relative",
          minHeight: "100vh",
          width: "100%",
          background:
            "var(--page-gradient)",
          fontFamily: "var(--font-sans)",
          overflow: "hidden",
        }}
      >
        {/* Ambient blobs */}
        <div
          style={{
            position: "absolute", top: "-200px", left: "50%", transform: "translateX(-50%)",
            width: 1100, height: 700, borderRadius: "50%",
            background: "radial-gradient(circle, var(--blob-1), transparent 70%)",
            filter: "blur(140px)", pointerEvents: "none", animation: "k2Float1 9s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute", top: "20%", left: "-200px",
            width: 600, height: 800, borderRadius: "50%",
            background: "radial-gradient(circle, var(--blob-2), transparent 70%)",
            filter: "blur(120px)", pointerEvents: "none", animation: "k2Float2 10s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute", top: "35%", right: "-160px",
            width: 500, height: 700, borderRadius: "50%",
            background: "radial-gradient(circle, var(--blob-3), transparent 70%)",
            filter: "blur(100px)", pointerEvents: "none", animation: "k2Float3 8s ease-in-out infinite",
          }}
        />
        <div className="k2-grid-overlay" />
        <div className="k2-noise" />

        <div style={{ position: "relative", zIndex: 10 }}>
          {/* Nav */}
          <nav
            style={{
              position: "sticky", top: 0, zIndex: 50,
              display: "flex", flexDirection: "column", justifyContent: "center",
              padding: "0 clamp(16px, 4vw, 40px)",
              background: "var(--nav-bg)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderBottom: "1px solid var(--border-default)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
              <span style={{ fontWeight: 700, fontSize: 19, letterSpacing: "-0.02em", color: "var(--foreground)" }}>
                Karex
              </span>

              <div className="k2-nav-links" style={{ display: "flex", gap: 4 }}>
                <a href="#features" className="k2-nav-link">ویژگی‌ها</a>
                <a href="#how-it-works" className="k2-nav-link">روش کار</a>
              </div>

              <div className="k2-desktop-actions" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <ThemeToggle />
                <button className="k2-btn k2-btn-ghost" onClick={() => router.push("/auth")} style={{ fontSize: 14, padding: "9px 16px" }}>
                  ورود
                </button>
                <button className="k2-btn k2-btn-primary" onClick={() => router.push("/register")} style={{ fontSize: 14, padding: "9px 18px", height: 38 }}>
                  ثبت‌نام
                </button>
              </div>

              <div className="k2-mobile-actions">
                <ThemeToggle />
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-expanded={menuOpen}
                  aria-controls="k2-main-menu"
                  aria-label={menuOpen ? "بستن منو" : "باز کردن منو"}
                  style={{
                    width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                    background: "var(--surface)", border: "1px solid var(--border-default)",
                    borderRadius: 8, color: "var(--foreground)", cursor: "pointer",
                  }}
                >
                  {menuOpen ? "✕" : "☰"}
                </button>
              </div>
            </div>

            <div id="k2-main-menu" className={`k2-mobile-menu ${menuOpen ? "open" : ""}`}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "12px 0 20px" }}>
                <a href="#features" className="k2-nav-link" onClick={() => setMenuOpen(false)}>ویژگی‌ها</a>
                <a href="#how-it-works" className="k2-nav-link" onClick={() => setMenuOpen(false)}>روش کار</a>
                <button className="k2-btn k2-btn-secondary" onClick={() => router.push("/auth")} style={{ fontSize: 14, padding: "10px", marginTop: 8 }}>ورود</button>
                <button className="k2-btn k2-btn-primary" onClick={() => router.push("/register")} style={{ fontSize: 14, padding: "10px" }}>ثبت‌نام رایگان</button>
              </div>
            </div>
          </nav>

          {/* Hero */}
          <section
            className="k2-hero"
            style={{
              opacity: mounted ? heroOpacity : 1,
              transform: mounted ? `translateY(${heroTranslate}px) scale(${heroScale})` : "none",
              transition: "opacity 0.1s linear",
            }}
          >
            <h1
              className={`k2-hero-title k2-gradient-text ${mounted ? "k2-fade-1" : ""}`}
              style={{
                fontWeight: 700,
                fontSize: "clamp(42px, 6.5vw, 76px)",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                margin: "0 auto 20px",
                maxWidth: 820,
              }}
            >
              بدون سردرگمی، نقشه راه آینده شغلی‌تان را بسازید
            </h1>

            <p
              className={`k2-hero-sub ${mounted ? "k2-fade-2" : ""}`}
              style={{
                fontSize: 17, lineHeight: 1.8, color: "var(--foreground-muted)",
                maxWidth: 540, margin: "0 auto 40px",
              }}
            >
              ارزیابی هوشمند علایق و توانمندی‌ها برای ترسیم دقیق‌ترین مسیر شغلی
              از کشف استعداد تا آغاز یادگیری
            </p>

            <div className={mounted ? "k2-fade-3" : ""} style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="k2-btn k2-btn-primary" onClick={handleStart} disabled={isLoading} style={{ fontSize: 15, padding: "0 30px", height: 46 }}>
                {isLoading ? "در حال آماده‌سازی..." : "شروع آزمون"}
              </button>
              <a href="#how-it-works" className="k2-btn k2-btn-secondary" style={{ fontSize: 15, padding: "0 26px", height: 46, textDecoration: "none" }}>
                بیشتر بدانید
              </a>
            </div>

          </section>

          {/* Features — Bento */}
          <section id="features" style={{ maxWidth: 1280, width: "100%", margin: "0 auto", padding: "112px clamp(16px, 4vw, 40px)" }}>
            <div style={{ textAlign: "right", marginBottom: 40 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.1em", color: "var(--accent)" }}>
                ویژگی‌ها
              </span>
              <h2 style={{ fontWeight: 700, fontSize: 34, letterSpacing: "-0.02em", color: "var(--foreground)", marginTop: 8 }}>
                چرا کارکس؟
              </h2>
            </div>

            <div className="k2-bento">
              {/* کارت بزرگ */}
              <div
                className="k2-card"
                onMouseMove={handleSpotlight}
                style={{ gridColumn: "1", gridRow: "1 / span 2", padding: 32, textAlign: "right", display: "flex", flexDirection: "column", gap: 16, justifyContent: "center" }}
              >
                <div className="k2-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M4 19V5m5 14V9m5 10V13m5 6V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 20, color: "var(--foreground)", marginBottom: 12, letterSpacing: "-0.01em" }}>
                    تحلیل شخصیت شغلی مبتنی بر داده
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.9, color: "var(--foreground-muted)", maxWidth: 440 }}>
                    پاسخ‌های شما بر اساس مدل‌های شناخته‌شده‌ی روان‌شناسی شغلی سنجیده می‌شود، نه یک تست حدسی.
                    کارکس الگوهای پنهان علاقه و مهارت شما را شناسایی می‌کند.
                  </p>
                </div>
              </div>

              {/* کارت کوچک ۱ */}
              <div
                className="k2-card"
                onMouseMove={handleSpotlight}
                style={{ gridColumn: "2", gridRow: "1", padding: 28, textAlign: "right", display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div className="k2-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3l2.6 6.2L21 10l-5 4.6L17.4 21 12 17.3 6.6 21 8 14.6 3 10l6.4-.8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 16, color: "var(--foreground)", marginBottom: 8 }}>
                    پیشنهاد مسیر متناسب
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--foreground-muted)" }}>
                    فقط مسیرهایی که با مهارت و علاقه شما هم‌خوانی دارند نشان داده می‌شود.
                  </p>
                </div>
              </div>

              {/* کارت کوچک ۲ */}
              <div
                className="k2-card"
                onMouseMove={handleSpotlight}
                style={{ gridColumn: "2", gridRow: "2", padding: 28, textAlign: "right", display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div className="k2-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M4 6h16M4 12h10M4 18h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 16, color: "var(--foreground)", marginBottom: 8 }}>
                    نقشه راه یادگیری
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--foreground-muted)" }}>
                    گام‌به‌گام مشخص می‌کنیم چه چیزی یاد بگیرید و از کجا شروع کنید.
                  </p>
                </div>
              </div>

              {/* کارت عریض */}
              <div
                className="k2-card"
                onMouseMove={handleSpotlight}
                style={{ gridColumn: "1 / -1", gridRow: "3", padding: 28, textAlign: "right", display: "flex", alignItems: "center", gap: 20 }}
              >
                <div className="k2-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 8v4l3 2M12 3a9 9 0 1 0 9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 16, color: "var(--foreground)", marginBottom: 6 }}>
                    پشتیبانی هوش مصنوعی، هر زمان که نیاز دارید
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--foreground-muted)" }}>
                    سؤال دارید؟ در هر مرحله از مسیر، دستیار هوشمند کارکس همراه شماست و راهنمایی می‌کند.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* How it works */}
          <section id="how-it-works" style={{ maxWidth: 860, width: "100%", margin: "0 auto", padding: "0 clamp(16px, 4vw, 40px) 128px" }}>
            <div style={{ textAlign: "right", marginBottom: 28 }}>
              <h2 style={{ fontWeight: 700, fontSize: 34, letterSpacing: "-0.02em", color: "var(--foreground)", margin: 0 }}>
                سه گام تا مسیر روشن
              </h2>
            </div>

            {/* مسیر دست‌کشیده که همراه اسکرول رسم می‌شود */}
            <div ref={stepsRef} className="k2-journey">
              <svg
                className="k2-journey-line"
                viewBox="0 0 60 520"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {/* رد کم‌رنگ کل مسیر */}
                <path
                  d={JOURNEY_PATH}
                  fill="none"
                  stroke="var(--border-hover)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="1 7"
                />
                {/* بخش کشیده‌شده — ضخامتش عمداً یکنواخت نیست */}
                <path
                  d={JOURNEY_PATH}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeDasharray={JOURNEY_LEN}
                  strokeDashoffset={JOURNEY_LEN * (1 - pathProgress)}
                  style={{ transition: "stroke-dashoffset .12s linear" }}
                />
              </svg>

              {steps.map((st, i) => {
                // هر گام وقتی مسیر به آن می‌رسد فعال می‌شود
                const threshold = (i + 0.55) / steps.length;
                const active = pathProgress >= threshold;
                return (
                  <div
                    key={st.num}
                    className={`k2-journey-step ${active ? "on" : ""}`}
                  >
                    <span className="k2-journey-dot" aria-hidden="true" />
                    <div className="k2-journey-card">
                      <span className="k2-journey-num">{st.num}</span>
                      <div>
                        <div className="k2-journey-title">{st.title}</div>
                        <div className="k2-journey-desc">{st.desc}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign: "center", marginTop: 44 }}>
              <button className="k2-btn k2-btn-primary" onClick={handleStart} disabled={isLoading} style={{ fontSize: 15, padding: "0 30px", height: 46 }}>
                {isLoading ? "در حال آماده‌سازی..." : "شروع آزمون"}
              </button>
            </div>
          </section>

          {/* نمای انفجاری — با اسکرول باز و دوباره جمع می‌شود */}
          <ExplodedProfile />

          {/* نمایشگر — محتوای دلخواه داخل قاب دستگاه */}
          <ScreenShowcase />

          {/* Footer */}
          <footer style={{ borderTop: "1px solid var(--border-default)", padding: "28px clamp(16px, 4vw, 40px)", textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "var(--foreground-subtle)", fontFamily: "var(--font-mono)" }}>
              © Karex — تمامی حقوق محفوظ است
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
