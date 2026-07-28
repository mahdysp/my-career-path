/**
 * استایل بخش «به‌جای این‌همه حدس، یک نقشه».
 *
 * درس‌های نسخه‌ی قبل که بد شد:
 *   • کارت‌ها ۲.۳:۱ پهن بودند و مثل نوار تخت دیده می‌شدند — حالا مربع‌اند.
 *   • `opacity` روی کل کارت اعمال می‌شد، پس ضربدر قرمز هم محو می‌شد
 *     (کنتراست ۲.۷). حالا فقط محتوای داخل کم‌رنگ می‌شود، نه نشانه.
 *   • `grayscale` همه‌چیز را مرده می‌کرد. حالا رنگ حفظ می‌شود و فقط
 *     یک خط روی برچسب کشیده می‌شود.
 *   • کارت نتیجه یک مستطیل خالی و بی‌روح بود — حالا برجسته و متمرکز است.
 */
export const clutterStyles = `
  .cl {
    max-width: 880px;
    margin: 0 auto;
    padding: clamp(56px, 8vw, 108px) clamp(16px, 4vw, 40px);
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
    margin: 16px auto 0; max-width: 52ch;
  }

  /* ── شبکه‌ی موارد ── */
  .cl-grid {
    display: grid; gap: clamp(9px, 1.4vw, 14px);
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-top: clamp(32px, 5vw, 56px);
  }

  .cl-item {
    position: relative;
    /* مربع تا مثل «کاشی» دیده شود نه نوار */
    aspect-ratio: 1 / 1;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 12px;
    padding: 14px 12px;
    border-radius: 16px;
    background: var(--background-elevated);
    border: 1px solid var(--border-default);
    transform: translateY(14px) scale(.94);
    opacity: 0;
    transition:
      opacity .45s ease,
      transform .55s cubic-bezier(.22,1,.36,1),
      border-color .45s ease,
      background .45s ease;
  }
  .cl-item.in { opacity: 1; transform: translateY(0) scale(1); }

  /* حالت حذف‌شده: کارت فرو می‌رود و کم‌جان می‌شود، ولی
     opacity روی کل کارت اعمال نمی‌شود تا ضربدر واضح بماند. */
  .cl-item.out {
    transform: scale(.97);
    border-color: color-mix(in srgb, var(--danger) 26%, var(--border-default));
    background: color-mix(in srgb, var(--danger) 5%, var(--background-elevated));
  }

  .cl-ico {
    width: 46px; height: 46px; border-radius: 13px;
    display: flex; align-items: center; justify-content: center;
    background: var(--surface);
    border: 1px solid var(--border-default);
    color: var(--foreground-muted);
    transition: color .45s ease, opacity .45s ease, transform .45s ease;
  }
  /* فقط محتوا کم‌رنگ می‌شود، نه نشانه‌ی حذف */
  .cl-item.out .cl-ico { opacity: .45; transform: scale(.94); }

  .cl-label {
    position: relative;
    font-size: 12.5px; line-height: 1.65;
    color: var(--foreground-muted);
    transition: color .45s ease;
  }
  .cl-item.out .cl-label { color: var(--foreground-subtle); }

  /* خط روی برچسب — از وسط کشیده می‌شود */
  .cl-label::after {
    content: "";
    position: absolute; inset-inline: -3px; top: 52%;
    height: 1.5px; border-radius: 2px;
    background: var(--danger);
    transform: scaleX(0);
    transform-origin: center;
    transition: transform .45s cubic-bezier(.22,1,.36,1) .1s;
  }
  .cl-item.out .cl-label::after { transform: scaleX(1); }

  /* نشانه‌ی حذف — همیشه پررنگ و خوانا */
  .cl-x {
    position: absolute; top: 9px; inset-inline-end: 9px;
    width: 22px; height: 22px; border-radius: 100px;
    display: flex; align-items: center; justify-content: center;
    background: var(--danger);
    color: var(--background-deep);
    opacity: 0; transform: scale(0) rotate(-90deg);
    transition:
      opacity .28s ease,
      transform .45s cubic-bezier(.34,1.56,.64,1);
  }
  .cl-item.out .cl-x { opacity: 1; transform: scale(1) rotate(0); }

  /* ── گذار ── */
  .cl-bridge {
    display: flex; flex-direction: column; align-items: center;
    gap: 8px; margin-top: clamp(24px, 3.6vw, 38px);
    opacity: 0; transform: translateY(-10px);
    transition: opacity .5s ease, transform .6s cubic-bezier(.22,1,.36,1);
  }
  .cl-bridge.on { opacity: 1; transform: translateY(0); }
  .cl-bridge-line {
    width: 1.5px; height: clamp(20px, 3vw, 32px);
    background: linear-gradient(
      to bottom,
      transparent,
      var(--accent)
    );
  }
  .cl-bridge-dot {
    width: 8px; height: 8px; border-radius: 100px;
    background: var(--accent);
    box-shadow: 0 0 0 5px var(--accent-glow);
  }

  /* ── کارت نتیجه ── */
  .cl-result {
    position: relative;
    margin-top: clamp(18px, 2.6vw, 26px);
    border-radius: 20px;
    padding: clamp(26px, 4vw, 40px) clamp(20px, 3.2vw, 36px);
    background: var(--card-solid);
    border: 1px solid var(--border-accent);
    box-shadow: var(--card-shadow-hover);
    overflow: hidden;
    opacity: 0; transform: translateY(18px) scale(.97);
    transition: opacity .6s ease, transform .7s cubic-bezier(.22,1,.36,1);
  }
  .cl-result.on { opacity: 1; transform: translateY(0) scale(1); }

  /* درخشش ملایم پشت کارت نتیجه تا از کاشی‌های بالا متمایز شود */
  .cl-result::before {
    content: "";
    position: absolute; inset: -40% 20% auto;
    height: 180px;
    background: radial-gradient(
      ellipse at center,
      var(--accent-glow),
      transparent 70%
    );
    pointer-events: none;
  }
  .cl-result > * { position: relative; }

  .cl-result-ico {
    width: 56px; height: 56px; border-radius: 16px;
    margin: 0 auto;
    display: flex; align-items: center; justify-content: center;
    background: color-mix(in srgb, var(--accent) 18%, transparent);
    border: 1px solid var(--border-accent);
    color: var(--accent);
  }
  .cl-result-t {
    font-weight: 700; font-size: clamp(18px, 2.5vw, 24px);
    letter-spacing: -.026em; color: var(--foreground);
    margin: 16px 0 0;
  }
  .cl-result-b {
    font-size: 13.5px; line-height: 2; color: var(--foreground-muted);
    margin: 10px auto 0; max-width: 50ch;
  }

  @media (max-width: 620px) {
    .cl-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .cl-label { font-size: 11.5px; }
    .cl-ico { width: 40px; height: 40px; border-radius: 11px; }
    .cl-x { width: 20px; height: 20px; top: 7px; inset-inline-end: 7px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .cl-item, .cl-x, .cl-bridge, .cl-result, .cl-label::after, .cl-ico {
      transition-duration: .01ms;
    }
    .cl-item, .cl-bridge, .cl-result { opacity: 1; transform: none; }
  }
`;
