"use client";

import { useId } from "react";

interface PasswordLampProps {
  /** روشن = رمز عبور دیده می‌شود */
  on: boolean;
  onToggle: () => void;
}

/**
 * چراغ آویز کنار فیلد رمز عبور.
 *
 * استعاره: نور = دیده‌شدن.
 *   • چراغ روشن  → رمز عبور نمایان است
 *   • چراغ خاموش → رمز عبور پنهان (نقطه‌چین)
 *
 * با کلیک روی خودِ چراغ یا کشیدن زنجیر، لامپ تاب می‌خورد و خاموش/روشن می‌شود.
 */
export default function PasswordLamp({ on, onToggle }: PasswordLampProps) {
  const uid = useId().replace(/:/g, "");
  const glow = `glow-${uid}`;
  const cone = `cone-${uid}`;
  const shade = `shade-${uid}`;
  const bulb = `bulb-${uid}`;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`k2-lamp ${on ? "on" : "off"}`}
      aria-pressed={on}
      aria-label={on ? "خاموش کردن چراغ و پنهان کردن رمز عبور" : "روشن کردن چراغ و نمایش رمز عبور"}
      title={on ? "خاموش کن — رمز پنهان شود" : "روشن کن — رمز را ببین"}
    >
      <svg viewBox="0 0 64 108" width="46" height="78" fill="none" aria-hidden="true">
        <defs>
          {/* هاله نور دور لامپ */}
          <radialGradient id={glow}>
            <stop offset="0%" stopColor="#fde68a" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#fbbf24" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>

          {/* مخروط نوری که به سمت فیلد می‌تابد */}
          <linearGradient id={cone} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde68a" stopOpacity="0.5" />
            <stop offset="55%" stopColor="#fbbf24" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>

          {/* بدنه فلزی آباژور */}
          <linearGradient id={shade} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4c5160" />
            <stop offset="42%" stopColor="#8a90a3" />
            <stop offset="100%" stopColor="#3a3f4d" />
          </linearGradient>

          <radialGradient id={bulb}>
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="60%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </radialGradient>
        </defs>

        {/* سقف */}
        <rect x="24" y="0" width="16" height="3" rx="1.5" fill="#2a2d36" />

        {/* گروه متحرک: سیم + آباژور + لامپ (تاب می‌خورد) */}
        <g className="k2-lamp-swing">
          {/* سیم */}
          <line x1="32" y1="2" x2="32" y2="26" stroke="#3f4453" strokeWidth="1.6" />

          {/* مخروط نور */}
          <path className="k2-lamp-cone" d="M14 49 L50 49 L64 108 L0 108 Z" fill={`url(#${cone})`} />

          {/* هاله */}
          <circle className="k2-lamp-halo" cx="32" cy="52" r="26" fill={`url(#${glow})`} />

          {/* کاسه آباژور */}
          <path
            d="M22 27 Q32 24 42 27 L50 47 Q32 51 14 47 Z"
            fill={`url(#${shade})`}
            stroke="#252932"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          {/* لبه داخلی روشن */}
          <path
            className="k2-lamp-rim"
            d="M14 47 Q32 51 50 47 Q32 44 14 47 Z"
            fill="#fde68a"
          />
          {/* بازتاب روی بدنه */}
          <path d="M25 28 Q27 37 24 46" stroke="rgba(255,255,255,0.22)" strokeWidth="1.4" strokeLinecap="round" fill="none" />

          {/* حباب خاموش (شیشه مات) — همیشه هست */}
          <circle cx="32" cy="52" r="6.5" fill="#2f333e" stroke="#454b59" strokeWidth="0.8" />
          {/* لامپ روشن — روی حباب محو می‌شود */}
          <circle className="k2-lamp-bulb" cx="32" cy="52" r="6.5" fill={`url(#${bulb})`} />
          {/* رشته داخل لامپ */}
          <path
            className="k2-lamp-filament"
            d="M29.5 52.5 q1.3 -2.6 2.5 0 q1.2 2.6 2.5 0"
            stroke="#b45309"
            strokeWidth="1"
            strokeLinecap="round"
            fill="none"
          />

          {/* زنجیر کشویی */}
          <g className="k2-lamp-chain">
            <line x1="47" y1="42" x2="47" y2="60" stroke="#5a6070" strokeWidth="1.3" />
            <circle cx="47" cy="63" r="2.6" fill="#8a90a3" stroke="#3a3f4d" strokeWidth="0.8" />
          </g>
        </g>
      </svg>
    </button>
  );
}
