"use client";

import { useCallback, useEffect, useState } from "react";
import AdminShell from "../AdminShell";
import AdminGate from "../AdminGate";
import { api } from "../adminClient";
import type { SiteContent } from "@/lib/site-content";

type Payload = { content: SiteContent; defaults: SiteContent };

type Health = {
  ok?: boolean;
  checks?: Record<string, { ok: boolean; detail?: string }>;
  [k: string]: unknown;
};

export default function AdminSettingsPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [flags, setFlags] = useState<SiteContent["flags"] | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api<Payload>("/api/admin/content")
      .then((d) => {
        setData(d);
        setFlags(d.content.flags);
      })
      .catch(setError)
      .finally(() => setLoading(false));

    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  /* load را داخل یک لایه‌ی async صدا می‌زنیم تا setState همگام با اجرای
     افکت نباشد (باعث رندر آبشاری می‌شود). */
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  async function save() {
    if (!flags) return;
    setBusy(true);
    setMsg(null);
    try {
      await api("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "flags", value: flags }),
      });
      setMsg({ kind: "ok", text: "تنظیمات ذخیره شد." });
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "ذخیره نشد." });
    } finally {
      setBusy(false);
    }
  }

  const set = (p: Partial<SiteContent["flags"]>) => flags && setFlags({ ...flags, ...p });

  return (
    <AdminShell>
      <div className="ad-head">
        <div>
          <h1 className="ad-h1">تنظیمات</h1>
          <p className="ad-lede">کنترل بخش‌های سایت و بررسی سلامت سرویس‌ها.</p>
        </div>
      </div>

      {msg && <div className={`ad-note ${msg.kind === "ok" ? "ok" : "err"}`}>{msg.text}</div>}

      <AdminGate loading={loading} error={error} onRetry={load}>
        {flags && data && (
          <>
            <div className="ad-card">
              <p className="ad-card-title">بخش‌های صفحه‌ی اصلی</p>
              <p className="ad-card-note">هر بخش را می‌توانید بدون تغییر کد پنهان کنید.</p>

              <Switch
                on={flags.explodedVisible}
                label="بخش نمای انفجاری"
                note="انیمیشن شش قطعه‌ای که با اسکرول باز و بسته می‌شود."
                onToggle={() => set({ explodedVisible: !flags.explodedVisible })}
              />
              <Switch
                on={flags.showcaseVisible}
                label="بخش نمایشگر"
                note="قاب مانیتور با تصاویری که در «محتوای سایت» تنظیم می‌کنید."
                onToggle={() => set({ showcaseVisible: !flags.showcaseVisible })}
              />
              <Switch
                on={flags.aboutVisible}
                label="صفحه‌ی درباره‌ی ما"
                note="اگر خاموش شود، صفحه‌ی /about پیام «یافت نشد» می‌دهد و از منو و فوتر برداشته می‌شود."
                onToggle={() => set({ aboutVisible: !flags.aboutVisible })}
              />
              <Switch
                on={flags.registrationOpen}
                label="ثبت‌نام کاربر جدید"
                note="اگر خاموش شود، صفحه‌ی ثبت‌نام پیام «فعلاً بسته است» نشان می‌دهد."
                onToggle={() => set({ registrationOpen: !flags.registrationOpen })}
              />

              <div className="ad-field" style={{ marginTop: 16 }}>
                <label className="ad-label">پیام نواری بالای سایت</label>
                <input
                  className="ad-input"
                  value={flags.banner}
                  onChange={(e) => set({ banner: e.target.value })}
                  placeholder="خالی بگذارید تا نمایش داده نشود"
                />
              </div>

              <div className="ad-row" style={{ marginTop: 16 }}>
                <button className="ad-btn primary" disabled={busy} onClick={save}>
                  {busy ? "در حال ذخیره…" : "ذخیره‌ی تنظیمات"}
                </button>
                <button className="ad-btn" disabled={busy} onClick={() => setFlags(data.content.flags)}>
                  بازگردانی
                </button>
              </div>
            </div>

            <div className="ad-card">
              <p className="ad-card-title">سلامت سرویس</p>
              <p className="ad-card-note">
                وضعیت اتصال به سرویس‌های بیرونی. اگر موردی قرمز است، متغیرهای محیطی را در
                Vercel بررسی کنید.
              </p>
              {!health ? (
                <div className="ad-empty">در دسترس نیست.</div>
              ) : (
                <pre
                  className="ad-mono"
                  style={{
                    margin: 0,
                    padding: 12,
                    borderRadius: 8,
                    background: "var(--background-base)",
                    border: "1px solid var(--border-default)",
                    overflowX: "auto",
                    fontSize: 11,
                    lineHeight: 1.9,
                    direction: "ltr",
                    textAlign: "left",
                  }}
                >
                  {JSON.stringify(health, null, 2)}
                </pre>
              )}
            </div>

            <div className="ad-card">
              <p className="ad-card-title">راه‌اندازی دیتابیس</p>
              <p className="ad-card-note">
                اگر بخشی از پنل خطای «جدول وجود ندارد» می‌دهد، فایل{" "}
                <code>supabase/admin-setup.sql</code> را در Supabase → SQL Editor اجرا کنید.
                این فایل جدول‌های نقش، محتوا، رویدادها و مخزن رسانه را می‌سازد و اجرای دوباره‌اش
                مشکلی ایجاد نمی‌کند.
              </p>
            </div>
          </>
        )}
      </AdminGate>
    </AdminShell>
  );
}

function Switch({
  on,
  label,
  note,
  onToggle,
}: {
  on: boolean;
  label: string;
  note: string;
  onToggle: () => void;
}) {
  return (
    <div className="ad-switch">
      <div className="ad-switch-txt">
        <b>{label}</b>
        <span>{note}</span>
      </div>
      <button
        className={`ad-toggle ${on ? "on" : ""}`}
        onClick={onToggle}
        role="switch"
        aria-checked={on}
        aria-label={label}
      />
    </div>
  );
}
