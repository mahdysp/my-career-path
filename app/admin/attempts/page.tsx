"use client";

import { useCallback, useEffect, useState } from "react";
import AdminShell from "../AdminShell";
import AdminGate from "../AdminGate";
import Confirm from "../Confirm";
import { api, faDateTime, faNum } from "../adminClient";

type Row = {
  id: string;
  userId: string;
  email: string;
  query: string;
  summary: string | null;
  createdAt: string;
};

type Payload = { attempts: Row[]; total: number; page: number; pageSize: number };

export default function AdminAttemptsPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [pending, setPending] = useState<Row | null>(null);
  const [open, setOpen] = useState<Row | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const sp = new URLSearchParams({ page: String(page) });
    if (q.trim()) sp.set("q", q.trim());
    api<Payload>(`/api/admin/attempts?${sp}`)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [page, q]);

  useEffect(() => {
    const t = setTimeout(load, q ? 320 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  async function remove(id: string) {
    setBusy(true);
    try {
      await api(`/api/admin/attempts?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      setMsg("آزمون حذف شد.");
      load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "خطا رخ داد.");
    } finally {
      setBusy(false);
      setPending(null);
    }
  }

  const pages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <AdminShell>
      <div className="ad-head">
        <div>
          <h1 className="ad-h1">آزمون‌ها</h1>
          <p className="ad-lede">همه‌ی آزمون‌های انجام‌شده روی سایت، همراه با صاحب و خلاصه‌ی نتیجه.</p>
        </div>
        {data && <span className="ad-badge">{faNum(data.total)} آزمون</span>}
      </div>

      <div className="ad-toolbar">
        <input
          className="ad-input"
          placeholder="جست‌وجو در عنوان آزمون…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(0);
          }}
        />
      </div>

      {msg && <div className="ad-note">{msg}</div>}

      <AdminGate loading={loading && !data} error={error} onRetry={load}>
        {data && (
          <>
            <div className="ad-tablewrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>عنوان</th>
                    <th>کاربر</th>
                    <th>تاریخ</th>
                    <th style={{ width: 1 }}>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {data.attempts.length === 0 && (
                    <tr>
                      <td colSpan={4}>
                        <div className="ad-empty">آزمونی پیدا نشد.</div>
                      </td>
                    </tr>
                  )}
                  {data.attempts.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <div className="ad-trunc" style={{ fontSize: 13, fontWeight: 600 }}>
                          {a.query || "بدون عنوان"}
                        </div>
                        {a.summary && (
                          <div className="ad-trunc" style={{ fontSize: 11.5, color: "var(--foreground-subtle)", marginTop: 2 }}>
                            {a.summary}
                          </div>
                        )}
                      </td>
                      <td className="ad-mono ad-trunc">{a.email}</td>
                      <td className="ad-mono">{faDateTime(a.createdAt)}</td>
                      <td>
                        <div className="ad-row" style={{ flexWrap: "nowrap" }}>
                          <button className="ad-btn sm" onClick={() => setOpen(a)}>
                            جزئیات
                          </button>
                          <button className="ad-btn sm danger" disabled={busy} onClick={() => setPending(a)}>
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pages > 1 && (
              <div className="ad-pager">
                <span className="ad-pager-info">
                  صفحه {faNum(page + 1)} از {faNum(pages)}
                </span>
                <div className="ad-row">
                  <button className="ad-btn sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                    قبلی
                  </button>
                  <button className="ad-btn sm" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>
                    بعدی
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </AdminGate>

      {pending && (
        <Confirm
          title="حذف آزمون"
          body={`آزمون «${pending.query || "بدون عنوان"}» برای همیشه حذف شود؟ این کار قابل بازگشت نیست.`}
          danger
          busy={busy}
          onCancel={() => setPending(null)}
          onConfirm={() => remove(pending.id)}
        />
      )}

      {open && (
        <div className="ad-overlay" onClick={() => setOpen(null)}>
          <div className="ad-dialog" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <h3>{open.query || "بدون عنوان"}</h3>
            <p style={{ marginBottom: 10 }}>
              <span className="ad-mono">{open.email}</span>
              <br />
              {faDateTime(open.createdAt)}
            </p>
            <div className="ad-note" style={{ maxHeight: 260, overflowY: "auto" }}>
              {open.summary || "خلاصه‌ای ثبت نشده است."}
            </div>
            <div className="ad-row" style={{ marginTop: 14, justifyContent: "flex-end" }}>
              <button className="ad-btn" onClick={() => setOpen(null)}>
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
