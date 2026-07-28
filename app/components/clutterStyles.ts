/**
 * استایل بخش «به‌جای این‌همه حدس، یک نقشه».
 *
 * الگو از مرجع طراحی: شبکه‌ای از کارت‌های کوچک که هرکدام علامت حذف
 * می‌گیرند، و در پایان جای همه را یک کارت واحد پر می‌کند.
 *
 * تفاوت با مرجع: آنجا لوگوی رقبا بود؛ اینجا «راه‌های حدسی انتخاب شغل»
 * است — چیزی که واقعاً با آن رقابت می‌کنیم.
 */
export const clutterStyles = `
  .cl {
    max-width: 900px;
    margin: 0 auto;
    padding: clamp(56px, 8vw, 104px) clamp(16px, 4vw, 40px);
    text-align: center;
  }

  .cl-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--font-mono); font-size: 11px;
    letter-spacing: .18em; color: var(--accent);
  }
  .cl-tri {
    width: 0; height: 0;
    border-left: 4.5px solid transparent;
    border-right: 4.5px solid transparent;
    border-bottom: 7px solid var(--accent);
  }
  .cl-title {
    font-weight: 700; font-size: clamp(27px, 4.4vw, 46px);
    letter-spacing: -.033em; color: var(--foreground);
    margin: 16px 0 0; line-height: 1.2;
  }
  .cl-lede {
    font-size: clamp(14px, 1.6vw, 16px); line-height: 2;
    color: var(--foreground-muted);
    margin: 16px auto 0; max-width: 54ch;
  }

  /* ── شبکه‌ی موارد حذف‌شونده ── */
  .cl-grid {
    display: grid; gap: clamp(10px, 1.8vw, 18px);
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-top: clamp(30px, 5vw, 52px);
  }

  .cl-item {
    position: relative;
    display: flex; flex-direction: column; align-items: center; gap: 10px;
    padding: clamp(14px, 2vw, 20px) 10px;
    border-radius: 14px;
    background: var(--background-elevated);
    border: 1px solid var(--border-default);
    opacity: 0;
    transform: translateY(12px) scale(.96);
    transition:
      opacity .5s ease,
      transform .55s cubic-bezier(.22,1,.36,1),
      filter .5s ease,
      border-color .5s ease;
  }
  .cl-item.in { opacity: 1; transform: translateY(0) scale(1); }

  /* حالت حذف‌شده: کم‌رنگ و بی‌رمق، ولی هنوز خوانا */
  .cl-item.out {
    opacity: .42;
    filter: grayscale(1);
    border-color: var(--border-default);
  }

  .cl-ico {
    width: 42px; height: 42px; border-radius: 11px;
    display: flex; align-items: center; justify-content: center;
    background: var(--surface);
    border: 1px solid var(--border-default);
    color: var(--foreground-muted);
    transition: color .4s ease, background .4s ease;
  }
  .cl-label {
    font-size: 12.5px; line-height: 1.6;
    color: var(--foreground-muted);
    transition: color .4s ease;
  }
  .cl-item.out .cl-label { color: var(--foreground-subtle); }

  /* علامت ضربدر گوشه */
  .cl-x {
    position: absolute; top: -7px; inset-inline-end: -7px;
    width: 21px; height: 21px; border-radius: 100px;
    display: flex; align-items: center; justify-content: center;
    background: var(--danger);
    color: var(--nav-cta-fg);
    box-shadow: 0 2px 8px color-mix(in srgb, var(--danger) 40%, transparent);
    opacity: 0; transform: scale(0);
    transition: opacity .3s ease, transform .4s cubic-bezier(.34,1.56,.64,1);
  }
  .cl-item.out .cl-x { opacity: 1; transform: scale(1); }

  /* ── فلش گذار ── */
  .cl-arrow {
    display: flex; align-items: center; justify-content: center;
    margin: clamp(22px, 3.5vw, 36px) 0 0;
    color: var(--accent);
    opacity: 0; transform: translateY(-8px);
    transition: opacity .5s ease, transform .6s cubic-bezier(.22,1,.36,1);
  }
  .cl-arrow.on { opacity: 1; transform: translateY(0); }

  /* ── کارت نتیجه ── */
  .cl-result {
    margin-top: clamp(18px, 3vw, 28px);
    border-radius: 18px;
    padding: clamp(22px, 3.4vw, 34px) clamp(18px, 3vw, 32px);
    background: var(--card-solid);
    border: 1px solid var(--border-accent);
    box-shadow: var(--card-shadow);
    opacity: 0; transform: translateY(16px) scale(.98);
    transition: opacity .6s ease, transform .7s cubic-bezier(.22,1,.36,1);
  }
  .cl-result.on { opacity: 1; transform: translateY(0) scale(1); }

  .cl-result-ico {
    width: 52px; height: 52px; border-radius: 14px;
    margin: 0 auto;
    display: flex; align-items: center; justify-content: center;
    background: color-mix(in srgb, var(--accent) 16%, transparent);
    border: 1px solid var(--border-accent);
    color: var(--accent);
  }
  .cl-result-t {
    font-weight: 700; font-size: clamp(17px, 2.3vw, 22px);
    letter-spacing: -.024em; color: var(--foreground);
    margin: 14px 0 0;
  }
  .cl-result-b {
    font-size: 13.5px; line-height: 2; color: var(--foreground-muted);
    margin: 10px auto 0; max-width: 52ch;
  }

  @media (max-width: 620px) {
    .cl-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .cl-label { font-size: 11.5px; }
    .cl-ico { width: 36px; height: 36px; border-radius: 10px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .cl-item, .cl-x, .cl-arrow, .cl-result { transition-duration: .01ms; }
    .cl-item { opacity: 1; transform: none; }
    .cl-arrow, .cl-result { opacity: 1; transform: none; }
  }
`;
