"use client";

import { useEffect } from "react";

/**
 * دیالوگ تأیید برای عملیات بازگشت‌ناپذیر.
 *
 * چرا لازم است: پنل اجازه‌ی حذف کامل کاربر را می‌دهد. یک کلیک اشتباه
 * روی دکمه‌ی حذف نباید داده‌ی کسی را از بین ببرد.
 */
export default function Confirm({
  title,
  body,
  danger,
  busy,
  confirmLabel = "تأیید",
  onConfirm,
  onCancel,
}: {
  title: string;
  body: string;
  danger?: boolean;
  busy?: boolean;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  /* Escape برای بستن — انتظار استاندارد هر دیالوگی */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="ad-overlay" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="ad-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{body}</p>
        <div className="ad-row">
          <button className="ad-btn" onClick={onCancel} disabled={busy}>
            انصراف
          </button>
          <button
            className={`ad-btn ${danger ? "danger" : "primary"}`}
            onClick={onConfirm}
            disabled={busy}
            autoFocus
          >
            {busy ? "در حال انجام…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
