/**
 * استایل بخش «پشتوانه» روی صفحه‌ی اصلی.
 *
 * الگو از مرجع طراحی: تصویر بزرگ در یک سمت، فهرست موارد با خط جداکننده
 * در سمت دیگر. تفاوتش با صفحه‌ی /data این است که اینجا خلاصه است و
 * تصویر ثابت می‌ماند (نه چسبان)، چون بخش کوتاه‌تر است.
 */
export const pillarsStyles = `
  .pl {
    max-width: 1240px;
    margin: 0 auto;
    padding: clamp(64px, 9vw, 120px) clamp(16px, 4vw, 40px);
  }

  .pl-head { margin-bottom: clamp(28px, 4.5vw, 52px); }
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
    font-weight: 700; font-size: clamp(28px, 4.4vw, 46px);
    letter-spacing: -.032em; color: var(--foreground);
    margin: 16px 0 0; line-height: 1.2; max-width: 16ch;
  }

  /* ── دو ستون ── */
  .pl-split {
    display: grid;
    grid-template-columns: minmax(0, 0.86fr) minmax(0, 1.14fr);
    gap: clamp(28px, 4.5vw, 68px);
    align-items: start;
  }

  .pl-visual {
    aspect-ratio: 1 / 1;
    border-radius: 20px;
    overflow: hidden;
    position: relative;
    background:
      radial-gradient(130% 100% at 28% 8%, var(--blob-1), transparent 58%),
      radial-gradient(110% 90% at 82% 96%, var(--blob-2), transparent 56%),
      var(--background-deep);
    border: 1px solid var(--border-default);
    display: flex; align-items: center; justify-content: center;
  }
  .pl-visual svg { width: 86%; height: auto; display: block; }

  /* ── موارد ── */
  .pl-item {
    padding: clamp(20px, 2.6vw, 30px) 0;
    border-bottom: 1px solid var(--border-default);
  }
  .pl-item:first-child { padding-top: 0; }
  .pl-item:last-child { border-bottom: 0; }

  .pl-item-t {
    font-weight: 700; font-size: clamp(18px, 2.3vw, 24px);
    letter-spacing: -.026em; margin: 0; line-height: 1.35;
    color: var(--foreground);
  }
  .pl-item-b {
    font-size: 14px; line-height: 2.05; color: var(--foreground-muted);
    margin: 10px 0 0; max-width: 58ch;
  }
  .pl-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 13px; }
  .pl-tag {
    font-family: var(--font-mono); font-size: 10.5px; letter-spacing: .04em;
    padding: 4px 10px; border-radius: 100px;
    background: var(--surface); color: var(--foreground-subtle);
    border: 1px solid var(--border-default);
  }

  .pl-cta {
    display: inline-flex; align-items: center; gap: 7px;
    margin-top: clamp(20px, 3vw, 30px);
    font-size: 14px; font-weight: 600; color: var(--accent);
    text-decoration: none;
    transition: gap .18s cubic-bezier(.22,1,.36,1);
  }
  .pl-cta::after { content: "←"; font-size: 15px; }
  @media (hover: hover) and (pointer: fine) {
    .pl-cta:hover { gap: 11px; }
  }

  @media (max-width: 880px) {
    .pl-split { grid-template-columns: 1fr; }
    .pl-visual { aspect-ratio: 16 / 10; max-height: 280px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .pl-cta { transition-duration: .01ms; }
  }
`;
