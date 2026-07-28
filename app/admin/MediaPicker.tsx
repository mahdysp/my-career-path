"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, fileSize } from "./adminClient";
import type { MediaFile } from "./media/page";

/**
 * انتخابگر فایل از کتابخانه‌ی رسانه، با امکان آپلود در همان لحظه.
 *
 * چرا آپلود اینجا هم هست: بدون آن، برای گذاشتن یک عکس روی اسلاید باید
 * به صفحه‌ی رسانه بروید، آپلود کنید، برگردید و کارِ نیمه‌کاره را از دست
 * بدهید.
 */
export default function MediaPicker({
  onPick,
  onClose,
}: {
  onPick: (f: MediaFile) => void;
  onClose: () => void;
}) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    setLoading(true);
    api<{ files: MediaFile[]; error?: string }>("/api/admin/media")
      .then((d) => {
        setFiles(d.files);
        if (d.error) setErr(d.error);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "خطا"))
      .finally(() => setLoading(false));
  }, []);

  /* load را داخل یک لایه‌ی async صدا می‌زنیم تا setState همگام با اجرای
     افکت نباشد (باعث رندر آبشاری می‌شود). */
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function upload(list: FileList) {
    if (!list.length) return;
    setBusy(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", list[0]);
      const res = await api<{ file: MediaFile }>("/api/admin/media", {
        method: "POST",
        body: fd,
      });
      onPick(res.file);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "آپلود نشد.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ad-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="ad-dialog"
        style={{ maxWidth: 720, maxHeight: "86vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>انتخاب تصویر</h3>
        <p>یک فایل از کتابخانه انتخاب کنید، فایل تازه آپلود کنید، یا آدرس مستقیم بدهید.</p>

        {err && <div className="ad-note err" style={{ marginBottom: 12 }}>{err}</div>}

        <div className="ad-row" style={{ marginBottom: 12 }}>
          <button className="ad-btn primary" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? "در حال آپلود…" : "آپلود فایل تازه"}
          </button>
          <input
            ref={inputRef}
            type="file"
            hidden
            accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml,video/mp4,video/webm"
            onChange={(e) => {
              if (e.target.files) upload(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        <div className="ad-row" style={{ marginBottom: 16, flexWrap: "nowrap" }}>
          <input
            className="ad-input"
            placeholder="یا آدرس مستقیم تصویر…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            className="ad-btn"
            disabled={!url.trim()}
            onClick={() =>
              onPick({
                name: url,
                url: url.trim(),
                size: 0,
                type: /\.(mp4|webm)$/i.test(url) ? "video/mp4" : "image/png",
                createdAt: new Date().toISOString(),
              })
            }
          >
            استفاده
          </button>
        </div>

        {loading ? (
          <div className="ad-empty">در حال بارگذاری…</div>
        ) : files.length === 0 ? (
          <div className="ad-empty">کتابخانه خالی است. یک فایل آپلود کنید.</div>
        ) : (
          <div className="ad-media">
            {files.map((f) => (
              <button
                key={f.name}
                className="ad-media-item"
                style={{ padding: 0, cursor: "pointer", textAlign: "start", background: "none" }}
                onClick={() => onPick(f)}
              >
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
                  <div className="ad-mono" style={{ fontSize: 10 }}>{fileSize(f.size)}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="ad-row" style={{ marginTop: 16, justifyContent: "flex-end" }}>
          <button className="ad-btn" onClick={onClose}>
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}
