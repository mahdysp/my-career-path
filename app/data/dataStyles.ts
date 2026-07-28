/**
 * استایل صفحه‌ی «داده و یکپارچگی».
 *
 * الگو از مرجع طراحی: دو ستون — تصویر بزرگ چسبان در یک سمت و فهرست
 * موارد در سمت دیگر که با اسکرول خوانده می‌شوند. روی موبایل تصویر بالا
 * می‌رود و فهرست زیرش می‌آید.
 */
export const dataStyles = `
  .dt {
    max-width: 1180px;
    margin: 0 auto;
    padding: 0 clamp(16px, 4vw, 40px) clamp(72px, 10vw, 128px);
    color: var(--foreground);
  }

  /* ── سربرگ ── */
  .dt-hero { padding: clamp(34px, 6vw, 72px) 0 clamp(28px, 4vw, 48px); }
  .dt-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--font-mono); font-size: 11px;
    letter-spacing: .18em; color: var(--accent);
  }
  .dt-tri {
    width: 0; height: 0;
    border-left: 4.5px solid transparent;
    border-right: 4.5px solid transparent;
    border-bottom: 7px solid var(--accent);
  }
  .dt-h1 {
    font-weight: 700; font-size: clamp(30px, 5.2vw, 54px);
    letter-spacing: -.034em; line-height: 1.17;
    margin: 16px 0 0; max-width: 17ch;
  }
  .dt-lede {
    font-size: clamp(15px, 1.7vw, 17px); line-height: 2.05;
    color: var(--foreground-muted); margin: 20px 0 0; max-width: 60ch;
  }

  /* ── چیدمان دو ستونه ── */
  .dt-split {
    display: grid;
    grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
    gap: clamp(28px, 4.5vw, 64px);
    align-items: start;
  }

  /* ستون تصویر — چسبان می‌ماند تا هنگام خواندن فهرست در دید بماند */
  .dt-visual {
    position: sticky; top: 100px;
    aspect-ratio: 1 / 1;
    border-radius: 20px;
    overflow: hidden;
    background:
      radial-gradient(120% 90% at 30% 10%, var(--blob-1), transparent 60%),
      radial-gradient(100% 80% at 80% 90%, var(--blob-2), transparent 58%),
      var(--background-deep);
    border: 1px solid var(--border-default);
    display: flex; align-items: center; justify-content: center;
  }
  .dt-visual svg { width: 82%; height: auto; display: block; }

  /* ── فهرست موارد ── */
  .dt-item {
    padding: clamp(20px, 2.6vw, 28px) 0;
    border-bottom: 1px solid var(--border-default);
  }
  .dt-item:first-child { padding-top: 0; }
  .dt-item:last-child { border-bottom: 0; padding-bottom: 0; }

  .dt-item-t {
    font-weight: 700; font-size: clamp(18px, 2.3vw, 23px);
    letter-spacing: -.024em; margin: 0; line-height: 1.35;
  }
  .dt-item-b {
    font-size: 14px; line-height: 2.05; color: var(--foreground-muted);
    margin: 10px 0 0; max-width: 60ch;
  }
  .dt-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 13px; }
  .dt-tag {
    font-family: var(--font-mono); font-size: 10.5px;
    letter-spacing: .04em;
    padding: 4px 10px; border-radius: 100px;
    background: var(--surface); color: var(--foreground-subtle);
    border: 1px solid var(--border-default);
  }

  /* ── جعبه‌ی پایانی ── */
  .dt-note {
    margin-top: clamp(38px, 5.5vw, 64px);
    border-radius: 16px;
    padding: clamp(20px, 3vw, 30px);
    background: var(--surface);
    border: 1px solid var(--border-accent);
  }
  .dt-note h2 { margin: 0; font-size: 16px; font-weight: 700; }
  .dt-note p {
    margin: 11px 0 0; font-size: 13.5px; line-height: 2.05;
    color: var(--foreground-muted); max-width: 74ch;
  }
  .dt-note-row { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
  .dt-btn {
    font-family: inherit; font-size: 13.5px; font-weight: 600;
    padding: 0 20px; height: 42px;
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 100px; text-decoration: none; white-space: nowrap;
    transition: transform .18s cubic-bezier(.22,1,.36,1), background .18s ease;
  }
  .dt-btn.primary {
    background: var(--accent); color: #fff; border: 1px solid var(--accent);
  }
  .dt-btn.ghost {
    background: transparent; color: var(--foreground);
    border: 1px solid var(--border-hover);
  }
  @media (hover: hover) and (pointer: fine) {
    .dt-btn.primary:hover { transform: translateY(-1px); }
    .dt-btn.ghost:hover { background: var(--surface); }
  }

  @media (max-width: 880px) {
    .dt-split { grid-template-columns: 1fr; }
    .dt-visual {
      position: static;
      aspect-ratio: 16 / 10;
      max-height: 300px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .dt-btn { transition-duration: .01ms; }
  }
`;
