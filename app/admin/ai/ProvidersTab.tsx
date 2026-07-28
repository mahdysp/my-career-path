"use client";

import { useState } from "react";
import Confirm from "../Confirm";
import { api, faDateTime } from "../adminClient";
import type { AiProvider } from "@/lib/ai-providers";

/**
 * تب سرویس‌دهنده‌ها.
 *
 * ترتیب کارت‌ها همان ترتیب واقعی failover است: از بالا به پایین امتحان
 * می‌شوند. برای همین شماره‌ی ردیف و دکمه‌های جابه‌جایی نمایش داده می‌شود —
 * ادمین باید بدون خواندن مستندات بفهمد کدام سرویس اول است.
 */

type TestState = { ok: boolean; ms: number; detail: string } | null;

/** پیش‌فرض‌های آماده تا ادمین آدرس را از حفظ ننویسد */
const PRESETS: { label: string; baseUrl: string; model: string }[] = [
  { label: "Groq", baseUrl: "https://api.groq.com/openai/v1", model: "llama-3.1-8b-instant" },
  { label: "OpenAI", baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini" },
  { label: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1", model: "openai/gpt-4o-mini" },
  { label: "Together", baseUrl: "https://api.together.xyz/v1", model: "meta-llama/Llama-3-8b-chat-hf" },
  { label: "DeepSeek", baseUrl: "https://api.deepseek.com/v1", model: "deepseek-chat" },
];

type Draft = {
  name: string;
  baseUrl: string;
  model: string;
  apiKey: string;
  apiKeyEnv: string;
  timeoutMs: number;
  maxRetries: number;
  enabled: boolean;
};

const EMPTY: Draft = {
  name: "",
  baseUrl: "",
  model: "",
  apiKey: "",
  apiKeyEnv: "",
  timeoutMs: 30000,
  maxRetries: 1,
  enabled: true,
};

export default function ProvidersTab({
  providers,
  encryption,
  onChanged,
  notify,
}: {
  providers: AiProvider[];
  encryption: boolean;
  onChanged: () => void;
  notify: (kind: "ok" | "err", text: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [tests, setTests] = useState<Record<string, TestState>>({});
  const [testing, setTesting] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AiProvider | null>(null);

  const enabledCount = providers.filter((p) => p.enabled && p.hasKey).length;

  function startCreate() {
    setDraft(EMPTY);
    setCreating(true);
    setEditing(null);
  }

  function startEdit(p: AiProvider) {
    setDraft({
      name: p.name,
      baseUrl: p.baseUrl,
      model: p.model,
      apiKey: "", // خالی یعنی «کلید فعلی را دست نزن»
      apiKeyEnv: "",
      timeoutMs: p.timeoutMs,
      maxRetries: p.maxRetries,
      enabled: p.enabled,
    });
    setEditing(p.id);
    setCreating(false);
  }

  function cancel() {
    setCreating(false);
    setEditing(null);
    setDraft(EMPTY);
  }

  async function save() {
    setBusy(true);
    try {
      const payload: Record<string, unknown> = {
        name: draft.name,
        baseUrl: draft.baseUrl,
        model: draft.model,
        enabled: draft.enabled,
        timeoutMs: Number(draft.timeoutMs),
        maxRetries: Number(draft.maxRetries),
      };
      // فقط وقتی کلید فرستاده می‌شود که واقعاً چیزی وارد شده باشد،
      // وگرنه ویرایشِ نام یک سرویس، کلیدش را پاک می‌کرد.
      if (draft.apiKey.trim()) payload.apiKey = draft.apiKey.trim();
      if (draft.apiKeyEnv.trim()) payload.apiKeyEnv = draft.apiKeyEnv.trim();

      if (creating) {
        payload.priority = (providers.at(-1)?.priority ?? 0) + 10;
        await api("/api/admin/ai/providers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        notify("ok", "سرویس اضافه شد.");
      } else {
        payload.id = editing;
        await api("/api/admin/ai/providers", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        notify("ok", "تغییرات ذخیره شد.");
      }
      cancel();
      onChanged();
    } catch (e) {
      notify("err", e instanceof Error ? e.message : "ذخیره نشد.");
    } finally {
      setBusy(false);
    }
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setBusy(true);
    try {
      await api("/api/admin/ai/providers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      onChanged();
    } catch (e) {
      notify("err", e instanceof Error ? e.message : "تغییر ناموفق بود.");
    } finally {
      setBusy(false);
    }
  }

  /** جابه‌جایی در ترتیب failover — با تعویض priority دو همسایه */
  async function move(index: number, dir: -1 | 1) {
    const a = providers[index];
    const b = providers[index + dir];
    if (!a || !b) return;

    setBusy(true);
    try {
      // اگر priorityها مساوی باشند تعویض ساده کاری نمی‌کند؛
      // پس مقدار قطعی و متفاوت می‌نویسیم.
      const pa = a.priority === b.priority ? a.priority + dir * -1 : b.priority;
      const pb = a.priority === b.priority ? b.priority + dir : a.priority;

      await Promise.all([
        api("/api/admin/ai/providers", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: a.id, priority: pa }),
        }),
        api("/api/admin/ai/providers", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: b.id, priority: pb }),
        }),
      ]);
      onChanged();
    } catch (e) {
      notify("err", e instanceof Error ? e.message : "جابه‌جایی ناموفق بود.");
    } finally {
      setBusy(false);
    }
  }

  async function runTest(p: AiProvider) {
    setTesting(p.id);
    setTests((t) => ({ ...t, [p.id]: null }));
    try {
      const r = await api<{ ok: boolean; ms: number; detail: string }>("/api/admin/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id }),
      });
      setTests((t) => ({ ...t, [p.id]: r }));
      if (r.ok) onChanged();
    } catch (e) {
      setTests((t) => ({
        ...t,
        [p.id]: {
          ok: false,
          ms: 0,
          detail: e instanceof Error ? e.message : "آزمون ناموفق بود.",
        },
      }));
    } finally {
      setTesting(null);
    }
  }

  async function remove() {
    if (!pendingDelete) return;
    setBusy(true);
    try {
      await api(`/api/admin/ai/providers?id=${encodeURIComponent(pendingDelete.id)}`, {
        method: "DELETE",
      });
      notify("ok", "سرویس حذف شد.");
      onChanged();
    } catch (e) {
      notify("err", e instanceof Error ? e.message : "حذف نشد.");
    } finally {
      setBusy(false);
      setPendingDelete(null);
    }
  }

  return (
    <>
      {!encryption && (
        <div className="ai-warn">
          <span aria-hidden>⚠</span>
          <div>
            متغیر محیطی <code>AI_ENCRYPTION_KEY</code> تنظیم نشده است. تا وقتی تنظیم نشود
            نمی‌توانید کلید API را در دیتابیس ذخیره کنید. یک کلید بسازید (
            <code>openssl rand -hex 32</code>) و در Vercel اضافه کنید — یا به‌جای کلید،
            نام یک متغیر محیطی را وارد کنید تا راز اصلاً وارد دیتابیس نشود.
          </div>
        </div>
      )}

      <div className="ad-card">
        <p className="ad-card-title">ترتیب جایگزینی</p>
        <p className="ad-card-note">
          سرویس‌ها از بالا به پایین امتحان می‌شوند. اگر اولی خطا بدهد یا پاسخ ندهد،
          درخواست خودکار به سرویس بعدی می‌رود و کاربر چیزی متوجه نمی‌شود.
          {enabledCount === 0 ? (
            <>
              {" "}
              <b>در حال حاضر هیچ سرویس آماده‌ای ندارید</b> — تا وقتی حداقل یک سرویس فعال
              با کلید معتبر نباشد، ساخت آزمون و تحلیل کار نمی‌کند.
            </>
          ) : (
            <>
              {" "}
              هم‌اکنون <b>{enabledCount}</b> سرویس آماده‌ی استفاده است.
            </>
          )}
        </p>

        {providers.length === 0 && !creating && (
          <div className="ad-empty">هنوز سرویسی اضافه نشده است.</div>
        )}

        {providers.map((p, i) => {
          const t = tests[p.id];
          const state = p.lastError && !p.lastOkAt ? "err" : p.lastOkAt ? "ok" : "idle";

          return (
            <div key={p.id} className={`ai-prov ${p.enabled ? "" : "off"}`}>
              <div className="ai-prov-top">
                <span className="ai-prov-rank" title="ترتیب امتحان">
                  {i + 1}
                </span>
                <span className={`ai-dot ${state}`} aria-hidden />
                <div>
                  <div className="ai-prov-name">{p.name}</div>
                  <div className="ai-prov-model">{p.model}</div>
                </div>

                <span className="ai-prov-spacer" />

                <button
                  className="ad-btn sm"
                  disabled={busy || i === 0}
                  onClick={() => move(i, -1)}
                  title="یک پله بالاتر"
                  aria-label={`${p.name}: یک پله بالاتر`}
                >
                  ↑
                </button>
                <button
                  className="ad-btn sm"
                  disabled={busy || i === providers.length - 1}
                  onClick={() => move(i, 1)}
                  title="یک پله پایین‌تر"
                  aria-label={`${p.name}: یک پله پایین‌تر`}
                >
                  ↓
                </button>
                <button
                  className="ad-btn sm"
                  disabled={busy || testing === p.id}
                  onClick={() => runTest(p)}
                >
                  {testing === p.id ? "در حال آزمون…" : "آزمون اتصال"}
                </button>
                <button className="ad-btn sm" disabled={busy} onClick={() => startEdit(p)}>
                  ویرایش
                </button>
                <button
                  className={`ad-toggle ${p.enabled ? "on" : ""}`}
                  role="switch"
                  aria-checked={p.enabled}
                  aria-label={`${p.name}: فعال`}
                  disabled={busy}
                  onClick={() => patch(p.id, { enabled: !p.enabled })}
                />
                <button
                  className="ad-btn sm danger"
                  disabled={busy}
                  onClick={() => setPendingDelete(p)}
                >
                  حذف
                </button>
              </div>

              <div className="ai-prov-meta">
                <span>
                  آدرس: <code>{p.baseUrl}</code>
                </span>
                <span>
                  کلید:{" "}
                  {p.hasKey ? (
                    <code>{p.keyHint ?? "از متغیر محیطی"}</code>
                  ) : (
                    <b style={{ color: "#dc2626" }}>تنظیم نشده</b>
                  )}
                </span>
                <span>مهلت: {p.timeoutMs} میلی‌ثانیه</span>
                <span>تلاش: {p.maxRetries}</span>
                {p.lastOkAt && <span className="ai-status">آخرین موفقیت: {faDateTime(p.lastOkAt)}</span>}
                {p.lastError && (
                  <span className="ai-status" style={{ color: "#dc2626" }}>
                    آخرین خطا: {p.lastError.slice(0, 90)}
                  </span>
                )}
              </div>

              {t && (
                <div className={`ai-test ${t.ok ? "ok" : "err"}`}>
                  {t.ok ? "✓ اتصال برقرار شد — " : "✕ اتصال برقرار نشد — "}
                  <code>{t.detail}</code>
                </div>
              )}
            </div>
          );
        })}

        {!creating && !editing && (
          <div className="ad-row" style={{ marginTop: 14 }}>
            <button className="ad-btn primary" onClick={startCreate} disabled={busy}>
              افزودن سرویس
            </button>
          </div>
        )}
      </div>

      {(creating || editing) && (
        <div className="ad-card">
          <p className="ad-card-title">{creating ? "سرویس جدید" : "ویرایش سرویس"}</p>
          <p className="ad-card-note">
            هر سرویسی که با استاندارد OpenAI سازگار باشد کار می‌کند — کافی است آدرس پایه و
            نام مدل را بدهید.
          </p>

          {creating && (
            <div className="ai-vars" style={{ marginBottom: 14 }}>
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  className="ai-var"
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      name: d.name || p.label,
                      baseUrl: p.baseUrl,
                      model: p.model,
                    }))
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          <div className="ai-grid">
            <div className="ad-field">
              <label className="ad-label">نام نمایشی</label>
              <input
                className="ad-input"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="مثلاً Groq"
              />
            </div>

            <div className="ad-field">
              <label className="ad-label">نام مدل</label>
              <input
                className="ad-input ai-ltr"
                value={draft.model}
                onChange={(e) => setDraft({ ...draft, model: e.target.value })}
                placeholder="llama-3.1-8b-instant"
              />
            </div>

            <div className="ad-field full">
              <label className="ad-label">آدرس پایه</label>
              <input
                className="ad-input ai-ltr"
                value={draft.baseUrl}
                onChange={(e) => setDraft({ ...draft, baseUrl: e.target.value })}
                placeholder="https://api.groq.com/openai/v1"
              />
              <p className="ai-hint">
                بدون <code>/chat/completions</code> انتهایی — خودش اضافه می‌شود.
              </p>
            </div>

            <div className="ad-field">
              <label className="ad-label">کلید API</label>
              <input
                className="ad-input ai-ltr"
                type="password"
                autoComplete="new-password"
                value={draft.apiKey}
                onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
                placeholder={editing ? "برای حفظ کلید فعلی خالی بگذارید" : "sk-…"}
              />
              <p className="ai-hint">
                با AES-256-GCM رمز می‌شود و هیچ‌وقت دوباره نمایش داده نمی‌شود.
              </p>
            </div>

            <div className="ad-field">
              <label className="ad-label">یا نام متغیر محیطی</label>
              <input
                className="ad-input ai-ltr"
                value={draft.apiKeyEnv}
                onChange={(e) => setDraft({ ...draft, apiKeyEnv: e.target.value })}
                placeholder="GROQ_API_KEY"
              />
              <p className="ai-hint">
                اگر پر شود، کلید از محیط خوانده می‌شود و اصلاً وارد دیتابیس نمی‌شود.
              </p>
            </div>

            <div className="ad-field">
              <label className="ad-label">مهلت پاسخ (میلی‌ثانیه)</label>
              <input
                className="ad-input ai-ltr"
                type="number"
                min={1000}
                max={120000}
                step={1000}
                value={draft.timeoutMs}
                onChange={(e) => setDraft({ ...draft, timeoutMs: Number(e.target.value) })}
              />
            </div>

            <div className="ad-field">
              <label className="ad-label">تعداد تلاش</label>
              <input
                className="ad-input ai-ltr"
                type="number"
                min={1}
                max={4}
                value={draft.maxRetries}
                onChange={(e) => setDraft({ ...draft, maxRetries: Number(e.target.value) })}
              />
              <p className="ai-hint">فقط برای خطاهای گذرا (۴۲۹ و ۵xx) تکرار می‌شود.</p>
            </div>
          </div>

          <div className="ad-row" style={{ marginTop: 16 }}>
            <button className="ad-btn primary" disabled={busy} onClick={save}>
              {busy ? "در حال ذخیره…" : creating ? "افزودن" : "ذخیره"}
            </button>
            <button className="ad-btn" disabled={busy} onClick={cancel}>
              انصراف
            </button>
          </div>
        </div>
      )}

      {pendingDelete && (
        <Confirm
          title="حذف سرویس"
          body={`«${pendingDelete.name}» و کلید ذخیره‌شده‌اش برای همیشه حذف می‌شوند. این کار بازگشت‌پذیر نیست.`}
          danger
          busy={busy}
          confirmLabel="حذف کن"
          onConfirm={remove}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}
