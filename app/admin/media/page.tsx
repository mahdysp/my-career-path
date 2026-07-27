"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AdminShell from "../AdminShell";
import AdminGate from "../AdminGate";
import Confirm from "../Confirm";
import { api, faDateTime, fileSize } from "../adminClient";

export type MediaFile = {
  name: string;
  url: string;
  size: number;
  type: string;
  createdAt: string;
};

type Payload = { files: MediaFile[]; error?: string };

export default function AdminMediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [over, setOver] = useState(false);
  const [pending, setPending] = useState<MediaFile | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api<Payload>("/api/admin/media")
      .then((d) => {
        setFiles(d.files);
        setSetupError(d.error ?? null);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  /* load را داخل یک لایه‌ی async صدا می‌زنیم تا setState همگام با اجرای
     افکت نباشد (باعث رندر آبشاری می‌شود). */
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const upload = useCallback(
    async (list: FileList | File[]) => {
      const arr = Array.from(list);
      if (!arr.length) return;
      setBusy(true);
      setMsg(null);
      let ok = 0;
      const errs: string[] = [];

      for (const f of arr) {
        const fd = new FormData();
        fd.append("file", f);
        try {
          await api("/api/admin/media", { method: "POST", body: fd });
          ok++;
        } catch (e) {
          errs.push(`${f.name}: ${e instanceof Error ? e.message : "خطا"}`);
        }
      }

      setBusy(false);
      setMsg(
        errs.length
          ? { kind: "err", text: errs.join(" — ") }
          : { kind: "ok", text: `${ok} فایل آپلود شد.` }
      );
      load();
    },
    [load]
  );

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setMsg({ kind: "ok", text: "آدرس کپی شد." });
    } catch {
      setMsg({ kind: "err", text: "کپی نشد — آدرس را دستی بردارید." });
    }
  }

  async function remove(name: string) {
    setBusy(true);
    try {
      await api(`/api/admin/media?name=${encodeURIComponent(name)}`, { method: "DELETE" });
      setMsg({ kind: "ok", text: "فایل حذف شد." });
      load();
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "خطا رخ داد." });
    } finally {
      setBusy(false);
      setPending(null);
    }
  }

  return (
    <AdminShell>
      <div className="ad-head">
        <div>
          <h1 className="ad-h1">رسانه</h1>
          <p className="ad-lede">
            تصاویر و ویدیوهای سایت. پس از آپلود، در بخش «محتوای سایت» می‌توانید هر فایل را
            روی صفحه‌ی نمایشگر بگذارید.
          </p>
        </div>
        <button className="ad-btn" onClick={load} disabled={loading || busy}>
          به‌روزرسانی
        </button>
      </div>

      {setupError && <div className="ad-note warn">{setupError}</div>}
      {msg && <div className={`ad-note ${msg.kind === "ok" ? "ok" : "err"}`}>{msg.text}</div>}

      <div
        className={`ad-drop ${over ? "over" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          upload(e.dataTransfer.files);
        }}
      >
        <p>{busy ? "در حال آپلود…" : "فایل را اینجا رها کنید یا کلیک کنید"}</p>
        <small>PNG · JPG · WebP · AVIF · GIF · SVG · MP4 · WebM — حداکثر ۱۰ مگابایت</small>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml,video/mp4,video/webm"
          onChange={(e) => {
            if (e.target.files) upload(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <div style={{ marginTop: 14 }}>
        <AdminGate loading={loading} error={error} onRetry={load}>
          {files.length === 0 ? (
            <div className="ad-empty">هنوز فایلی آپلود نشده است.</div>
          ) : (
            <div className="ad-media">
              {files.map((f) => (
                <div key={f.name} className="ad-media-item">
                  <div className="ad-media-thumb">
                    {f.type.startsWith("video/") ? (
                      <video src={f.url} muted playsInline />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.url} alt={f.name} loading="lazy" />
                    )}
                  </div>
                  <div className="ad-media-meta">
                    <div className="ad-media-name">{f.name}</div>
                    <div className="ad-mono" style={{ fontSize: 10, marginTop: 3 }}>
                      {fileSize(f.size)} · {faDateTime(f.createdAt)}
                    </div>
                    <div className="ad-media-actions">
                      <button className="ad-btn sm" onClick={() => copy(f.url)}>
                        کپی آدرس
                      </button>
                      <button className="ad-btn sm danger" disabled={busy} onClick={() => setPending(f)}>
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminGate>
      </div>

      {pending && (
        <Confirm
          title="حذف فایل"
          body={`«${pending.name}» حذف شود؟ اگر جایی از سایت استفاده شده باشد، آنجا خالی می‌شود.`}
          danger
          busy={busy}
          onCancel={() => setPending(null)}
          onConfirm={() => remove(pending.name)}
        />
      )}
    </AdminShell>
  );
}
