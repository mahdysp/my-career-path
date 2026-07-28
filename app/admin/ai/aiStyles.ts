/**
 * استایل‌های مخصوص صفحه‌ی هوش مصنوعی.
 *
 * فقط چیزهایی که در adminStyles وجود ندارند اینجا آمده‌اند: نوار تب‌ها،
 * کارت سرویس با دستگیره‌ی ترتیب، و نشانگر وضعیت. بقیه‌ی ظاهر (دکمه، ورودی،
 * کارت) از همان کلاس‌های ad-* مشترک می‌آید تا پنل یکدست بماند.
 */
export const aiStyles = `
  /* ── نوار تب ── */
  .ai-tabs {
    display: flex; gap: 4px; margin: 0 0 20px;
    border-bottom: 1px solid var(--border-default);
  }
  .ai-tab {
    appearance: none; background: none; border: 0;
    border-bottom: 2px solid transparent;
    padding: 10px 16px; margin-bottom: -1px;
    font: inherit; font-size: 13px; font-weight: 600;
    color: var(--foreground-muted); cursor: pointer;
    transition: color .15s, border-color .15s;
  }
  .ai-tab:hover { color: var(--foreground-default); }
  .ai-tab.on {
    color: var(--accent-default, var(--foreground-default));
    border-bottom-color: var(--accent-default, var(--foreground-default));
  }
  .ai-tab-count {
    display: inline-block; margin-inline-start: 6px;
    padding: 1px 6px; border-radius: 100px;
    background: var(--background-base); border: 1px solid var(--border-default);
    font-size: 11px; font-weight: 500;
  }

  /* ── کارت سرویس ── */
  .ai-prov {
    border: 1px solid var(--border-default); border-radius: 10px;
    background: var(--background-elevated);
    padding: 14px 16px; margin-bottom: 10px;
  }
  .ai-prov.off { opacity: .62; }
  .ai-prov-top {
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  }
  .ai-prov-rank {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 26px; height: 26px; padding: 0 7px; border-radius: 7px;
    background: var(--background-base); border: 1px solid var(--border-default);
    font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums;
  }
  .ai-prov-name { font-size: 14px; font-weight: 700; }
  .ai-prov-model {
    font-size: 11.5px; color: var(--foreground-muted);
    direction: ltr; unicode-bidi: embed;
  }
  .ai-prov-spacer { flex: 1 1 auto; }

  /* ردیف مشخصات فنی — همیشه چپ‌چین چون آدرس و نام مدل لاتین‌اند */
  .ai-prov-meta {
    display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 10px;
    font-size: 11.5px; color: var(--foreground-muted);
  }
  .ai-prov-meta code {
    direction: ltr; unicode-bidi: embed;
    font-size: 11px; word-break: break-all;
  }

  /* ── نشانگر وضعیت ── */
  .ai-dot {
    display: inline-block; width: 8px; height: 8px; border-radius: 50%;
    background: var(--foreground-muted); flex: none;
  }
  .ai-dot.ok  { background: #16a34a; }
  .ai-dot.err { background: #dc2626; }
  .ai-dot.idle { background: var(--border-strong, var(--border-default)); }

  .ai-status {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 11.5px; color: var(--foreground-muted);
  }

  /* ── نتیجه‌ی آزمون اتصال ── */
  .ai-test {
    margin-top: 10px; padding: 9px 11px; border-radius: 8px;
    font-size: 12px; line-height: 1.8;
    border: 1px solid var(--border-default);
    background: var(--background-base);
  }
  .ai-test.ok  { border-color: #16a34a55; background: #16a34a10; }
  .ai-test.err { border-color: #dc262655; background: #dc262610; }
  .ai-test code {
    direction: ltr; unicode-bidi: embed; word-break: break-all; font-size: 11px;
  }

  /* ── فرم ── */
  .ai-grid {
    display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px;
  }
  .ai-grid .full { grid-column: 1 / -1; }
  @media (max-width: 720px) { .ai-grid { grid-template-columns: 1fr; } }

  .ai-hint {
    font-size: 11.5px; color: var(--foreground-muted);
    margin: 5px 0 0; line-height: 1.8;
  }

  /* ورودی‌هایی که محتوای لاتین دارند (آدرس، مدل، کلید) */
  .ai-ltr {
    direction: ltr; text-align: left;
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: 12px;
  }

  /* ── قالب‌ها ── */
  .ai-prompt-key {
    display: inline-block; padding: 2px 8px; border-radius: 6px;
    background: var(--background-base); border: 1px solid var(--border-default);
    font-size: 11px; direction: ltr; unicode-bidi: embed;
    font-family: var(--font-mono, ui-monospace, monospace);
  }
  .ai-vars { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .ai-var {
    appearance: none; cursor: pointer;
    padding: 3px 9px; border-radius: 100px;
    border: 1px solid var(--border-default); background: var(--background-base);
    color: var(--foreground-muted);
    font: inherit; font-size: 11px;
    direction: ltr; unicode-bidi: embed;
    transition: color .15s, border-color .15s;
  }
  .ai-var:hover {
    color: var(--foreground-default);
    border-color: var(--border-interactive, var(--border-default));
  }

  .ai-ta {
    width: 100%; min-height: 260px; resize: vertical;
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: 12px; line-height: 1.95;
  }

  /* ── هشدار رمزگذاری ── */
  .ai-warn {
    display: flex; gap: 10px; align-items: flex-start;
    padding: 11px 13px; border-radius: 9px; margin-bottom: 16px;
    border: 1px solid #d9770655; background: #d977060f;
    font-size: 12.5px; line-height: 1.9;
  }
  .ai-warn code {
    direction: ltr; unicode-bidi: embed; font-size: 11.5px;
  }
`;
