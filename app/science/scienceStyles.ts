/**
 * استایل صفحه‌ی پشتوانه‌ی علمی.
 *
 * زبان بصری: مقاله‌ی علمی، نه صفحه‌ی فروش. ستون متن باریک (حدود ۷۰ نویسه)
 * تا خواندن راحت باشد، تیترهای شماره‌دار، و ارجاعات به‌سبک آکادمیک.
 * از همان توکن‌های سایت استفاده می‌کند تا هر دو تم کار کنند.
 */
export const scienceStyles = `
  .sc {
    max-width: 1120px;
    margin: 0 auto;
    padding: 0 clamp(16px, 4vw, 40px) clamp(72px, 10vw, 128px);
    color: var(--foreground);
  }

  /* ── سربرگ ── */
  .sc-hero { padding: clamp(28px, 5vw, 56px) 0 clamp(36px, 6vw, 72px); }
  .sc-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--font-mono); font-size: 11px;
    letter-spacing: .18em; color: var(--accent);
  }
  .sc-tri {
    width: 0; height: 0;
    border-left: 4.5px solid transparent;
    border-right: 4.5px solid transparent;
    border-bottom: 7px solid var(--accent);
  }
  .sc-h1 {
    font-weight: 700; font-size: clamp(30px, 5vw, 52px);
    letter-spacing: -.032em; line-height: 1.18;
    margin: 16px 0 0; max-width: 20ch;
  }
  .sc-lede {
    font-size: clamp(15px, 1.7vw, 17px); line-height: 2.05;
    color: var(--foreground-muted); margin: 20px 0 0; max-width: 62ch;
  }

  /* ── بخش‌ها ── */
  .sc-sec { padding-top: clamp(48px, 7vw, 88px); scroll-margin-top: 96px; }
  .sc-sec-n {
    font-family: var(--font-mono); font-size: 11px;
    letter-spacing: .14em; color: var(--accent); display: block;
  }
  .sc-h2 {
    font-weight: 700; font-size: clamp(21px, 2.9vw, 30px);
    letter-spacing: -.025em; margin: 9px 0 0; line-height: 1.3;
  }
  .sc-intro {
    font-size: 14.5px; line-height: 2.05; color: var(--foreground-muted);
    margin: 14px 0 0; max-width: 68ch;
  }
  .sc-body { font-size: 14.5px; line-height: 2.05; color: var(--foreground-muted); }
  .sc-body p { margin: 14px 0 0; max-width: 68ch; }
  .sc-body strong { color: var(--foreground); font-weight: 600; }

  /* ── ارجاع درون‌متنی ── */
  .sc-ref {
    font-family: var(--font-mono); font-size: 10.5px;
    color: var(--accent); text-decoration: none;
    padding: 1px 5px; margin-inline-start: 3px;
    border: 1px solid var(--border-accent); border-radius: 5px;
    white-space: nowrap; vertical-align: 1px;
    transition: background .16s ease;
  }
  @media (hover: hover) and (pointer: fine) {
    .sc-ref:hover { background: color-mix(in srgb, var(--accent) 12%, transparent); }
  }

  /* ── کارت ── */
  .sc-card {
    background: var(--background-elevated);
    border: 1px solid var(--border-default);
    border-radius: 14px;
    padding: clamp(16px, 2.4vw, 24px);
  }

  /* ── یافته‌های عددی ── */
  .sc-findings {
    display: grid; gap: 12px; margin-top: 26px;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
  .sc-finding {
    background: var(--background-elevated);
    border: 1px solid var(--border-default);
    border-radius: 14px; padding: 18px 20px;
    display: flex; flex-direction: column;
  }
  .sc-finding-v {
    font-family: var(--font-mono); font-size: clamp(22px, 3vw, 28px);
    font-weight: 700; letter-spacing: -.02em; color: var(--accent);
    direction: ltr; text-align: start;
  }
  .sc-finding-l {
    font-size: 13.5px; font-weight: 700; margin-top: 8px;
    color: var(--foreground);
  }
  .sc-finding-d {
    font-size: 12.5px; line-height: 1.95; color: var(--foreground-subtle);
    margin-top: 8px; flex: 1;
  }
  .sc-finding-c { margin-top: 12px; }

  /* ── شش بُعد ── */
  .sc-dims {
    display: grid; gap: 12px; margin-top: 26px;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
  .sc-dim {
    background: var(--background-elevated);
    border: 1px solid var(--border-default);
    border-radius: 14px; padding: 18px 20px;
    border-top: 2px solid var(--dim-hue);
  }
  .sc-dim-top { display: flex; align-items: baseline; gap: 9px; }
  .sc-dim-k {
    font-family: var(--font-mono); font-size: 19px; font-weight: 700;
    color: var(--dim-hue); line-height: 1;
  }
  .sc-dim-fa { font-size: 15px; font-weight: 700; }
  .sc-dim-en {
    font-family: var(--font-mono); font-size: 11px;
    color: var(--foreground-subtle); margin-inline-start: auto;
  }
  .sc-dim-gist {
    font-size: 13px; line-height: 1.95;
    color: var(--foreground-muted); margin-top: 10px;
  }
  .sc-chips { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 12px; }
  .sc-chip {
    font-size: 11px; padding: 3px 9px; border-radius: 100px;
    background: var(--surface); color: var(--foreground-subtle);
    border: 1px solid var(--border-default);
  }
  .sc-dim-ex {
    margin-top: 13px; padding-top: 12px;
    border-top: 1px solid var(--border-default);
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
  }
  .sc-dim-ex-t { font-size: 11.5px; color: var(--foreground-subtle); line-height: 1.6; }
  .sc-dim-ex-t b { display: block; color: var(--foreground-muted); font-weight: 600; }
  .sc-dim-ex-v {
    font-family: var(--font-mono); font-size: 17px; font-weight: 700;
    color: var(--dim-hue); flex: 0 0 auto;
  }

  /* ── مراحل محاسبه ── */
  .sc-steps { margin-top: 26px; display: grid; gap: 10px; }
  .sc-step {
    background: var(--background-elevated);
    border: 1px solid var(--border-default);
    border-radius: 14px; padding: 18px 20px;
    display: grid; grid-template-columns: 44px minmax(0, 1fr); gap: 14px;
  }
  .sc-step-n {
    font-family: var(--font-mono); font-size: 12px; font-weight: 700;
    color: var(--accent); padding-top: 2px;
  }
  .sc-step-t { font-size: 14.5px; font-weight: 700; }
  .sc-step-b {
    font-size: 13px; line-height: 2; color: var(--foreground-muted);
    margin-top: 7px;
  }
  .sc-formula {
    display: block; margin-top: 11px; padding: 10px 13px;
    border-radius: 9px; background: var(--background-base);
    border: 1px solid var(--border-default);
    font-family: var(--font-mono); font-size: 12.5px;
    color: var(--foreground); direction: ltr; text-align: left;
    overflow-x: auto; white-space: nowrap;
  }

  /* ── دو ستون: می‌کند / نمی‌کند ── */
  .sc-split {
    display: grid; gap: 12px; margin-top: 26px;
    grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
  }
  .sc-list { list-style: none; margin: 12px 0 0; padding: 0; }
  .sc-list li {
    display: flex; gap: 9px; align-items: flex-start;
    font-size: 13px; line-height: 1.95; padding: 7px 0;
    color: var(--foreground-muted);
  }
  .sc-list li + li { border-top: 1px solid var(--border-default); }
  .sc-tick { flex: 0 0 auto; margin-top: 5px; }
  .sc-tick.yes { color: var(--success); }
  .sc-tick.no { color: var(--danger); }

  /* ── محدودیت‌ها ── */
  .sc-limits { margin-top: 26px; display: grid; gap: 10px; }
  .sc-limit {
    background: var(--background-elevated);
    border: 1px solid var(--border-default);
    border-inline-start: 2px solid var(--warning);
    border-radius: 12px; padding: 16px 20px;
  }
  .sc-limit-t { font-size: 14px; font-weight: 700; }
  .sc-limit-b {
    font-size: 13px; line-height: 2; color: var(--foreground-muted);
    margin-top: 7px; max-width: 74ch;
  }

  /* ── منابع ── */
  .sc-cites { margin-top: 26px; display: grid; gap: 2px; }
  .sc-cite {
    display: grid; grid-template-columns: 34px minmax(0, 1fr); gap: 12px;
    padding: 13px 4px; border-bottom: 1px solid var(--border-default);
    scroll-margin-top: 96px;
  }
  .sc-cite:last-child { border-bottom: 0; }
  .sc-cite-n {
    font-family: var(--font-mono); font-size: 11px;
    color: var(--accent); padding-top: 3px;
  }
  .sc-cite-t {
    font-size: 13.5px; line-height: 1.8; color: var(--foreground);
    font-weight: 600;
  }
  .sc-cite-m {
    font-size: 12px; line-height: 1.85; color: var(--foreground-subtle);
    margin-top: 3px;
  }
  .sc-cite-l {
    font-family: var(--font-mono); font-size: 11px;
    color: var(--accent); text-decoration: none;
    direction: ltr; display: inline-block; margin-top: 5px;
    word-break: break-all;
  }
  @media (hover: hover) and (pointer: fine) {
    .sc-cite-l:hover { text-decoration: underline; }
  }
  .sc-cite:target { background: var(--surface); border-radius: 8px; }

  /* ── جعبه‌ی صداقت ── */
  .sc-honest {
    margin-top: 26px; border-radius: 14px; padding: clamp(18px, 2.6vw, 26px);
    background: var(--surface);
    border: 1px solid var(--border-accent);
  }
  .sc-honest h3 {
    margin: 0; font-size: 15.5px; font-weight: 700;
    display: flex; align-items: center; gap: 8px;
  }
  .sc-honest p {
    margin: 12px 0 0; font-size: 13.5px; line-height: 2.05;
    color: var(--foreground-muted); max-width: 72ch;
  }

  /* ── فراخوان پایانی ── */
  .sc-cta {
    margin-top: clamp(48px, 7vw, 88px); text-align: center;
    border-radius: 18px; padding: clamp(28px, 4.5vw, 48px) 24px;
    background: var(--background-elevated);
    border: 1px solid var(--border-default);
  }
  .sc-cta h2 {
    margin: 0; font-size: clamp(20px, 2.8vw, 28px);
    font-weight: 700; letter-spacing: -.025em;
  }
  .sc-cta p {
    margin: 12px auto 0; max-width: 52ch;
    font-size: 14px; line-height: 2; color: var(--foreground-muted);
  }
  .sc-cta-row {
    display: flex; gap: 10px; justify-content: center;
    margin-top: 22px; flex-wrap: wrap;
  }
  .sc-btn {
    font-family: inherit; font-size: 14px; font-weight: 600;
    padding: 0 22px; height: 44px;
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 100px; cursor: pointer; text-decoration: none;
    transition: transform .18s cubic-bezier(.22,1,.36,1), box-shadow .18s ease;
  }
  .sc-btn.primary {
    background: var(--accent); color: #fff; border: 1px solid var(--accent);
  }
  .sc-btn.ghost {
    background: transparent; color: var(--foreground);
    border: 1px solid var(--border-hover);
  }
  @media (hover: hover) and (pointer: fine) {
    .sc-btn.primary:hover { transform: translateY(-1px); box-shadow: 0 8px 22px var(--accent-glow); }
    .sc-btn.ghost:hover { background: var(--surface); }
  }

  /* ── فهرست کناری ── */
  .sc-toc {
    position: sticky; top: 92px;
    display: flex; flex-direction: column; gap: 1px;
  }
  .sc-toc a {
    font-size: 12.5px; color: var(--foreground-subtle);
    text-decoration: none; padding: 7px 11px; border-radius: 8px;
    border-inline-start: 2px solid transparent;
    transition: color .16s ease, border-color .16s ease;
  }
  .sc-toc a.on {
    color: var(--foreground); border-inline-start-color: var(--accent);
    background: var(--surface);
  }
  @media (hover: hover) and (pointer: fine) {
    .sc-toc a:hover { color: var(--foreground); }
  }
  .sc-layout { display: grid; grid-template-columns: 196px minmax(0, 1fr); gap: 34px; }

  @media (max-width: 900px) {
    .sc-layout { grid-template-columns: 1fr; gap: 0; }
    .sc-toc { display: none; }
    .sc-step { grid-template-columns: 1fr; gap: 6px; }
  }
  @media (max-width: 520px) {
    .sc-cite { grid-template-columns: 26px minmax(0, 1fr); gap: 9px; }
    .sc-dim-ex { flex-wrap: wrap; }
  }
  @media (prefers-reduced-motion: reduce) {
    .sc-btn, .sc-toc a, .sc-ref { transition-duration: .01ms; }
  }
`;
