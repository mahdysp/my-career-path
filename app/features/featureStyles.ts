/**
 * استایل مشترک صفحات «امکانات».
 *
 * از همان زبان بصری /how-it-works و /science استفاده می‌کند — ستون متن
 * باریک، فهرست کناری چسبان، جدول جزئیات فنی — تا این چهار صفحه با بقیه
 * یکدست باشند و کاربر حس نکند وارد سایت دیگری شده.
 */
export const featureStyles = `
  .fw {
    max-width: 1120px;
    margin: 0 auto;
    padding: 0 clamp(16px, 4vw, 40px) clamp(72px, 10vw, 128px);
    color: var(--foreground);
  }

  /* ── سربرگ ── */
  .fw-hero { padding: clamp(28px, 5vw, 56px) 0 clamp(24px, 3.5vw, 44px); }
  .fw-crumb {
    display: flex; align-items: center; gap: 7px;
    font-size: 12px; color: var(--foreground-subtle);
    margin-bottom: 16px; flex-wrap: wrap;
  }
  .fw-crumb a { color: var(--foreground-muted); text-decoration: none; }
  @media (hover: hover) and (pointer: fine) {
    .fw-crumb a:hover { color: var(--foreground); }
  }
  .fw-crumb span { opacity: .5; }

  .fw-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--font-mono); font-size: 11px;
    letter-spacing: .18em; color: var(--accent);
  }
  .fw-tri {
    width: 0; height: 0;
    border-left: 4.5px solid transparent;
    border-right: 4.5px solid transparent;
    border-bottom: 7px solid var(--accent);
  }
  .fw-h1 {
    font-weight: 700; font-size: clamp(29px, 4.8vw, 50px);
    letter-spacing: -.032em; line-height: 1.2;
    margin: 16px 0 0; max-width: 19ch;
  }
  .fw-lede {
    font-size: clamp(15px, 1.7vw, 17px); line-height: 2.05;
    color: var(--foreground-muted); margin: 20px 0 0; max-width: 62ch;
  }

  /* ── نوار آمار ── */
  .fw-quick {
    display: grid; gap: 10px; margin-top: 28px;
    grid-template-columns: repeat(auto-fit, minmax(148px, 1fr));
  }
  .fw-quick-i {
    background: var(--background-elevated);
    border: 1px solid var(--border-default);
    border-radius: 12px; padding: 14px 16px;
  }
  .fw-quick-k {
    font-family: var(--font-mono); font-size: 10px;
    letter-spacing: .1em; color: var(--foreground-subtle);
  }
  .fw-quick-v {
    font-size: 16.5px; font-weight: 700; margin-top: 6px;
    letter-spacing: -.02em;
  }

  /* ── چیدمان ── */
  .fw-layout { display: grid; grid-template-columns: 178px minmax(0, 1fr); gap: 34px; }
  .fw-toc {
    position: sticky; top: 92px; align-self: start;
    display: flex; flex-direction: column; gap: 1px;
  }
  .fw-toc a {
    font-size: 12.5px; color: var(--foreground-subtle);
    text-decoration: none; padding: 8px 11px; border-radius: 8px;
    border-inline-start: 2px solid transparent;
    transition: color .16s ease, border-color .16s ease;
  }
  .fw-toc a.on {
    color: var(--foreground); border-inline-start-color: var(--accent);
    background: var(--surface);
  }
  @media (hover: hover) and (pointer: fine) {
    .fw-toc a:hover { color: var(--foreground); }
  }

  /* ── بخش ── */
  .fw-sec { padding-top: clamp(38px, 5.5vw, 68px); scroll-margin-top: 96px; }
  .fw-sec:first-child { padding-top: clamp(20px, 3vw, 34px); }
  .fw-h2 {
    font-weight: 700; font-size: clamp(19px, 2.6vw, 27px);
    letter-spacing: -.025em; margin: 0; line-height: 1.32;
  }
  .fw-gist {
    font-size: 14px; line-height: 1.95; margin: 10px 0 0;
    color: var(--accent); max-width: 62ch;
  }
  .fw-body { margin-top: 12px; }
  .fw-body p {
    font-size: 14px; line-height: 2.05; color: var(--foreground-muted);
    margin: 0 0 11px; max-width: 66ch;
  }
  .fw-body p:last-child { margin-bottom: 0; }

  /* جدول جزئیات */
  .fw-detail {
    margin-top: 15px;
    background: var(--background-elevated);
    border: 1px solid var(--border-default);
    border-radius: 12px; overflow: hidden;
    max-width: 66ch;
  }
  .fw-detail-r {
    display: flex; align-items: center; justify-content: space-between;
    gap: 14px; padding: 10px 15px;
    border-bottom: 1px solid var(--border-default);
  }
  .fw-detail-r:last-child { border-bottom: 0; }
  .fw-detail-k { font-size: 12.5px; color: var(--foreground-subtle); }
  .fw-detail-v {
    font-family: var(--font-mono); font-size: 12.5px;
    color: var(--foreground); direction: ltr; text-align: left;
    white-space: nowrap; overflow-x: auto; max-width: 62%;
  }

  /* فهرست نکته‌دار */
  .fw-bullets {
    margin-top: 15px; display: grid; gap: 9px;
    grid-template-columns: repeat(auto-fit, minmax(232px, 1fr));
    max-width: 66ch;
  }
  .fw-bullet {
    background: var(--background-elevated);
    border: 1px solid var(--border-default);
    border-radius: 11px; padding: 13px 15px;
  }
  .fw-bullet b {
    display: flex; align-items: center; gap: 7px;
    font-size: 13px; font-weight: 700; color: var(--foreground);
  }
  .fw-bullet b::before {
    content: ""; flex: 0 0 auto;
    width: 5px; height: 5px; border-radius: 100px;
    background: var(--accent);
  }
  .fw-bullet span {
    display: block; font-size: 12px; line-height: 1.85;
    color: var(--foreground-subtle); margin-top: 5px;
  }

  /* جعبه‌ی چرا */
  .fw-why {
    margin-top: 15px; border-radius: 12px;
    padding: 14px 17px; max-width: 66ch;
    background: var(--surface);
    border: 1px solid var(--border-default);
    border-inline-start: 2px solid var(--accent);
  }
  .fw-why-q {
    font-size: 13px; font-weight: 700; color: var(--foreground);
    display: flex; align-items: flex-start; gap: 7px; line-height: 1.7;
  }
  .fw-why-q svg { flex: 0 0 auto; margin-top: 3px; color: var(--accent); }
  .fw-why-a {
    font-size: 13px; line-height: 2; color: var(--foreground-muted);
    margin: 7px 0 0;
  }

  /* ── صفحات مرتبط ── */
  .fw-related {
    margin-top: clamp(40px, 6vw, 72px);
    padding-top: clamp(26px, 4vw, 40px);
    border-top: 1px solid var(--border-default);
  }
  .fw-related-t {
    font-family: var(--font-mono); font-size: 11px;
    letter-spacing: .14em; color: var(--foreground-subtle);
  }
  .fw-related-grid {
    display: grid; gap: 10px; margin-top: 14px;
    grid-template-columns: repeat(auto-fit, minmax(216px, 1fr));
  }
  .fw-related-c {
    display: block; text-decoration: none;
    background: var(--background-elevated);
    border: 1px solid var(--border-default);
    border-radius: 12px; padding: 15px 17px;
    transition: border-color .18s ease, transform .18s cubic-bezier(.22,1,.36,1);
  }
  @media (hover: hover) and (pointer: fine) {
    .fw-related-c:hover {
      border-color: var(--border-accent);
      transform: translateY(-2px);
    }
  }
  .fw-related-c b {
    display: flex; align-items: center; justify-content: space-between;
    gap: 8px; font-size: 13.5px; font-weight: 700; color: var(--foreground);
  }
  .fw-related-c b::after {
    content: "←"; color: var(--accent); font-size: 14px;
  }
  .fw-related-c span {
    display: block; font-size: 12px; line-height: 1.85;
    color: var(--foreground-subtle); margin-top: 5px;
  }

  /* ── فراخوان ── */
  .fw-cta {
    margin-top: clamp(36px, 5vw, 60px); text-align: center;
    border-radius: 18px; padding: clamp(26px, 4vw, 44px) 24px;
    background: var(--background-elevated);
    border: 1px solid var(--border-default);
  }
  .fw-cta h2 {
    margin: 0; font-size: clamp(19px, 2.6vw, 26px);
    font-weight: 700; letter-spacing: -.025em;
  }
  .fw-cta p {
    margin: 11px auto 0; max-width: 50ch;
    font-size: 13.5px; line-height: 2; color: var(--foreground-muted);
  }
  .fw-row {
    display: flex; gap: 10px; justify-content: center;
    margin-top: 20px; flex-wrap: wrap;
  }
  .fw-btn {
    font-family: inherit; font-size: 14px; font-weight: 600;
    padding: 0 22px; height: 44px;
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 100px; cursor: pointer; text-decoration: none;
    white-space: nowrap;
    transition: transform .18s cubic-bezier(.22,1,.36,1), box-shadow .18s ease, background .18s ease;
  }
  .fw-btn.primary {
    background: var(--accent); color: #fff; border: 1px solid var(--accent);
  }
  .fw-btn.ghost {
    background: transparent; color: var(--foreground);
    border: 1px solid var(--border-hover);
  }
  @media (hover: hover) and (pointer: fine) {
    .fw-btn.primary:hover { transform: translateY(-1px); box-shadow: 0 8px 22px var(--accent-glow); }
    .fw-btn.ghost:hover { background: var(--surface); }
  }

  @media (max-width: 900px) {
    .fw-layout { grid-template-columns: 1fr; gap: 0; }
    .fw-toc { display: none; }
  }
  @media (max-width: 520px) {
    .fw-detail-r { flex-direction: column; align-items: flex-start; gap: 4px; }
    .fw-detail-v { max-width: 100%; }
  }
  @media (prefers-reduced-motion: reduce) {
    .fw-btn, .fw-toc a, .fw-related-c { transition-duration: .01ms; }
  }
`;
