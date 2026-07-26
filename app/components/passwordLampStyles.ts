/**
 * استایل مشترک چراغ آویز رمز عبور — در /auth و /register استفاده می‌شود.
 * به‌صورت رشته export می‌شود تا داخل <style> همان صفحات تزریق شود
 * و با بقیه استایل‌های k2 یکجا بماند.
 */
export const passwordLampStyles = `
  @keyframes k2LampSwing {
    0%   { transform: rotate(0deg); }
    22%  { transform: rotate(7deg); }
    45%  { transform: rotate(-5deg); }
    68%  { transform: rotate(3deg); }
    85%  { transform: rotate(-1.5deg); }
    100% { transform: rotate(0deg); }
  }
  @keyframes k2LampIdle {
    0%, 100% { transform: rotate(-1.2deg); }
    50%      { transform: rotate(1.2deg); }
  }
  @keyframes k2LampFlicker {
    0%   { opacity: 0.25; }
    12%  { opacity: 0.9; }
    20%  { opacity: 0.35; }
    32%  { opacity: 1; }
    100% { opacity: 1; }
  }
  @keyframes k2ChainPull {
    0%, 100% { transform: translateY(0); }
    40%      { transform: translateY(5px); }
  }

  .k2-lamp {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    line-height: 0;
    flex-shrink: 0;
    align-self: flex-start;
    border-radius: 10px;
    transition: filter 0.3s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .k2-lamp:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--background-base), 0 0 0 4px var(--accent);
  }

  /* سیم و آباژور: تاب آرام همیشگی، تاب تند هنگام کلیک */
  .k2-lamp-swing {
    transform-origin: 32px 2px;
    animation: k2LampIdle 5.5s ease-in-out infinite;
  }
  .k2-lamp:active .k2-lamp-swing,
  .k2-lamp:hover .k2-lamp-swing {
    animation: k2LampSwing 1.5s cubic-bezier(0.36,0,0.15,1);
  }
  .k2-lamp:hover .k2-lamp-chain { animation: k2ChainPull 0.5s ease; }

  /* ── حالت روشن ── */
  .k2-lamp.on { filter: drop-shadow(0 0 14px rgba(251,191,36,0.32)); }
  .k2-lamp.on .k2-lamp-bulb     { opacity: 1;   animation: k2LampFlicker 0.45s ease-out; }
  .k2-lamp.on .k2-lamp-halo     { opacity: 1;   animation: k2LampFlicker 0.45s ease-out; }
  .k2-lamp.on .k2-lamp-cone     { opacity: 1;   animation: k2LampFlicker 0.45s ease-out; }
  .k2-lamp.on .k2-lamp-rim      { opacity: 0.95; }
  .k2-lamp.on .k2-lamp-filament { stroke: #fff7ed; }

  /* ── حالت خاموش ── */
  .k2-lamp.off .k2-lamp-bulb     { opacity: 0; }
  .k2-lamp.off .k2-lamp-halo     { opacity: 0; }
  .k2-lamp.off .k2-lamp-cone     { opacity: 0; }
  .k2-lamp.off .k2-lamp-rim      { opacity: 0.12; }
  .k2-lamp.off .k2-lamp-filament { stroke: #4b5160; }

  .k2-lamp-bulb, .k2-lamp-halo, .k2-lamp-cone, .k2-lamp-rim {
    transition: opacity 0.32s ease;
  }
  .k2-lamp-filament { transition: stroke 0.32s ease; }

  /* فیلد رمز وقتی نور رویش می‌تابد گرم‌تر می‌شود */
  .k2-input-wrap.lit {
    border-color: rgba(251,191,36,0.4);
    background: rgba(251,191,36,0.05);
    box-shadow: 0 0 0 3px rgba(251,191,36,0.08);
  }
  .k2-input-wrap.lit svg.lead { color: #fbbf24; }

  /* ردیف چراغ + فیلد */
  .k2-pass-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
  .k2-pass-row > .k2-field { flex: 1; min-width: 0; }

  @media (prefers-reduced-motion: reduce) {
    .k2-lamp-swing,
    .k2-lamp:hover .k2-lamp-swing,
    .k2-lamp:active .k2-lamp-swing,
    .k2-lamp:hover .k2-lamp-chain { animation: none; }
    .k2-lamp.on .k2-lamp-bulb,
    .k2-lamp.on .k2-lamp-halo,
    .k2-lamp.on .k2-lamp-cone { animation: none; }
  }
`;
