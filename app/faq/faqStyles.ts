/**
 * استایل صفحه‌ی پرسش‌های متداول.
 *
 * الگو: آکاردئون کارت‌محور — هر پرسش یک کارت مستقل با دکمه‌ی + / − در
 * سمت مقابل متن. باز و بسته شدن با ارتفاع پویا انیمیت می‌شود.
 */
export const faqStyles = `
  .fq {
    max-width: 940px;
    margin: 0 auto;
    padding: 0 clamp(16px, 4vw, 40px) clamp(72px, 10vw, 128px);
    color: var(--foreground);
  }

  /* ── سربرگ ── */
  .fq-hero {
    padding: clamp(40px, 7vw, 90px) 0 clamp(28px, 4.5vw, 52px);
    text-align: center;
  }
  .fq-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--font-mono); font-size: 11px;
    letter-spacing: .18em; color: var(--accent);
  }
  .fq-tri {
    width: 0; height: 0;
    border-left: 4.5px solid transparent;
    border-right: 4.5px solid transparent;
    border-bottom: 7px solid var(--accent);
  }
  .fq-h1 {
    font-weight: 700; font-size: clamp(32px, 5.6vw, 56px);
    letter-spacing: -.035em; line-height: 1.15;
    margin: 18px 0 0;
  }
  .fq-lede {
    font-size: clamp(14.5px, 1.6vw, 16px); line-height: 2;
    color: var(--foreground-muted);
    margin: 18px auto 0; max-width: 56ch;
  }

  /* ── جست‌وجو ── */
  .fq-search {
    position: relative; max-width: 420px; margin: 26px auto 0;
  }
  .fq-search input {
    width: 100%; font-family: inherit; font-size: 14px;
    color: var(--foreground); background: var(--background-elevated);
    border: 1px solid var(--border-default); border-radius: 100px;
    padding: 12px 44px 12px 18px;
    transition: border-color .18s ease, box-shadow .18s ease;
  }
  .fq-search input:focus {
    outline: none; border-color: var(--border-accent);
    box-shadow: 0 0 0 3px var(--accent-glow);
  }
  .fq-search input::placeholder { color: var(--placeholder); }
  .fq-search svg {
    position: absolute; inset-inline-start: 16px; top: 50%;
    transform: translateY(-50%);
    color: var(--foreground-subtle); pointer-events: none;
  }

  /* ── آکاردئون ── */
  .fq-list { display: grid; gap: 12px; }

  .fq-item {
    background: var(--background-elevated);
    border: 1px solid var(--border-default);
    border-radius: 16px;
    overflow: hidden;
    transition: border-color .2s ease, box-shadow .2s ease;
  }
  .fq-item.open {
    border-color: var(--border-hover);
    box-shadow: var(--card-shadow);
  }

  .fq-q {
    width: 100%; display: flex; align-items: center;
    justify-content: space-between; gap: 16px;
    padding: clamp(18px, 2.4vw, 24px) clamp(18px, 2.6vw, 28px);
    background: none; border: 0; cursor: pointer;
    font-family: inherit; font-size: clamp(14.5px, 1.7vw, 16.5px);
    font-weight: 600; color: var(--foreground);
    text-align: start; line-height: 1.6;
    transition: background .16s ease;
  }
  @media (hover: hover) and (pointer: fine) {
    .fq-q:hover { background: var(--surface); }
  }

  /* دکمه‌ی + / − */
  .fq-sign {
    flex: 0 0 auto;
    width: 34px; height: 34px; border-radius: 100px;
    background: var(--surface);
    border: 1px solid var(--border-default);
    position: relative;
    transition: background .2s ease, border-color .2s ease, transform .3s cubic-bezier(.22,1,.36,1);
  }
  .fq-sign::before, .fq-sign::after {
    content: ""; position: absolute; inset: 50% auto auto 50%;
    background: var(--foreground-muted); border-radius: 2px;
    transition: transform .3s cubic-bezier(.22,1,.36,1), background .2s ease;
  }
  /* خط افقی */
  .fq-sign::before {
    width: 13px; height: 1.7px;
    transform: translate(-50%, -50%);
  }
  /* خط عمودی — در حالت باز محو می‌شود */
  .fq-sign::after {
    width: 1.7px; height: 13px;
    transform: translate(-50%, -50%);
  }
  .fq-item.open .fq-sign {
    background: var(--accent); border-color: var(--accent);
    transform: rotate(180deg);
  }
  .fq-item.open .fq-sign::before { background: #fff; }
  .fq-item.open .fq-sign::after { transform: translate(-50%, -50%) scaleY(0); }

  /* پاسخ — ارتفاع با گرید انیمیت می‌شود تا نیاز به اندازه‌گیری نباشد */
  .fq-a {
    display: grid; grid-template-rows: 0fr;
    transition: grid-template-rows .34s cubic-bezier(.22,1,.36,1);
  }
  .fq-item.open .fq-a { grid-template-rows: 1fr; }
  .fq-a-in { overflow: hidden; }
  .fq-a p {
    margin: 0;
    padding: 0 clamp(18px, 2.6vw, 28px) clamp(20px, 2.6vw, 26px);
    font-size: 14px; line-height: 2.1; color: var(--foreground-muted);
    max-width: 72ch;
  }

  .fq-empty {
    padding: 44px 20px; text-align: center;
    color: var(--foreground-subtle); font-size: 14px; line-height: 2;
  }

  /* ── پایان صفحه ── */
  .fq-more {
    margin-top: clamp(34px, 5vw, 56px);
    padding-top: clamp(24px, 3.5vw, 36px);
    border-top: 1px solid var(--border-default);
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px; flex-wrap: wrap;
  }
  .fq-more p {
    margin: 0; font-size: 14px; line-height: 1.95;
    color: var(--foreground-muted); max-width: 46ch;
  }
  .fq-more b { display: block; color: var(--foreground); font-size: 15px; }
  .fq-btn {
    font-family: inherit; font-size: 14px; font-weight: 600;
    padding: 0 22px; height: 44px;
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 100px; text-decoration: none; white-space: nowrap;
    background: var(--accent); color: #fff;
    border: 1px solid var(--accent);
    transition: transform .18s cubic-bezier(.22,1,.36,1), box-shadow .18s ease;
  }
  @media (hover: hover) and (pointer: fine) {
    .fq-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 22px var(--accent-glow); }
  }

  @media (prefers-reduced-motion: reduce) {
    .fq-a, .fq-sign, .fq-sign::before, .fq-sign::after, .fq-btn {
      transition-duration: .01ms;
    }
  }
`;
