/**
 * استایل مشترک پنل مدیریت.
 *
 * جدا از صفحه‌ی اصلی نگه داشته شده چون پنل یک زبان بصری متفاوت دارد:
 * چگال‌تر، جدول‌محور، و بدون انیمیشن‌های تزئینی. ولی از همان توکن‌های
 * رنگی سایت استفاده می‌کند تا هر دو تم روشن و تیره کار کنند.
 */
export const adminStyles = `
  .ad-shell {
    display: grid;
    grid-template-columns: 232px minmax(0, 1fr);
    min-height: 100vh;
    background: var(--background-base);
    color: var(--foreground);
    font-family: var(--font-sans);
  }

  /* ── نوار کناری ── */
  .ad-side {
    border-inline-start: 1px solid var(--border-default);
    background: var(--background-elevated);
    padding: 18px 14px;
    display: flex; flex-direction: column; gap: 4px;
    position: sticky; top: 0; height: 100vh; overflow-y: auto;
  }
  .ad-brand {
    display: flex; align-items: center; gap: 9px;
    padding: 4px 8px 16px;
  }
  .ad-brand b { font-size: 15px; font-weight: 700; letter-spacing: -.01em; }
  .ad-brand span {
    font-family: var(--font-mono); font-size: 9.5px;
    letter-spacing: .1em; color: var(--accent);
    border: 1px solid var(--border-accent); border-radius: 4px;
    padding: 2px 5px;
  }
  .ad-navlink {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 10px; border-radius: 8px;
    font-size: 13.5px; color: var(--foreground-muted);
    text-decoration: none; border: 1px solid transparent;
    transition: background .16s ease, color .16s ease;
  }
  .ad-navlink svg { flex: 0 0 auto; opacity: .75; }
  .ad-navlink.on {
    background: var(--surface); color: var(--foreground);
    border-color: var(--border-default); font-weight: 600;
  }
  .ad-navlink.on svg { opacity: 1; color: var(--accent); }
  @media (hover: hover) and (pointer: fine) {
    .ad-navlink:hover { background: var(--surface); color: var(--foreground); }
  }
  .ad-side-foot {
    margin-top: auto; padding-top: 14px;
    border-top: 1px solid var(--border-default);
    display: flex; flex-direction: column; gap: 8px;
  }
  .ad-who {
    font-size: 11.5px; color: var(--foreground-subtle);
    padding: 0 4px; line-height: 1.7; word-break: break-all;
  }
  .ad-who b { color: var(--foreground-muted); font-weight: 600; }

  /* ── ناحیه‌ی محتوا ── */
  .ad-main { min-width: 0; padding: 24px clamp(16px, 3vw, 34px) 60px; }
  .ad-head {
    display: flex; align-items: flex-end; justify-content: space-between;
    gap: 16px; flex-wrap: wrap; margin-bottom: 22px;
  }
  .ad-h1 {
    font-size: 21px; font-weight: 700; letter-spacing: -.02em; margin: 0;
  }
  .ad-lede {
    font-size: 13px; color: var(--foreground-muted); margin: 5px 0 0;
    line-height: 1.75; max-width: 62ch;
  }

  /* ── کارت ── */
  .ad-card {
    background: var(--background-elevated);
    border: 1px solid var(--border-default);
    border-radius: 12px;
    padding: 16px 18px;
  }
  .ad-card + .ad-card { margin-top: 14px; }
  .ad-card-title {
    font-size: 13px; font-weight: 700; margin: 0 0 3px;
  }
  .ad-card-note {
    font-size: 11.5px; color: var(--foreground-subtle);
    margin: 0 0 14px; line-height: 1.7;
  }

  /* ── آمار ── */
  .ad-stats {
    display: grid; gap: 12px;
    grid-template-columns: repeat(auto-fit, minmax(158px, 1fr));
  }
  .ad-stat {
    background: var(--background-elevated);
    border: 1px solid var(--border-default);
    border-radius: 12px; padding: 14px 16px;
  }
  .ad-stat-k {
    font-family: var(--font-mono); font-size: 10px;
    letter-spacing: .1em; color: var(--foreground-subtle);
  }
  .ad-stat-v {
    font-size: 26px; font-weight: 700; letter-spacing: -.03em;
    margin-top: 6px; font-variant-numeric: tabular-nums;
  }
  .ad-stat-d { font-size: 11.5px; color: var(--foreground-muted); margin-top: 3px; }
  .ad-stat-d.up { color: var(--success); }

  /* ── جدول ── */
  .ad-tablewrap {
    overflow-x: auto;
    border: 1px solid var(--border-default);
    border-radius: 12px;
    background: var(--background-elevated);
  }
  .ad-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .ad-table th {
    text-align: right; font-weight: 600; font-size: 11px;
    letter-spacing: .05em; color: var(--foreground-subtle);
    padding: 11px 14px; border-bottom: 1px solid var(--border-default);
    white-space: nowrap; background: var(--surface);
  }
  .ad-table td {
    padding: 11px 14px; border-bottom: 1px solid var(--border-default);
    vertical-align: middle;
  }
  .ad-table tr:last-child td { border-bottom: 0; }
  @media (hover: hover) and (pointer: fine) {
    .ad-table tbody tr:hover { background: var(--surface); }
  }
  .ad-mono {
    font-family: var(--font-mono); font-size: 11.5px;
    color: var(--foreground-muted); font-variant-numeric: tabular-nums;
  }
  .ad-trunc {
    max-width: 30ch; overflow: hidden;
    text-overflow: ellipsis; white-space: nowrap;
  }

  /* ── نشان ── */
  .ad-badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-family: var(--font-mono); font-size: 10px; letter-spacing: .05em;
    padding: 3px 7px; border-radius: 5px;
    border: 1px solid var(--border-default); color: var(--foreground-muted);
    white-space: nowrap;
  }
  .ad-badge.accent { color: var(--accent); border-color: var(--border-accent); }
  .ad-badge.danger { color: var(--danger); border-color: color-mix(in srgb, var(--danger) 35%, transparent); }
  .ad-badge.ok     { color: var(--success); border-color: color-mix(in srgb, var(--success) 35%, transparent); }

  /* ── ورودی ── */
  /* ورودی‌ها و دکمه‌ها اجزای تعاملی‌اند: حاشیه‌شان باید ۳:۱ کنتراست
     داشته باشد وگرنه در تم روشن مرزشان با پس‌زمینه گم می‌شود. */
  .ad-input, .ad-select, .ad-textarea {
    width: 100%; font-family: inherit; font-size: 13px;
    color: var(--foreground); background: var(--input-bg);
    border: 1px solid var(--border-strong); border-radius: 8px;
    padding: 9px 11px; transition: border-color .16s ease, background .16s ease;
  }
  .ad-textarea { line-height: 1.85; resize: vertical; min-height: 76px; }
  .ad-input:focus, .ad-select:focus, .ad-textarea:focus {
    outline: none; border-color: var(--border-accent);
    background: var(--input-bg-focus);
  }
  .ad-input::placeholder, .ad-textarea::placeholder { color: var(--placeholder); }
  .ad-label {
    display: block; font-size: 11.5px; font-weight: 600;
    color: var(--foreground-muted); margin-bottom: 6px;
  }
  .ad-field + .ad-field { margin-top: 13px; }

  /* ── دکمه ── */
  .ad-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    font-family: inherit; font-size: 12.5px; font-weight: 600;
    padding: 8px 14px; border-radius: 8px; cursor: pointer;
    border: 1px solid var(--border-strong);
    background: var(--surface); color: var(--foreground);
    white-space: nowrap;
    transition: background .16s ease, border-color .16s ease, opacity .16s ease;
  }
  @media (hover: hover) and (pointer: fine) {
    .ad-btn:hover:not(:disabled) { background: var(--surface-hover); border-color: var(--border-hover); }
  }
  .ad-btn:disabled { opacity: .45; cursor: not-allowed; }
  .ad-btn.primary {
    background: var(--accent); border-color: var(--accent); color: #fff;
  }
  @media (hover: hover) and (pointer: fine) {
    .ad-btn.primary:hover:not(:disabled) { background: var(--accent-bright); border-color: var(--accent-bright); }
  }
  .ad-btn.danger { color: var(--danger); border-color: color-mix(in srgb, var(--danger) 32%, transparent); }
  .ad-btn.sm { font-size: 11.5px; padding: 5px 9px; border-radius: 6px; }

  .ad-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .ad-toolbar {
    display: flex; gap: 8px; align-items: center;
    flex-wrap: wrap; margin-bottom: 14px;
  }
  .ad-toolbar .ad-input { width: auto; flex: 1 1 210px; min-width: 0; }
  .ad-toolbar .ad-select { width: auto; flex: 0 0 auto; }

  /* ── حالت‌های خالی و پیام ── */
  .ad-empty {
    padding: 40px 20px; text-align: center;
    color: var(--foreground-subtle); font-size: 13px; line-height: 1.9;
  }
  .ad-note {
    border-radius: 10px; padding: 11px 14px; font-size: 12.5px;
    line-height: 1.85; border: 1px solid var(--border-default);
    background: var(--surface); color: var(--foreground-muted);
  }
  .ad-note.warn {
    border-color: color-mix(in srgb, var(--warning) 34%, transparent);
    color: var(--warning);
  }
  .ad-note.err {
    border-color: color-mix(in srgb, var(--danger) 34%, transparent);
    color: var(--danger);
  }
  .ad-note.ok {
    border-color: color-mix(in srgb, var(--success) 34%, transparent);
    color: var(--success);
  }
  .ad-note + * { margin-top: 14px; }

  /* ── صفحه‌بندی ── */
  .ad-pager {
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; margin-top: 13px; flex-wrap: wrap;
  }
  .ad-pager-info {
    font-family: var(--font-mono); font-size: 11.5px;
    color: var(--foreground-subtle);
  }

  /* ── نمودار روند ── */
  .ad-spark { display: flex; align-items: flex-end; gap: 2px; height: 62px; }
  .ad-spark i {
    flex: 1 1 0; min-width: 0; display: block; border-radius: 2px 2px 0 0;
    background: var(--accent); opacity: .55;
    transition: opacity .16s ease;
  }
  @media (hover: hover) and (pointer: fine) {
    .ad-spark i:hover { opacity: 1; }
  }

  /* ── رسانه ── */
  .ad-media {
    display: grid; gap: 12px;
    grid-template-columns: repeat(auto-fill, minmax(152px, 1fr));
  }
  .ad-media-item {
    border: 1px solid var(--border-default); border-radius: 10px;
    overflow: hidden; background: var(--background-base);
  }
  .ad-media-thumb {
    aspect-ratio: 16 / 10; background: var(--background-deep);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
  }
  .ad-media-thumb img, .ad-media-thumb video {
    width: 100%; height: 100%; object-fit: cover; display: block;
  }
  .ad-media-meta { padding: 8px 10px; }
  .ad-media-name {
    font-size: 11px; word-break: break-all; line-height: 1.6;
    color: var(--foreground-muted);
  }
  .ad-media-actions { display: flex; gap: 5px; margin-top: 7px; }

  .ad-drop {
    border: 1.5px dashed var(--border-hover); border-radius: 12px;
    padding: 26px 18px; text-align: center; cursor: pointer;
    transition: border-color .16s ease, background .16s ease;
  }
  .ad-drop.over { border-color: var(--accent); background: var(--surface); }
  .ad-drop p { margin: 0; font-size: 13px; color: var(--foreground-muted); }
  .ad-drop small {
    display: block; margin-top: 5px; font-size: 11px;
    color: var(--foreground-subtle);
  }

  /* ── اسلایدها ── */
  .ad-slide {
    border: 1px solid var(--border-default); border-radius: 10px;
    padding: 14px; background: var(--background-base);
  }
  .ad-slide + .ad-slide { margin-top: 11px; }
  .ad-slide-top {
    display: flex; align-items: center; justify-content: space-between;
    gap: 10px; margin-bottom: 12px;
  }
  .ad-slide-grid {
    display: grid; gap: 12px;
    grid-template-columns: 168px minmax(0, 1fr);
  }
  .ad-slide-prev {
    aspect-ratio: 16 / 10; border-radius: 7px; overflow: hidden;
    background: var(--background-deep);
    border: 1px solid var(--border-default);
    display: flex; align-items: center; justify-content: center;
  }
  .ad-slide-prev img, .ad-slide-prev video {
    width: 100%; height: 100%; object-fit: cover;
  }
  .ad-slide-prev span {
    font-family: var(--font-mono); font-size: 10px;
    color: var(--foreground-subtle);
  }

  /* ── سوئیچ ── */
  .ad-switch {
    display: flex; align-items: center; justify-content: space-between;
    gap: 14px; padding: 11px 0;
    border-bottom: 1px solid var(--border-default);
  }
  .ad-switch:last-child { border-bottom: 0; }
  .ad-switch-txt b {
    display: block; font-size: 13px; font-weight: 600; margin-bottom: 2px;
  }
  .ad-switch-txt span {
    font-size: 11.5px; color: var(--foreground-subtle); line-height: 1.7;
  }
  .ad-toggle {
    flex: 0 0 auto; width: 40px; height: 23px; border-radius: 100px;
    border: 1px solid var(--border-strong); background: var(--track);
    position: relative; cursor: pointer; padding: 0;
    transition: background .18s ease, border-color .18s ease;
  }
  .ad-toggle::after {
    content: ""; position: absolute; top: 2px; inset-inline-end: 2px;
    width: 17px; height: 17px; border-radius: 100px;
    background: var(--foreground-muted);
    transition: transform .18s cubic-bezier(.16,1,.3,1), background .18s ease;
  }
  .ad-toggle.on { background: var(--accent); border-color: var(--accent); }
  .ad-toggle.on::after { transform: translateX(-17px); background: #fff; }

  /* ── دیالوگ تأیید ── */
  .ad-overlay {
    position: fixed; inset: 0; z-index: 100;
    background: var(--overlay); backdrop-filter: blur(3px);
    display: flex; align-items: center; justify-content: center; padding: 20px;
  }
  .ad-dialog {
    width: 100%; max-width: 400px;
    background: var(--background-elevated);
    border: 1px solid var(--border-hover);
    border-radius: 14px; padding: 20px;
    box-shadow: var(--card-shadow-hover);
  }
  .ad-dialog h3 { margin: 0 0 8px; font-size: 15px; font-weight: 700; }
  .ad-dialog p {
    margin: 0 0 16px; font-size: 13px; line-height: 1.9;
    color: var(--foreground-muted);
  }
  .ad-dialog .ad-row { justify-content: flex-end; }

  /* ── ناوبار موبایل ── */
  .ad-mobilebar { display: none; }

  @media (max-width: 860px) {
    .ad-shell { grid-template-columns: 1fr; }
    .ad-side { display: none; }
    .ad-mobilebar {
      display: flex; gap: 6px; overflow-x: auto;
      padding: 10px clamp(12px, 3vw, 20px);
      border-bottom: 1px solid var(--border-default);
      background: var(--background-elevated);
      position: sticky; top: 0; z-index: 20;
      -webkit-overflow-scrolling: touch;
    }
    .ad-mobilebar .ad-navlink {
      padding: 7px 11px; font-size: 12.5px; white-space: nowrap;
      border: 1px solid var(--border-default); border-radius: 100px;
    }
    .ad-mobilebar .ad-navlink svg { display: none; }
    .ad-main { padding: 18px clamp(12px, 3vw, 20px) 48px; }
    .ad-slide-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 520px) {
    .ad-h1 { font-size: 18px; }
    .ad-stat-v { font-size: 22px; }
    .ad-table th, .ad-table td { padding: 9px 11px; }
  }

  /* لمسی: هدف‌های ۴۴px */
  @media (hover: none) and (pointer: coarse) {
    .ad-btn { min-height: 40px; }
    .ad-btn.sm { min-height: 34px; }
    .ad-navlink { min-height: 40px; }
  }
`;
