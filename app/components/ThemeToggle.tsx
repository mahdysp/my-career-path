"use client";

import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "karex-theme";

/**
 * اسکریپتی که قبل از رنگ‌آمیزی صفحه اجرا می‌شود تا از پرش تم (FOUC) جلوگیری کند.
 * در <head> با dangerouslySetInnerHTML تزریق می‌شود.
 */
export const themeInitScript = `(function(){try{
var t=localStorage.getItem('${THEME_STORAGE_KEY}');
if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}
document.documentElement.setAttribute('data-theme',t);
}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.add("k2-theming");
  root.setAttribute("data-theme", theme);
  window.setTimeout(() => root.classList.remove("k2-theming"), 320);
}

/** دکمه تغییر تم — خورشید/ماه با انیمیشن چرخشی */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const current = (document.documentElement.getAttribute("data-theme") as Theme) || "dark";
    setTheme(current);
    setReady(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  const label = theme === "dark" ? "روشن کردن تم روز" : "فعال کردن تم شب";

  return (
    <button
      type="button"
      onClick={toggle}
      className={`k2-theme-toggle ${className}`}
      aria-label={label}
      title={label}
      suppressHydrationWarning
    >
      {/* خورشید */}
      <svg className="k2-sun" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      {/* ماه */}
      <svg className="k2-moon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
      {!ready && <span style={{ display: "none" }} />}
    </button>
  );
}
