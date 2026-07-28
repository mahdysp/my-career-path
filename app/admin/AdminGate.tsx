"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { AdminError } from "./adminClient";

/**
 * حالت‌های بارگذاری / رد دسترسی / خطا با یک ظاهر یکسان.
 *
 * چرا جداست: هر هفت صفحه‌ی پنل همین سه حالت را دارند و بدون این، منطق
 * تکراری در همه‌جا پخش می‌شد.
 */
export default function AdminGate({
  loading,
  error,
  onRetry,
  children,
}: {
  loading: boolean;
  error: unknown;
  onRetry?: () => void;
  children: ReactNode;
}) {
  if (loading) {
    return (
      <div className="ad-empty" role="status">
        در حال بارگذاری…
      </div>
    );
  }

  if (error) {
    const status = error instanceof AdminError ? error.status : 0;
    const msg = error instanceof Error ? error.message : "خطای غیرمنتظره‌ای رخ داد.";

    if (status === 401) {
      return (
        <div className="ad-card" style={{ maxWidth: 460 }}>
          <p className="ad-card-title">وارد نشده‌اید</p>
          <p className="ad-card-note">برای دسترسی به پنل مدیریت باید وارد حساب خود شوید.</p>
          <Link
            href={`/auth?next=${encodeURIComponent("/admin")}`}
            className="ad-btn primary"
            style={{ textDecoration: "none" }}
          >
            ورود به حساب
          </Link>
        </div>
      );
    }

    if (status === 403) {
      return (
        <div className="ad-card" style={{ maxWidth: 520 }}>
          <p className="ad-card-title">دسترسی ندارید</p>
          <p className="ad-card-note">
            {msg}
            <br />
            <br />
            اگر باید ادمین باشید، یکی از این دو کار را انجام دهید:
          </p>
          <ol
            style={{
              margin: 0,
              paddingInlineStart: 18,
              fontSize: 12.5,
              lineHeight: 2.1,
              color: "var(--foreground-muted)",
            }}
          >
            <li>
              ایمیل خود را به متغیر محیطی <code>ADMIN_EMAILS</code> در Vercel اضافه کنید
              (چند ایمیل با ویرگول جدا می‌شود).
            </li>
            <li>
              یا در Supabase اجرا کنید:{" "}
              <code style={{ fontSize: 11.5 }}>
                update profiles set role = &apos;admin&apos; where email = &apos;…&apos;;
              </code>
            </li>
          </ol>
          <div className="ad-row" style={{ marginTop: 16 }}>
            {onRetry && (
              <button className="ad-btn" onClick={onRetry}>
                بررسی دوباره
              </button>
            )}
            <Link href="/" className="ad-btn" style={{ textDecoration: "none" }}>
              بازگشت به سایت
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="ad-card" style={{ maxWidth: 460 }}>
        <p className="ad-card-title">خطا در بارگذاری</p>
        <p className="ad-card-note">{msg}</p>
        {onRetry && (
          <button className="ad-btn" onClick={onRetry}>
            تلاش دوباره
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
