/**
 * استایل صفحه‌ی «درباره‌ی ما و تماس».
 *
 * از همان زبان بصری بقیه‌ی صفحات محتوایی استفاده می‌کند تا کاربر حس
 * نکند وارد سایت دیگری شده.
 */
export const aboutStyles = `
  .ab {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 clamp(16px, 4vw, 40px) clamp(72px, 10vw, 128px);
    color: var(--foreground);
  }

  /* ── سربرگ ── */
  .ab-hero { padding: clamp(28px, 5vw, 56px) 0 clamp(24px, 3.5vw, 44px); }
  .ab-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--font-mono); font-size: 11px;
    letter-spacing: .18em; color: var(--accent);
  }
  .ab-tri {
    width: 0; height: 0;
    border-left: 4.5px solid transparent;
    border-right: 4.5px solid transparent;
    border-bottom: 7px solid var(--accent);
  }
  .ab-h1 {
    font-weight: 700; font-size: clamp(30px, 5vw, 50px);
    letter-spacing: -.032em; line-height: 1.2;
    margin: 16px 0 0; max-width: 18ch;
  }
  .ab-lede {
    font-size: clamp(15px, 1.7vw, 17px); line-height: 2.05;
    color: var(--foreground-muted); margin: 20px 0 0; max-width: 62ch;
  }

  /* ── بخش ── */
  .ab-sec { padding-top: clamp(40px, 6vw, 76px); scroll-margin-top: 96px; }
  .ab-h2 {
    font-weight: 700; font-size: clamp(20px, 2.7vw, 28px);
    letter-spacing: -.025em; margin: 0; line-height: 1.32;
  }
  .ab-body { margin-top: 14px; }
  .ab-body p {
    font-size: 14.5px; line-height: 2.1; color: var(--foreground-muted);
    margin: 0 0 13px; max-width: 66ch;
  }
  .ab-body p:last-child { margin-bottom: 0; }

  /* ── ارزش‌ها ── */
  .ab-values {
    display: grid; gap: 11px; margin-top: 20px;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
  .ab-value {
    background: var(--background-elevated);
    border: 1px solid var(--border-default);
    border-radius: 13px; padding: 17px 19px;
  }
  .ab-value b {
    display: flex; align-items: center; gap: 8px;
    font-size: 14px; font-weight: 700; color: var(--foreground);
  }
  .ab-value b::before {
    content: ""; flex: 0 0 auto;
    width: 6px; height: 6px; border-radius: 100px;
    background: var(--accent);
  }
  .ab-value span {
    display: block; font-size: 13px; line-height: 1.95;
    color: var(--foreground-subtle); margin-top: 8px;
  }

  /* ── کانال‌های ارتباطی ── */
  .ab-channels {
    display: grid; gap: 11px; margin-top: 20px;
    grid-template-columns: repeat(auto-fit, minmax(238px, 1fr));
  }
  .ab-ch {
    display: flex; align-items: center; gap: 13px;
    text-decoration: none;
    background: var(--background-elevated);
    border: 1px solid var(--border-default);
    border-radius: 13px; padding: 15px 17px;
    transition: border-color .18s ease, transform .18s cubic-bezier(.22,1,.36,1);
  }
  @media (hover: hover) and (pointer: fine) {
    .ab-ch:hover { border-color: var(--border-accent); transform: translateY(-2px); }
  }
  .ab-ch-ico {
    flex: 0 0 auto;
    width: 38px; height: 38px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    background: var(--nav-ico); color: var(--accent);
  }
  .ab-ch-t { min-width: 0; }
  .ab-ch-t b {
    display: block; font-size: 12px; font-weight: 600;
    color: var(--foreground-subtle);
  }
  .ab-ch-t span {
    display: block; font-size: 14px; font-weight: 600;
    color: var(--foreground); margin-top: 3px;
    direction: ltr; text-align: start;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  /* آدرس متنی است، نه لینک */
  .ab-ch.static { cursor: default; }
  @media (hover: hover) and (pointer: fine) {
    .ab-ch.static:hover { transform: none; border-color: var(--border-default); }
  }

  .ab-note {
    margin-top: 16px; border-radius: 12px;
    padding: 13px 17px; max-width: 66ch;
    background: var(--surface);
    border: 1px solid var(--border-default);
    border-inline-start: 2px solid var(--accent);
    font-size: 13px; line-height: 1.95; color: var(--foreground-muted);
  }

  @media (max-width: 520px) {
    .ab-value, .ab-ch { padding: 14px 15px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .ab-ch { transition-duration: .01ms; }
  }
`;
