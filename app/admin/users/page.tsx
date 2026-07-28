"use client";

import { useCallback, useEffect, useState } from "react";
import AdminShell from "../AdminShell";
import AdminGate from "../AdminGate";
import Confirm from "../Confirm";
import { api, faDateTime, faNum } from "../adminClient";

type Row = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  education: string;
  role: string;
  bannedAt: string | null;
  notes: string;
  createdAt: string;
  attempts: number;
};

type Payload = {
  users: Row[];
  total: number;
  page: number;
  pageSize: number;
  selfId: string;
};

type Pending = { id: string; action: string; label: string; body: string } | null;

export default function AdminUsersPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [pending, setPending] = useState<Pending>(null);
  const [openNotes, setOpenNotes] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const sp = new URLSearchParams({ page: String(page) });
    if (q.trim()) sp.set("q", q.trim());
    if (role) sp.set("role", role);
    if (status) sp.set("status", status);
    api<Payload>(`/api/admin/users?${sp}`)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [page, q, role, status]);

  /* جست‌وجو با تأخیر تا هر حرف یک درخواست نفرستد */
  useEffect(() => {
    const t = setTimeout(load, q ? 320 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  async function act(id: string, action: string, value?: unknown) {
    setBusy(true);
    setMsg(null);
    try {
      await api("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, value }),
      });
      setMsg({ kind: "ok", text: "انجام شد." });
      load();
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "خطا رخ داد." });
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
          <h1 className="ad-h1">کاربران</h1>
          <p className="ad-lede">
            جست‌وجو، تغییر نقش، مسدودسازی و حذف. همه‌ی عملیات حساس در دفتر رویدادها ثبت می‌شود.
          </p>
        </div>
        {data && <span className="ad-badge">{faNum(data.total)} کاربر</span>}
      </div>

      <div className="ad-toolbar">
        <input
          className="ad-input"
          placeholder="جست‌وجو در ایمیل یا نام…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(0);
          }}
        />
        <select
          className="ad-select"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(0);
          }}
        >
          <option value="">همه‌ی نقش‌ها</option>
          <option value="admin">ادمین</option>
          <option value="user">کاربر عادی</option>
        </select>
        <select
          className="ad-select"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
        >
          <option value="">همه‌ی وضعیت‌ها</option>
          <option value="active">فعال</option>
          <option value="banned">مسدود</option>
        </select>
      </div>

      {msg && <div className={`ad-note ${msg.kind === "ok" ? "ok" : "err"}`}>{msg.text}</div>}

      <AdminGate loading={loading && !data} error={error} onRetry={load}>
        {data && (
          <>
            <div className="ad-tablewrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>کاربر</th>
                    <th>نقش</th>
                    <th>آزمون</th>
                    <th>عضویت</th>
                    <th style={{ width: 1 }}>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.length === 0 && (
                    <tr>
                      <td colSpan={5}>
                        <div className="ad-empty">کاربری با این مشخصات پیدا نشد.</div>
                      </td>
                    </tr>
                  )}
                  {data.users.map((u) => {
                    const self = u.id === data.selfId;
                    const name = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
                    return (
                      <tr key={u.id}>
                        <td>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>
                            {name || "بدون نام"}
                            {self && (
                              <span className="ad-badge" style={{ marginInlineStart: 6 }}>
                                شما
                              </span>
                            )}
                          </div>
                          <div className="ad-mono">{u.email}</div>
                          {u.notes && (
                            <div
                              className="ad-trunc"
                              style={{ fontSize: 11, color: "var(--foreground-subtle)", marginTop: 3 }}
                            >
                              یادداشت: {u.notes}
                            </div>
                          )}
                        </td>
                        <td>
                          {u.bannedAt ? (
                            <span className="ad-badge danger">مسدود</span>
                          ) : u.role === "admin" ? (
                            <span className="ad-badge accent">ادمین</span>
                          ) : (
                            <span className="ad-badge">کاربر</span>
                          )}
                        </td>
                        <td className="ad-mono">{faNum(u.attempts)}</td>
                        <td className="ad-mono">{faDateTime(u.createdAt)}</td>
                        <td>
                          <div className="ad-row" style={{ flexWrap: "nowrap" }}>
                            <button
                              className="ad-btn sm"
                              disabled={busy}
                              onClick={() => {
                                setOpenNotes(u.id);
                                setNoteDraft(u.notes);
                              }}
                            >
                              یادداشت
                            </button>
                            {u.role === "admin" ? (
                              <button
                                className="ad-btn sm"
                                disabled={busy || self}
                                title={self ? "روی حساب خودتان ممکن نیست" : ""}
                                onClick={() =>
                                  setPending({
                                    id: u.id,
                                    action: "demote",
                                    label: "خلع نقش ادمین",
                                    body: `دسترسی ادمین از «${u.email}» گرفته شود؟`,
                                  })
                                }
                              >
                                خلع ادمین
                              </button>
                            ) : (
                              <button
                                className="ad-btn sm"
                                disabled={busy}
                                onClick={() =>
                                  setPending({
                                    id: u.id,
                                    action: "promote",
                                    label: "ارتقا به ادمین",
                                    body: `به «${u.email}» دسترسی کامل مدیریت داده شود؟`,
                                  })
                                }
                              >
                                ادمین کن
                              </button>
                            )}
                            {u.bannedAt ? (
                              <button className="ad-btn sm" disabled={busy} onClick={() => act(u.id, "unban")}>
                                رفع مسدودی
                              </button>
                            ) : (
                              <button
                                className="ad-btn sm"
                                disabled={busy || self}
                                onClick={() =>
                                  setPending({
                                    id: u.id,
                                    action: "ban",
                                    label: "مسدودسازی کاربر",
                                    body: `«${u.email}» مسدود شود؟ داده‌هایش حذف نمی‌شود و بعداً قابل بازگشت است.`,
                                  })
                                }
                              >
                                مسدود
                              </button>
                            )}
                            <button
                              className="ad-btn sm danger"
                              disabled={busy || self}
                              onClick={() =>
                                setPending({
                                  id: u.id,
                                  action: "delete",
                                  label: "حذف کامل کاربر",
                                  body: `«${u.email}» و تمام ${faNum(u.attempts)} آزمونش برای همیشه حذف شوند؟ این کار قابل بازگشت نیست.`,
                                })
                              }
                            >
                              حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
                  <button
                    className="ad-btn sm"
                    disabled={page >= pages - 1}
                    onClick={() => setPage((p) => p + 1)}
                  >
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
          title={pending.label}
          body={pending.body}
          danger={pending.action === "delete"}
          busy={busy}
          onCancel={() => setPending(null)}
          onConfirm={() => act(pending.id, pending.action)}
        />
      )}

      {openNotes && (
        <div className="ad-overlay" onClick={() => setOpenNotes(null)}>
          <div className="ad-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>یادداشت داخلی</h3>
            <p>این یادداشت فقط برای مدیران دیده می‌شود و به کاربر نمایش داده نمی‌شود.</p>
            <textarea
              className="ad-textarea"
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="مثلاً: درخواست پشتیبانی داشت…"
            />
            <div className="ad-row" style={{ marginTop: 14, justifyContent: "flex-end" }}>
              <button className="ad-btn" onClick={() => setOpenNotes(null)}>
                انصراف
              </button>
              <button
                className="ad-btn primary"
                disabled={busy}
                onClick={async () => {
                  await act(openNotes, "notes", noteDraft);
                  setOpenNotes(null);
                }}
              >
                ذخیره
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
