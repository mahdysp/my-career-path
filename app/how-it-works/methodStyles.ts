/**
 * استایل صفحه‌ی روش کار.
 *
 * زبان بصری: خط زمانی عمودی. هر مرحله یک ایستگاه روی خط است که با اسکرول
 * روشن می‌شود — همان استعاره‌ی «مسیر» که در بخش سه‌گام صفحه‌ی اصلی هست،
 * ولی مفصل‌تر.
 */
export const methodStyles = `
  .mw {
    max-width: 1120px;
    margin: 0 auto;
    padding: 0 clamp(16px, 4vw, 40px) clamp(72px, 10vw, 128px);
    color: var(--foreground);
  }

  /* ── سربرگ ── */
  .mw-hero { padding: clamp(28px, 5vw, 56px) 0 clamp(28px, 4vw, 52px); }
  .mw-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--font-mono); font-size: 11px;
    letter-spacing: .18em; color: var(--accent);
  }
  .mw-tri {
    width: 0; height: 0;
    border-left: 4.5px solid transparent;
    border-right: 4.5px solid transparent;
    border-bottom: 7px solid var(--accent);
  }
  .mw-h1 {
    font-weight: 700; font-size: clamp(30px, 5vw, 52px);
    letter-spacing: -.032em; line-height: 1.18;
    margin: 16px 0 0; max-width: 18ch;
  }
  .mw-lede {
    font-size: clamp(15px, 1.7vw, 17px); line-height: 2.05;
    color: var(--foreground-muted); margin: 20px 0 0; max-width: 62ch;
  }

  /* ── نوار خلاصه ── */
  .mw-quick {
    display: grid; gap: 10px; margin-top: 28px;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  .mw-quick-i {
    background: var(--background-elevated);
    border: 1px solid var(--border-default);
    border-radius: 12px; padding: 14px 16px;
  }
  .mw-quick-k {
    font-family: var(--font-mono); font-size: 10px;
    letter-spacing: .1em; color: var(--foreground-subtle);
  }
  .mw-quick-v {
    font-size: 17px; font-weight: 700; margin-top: 6px;
    letter-spacing: -.02em;
  }

  /* ── چیدمان با فهرست کناری ── */
  .mw-layout { display: grid; grid-template-columns: 186px minmax(0, 1fr); gap: 34px; }
  .mw-toc {
    position: sticky; top: 92px; align-self: start;
    display: flex; flex-direction: column; gap: 1px;
  }
  .mw-toc a {
    display: flex; align-items: center; gap: 9px;
    font-size: 12.5px; color: var(--foreground-subtle);
    text-decoration: none; padding: 8px 11px; border-radius: 8px;
    border-inline-start: 2px solid transparent;
    transition: color .16s ease, border-color .16s ease;
  }
  .mw-toc a i {
    font-family: var(--font-mono); font-size: 10px;
    font-style: normal; opacity: .7;
  }
  .mw-toc a.on {
    color: var(--foreground); border-inline-start-color: var(--accent);
    background: var(--surface);
  }
  .mw-toc a.on i { color: var(--accent); opacity: 1; }
  @media (hover: hover) and (pointer: fine) {
    .mw-toc a:hover { color: var(--foreground); }
  }

  /* ── خط زمانی ── */
  .mw-track { position: relative; }
  /* خط عمودی پشت ایستگاه‌ها */
  .mw-track::before {
    content: "";
    position: absolute; top: 14px; bottom: 40px;
    inset-inline-start: 15px; width: 2px;
    background: var(--border-default);
    border-radius: 2px;
  }
  /* بخش پرشده — با اسکرول رشد می‌کند */
  .mw-fill {
    position: absolute; top: 14px;
    inset-inline-start: 15px; width: 2px;
    background: linear-gradient(
      to bottom,
      var(--accent),
      color-mix(in srgb, var(--accent) 45%, transparent)
    );
    border-radius: 2px;
    transition: height .18s linear;
  }

  .mw-stage {
    position: relative;
    padding: 0 0 clamp(28px, 4vw, 44px) 0;
    padding-inline-start: 52px;
    scroll-margin-top: 96px;
  }
  .mw-dot {
    position: absolute; top: 8px; inset-inline-start: 8px;
    width: 18px; height: 18px; border-radius: 100px;
    background: var(--background-base);
    border: 2px solid var(--border-hover);
    display: flex; align-items: center; justify-content: center;
    transition: border-color .3s ease, transform .3s cubic-bezier(.22,1,.36,1);
  }
  .mw-dot::after {
    content: ""; width: 6px; height: 6px; border-radius: 100px;
    background: var(--border-hover);
    transition: background .3s ease;
  }
  .mw-stage.on .mw-dot { border-color: var(--accent); transform: scale(1.1); }
  .mw-stage.on .mw-dot::after { background: var(--accent); }

  .mw-n {
    font-family: var(--font-mono); font-size: 11px;
    letter-spacing: .14em; color: var(--foreground-subtle);
    transition: color .3s ease;
  }
  .mw-stage.on .mw-n { color: var(--accent); }
  .mw-t {
    font-weight: 700; font-size: clamp(18px, 2.4vw, 24px);
    letter-spacing: -.024em; margin: 7px 0 0; line-height: 1.35;
  }
  .mw-gist {
    font-size: 14px; line-height: 1.95; margin: 9px 0 0;
    color: var(--accent); max-width: 62ch;
  }
  .mw-body { margin-top: 12px; }
  .mw-body p {
    font-size: 14px; line-height: 2.05; color: var(--foreground-muted);
    margin: 0 0 11px; max-width: 66ch;
  }
  .mw-body p:last-child { margin-bottom: 0; }

  /* جدول جزئیات فنی */
  .mw-detail {
    margin-top: 14px; display: grid; gap: 1px;
    background: var(--background-elevated);
    border: 1px solid var(--border-default);
    border-radius: 12px; overflow: hidden;
    max-width: 66ch;
  }
  .mw-detail-r {
    display: flex; align-items: center; justify-content: space-between;
    gap: 14px; padding: 10px 15px;
    border-bottom: 1px solid var(--border-default);
  }
  .mw-detail-r:last-child { border-bottom: 0; }
  .mw-detail-k { font-size: 12.5px; color: var(--foreground-subtle); }
  .mw-detail-v {
    font-family: var(--font-mono); font-size: 12.5px;
    color: var(--foreground); direction: ltr; text-align: left;
    white-space: nowrap; overflow-x: auto; max-width: 60%;
  }

  /* جعبه‌ی «چرا» */
  .mw-why {
    margin-top: 14px; border-radius: 12px;
    padding: 14px 17px; max-width: 66ch;
    background: var(--surface);
    border: 1px solid var(--border-default);
    border-inline-start: 2px solid var(--accent);
  }
  .mw-why-q {
    font-size: 13px; font-weight: 700; color: var(--foreground);
    display: flex; align-items: center; gap: 7px;
  }
  .mw-why-a {
    font-size: 13px; line-height: 2; color: var(--foreground-muted);
    margin: 7px 0 0;
  }

  /* ── بخش‌های عمومی ── */
  .mw-sec { padding-top: clamp(44px, 6vw, 76px); scroll-margin-top: 96px; }
  .mw-sec-n {
    font-family: var(--font-mono); font-size: 11px;
    letter-spacing: .14em; color: var(--accent); display: block;
  }
  .mw-h2 {
    font-weight: 700; font-size: clamp(21px, 2.9vw, 30px);
    letter-spacing: -.025em; margin: 9px 0 0; line-height: 1.3;
  }
  .mw-intro {
    font-size: 14.5px; line-height: 2.05; color: var(--foreground-muted);
    margin: 14px 0 0; max-width: 66ch;
  }

  /* ── ارجاع به صفحه‌ی علمی ── */
  .mw-crossref {
    margin-top: 26px; border-radius: 14px;
    padding: clamp(18px, 2.6vw, 26px);
    background: var(--surface);
    border: 1px solid var(--border-accent);
    display: flex; align-items: center; justify-content: space-between;
    gap: 18px; flex-wrap: wrap;
  }
  .mw-crossref h3 { margin: 0; font-size: 15.5px; font-weight: 700; }
  .mw-crossref p {
    margin: 8px 0 0; font-size: 13.5px; line-height: 1.95;
    color: var(--foreground-muted); max-width: 56ch;
  }

  /* ── فراخوان ── */
  .mw-cta {
    margin-top: clamp(44px, 6vw, 80px); text-align: center;
    border-radius: 18px; padding: clamp(28px, 4.5vw, 48px) 24px;
    background: var(--background-elevated);
    border: 1px solid var(--border-default);
  }
  .mw-cta h2 {
    margin: 0; font-size: clamp(20px, 2.8vw, 28px);
    font-weight: 700; letter-spacing: -.025em;
  }
  .mw-cta p {
    margin: 12px auto 0; max-width: 52ch;
    font-size: 14px; line-height: 2; color: var(--foreground-muted);
  }
  .mw-row {
    display: flex; gap: 10px; justify-content: center;
    margin-top: 22px; flex-wrap: wrap;
  }
  .mw-btn {
    font-family: inherit; font-size: 14px; font-weight: 600;
    padding: 0 22px; height: 44px;
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 100px; cursor: pointer; text-decoration: none;
    white-space: nowrap;
    transition: transform .18s cubic-bezier(.22,1,.36,1), box-shadow .18s ease, background .18s ease;
  }
  .mw-btn.primary {
    background: var(--accent); color: #fff; border: 1px solid var(--accent);
  }
  .mw-btn.ghost {
    background: transparent; color: var(--foreground);
    border: 1px solid var(--border-hover);
  }
  @media (hover: hover) and (pointer: fine) {
    .mw-btn.primary:hover { transform: translateY(-1px); box-shadow: 0 8px 22px var(--accent-glow); }
    .mw-btn.ghost:hover { background: var(--surface); }
  }

  @media (max-width: 900px) {
    .mw-layout { grid-template-columns: 1fr; gap: 0; }
    .mw-toc { display: none; }
  }
  @media (max-width: 520px) {
    .mw-stage { padding-inline-start: 40px; }
    .mw-track::before, .mw-fill { inset-inline-start: 11px; }
    .mw-dot { inset-inline-start: 4px; width: 16px; height: 16px; }
    .mw-detail-r { flex-direction: column; align-items: flex-start; gap: 4px; }
    .mw-detail-v { max-width: 100%; }
    .mw-crossref { flex-direction: column; align-items: flex-start; }
  }
  @media (prefers-reduced-motion: reduce) {
    .mw-fill, .mw-dot, .mw-n, .mw-btn {
      transition-duration: .01ms;
    }
  }
`;
