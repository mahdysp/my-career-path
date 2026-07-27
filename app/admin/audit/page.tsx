"use client";

import { useCallback, useEffect, useState } from "react";
import AdminShell from "../AdminShell";
import AdminGate from "../AdminGate";
import { api, faDateTime, faNum } from "../adminClient";

type Entry = {
  id: number;
  created_at: string;
  actor_email: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  detail: unknown;
  ip: string | null;
};

type Payload = {
  entries: Entry[];
  total: number;
  page: number;
  pageSize: number;
  error?: string;
};

/** برچسب فارسی برای هر نوع عمل */
const LABEL: Record<string, string> = {
  "user.delete": "حذف کاربر",
  "user.promote": "ارتقا به ادمین",
  "user.demote": "خلع ادمین",
  "user.ban": "مسدودسازی",
  "user.unban": "رفع مسدودی",
  "user.user.notes": "ویرایش یادداشت",
  "attempt.delete": "حذف آزمون",
  "content.update": "ویرایش محتوا",
  "media.upload": "آپلود فایل",
  "media.delete": "حذف فایل",
};

const isDanger = (a: string) => a.includes("delete") || a.includes("ban");

export default function AdminAuditPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [page, setPage] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api<Payload>(`/api/admin/audit?page=${page}`)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [page]);

  /* load را داخل یک لایه‌ی async صدا می‌زنیم تا setState همگام با اجرای
     افکت نباشد (باعث رندر آبشاری می‌شود). */
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const pages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <AdminShell>
      <div className="ad-head">
        <div>
          <h1 className="ad-h1">رویدادها</h1>
          <p className="ad-lede">
            هر عمل حساس مدیران اینجا ثبت می‌شود. این دفتر فقط خواندنی است و از پنل قابل
            پاک کردن نیست.
          </p>
        </div>
        {data && !data.error && <span className="ad-badge">{faNum(data.total)} رویداد</span>}
      </div>

      {data?.error && <div className="ad-note warn">{data.error}</div>}

      <AdminGate loading={loading && !data} error={error} onRetry={load}>
        {data && !data.error && (
          <>
            <div className="ad-tablewrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>عمل</th>
                    <th>مدیر</th>
                    <th>هدف</th>
                    <th>زمان</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {data.entries.length === 0 && (
                    <tr>
                      <td colSpan={5}>
                        <div className="ad-empty">هنوز رویدادی ثبت نشده است.</div>
                      </td>
                    </tr>
                  )}
                  {data.entries.map((e) => (
                    <tr key={e.id}>
                      <td>
                        <span className={`ad-badge ${isDanger(e.action) ? "danger" : ""}`}>
                          {LABEL[e.action] ?? e.action}
                        </span>
                      </td>
                      <td className="ad-mono ad-trunc">{e.actor_email ?? "—"}</td>
                      <td className="ad-mono ad-trunc" title={e.target_id ?? ""}>
                        {e.target_id ?? "—"}
                      </td>
                      <td className="ad-mono">{faDateTime(e.created_at)}</td>
                      <td className="ad-mono">{e.ip ?? "—"}</td>
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
    </AdminShell>
  );
}
