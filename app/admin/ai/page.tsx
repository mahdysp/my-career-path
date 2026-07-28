"use client";

import { useCallback, useEffect, useState } from "react";
import AdminShell from "../AdminShell";
import AdminGate from "../AdminGate";
import { api } from "../adminClient";
import { aiStyles } from "./aiStyles";
import ProvidersTab from "./ProvidersTab";
import PromptsTab from "./PromptsTab";
import type { AiPrompt, AiProvider } from "@/lib/ai-providers";

/**
 * صفحه‌ی هوش مصنوعی — دو تب: سرویس‌دهنده‌ها و قالب‌های دستور.
 *
 * چرا یک صفحه با تب و نه دو صفحه: این دو همیشه با هم تنظیم می‌شوند. وقتی
 * قالبی را عوض می‌کنید معمولاً می‌خواهید همان‌جا اتصال سرویس را هم بیازمایید.
 */

type Tab = "providers" | "prompts";

export default function AdminAiPage() {
  const [tab, setTab] = useState<Tab>("providers");

  const [providers, setProviders] = useState<AiProvider[]>([]);
  const [prompts, setPrompts] = useState<AiPrompt[]>([]);
  const [encryption, setEncryption] = useState(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      api<{ providers: AiProvider[]; encryption: boolean }>("/api/admin/ai/providers"),
      api<{ prompts: AiPrompt[] }>("/api/admin/ai/prompts"),
    ])
      .then(([p, q]) => {
        setProviders(p.providers);
        setEncryption(p.encryption);
        setPrompts(q.prompts);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  /* در یک لایه‌ی async تا setState همگام با اجرای افکت نباشد */
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  /** بارگذاری دوباره بدون نمایش حالت «در حال بارگذاری» — تا صفحه نپرد */
  const refresh = useCallback(() => {
    Promise.all([
      api<{ providers: AiProvider[]; encryption: boolean }>("/api/admin/ai/providers"),
      api<{ prompts: AiPrompt[] }>("/api/admin/ai/prompts"),
    ])
      .then(([p, q]) => {
        setProviders(p.providers);
        setEncryption(p.encryption);
        setPrompts(q.prompts);
      })
      .catch((e) => setMsg({ kind: "err", text: e instanceof Error ? e.message : "خطا" }));
  }, []);

  const notify = useCallback((kind: "ok" | "err", text: string) => {
    setMsg({ kind, text });
    // پیام موفقیت خودش می‌رود؛ خطا می‌ماند تا خوانده شود
    if (kind === "ok") setTimeout(() => setMsg(null), 4000);
  }, []);

  return (
    <AdminShell>
      <style>{aiStyles}</style>

      <div className="ad-head">
        <div>
          <h1 className="ad-h1">هوش مصنوعی</h1>
          <p className="ad-lede">
            سرویس‌های تولید سوال و تحلیل، و متن دستورهایی که به آن‌ها فرستاده می‌شود.
          </p>
        </div>
      </div>

      {msg && <div className={`ad-note ${msg.kind === "ok" ? "ok" : "err"}`}>{msg.text}</div>}

      <div className="ai-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === "providers"}
          className={`ai-tab ${tab === "providers" ? "on" : ""}`}
          onClick={() => setTab("providers")}
        >
          سرویس‌دهنده‌ها
          {providers.length > 0 && <span className="ai-tab-count">{providers.length}</span>}
        </button>
        <button
          role="tab"
          aria-selected={tab === "prompts"}
          className={`ai-tab ${tab === "prompts" ? "on" : ""}`}
          onClick={() => setTab("prompts")}
        >
          قالب‌های دستور
          {prompts.length > 0 && <span className="ai-tab-count">{prompts.length}</span>}
        </button>
      </div>

      <AdminGate loading={loading} error={error} onRetry={load}>
        {tab === "providers" ? (
          <ProvidersTab
            providers={providers}
            encryption={encryption}
            onChanged={refresh}
            notify={notify}
          />
        ) : (
          <PromptsTab prompts={prompts} onChanged={refresh} notify={notify} />
        )}
      </AdminGate>
    </AdminShell>
  );
}
