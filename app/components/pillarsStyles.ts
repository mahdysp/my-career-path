/**
 * استایل بخش «پشتوانه» روی صفحه‌ی اصلی.
 *
 * بخش چسبان است — مثل نمای انفجاری. تا وقتی شبکه شکل نگرفته و ستون‌ها
 * خوانده نشده‌اند، صحنه در پنجره قفل می‌ماند.
 */
export const pillarsStyles = `
  /* ظرف بلند = طول نوار پیشرفت روایت */
  .pl-wrap {
    position: relative;
    height: 230vh;
  }

  .pl {
    position: sticky;
    top: 0;
    height: 100svh;
    max-width: 1240px;
    margin: 0 auto;
    padding: clamp(16px, 3vh, 40px) clamp(16px, 4vw, 40px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: clamp(14px, 2.5vh, 34px);
  }

  .pl-head { flex: 0 0 auto; }
  .pl-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--font-mono); font-size: 11px;
    letter-spacing: .18em; color: var(--accent);
  }
  .pl-tri {
    width: 0; height: 0;
    border-left: 4.5px solid transparent;
    border-right: 4.5px solid transparent;
    border-bottom: 7px solid var(--accent);
  }
  .pl-title {
    font-weight: 700; font-size: clamp(26px, 4.2vw, 44px);
    letter-spacing: -.032em; color: var(--foreground);
    margin: 12px 0 0; line-height: 1.22; max-width: 17ch;
  }

  /* ── برچسب گذار: حدس ← داده ── */
  .pl-shift {
    display: inline-flex; align-items: center; gap: 10px;
    margin-top: 14px;
  }
  .pl-shift-s {
    font-family: var(--font-mono); font-size: 11px;
    letter-spacing: .1em;
    padding: 5px 13px; border-radius: 100px;
    border: 1px solid var(--border-default);
    color: var(--foreground-subtle);
    transition: color .4s ease, border-color .4s ease, background .4s ease;
  }
  .pl-shift-s.on {
    color: var(--accent);
    border-color: var(--border-accent);
    background: color-mix(in srgb, var(--accent) 10%, transparent);
  }
  .pl-shift-arrow {
    font-size: 13px; color: var(--foreground-subtle);
  }

  /* ── دو ستون ── */
  .pl-split {
    flex: 1 1 auto;
    min-height: 0;
    display: grid;
    grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
    gap: clamp(20px, 3.5vw, 56px);
    align-items: center;
  }

  .pl-visual {
    position: relative;
    min-height: 0;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  /* صحنه مربعی است، پس سقف عرض باید از ارتفاعِ در دسترس هم تبعیت کند
     وگرنه بوم بلندتر از قاب می‌شود. ارتفاع را جاوااسکریپت برابر عرض
     نهایی ست می‌کند. */
  .pl-canvas {
    display: block;
    width: 100%;
    max-width: min(100%, 52vh);
    margin: 0 auto;
  }

  .pl-list { min-width: 0; }

  /* ── موارد ── */
  .pl-item {
    padding: clamp(12px, 1.8vh, 22px) 0;
    min-width: 0;
    border-bottom: 1px solid var(--border-default);
    opacity: 0;
    transform: translateY(14px);
    transition: opacity .55s ease, transform .6s cubic-bezier(.22,1,.36,1);
  }
  .pl-item.on { opacity: 1; transform: translateY(0); }
  .pl-item:first-child { padding-top: 0; }
  .pl-item:last-child { border-bottom: 0; }

  .pl-item-t {
    font-weight: 700; font-size: clamp(16px, 2.1vw, 22px);
    letter-spacing: -.026em; margin: 0; line-height: 1.35;
    color: var(--foreground);
    display: flex; align-items: center; gap: 9px;
  }
  /* نقطه‌ی هم‌رنگ گره‌های شبکه */
  .pl-item-t::before {
    content: ""; flex: 0 0 auto;
    width: 7px; height: 7px; border-radius: 100px;
    background: var(--pl-hue, var(--accent));
    transform: scale(0);
    transition: transform .45s cubic-bezier(.22,1,.36,1) .12s;
  }
  .pl-item.on .pl-item-t::before { transform: scale(1); }

  .pl-item-b {
    font-size: 13.5px; line-height: 1.95; color: var(--foreground-muted);
    margin: 8px 0 0; max-width: 56ch;
  }
  .pl-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
  .pl-tag {
    font-family: var(--font-mono); font-size: 10.5px; letter-spacing: .04em;
    padding: 4px 10px; border-radius: 100px;
    background: var(--surface); color: var(--foreground-subtle);
    border: 1px solid var(--border-default);
  }

  .pl-cta {
    display: inline-flex; align-items: center; gap: 7px;
    margin-top: clamp(12px, 2vh, 24px);
    font-size: 14px; font-weight: 600; color: var(--accent);
    text-decoration: none;
    opacity: 0; transform: translateY(8px);
    transition: opacity .5s ease, transform .5s cubic-bezier(.22,1,.36,1),
      gap .18s cubic-bezier(.22,1,.36,1);
  }
  .pl-cta.on { opacity: 1; transform: translateY(0); }
  .pl-cta::after { content: "←"; font-size: 15px; }
  @media (hover: hover) and (pointer: fine) {
    .pl-cta.on:hover { gap: 11px; }
  }

  @media (max-width: 880px) {
    /* یک‌ستونه: صحنه بالا، متن پایین. بخش دیگر قفل نمی‌شود چون
       ارتفاع لازم برای سه ستون متن + صحنه از یک پنجره بیشتر است. */
    .pl-wrap { height: auto; }
    .pl {
      position: static;
      height: auto;
      padding-block: clamp(48px, 9vw, 80px);
      gap: clamp(18px, 3.5vw, 30px);
    }
    .pl-split {
      grid-template-columns: 1fr;
      gap: clamp(16px, 4vw, 30px);
      align-items: start;
    }
    .pl-visual { width: 100%; }
    /* سقف بر حسب عرض صفحه، نه ارتفاع — در چیدمان عمودی ارتفاع آزاد است */
    .pl-canvas { max-width: min(100%, 300px); }
    .pl-item-b { font-size: 13px; }
    .pl-title { font-size: clamp(22px, 5.4vw, 32px); }
  }
  /* نمایشگر کوتاه در حالت دوستونه هم نباید قفل شود */
  @media (min-width: 881px) and (max-height: 680px) {
    .pl-wrap { height: auto; }
    .pl { position: static; height: auto; padding-block: 64px; }
    .pl-canvas { max-width: 340px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .pl-item, .pl-cta, .pl-item-t::before, .pl-shift-s {
      transition-duration: .01ms;
    }
    .pl-item, .pl-cta { opacity: 1; transform: none; }
    .pl-item-t::before { transform: scale(1); }
  }
`;
