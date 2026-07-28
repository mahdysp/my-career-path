"use client";

import { useRef, useState } from "react";
import { api, faDateTime } from "../adminClient";
import type { AiPrompt } from "@/lib/ai-providers";

/**
 * تب قالب‌های دستور.
 *
 * متن دستورها از کد بیرون کشیده شده تا تغییر لحن یا قواعد آزمون نیازی به
 * دیپلوی نداشته باشد. اگر متغیری از قالب حذف شود خروجی خراب می‌شود، پس
 * پیش از ذخیره بررسی می‌کنیم و هشدار می‌دهیم.
 */
export default function PromptsTab({
  prompts,
  onChanged,
  notify,
}: {
  prompts: AiPrompt[];
  onChanged: () => void;
  notify: (kind: "ok" | "err", text: string) => void;
}) {
  const [activeKey, setActiveKey] = useState<string>(prompts[0]?.key ?? "");
  const [busy, setBusy] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  /* ویرایش‌های ذخیره‌نشده، کلید به کلید.
     به‌جای همگام‌سازی یک «پیش‌نویس» با useEffect (که رندر آبشاری می‌سازد)،
     پیش‌نویس از روی داده‌ی سرور مشتق می‌شود و فقط تغییرات کاربر نگه داشته
     می‌شود. مزیت جانبی: با عوض کردن تب، ویرایش‌های نیمه‌کاره از بین نمی‌رود. */
  const [edits, setEdits] = useState<Record<string, Partial<AiPrompt>>>({});

  const active = prompts.find((p) => p.key === activeKey) ?? prompts[0] ?? null;

  if (!prompts.length) {
    return (
      <div className="ad-card">
        <p className="ad-card-title">قالبی وجود ندارد</p>
        <p className="ad-card-note">
          فایل <code>supabase/admin-setup.sql</code> را در Supabase → SQL Editor اجرا کنید
          تا قالب‌های پیش‌فرض ساخته شوند.
        </p>
      </div>
    );
  }

  if (!active) return null;

  const draft: AiPrompt = { ...active, ...(edits[active.key] ?? {}) };

  /** ثبت یک تغییر روی قالب فعال */
  const patch = (p: Partial<AiPrompt>) =>
    setEdits((e) => ({ ...e, [active.key]: { ...(e[active.key] ?? {}), ...p } }));

  const dirty =
    draft.template !== active.template ||
    draft.system !== active.system ||
    draft.temperature !== active.temperature ||
    draft.maxTokens !== active.maxTokens;

  /** متغیرهایی که در قالب استفاده نشده‌اند — خروجی را خراب می‌کنند */
  const missing = draft.variables.filter(
    (v) => !new RegExp(`\\{\\{\\s*${v}\\s*\\}\\}`).test(draft.template)
  );

  /** درج متغیر در محل مکان‌نما */
  function insertVar(v: string) {
    const ta = taRef.current;
    const token = `{{${v}}}`;
    if (!ta) {
      patch({ template: draft.template + token });
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    patch({ template: draft.template.slice(0, start) + token + draft.template.slice(end) });
    // مکان‌نما بعد از متن درج‌شده بماند
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + token.length, start + token.length);
    });
  }

  async function save() {
    setBusy(true);
    try {
      await api("/api/admin/ai/prompts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: draft.key,
          system: draft.system,
          template: draft.template,
          temperature: draft.temperature,
          maxTokens: draft.maxTokens,
        }),
      });
      setEdits((e) => ({ ...e, [draft.key]: {} }));
      notify("ok", "قالب ذخیره شد.");
      onChanged();
    } catch (e) {
      notify("err", e instanceof Error ? e.message : "ذخیره نشد.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="ad-card">
        <p className="ad-card-title">انتخاب قالب</p>
        <p className="ad-card-note">
          این متن‌ها مستقیم به سرویس هوش مصنوعی فرستاده می‌شوند. تغییرشان بلافاصله روی
          آزمون‌های بعدی اثر می‌گذارد — بدون نیاز به دیپلوی.
        </p>
        <div className="ai-vars">
          {prompts.map((p) => (
            <button
              key={p.key}
              type="button"
              className="ai-var"
              onClick={() => setActiveKey(p.key)}
              style={
                p.key === active.key
                  ? {
                      color: "var(--foreground-default)",
                      borderColor: "var(--border-interactive, var(--border-default))",
                      fontWeight: 700,
                    }
                  : undefined
              }
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      <div className="ad-card">
        <div className="ad-row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <div>
            <p className="ad-card-title" style={{ marginBottom: 4 }}>
              {active.title} <span className="ai-prompt-key">{active.key}</span>
            </p>
            <p className="ad-card-note" style={{ marginBottom: 0 }}>
              {active.description}
            </p>
          </div>
          <span className="ai-status">آخرین ویرایش: {faDateTime(active.updatedAt)}</span>
        </div>

        <div className="ad-field" style={{ marginTop: 16 }}>
          <label className="ad-label">دستور سیستمی</label>
          <textarea
            className="ad-textarea ai-ltr"
            style={{ minHeight: 70 }}
            value={draft.system}
            onChange={(e) => patch({ system: e.target.value })}
            placeholder="You are a career counseling expert…"
          />
          <p className="ai-hint">
            لحن و قواعد کلی. معمولاً به انگلیسی نوشته می‌شود چون مدل‌ها به آن دقیق‌تر پایبندند.
          </p>
        </div>

        <div className="ad-field">
          <label className="ad-label">متن قالب</label>
          <textarea
            ref={taRef}
            className="ad-textarea ai-ta"
            value={draft.template}
            onChange={(e) => patch({ template: e.target.value })}
          />
          <p className="ai-hint">
            برای درج متغیر روی آن کلیک کنید — در محل مکان‌نما اضافه می‌شود:
          </p>
          <div className="ai-vars">
            {draft.variables.map((v) => (
              <button key={v} type="button" className="ai-var" onClick={() => insertVar(v)}>
                {`{{${v}}}`}
              </button>
            ))}
          </div>
        </div>

        {missing.length > 0 && (
          <div className="ai-warn" style={{ marginTop: 4 }}>
            <span aria-hidden>⚠</span>
            <div>
              این متغیرها در قالب استفاده نشده‌اند:{" "}
              <code>{missing.map((v) => `{{${v}}}`).join(" ")}</code>
              <br />
              بدون آن‌ها مدل اطلاعات لازم را دریافت نمی‌کند و خروجی احتمالاً بی‌ربط می‌شود.
            </div>
          </div>
        )}

        <div className="ai-grid" style={{ marginTop: 4 }}>
          <div className="ad-field">
            <label className="ad-label">دما (خلاقیت)</label>
            <input
              className="ad-input ai-ltr"
              type="number"
              min={0}
              max={2}
              step={0.1}
              value={draft.temperature}
              onChange={(e) => patch({ temperature: Number(e.target.value) })}
            />
            <p className="ai-hint">۰ = همیشه یکسان، ۱ = متنوع‌تر. برای خروجی JSON پایین بهتر است.</p>
          </div>

          <div className="ad-field">
            <label className="ad-label">سقف توکن</label>
            <input
              className="ad-input ai-ltr"
              type="number"
              min={64}
              max={32000}
              step={100}
              value={draft.maxTokens}
              onChange={(e) => patch({ maxTokens: Number(e.target.value) })}
            />
            <p className="ai-hint">اگر خروجی نصفه می‌ماند، این عدد را بالا ببرید.</p>
          </div>
        </div>

        <div className="ad-row" style={{ marginTop: 16 }}>
          <button className="ad-btn primary" disabled={busy || !dirty} onClick={save}>
            {busy ? "در حال ذخیره…" : "ذخیره‌ی قالب"}
          </button>
          <button
            className="ad-btn"
            disabled={busy || !dirty}
            onClick={() => setEdits((e) => ({ ...e, [active.key]: {} }))}
          >
            بازگردانی
          </button>
          {dirty && <span className="ai-status">تغییرات ذخیره نشده</span>}
        </div>
      </div>
    </>
  );
}
