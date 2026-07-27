/**
 * استایل نوار بالای سایت.
 *
 * شکل: یک «قرص» شناور با گوشه‌های کاملاً گرد که از لبه‌ها فاصله دارد،
 * نه نواری که تمام عرض را می‌گیرد. منوهای بازشونده زیرش باز می‌شوند.
 *
 * رفتار: با اسکرول به پایین محو و بالا می‌رود، با اسکرول به بالا برمی‌گردد.
 */
export const navStyles = `
  .kn-wrap {
    position: fixed;
    top: 0; inset-inline: 0;
    z-index: 60;
    padding: clamp(10px, 1.6vw, 18px) clamp(12px, 3vw, 30px);
    pointer-events: none;
    transition: transform .38s cubic-bezier(.22,1,.36,1), opacity .28s ease;
  }
  .kn-wrap > * { pointer-events: auto; }

  /* پنهان‌شدن هنگام اسکرول به پایین */
  .kn-wrap.hidden {
    transform: translateY(calc(-100% - 10px));
    opacity: 0;
  }

  .kn-bar {
    max-width: 1240px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: clamp(10px, 2vw, 26px);
    height: 58px;
    padding: 0 8px 0 8px;
    border-radius: 100px;
    background: var(--nav-pill);
    border: 1px solid var(--nav-pill-edge);
    backdrop-filter: blur(18px) saturate(140%);
    -webkit-backdrop-filter: blur(18px) saturate(140%);
    box-shadow: var(--nav-pill-shadow);
    transition: background .25s ease, border-color .25s ease, box-shadow .25s ease;
    /* مرجع موقعیت برای منوی پهن */
    position: relative;
  }
  /* وقتی صفحه اسکرول شده، قرص کمی تیره‌تر و برجسته‌تر می‌شود */
  .kn-wrap.lifted .kn-bar { box-shadow: var(--nav-pill-shadow-lift); }

  /* ── نشان ── */
  .kn-brand {
    display: flex; align-items: center; gap: 9px;
    padding-inline: 14px;
    font-weight: 700; font-size: 18px; letter-spacing: -.02em;
    color: var(--foreground); text-decoration: none;
    flex: 0 0 auto;
  }
  .kn-mark {
    width: 22px; height: 22px; flex: 0 0 auto;
    color: var(--accent);
  }

  /* ── ناوبری میانی ── */
  .kn-nav { display: flex; align-items: center; gap: 2px; }

  /* منوهای باریک نسبت به دکمه‌ی خودشان جای می‌گیرند؛ منوی پهن نسبت به
     کل قرص. برای همین .kn-item حالت static دارد وقتی منوی پهن دارد. */
  .kn-item { position: relative; }
  .kn-item.has-wide { position: static; }

  .kn-trigger {
    display: inline-flex; align-items: center; gap: 5px;
    font-family: inherit; font-size: 14px; font-weight: 500;
    color: var(--foreground-muted);
    background: none; border: 0; cursor: pointer;
    padding: 9px 13px; border-radius: 100px;
    text-decoration: none; white-space: nowrap;
    transition: color .18s ease, background .18s ease;
  }
  .kn-trigger svg { transition: transform .24s cubic-bezier(.22,1,.36,1); opacity: .6; }
  .kn-item.open .kn-trigger { color: var(--foreground); background: var(--surface); }
  .kn-item.open .kn-trigger svg { transform: rotate(180deg); opacity: 1; }
  @media (hover: hover) and (pointer: fine) {
    .kn-trigger:hover { color: var(--foreground); background: var(--surface); }
  }

  /* ── منوی بازشونده ── */
  .kn-pop {
    position: absolute;
    top: calc(100% + 14px);
    inset-inline-start: 50%;
    transform: translateX(50%) translateY(-6px);
    min-width: min(320px, calc(100vw - 40px));
    padding: 8px;
    border-radius: 16px;
    background: var(--nav-pop);
    border: 1px solid var(--nav-pill-edge);
    box-shadow: var(--nav-pop-shadow);
    backdrop-filter: blur(18px) saturate(140%);
    -webkit-backdrop-filter: blur(18px) saturate(140%);
    opacity: 0; visibility: hidden;
    transition: opacity .2s ease, transform .28s cubic-bezier(.22,1,.36,1), visibility .2s;
  }
  /* در RTL، translateX مثبت به چپ می‌برد؛ برای وسط‌چین کردن باید معکوس شود */
  [dir="ltr"] .kn-pop { transform: translateX(-50%) translateY(-6px); }
  .kn-item.open .kn-pop {
    opacity: 1; visibility: visible;
    transform: translateX(50%) translateY(0);
  }
  [dir="ltr"] .kn-item.open .kn-pop { transform: translateX(-50%) translateY(0); }

  /* منوی پهن به خود قرص چسبیده، نه به دکمه.
     اگر روی دکمه وسط‌چین می‌شد، در نمایشگرهای کوچک از لبه بیرون می‌زد. */
  .kn-pop.wide {
    position: absolute;
    inset-inline: 0;
    inset-inline-start: 0;
    min-width: 0;
    padding: 10px;
    transform: translateY(-6px);
  }
  .kn-item.open .kn-pop.wide,
  [dir="ltr"] .kn-item.open .kn-pop.wide { transform: translateY(0); }
  [dir="ltr"] .kn-pop.wide { transform: translateY(-6px); }

  .kn-grid { display: grid; gap: 4px; }
  .kn-pop.wide .kn-grid { grid-template-columns: repeat(2, 1fr); }
  @media (min-width: 1080px) {
    .kn-pop.wide .kn-grid { grid-template-columns: repeat(4, 1fr); }
    .kn-pop.wide .kn-link { flex-direction: column; gap: 9px; }
  }

  .kn-link {
    display: flex; align-items: flex-start; gap: 11px;
    padding: 11px 12px; border-radius: 11px;
    text-decoration: none; color: inherit;
    background: none; border: 0; width: 100%;
    font-family: inherit; text-align: start; cursor: pointer;
    transition: background .16s ease;
  }
  @media (hover: hover) and (pointer: fine) {
    .kn-link:hover { background: var(--surface); }
  }
  .kn-ico {
    flex: 0 0 auto;
    width: 34px; height: 34px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    background: var(--nav-ico); color: var(--nav-ico-fg);
    transition: background .2s ease, color .2s ease, box-shadow .2s ease;
  }

  /* صفحه‌ی جاری: مربع آیکن رنگ لهجه می‌گیرد تا کاربر بداند کجاست */
  .kn-link.current .kn-ico {
    background: var(--accent);
    color: #fff;
    box-shadow: 0 4px 14px var(--accent-glow);
  }
  .kn-link.current .kn-txt b { color: var(--accent); }
  .kn-link.current { background: var(--surface); }
  .kn-txt b {
    display: block; font-size: 13.5px; font-weight: 600;
    color: var(--foreground); margin-bottom: 2px;
  }
  .kn-txt span {
    display: block; font-size: 11.5px; line-height: 1.75;
    color: var(--foreground-subtle);
  }

  /* ── سمت چپ: تم، ورود، ثبت‌نام ── */
  .kn-side { display: flex; align-items: center; gap: 7px; flex: 0 0 auto; }

  .kn-ghost {
    font-family: inherit; font-size: 13.5px; font-weight: 600;
    color: var(--foreground);
    padding: 0 17px; height: 38px;
    display: inline-flex; align-items: center;
    border-radius: 100px; cursor: pointer;
    background: transparent;
    border: 1px solid var(--nav-pill-edge);
    white-space: nowrap;
    transition: background .18s ease, border-color .18s ease;
  }
  @media (hover: hover) and (pointer: fine) {
    .kn-ghost:hover { background: var(--surface); border-color: var(--border-hover); }
  }

  .kn-cta {
    font-family: inherit; font-size: 13.5px; font-weight: 600;
    padding: 0 19px; height: 38px;
    display: inline-flex; align-items: center;
    border-radius: 100px; cursor: pointer;
    background: var(--nav-cta); color: var(--nav-cta-fg);
    border: 1px solid transparent;
    white-space: nowrap;
    transition: transform .18s cubic-bezier(.22,1,.36,1), box-shadow .18s ease, opacity .18s ease;
  }
  @media (hover: hover) and (pointer: fine) {
    .kn-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 18px var(--accent-glow); }
  }
  .kn-cta:active { transform: translateY(0); }

  /* دکمه‌ی تم داخل قرص */
  .kn-side .k2-theme-toggle,
  .kn-side button[aria-label*="تم"] {
    border-radius: 100px;
  }

  /* جای‌گیر تا وضعیت ورود مشخص شود — از پرش چیدمان جلوگیری می‌کند */
  .kn-skel {
    display: inline-block; width: 152px; height: 38px;
    border-radius: 100px; background: var(--surface);
  }
  @media (max-width: 940px) { .kn-skel { display: none; } }

  /* ── همبرگر ── */
  .kn-burger {
    display: none;
    width: 38px; height: 38px;
    align-items: center; justify-content: center;
    border-radius: 100px; cursor: pointer;
    background: transparent; color: var(--foreground);
    border: 1px solid var(--nav-pill-edge);
  }
  .kn-burger span {
    position: relative; display: block;
    width: 15px; height: 1.6px; border-radius: 2px;
    background: currentColor;
    transition: transform .28s cubic-bezier(.22,1,.36,1), opacity .18s ease;
  }
  .kn-burger span::before, .kn-burger span::after {
    content: ""; position: absolute; inset-inline-start: 0;
    width: 15px; height: 1.6px; border-radius: 2px;
    background: currentColor;
    transition: transform .28s cubic-bezier(.22,1,.36,1);
  }
  .kn-burger span::before { top: -5px; }
  .kn-burger span::after  { top: 5px; }
  .kn-burger.on span { background: transparent; }
  .kn-burger.on span::before { transform: translateY(5px) rotate(45deg); }
  .kn-burger.on span::after  { transform: translateY(-5px) rotate(-45deg); }

  /* ── کشوی موبایل ── */
  .kn-sheet {
    max-width: 1240px; margin: 8px auto 0;
    border-radius: 20px;
    background: var(--nav-pop);
    border: 1px solid var(--nav-pill-edge);
    box-shadow: var(--nav-pop-shadow);
    backdrop-filter: blur(18px) saturate(140%);
    -webkit-backdrop-filter: blur(18px) saturate(140%);
    overflow: hidden;
    max-height: 0; opacity: 0;
    transition: max-height .34s cubic-bezier(.22,1,.36,1), opacity .22s ease;
  }
  .kn-sheet.open { max-height: min(74vh, 620px); opacity: 1; overflow-y: auto; }
  .kn-sheet-in { padding: 10px; }

  .kn-group + .kn-group { margin-top: 4px; }
  .kn-group-t {
    font-family: var(--font-mono); font-size: 10px;
    letter-spacing: .12em; color: var(--foreground-subtle);
    padding: 12px 12px 6px;
  }
  .kn-sheet-actions {
    display: grid; gap: 7px; padding: 10px 6px 4px;
    border-top: 1px solid var(--border-default); margin-top: 8px;
  }
  .kn-sheet-actions .kn-ghost,
  .kn-sheet-actions .kn-cta { width: 100%; justify-content: center; height: 44px; }

  /* پرده‌ی پشت منو روی موبایل */
  .kn-scrim {
    position: fixed; inset: 0; z-index: -1;
    background: var(--overlay);
    opacity: 0; visibility: hidden;
    transition: opacity .26s ease, visibility .26s;
  }
  .kn-scrim.on { opacity: 1; visibility: visible; }

  /* فاصله‌ی محتوا از نوار شناور */
  .kn-spacer { height: calc(58px + clamp(20px, 3.2vw, 36px)); }

  @media (max-width: 940px) {
    .kn-nav, .kn-side .kn-ghost, .kn-side .kn-cta { display: none; }
    .kn-burger { display: inline-flex; }
    .kn-bar { height: 54px; }
    .kn-spacer { height: calc(54px + clamp(20px, 3.2vw, 36px)); }
  }
  @media (min-width: 941px) {
    .kn-sheet { display: none; }
  }
  @media (max-width: 420px) {
    .kn-brand { font-size: 16px; padding-inline: 10px; }
    .kn-bar { padding-inline: 6px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .kn-wrap, .kn-pop, .kn-sheet, .kn-cta, .kn-burger span,
    .kn-burger span::before, .kn-burger span::after {
      transition-duration: .01ms;
    }
  }
`;
