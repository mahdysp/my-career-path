"use client";

import Link from "next/link";

/** صفحه‌ی وضعیت مشترک برای خطا / ۴۰۴ — هماهنگ با تم سایت */
export default function StatusScreen({
  code,
  title,
  description,
  primary,
  secondary,
}: {
  code: string;
  title: string;
  description: string;
  primary?: { label: string; href?: string; onClick?: () => void };
  secondary?: { label: string; href: string };
}) {
  return (
    <main
      dir="rtl"
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        background: "var(--page-gradient)",
        fontFamily: "var(--font-sans)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <style>{`
        @keyframes k2FadeUp { from { opacity:0; transform: translateY(18px); } to { opacity:1; transform: translateY(0); } }
        @keyframes k2Float { 0%,100% { transform: translate(-50%,0); } 50% { transform: translate(-50%,-24px); } }
        .k2-status-card { animation: k2FadeUp .6s cubic-bezier(.16,1,.3,1) both; }
        .k2-status-btn {
          font-family: var(--font-sans); font-weight: 500; border: none; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          height: 44px; padding: 0 24px; font-size: 14.5px; border-radius: 8px;
          text-decoration: none;
          transition: transform .2s cubic-bezier(.16,1,.3,1), box-shadow .2s ease, background .2s ease;
        }
        .k2-status-primary {
          background: var(--accent); color: #fff;
          box-shadow: 0 0 0 1px var(--border-accent), 0 4px 12px var(--accent-glow);
        }
        .k2-status-primary:hover { background: var(--accent-bright); transform: translateY(-2px); }
        .k2-status-secondary {
          background: var(--surface); color: var(--foreground);
          box-shadow: inset 0 0 0 1px var(--border-default);
        }
        .k2-status-secondary:hover { background: var(--surface-hover); }
      `}</style>

      <div
        style={{
          position: "absolute",
          top: "-220px",
          left: "50%",
          width: 900,
          height: 620,
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--blob-1), transparent 70%)",
          filter: "blur(140px)",
          pointerEvents: "none",
          animation: "k2Float 9s ease-in-out infinite",
        }}
      />

      <div
        className="k2-status-card"
        style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 440 }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 62,
            lineHeight: 1,
            color: "var(--accent)",
            opacity: 0.9,
            marginBottom: 20,
          }}
        >
          {code}
        </div>

        <h1
          style={{
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: "-.02em",
            color: "var(--foreground)",
            margin: "0 0 10px",
          }}
        >
          {title}
        </h1>

        <p
          style={{
            fontSize: 13.5,
            lineHeight: 1.9,
            color: "var(--foreground-muted)",
            margin: "0 0 26px",
          }}
        >
          {description}
        </p>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {primary &&
            (primary.href ? (
              <Link href={primary.href} className="k2-status-btn k2-status-primary">
                {primary.label}
              </Link>
            ) : (
              <button onClick={primary.onClick} className="k2-status-btn k2-status-primary">
                {primary.label}
              </button>
            ))}
          {secondary && (
            <Link href={secondary.href} className="k2-status-btn k2-status-secondary">
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
