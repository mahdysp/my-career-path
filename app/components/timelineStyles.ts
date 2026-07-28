/**
 * استایل بخش «چه وقتی برای این تصمیم درست است؟».
 *
 * موضوعی که هیچ‌جای دیگر سایت پوشش داده نشده: علاقه‌های شغلی با گذر
 * زمان تثبیت می‌شوند، و بحرانی‌ترین بازه دقیقاً همان سنی است که بیشتر
 * مردم باید تصمیم بگیرند.
 *
 * گرافیک: نموداری با ستون‌های منحنی که ارتفاعشان از داده‌ی واقعی
 * پژوهش می‌آید، به‌علاوه‌ی یک منحنی روان که از نوکشان می‌گذرد.
 */
export const timelineStyles = `
  .tl {
    max-width: 1080px;
    margin: 0 auto;
    padding: clamp(56px, 8vw, 108px) clamp(16px, 4vw, 40px);
  }

  .tl-head { text-align: center; max-width: 60ch; margin: 0 auto; }
  .tl-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--font-mono); font-size: 11px;
    letter-spacing: .18em; color: var(--accent);
  }
  .tl-tri {
    width: 0; height: 0;
    border-left: 4.5px solid transparent;
    border-right: 4.5px solid transparent;
    border-bottom: 7px solid var(--accent);
  }
  .tl-title {
    font-weight: 700; font-size: clamp(27px, 4.4vw, 46px);
    letter-spacing: -.033em; color: var(--foreground);
    margin: 16px 0 0; line-height: 1.2;
  }
  .tl-lede {
    font-size: clamp(14px, 1.6vw, 16px); line-height: 2;
    color: var(--foreground-muted); margin: 16px auto 0;
  }

  /* ── نمودار ── */
  .tl-chart {
    position: relative;
    margin-top: clamp(34px, 5vw, 60px);
    padding: clamp(18px, 2.6vw, 30px) clamp(14px, 2.2vw, 26px) 0;
    border-radius: 20px;
    background: var(--background-elevated);
    border: 1px solid var(--border-default);
    box-shadow: var(--card-shadow);
  }

  /* محور و خطوط راهنما */
  .tl-grid {
    position: absolute; inset-inline: clamp(14px, 2.2vw, 26px);
    top: clamp(18px, 2.6vw, 30px);
    height: var(--tl-h);
    pointer-events: none;
  }
  .tl-grid i {
    position: absolute; inset-inline: 0; height: 1px;
    background: var(--grid-line);
  }
  .tl-grid b {
    position: absolute; inset-inline-start: 0;
    transform: translateY(-50%);
    font-family: var(--font-mono); font-size: 9.5px;
    color: var(--foreground-subtle);
    background: var(--background-elevated);
    padding-inline-end: 6px;
  }

  .tl-bars {
    position: relative;
    display: grid;
    grid-template-columns: repeat(var(--tl-n), minmax(0, 1fr));
    gap: clamp(6px, 1.2vw, 14px);
    height: var(--tl-h);
    align-items: end;
  }

  .tl-col {
    position: relative;
    display: flex; flex-direction: column; justify-content: flex-end;
    height: 100%;
    cursor: default;
  }

  /* ستون — از پایین رشد می‌کند */
  .tl-bar {
    position: relative;
    border-radius: 12px 12px 4px 4px;
    background: linear-gradient(
      to top,
      color-mix(in srgb, var(--tl-hue) 26%, transparent),
      color-mix(in srgb, var(--tl-hue) 72%, transparent)
    );
    border: 1px solid color-mix(in srgb, var(--tl-hue) 55%, transparent);
    border-bottom: 0;
    height: 0;
    transition: height .8s cubic-bezier(.22,1,.36,1);
  }
  /* ستون نقطه‌ی عطف پررنگ‌تر و درخشان است */
  .tl-col.peak .tl-bar {
    background: linear-gradient(
      to top,
      color-mix(in srgb, var(--tl-hue) 34%, transparent),
      var(--tl-hue)
    );
    border-color: var(--tl-hue);
    box-shadow: 0 0 26px -4px color-mix(in srgb, var(--tl-hue) 60%, transparent);
  }

  /* عدد بالای ستون */
  .tl-val {
    position: absolute; inset-inline: 0; top: -22px;
    font-family: var(--font-mono); font-size: 11px; font-weight: 700;
    color: var(--tl-hue); text-align: center;
    opacity: 0; transform: translateY(6px);
    transition: opacity .4s ease .35s, transform .5s cubic-bezier(.22,1,.36,1) .35s;
  }
  .tl-col.on .tl-val { opacity: 1; transform: translateY(0); }

  /* نشان نقطه‌ی عطف */
  .tl-flag {
    position: absolute; inset-inline: 0; top: -48px;
    display: flex; justify-content: center;
    opacity: 0; transform: translateY(8px) scale(.9);
    transition: opacity .45s ease .5s, transform .55s cubic-bezier(.34,1.56,.64,1) .5s;
  }
  .tl-col.on.peak .tl-flag { opacity: 1; transform: translateY(0) scale(1); }
  .tl-flag span {
    font-family: var(--font-mono); font-size: 9.5px; letter-spacing: .06em;
    white-space: nowrap;
    padding: 4px 9px; border-radius: 100px;
    background: var(--tl-hue); color: var(--background-deep);
    font-weight: 700;
  }

  /* برچسب سنی زیر ستون */
  .tl-age {
    margin-top: 10px; text-align: center;
    font-family: var(--font-mono); font-size: 11.5px;
    color: var(--foreground-muted);
    opacity: 0; transform: translateY(6px);
    transition: opacity .4s ease .2s, transform .45s cubic-bezier(.22,1,.36,1) .2s;
  }
  .tl-col.on .tl-age { opacity: 1; transform: translateY(0); }
  .tl-col.peak .tl-age { color: var(--foreground); font-weight: 700; }

  .tl-axis {
    display: grid;
    grid-template-columns: repeat(var(--tl-n), minmax(0, 1fr));
    gap: clamp(6px, 1.2vw, 14px);
    padding-bottom: 14px;
    border-top: 1px solid var(--border-default);
    padding-top: 12px;
    margin-top: 4px;
  }
  .tl-axis-note {
    text-align: center;
    font-family: var(--font-mono); font-size: 9.5px;
    letter-spacing: .1em; color: var(--foreground-subtle);
    padding: 0 0 14px;
  }

  /* ── کارت‌های توضیح ── */
  .tl-cards {
    display: grid; gap: clamp(9px, 1.4vw, 13px);
    grid-template-columns: repeat(auto-fit, minmax(184px, 1fr));
    margin-top: clamp(18px, 2.6vw, 26px);
  }
  .tl-card {
    padding: 15px 17px;
    border-radius: 14px;
    background: var(--background-elevated);
    border: 1px solid var(--border-default);
    border-top: 2px solid var(--tl-hue);
    opacity: 0; transform: translateY(12px);
    transition: opacity .5s ease, transform .55s cubic-bezier(.22,1,.36,1);
  }
  .tl-card.on { opacity: 1; transform: translateY(0); }
  .tl-card.peak {
    border-color: var(--border-accent);
    border-top-color: var(--tl-hue);
    box-shadow: var(--card-shadow);
  }
  .tl-card-age {
    font-family: var(--font-mono); font-size: 10px;
    letter-spacing: .08em; color: var(--tl-hue);
  }
  .tl-card-t {
    font-size: 14px; font-weight: 700; color: var(--foreground);
    margin: 6px 0 0; line-height: 1.4;
  }
  .tl-card-b {
    font-size: 12.5px; line-height: 1.9;
    color: var(--foreground-muted); margin: 7px 0 0;
  }

  /* ── جمع‌بندی ── */
  .tl-foot {
    margin-top: clamp(20px, 3vw, 30px);
    border-radius: 16px;
    padding: clamp(18px, 2.6vw, 26px);
    background: var(--surface);
    border: 1px solid var(--border-accent);
    display: flex; align-items: flex-start; gap: 14px;
    opacity: 0; transform: translateY(12px);
    transition: opacity .55s ease, transform .6s cubic-bezier(.22,1,.36,1);
  }
  .tl-foot.on { opacity: 1; transform: translateY(0); }
  .tl-foot-ico {
    flex: 0 0 auto;
    width: 38px; height: 38px; border-radius: 11px;
    display: flex; align-items: center; justify-content: center;
    background: color-mix(in srgb, var(--accent) 16%, transparent);
    border: 1px solid var(--border-accent);
    color: var(--accent);
  }
  .tl-foot p {
    margin: 0; font-size: 13.5px; line-height: 2;
    color: var(--foreground-muted); max-width: 68ch;
  }
  .tl-src {
    display: inline-flex; align-items: center; gap: 6px;
    margin-top: 10px; font-size: 11.5px;
    color: var(--accent); text-decoration: none;
    font-family: var(--font-mono);
  }
  @media (hover: hover) and (pointer: fine) {
    .tl-src:hover { text-decoration: underline; }
  }

  @media (max-width: 720px) {
    .tl-val { font-size: 10px; top: -19px; }
    .tl-age { font-size: 10px; }
    .tl-flag { display: none; }
    .tl-foot { flex-direction: column; gap: 12px; }
  }
  @media (max-width: 460px) {
    .tl-age { font-size: 8.5px; letter-spacing: -.02em; }
    .tl-val { font-size: 9px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .tl-bar, .tl-val, .tl-age, .tl-flag, .tl-card, .tl-foot {
      transition-duration: .01ms;
    }
    .tl-val, .tl-age, .tl-card, .tl-foot { opacity: 1; transform: none; }
  }
`;
