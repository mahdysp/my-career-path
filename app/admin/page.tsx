"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import AdminShell from "./AdminShell";
import AdminGate from "./AdminGate";
import { api, faAgo, faNum, faDateTime } from "./adminClient";

type Overview = {
  admin: { email: string; via: string };
  stats: {
    users: number;
    usersDay: number;
    usersWeek: number;
    admins: number;
    banned: number;
    attempts: number;
    attemptsDay: number;
    attemptsWeek: number;
  };
  trend: { date: string; value: number }[];
  recentUsers: { id: string; email: string; name: string; createdAt: string; role: string }[];
  recentAttempts: { id: string; user_id: string; query: string; created_at: string }[];
};

export default function AdminOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api<Overview>("/api/admin/overview")
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  /* load را داخل یک لایه‌ی async صدا می‌زنیم تا setState همگام با اجرای
     افکت نباشد (باعث رندر آبشاری می‌شود). */
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const peak = Math.max(1, ...(data?.trend ?? []).map((t) => t.value));

  return (
    <AdminShell admin={data?.admin ?? null}>
      <div className="ad-head">
        <div>
          <h1 className="ad-h1">نمای کلی</h1>
          <p className="ad-lede">وضعیت لحظه‌ای سایت — کاربران، آزمون‌ها و روند فعالیت.</p>
        </div>
        <button className="ad-btn" onClick={load} disabled={loading}>
          به‌روزرسانی
        </button>
      </div>

      <AdminGate loading={loading} error={error} onRetry={load}>
        {data && (
          <>
            <div className="ad-stats">
              <Stat
                k="کل کاربران"
                v={data.stats.users}
                d={data.stats.usersWeek > 0 ? `+${faNum(data.stats.usersWeek)} این هفته` : "بدون تغییر این هفته"}
                up={data.stats.usersWeek > 0}
              />
              <Stat
                k="کل آزمون‌ها"
                v={data.stats.attempts}
                d={data.stats.attemptsWeek > 0 ? `+${faNum(data.stats.attemptsWeek)} این هفته` : "بدون تغییر این هفته"}
                up={data.stats.attemptsWeek > 0}
              />
              <Stat k="امروز" v={data.stats.attemptsDay} d={`${faNum(data.stats.usersDay)} کاربر تازه`} />
              <Stat k="مدیران" v={data.stats.admins} d={data.stats.banned ? `${faNum(data.stats.banned)} کاربر مسدود` : "بدون کاربر مسدود"} />
            </div>

            <div className="ad-card" style={{ marginTop: 14 }}>
              <p className="ad-card-title">آزمون‌های ۳۰ روز اخیر</p>
              <p className="ad-card-note">
                بیشترین در یک روز: {faNum(peak)} — مجموع {faNum(data.trend.reduce((a, t) => a + t.value, 0))}
              </p>
              <div className="ad-spark">
                {data.trend.map((t) => (
                  <i
                    key={t.date}
                    style={{ height: `${Math.max(3, (t.value / peak) * 100)}%` }}
                    title={`${t.date} — ${faNum(t.value)} آزمون`}
                  />
                ))}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gap: 14,
                marginTop: 14,
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              }}
            >
              <div className="ad-card">
                <p className="ad-card-title">کاربران تازه</p>
                <p className="ad-card-note">
                  <Link href="/admin/users" style={{ color: "var(--accent)" }}>
                    مشاهده‌ی همه‌ی کاربران ←
                  </Link>
                </p>
                {data.recentUsers.length === 0 ? (
                  <div className="ad-empty">هنوز کاربری ثبت‌نام نکرده است.</div>
                ) : (
                  data.recentUsers.map((u) => (
                    <div
                      key={u.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                        padding: "8px 0",
                        borderBottom: "1px solid var(--border-default)",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name || "بدون نام"}</div>
                        <div className="ad-mono ad-trunc">{u.email}</div>
                      </div>
                      <div style={{ textAlign: "left", flex: "0 0 auto" }}>
                        {u.role === "admin" && <span className="ad-badge accent">ادمین</span>}
                        <div className="ad-mono" style={{ marginTop: 3 }}>
                          {faAgo(u.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="ad-card">
                <p className="ad-card-title">آزمون‌های اخیر</p>
                <p className="ad-card-note">
                  <Link href="/admin/attempts" style={{ color: "var(--accent)" }}>
                    مشاهده‌ی همه‌ی آزمون‌ها ←
                  </Link>
                </p>
                {data.recentAttempts.length === 0 ? (
                  <div className="ad-empty">هنوز آزمونی انجام نشده است.</div>
                ) : (
                  data.recentAttempts.map((a) => (
                    <div
                      key={a.id}
                      style={{
                        padding: "8px 0",
                        borderBottom: "1px solid var(--border-default)",
                      }}
                    >
                      <div className="ad-trunc" style={{ fontSize: 13, maxWidth: "100%" }}>
                        {a.query || "بدون عنوان"}
                      </div>
                      <div className="ad-mono">{faDateTime(a.created_at)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </AdminGate>
    </AdminShell>
  );
}

function Stat({ k, v, d, up }: { k: string; v: number; d: string; up?: boolean }) {
  return (
    <div className="ad-stat">
      <div className="ad-stat-k">{k}</div>
      <div className="ad-stat-v">{faNum(v)}</div>
      <div className={`ad-stat-d ${up ? "up" : ""}`}>{d}</div>
    </div>
  );
}
