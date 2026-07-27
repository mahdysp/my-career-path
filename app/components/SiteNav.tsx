"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { navStyles } from "./navStyles";

/**
 * نوار بالای سایت — قرص شناور با منوهای بازشونده.
 *
 * دو رفتار کلیدی:
 *   ۱. **پنهان‌شدن هوشمند**: اسکرول به پایین → محو می‌شود؛ اسکرول به بالا →
 *      برمی‌گردد. آستانه‌ی ۶ پیکسل دارد تا لرزش‌های کوچک ترکش نکنند، و تا
 *      ۱۲۰ پیکسل اول همیشه دیده می‌شود.
 *   ۲. **منوهای بازشونده** با تأخیر بسته‌شدن، چون بدون آن حرکت مورب ماوس
 *      از دکمه به داخل منو باعث بسته‌شدن ناگهانی می‌شود.
 */

type Leaf = { label: string; desc: string; href: string; icon: keyof typeof ICONS };
type Group = { label: string; wide?: boolean; items: Leaf[] };

const ICONS = {
  compass: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="m15.2 8.8-2 5.4-5.4 2 2-5.4z" />
    </svg>
  ),
  chart: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19V5M4 19h16" /><path d="M8 15v-3M12.5 15V8M17 15v-5" />
    </svg>
  ),
  layers: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3 8.5 4.5L12 12 3.5 7.5z" /><path d="m3.5 12.5 8.5 4.5 8.5-4.5" />
    </svg>
  ),
  spark: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><circle cx="12" cy="12" r="3.2" />
    </svg>
  ),
  book: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H19v16H5.5A1.5 1.5 0 0 1 4 18.5z" /><path d="M8 8h7M8 12h7" />
    </svg>
  ),
  target: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r=".9" fill="currentColor" />
    </svg>
  ),
  user: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.6" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  ),
  shield: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6z" /><path d="m9.2 12 2 2 3.6-3.8" />
    </svg>
  ),
};

const GROUPS: Group[] = [
  {
    label: "امکانات",
    wide: true,
    items: [
      { label: "آزمون شخصیت شغلی", desc: "شش بُعد RIASEC بر پایه‌ی استاندارد O*NET", href: "/features/assessment", icon: "compass" },
      { label: "پروفایل شغلی", desc: "شش عددی که تصویر کاری شما را می‌سازند", href: "/features/profile", icon: "chart" },
      { label: "مقایسه‌ی مشاغل", desc: "درصد تطابق با فرمول مشخص", href: "/features/compare", icon: "layers" },
      { label: "مسیر پیشنهادی", desc: "بعد از نتیجه چه کنید", href: "/features/path", icon: "target" },
    ],
  },
  {
    label: "منابع",
    items: [
      { label: "روش کار", desc: "شش مرحله از انتخاب حوزه تا نتیجه", href: "/how-it-works", icon: "spark" },
      { label: "پشتوانه‌ی علمی", desc: "مدل هالند، داده‌های O*NET و روش محاسبه", href: "/science", icon: "book" },
      { label: "داده و یکپارچگی", desc: "روی چه منابعی ساخته شده‌ایم", href: "/data", icon: "layers" },
      { label: "پرسش‌های متداول", desc: "پاسخ سؤال‌های رایج", href: "/faq", icon: "spark" },
    ],
  },
  {
    label: "حساب",
    items: [
      { label: "داشبورد من", desc: "نتایج و روند پیشرفت شما", href: "/dashboard", icon: "user" },
      { label: "درباره‌ی ما", desc: "چرا Karex را ساختیم و راه‌های تماس", href: "/about", icon: "shield" },
    ],
  },
];

type Me = { id: string; email: string; firstName: string; lastName: string } | null;

export default function SiteNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [me, setMe] = useState<Me>(null);
  const [meLoaded, setMeLoaded] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lifted, setLifted] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  /* وضعیت ورود را خود نوار می‌گیرد، نه هر صفحه جداگانه.
     اینطور همه‌ی صفحه‌ها یک ناوبار یکسان دارند بدون تکرار منطق. */
  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => {
        if (alive) setMe(d.user ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setMeLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  /* پنهان‌شدن هنگام اسکرول به پایین */
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const delta = y - lastY;

      setLifted(y > 8);

      /* آستانه‌ی ۶ پیکسل: بدون آن، لرزش ترک‌پد نوار را می‌لرزاند.
         تا ۱۲۰ پیکسل اول همیشه دیده می‌شود تا بالای صفحه گم نشود. */
      if (Math.abs(delta) > 6) {
        setHidden(delta > 0 && y > 120);
        lastY = y;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* بستن با Escape و با کلیک بیرون */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(null);
      setSheet(false);
    };
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(null);
        setSheet(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, []);

  /* قفل اسکرول وقتی کشوی موبایل باز است */
  useEffect(() => {
    if (!sheet) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheet]);

  const clearClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  /* تأخیر بستن: حرکت مورب ماوس از دکمه به منو نباید آن را ببندد */
  const scheduleClose = useCallback(() => {
    clearClose();
    closeTimer.current = window.setTimeout(() => setOpen(null), 160);
  }, []);

  const go = (href: string) => {
    setOpen(null);
    setSheet(false);
    router.push(href);
  };

  /** آیا این لینک همان صفحه‌ای است که کاربر روی آن است؟ */
  const isCurrent = (href: string) => {
    const base = href.split("#")[0].replace(/\/$/, "") || "/";
    const here = (pathname ?? "/").replace(/\/$/, "") || "/";
    return base === here;
  };

  const logout = async () => {
    setOpen(null);
    setSheet(false);
    await fetch("/api/auth/logout", { method: "POST" });
    setMe(null);
    router.push("/");
    router.refresh();
  };

  /* تا وقتی وضعیت ورود مشخص نشده، جای دکمه‌ها خالی نگه داشته می‌شود تا
     چیدمان نپرد (اول «ورود» نشان ندهیم و بعد به «داشبورد» تغییر کند). */
  const actions = !meLoaded ? (
    <span className="kn-skel" aria-hidden />
  ) : me ? (
    <>
      <button className="kn-ghost" onClick={() => router.push("/dashboard")}>
        داشبورد
      </button>
      <button className="kn-cta" onClick={logout}>
        خروج
      </button>
    </>
  ) : (
    <>
      <button className="kn-ghost" onClick={() => router.push("/auth")}>
        ورود
      </button>
      <button className="kn-cta" onClick={() => router.push("/register")}>
        ثبت‌نام
      </button>
    </>
  );

  const sheetActions = !meLoaded ? null : me ? (
    <>
      <button className="kn-ghost" onClick={() => go("/dashboard")}>
        داشبورد
      </button>
      <button className="kn-cta" onClick={logout}>
        خروج
      </button>
    </>
  ) : (
    <>
      <button className="kn-ghost" onClick={() => go("/auth")}>
        ورود
      </button>
      <button className="kn-cta" onClick={() => go("/register")}>
        ثبت‌نام
      </button>
    </>
  );

  /* وقتی منویی باز است نوار نباید پنهان شود. این را هنگام رندر مشتق
     می‌کنیم نه با یک افکت جدا — افکت باعث یک رندر اضافه می‌شد. */
  const isHidden = hidden && !open && !sheet;

  return (
    <>
      <style>{navStyles}</style>

      <div
        ref={wrapRef}
        className={`kn-wrap ${isHidden ? "hidden" : ""} ${lifted ? "lifted" : ""}`}
      >
        <div className={`kn-scrim ${sheet ? "on" : ""}`} onClick={() => setSheet(false)} />

        <div className="kn-bar">
          <Link href="/" className="kn-brand" aria-label="Karex — صفحه‌ی اصلی">
            <svg className="kn-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9.2" />
              <path d="m15.6 8.4-2.2 5.6-5.6 2.2 2.2-5.6z" fill="currentColor" stroke="none" />
            </svg>
            Karex
          </Link>

          <nav className="kn-nav" aria-label="ناوبری اصلی">
            {GROUPS.map((g) => (
              <div
                key={g.label}
                className={`kn-item ${g.wide ? "has-wide" : ""} ${
                  open === g.label ? "open" : ""
                }`}
                onMouseEnter={() => {
                  clearClose();
                  setOpen(g.label);
                }}
                onMouseLeave={scheduleClose}
              >
                <button
                  className="kn-trigger"
                  aria-expanded={open === g.label}
                  aria-haspopup="true"
                  onClick={() => setOpen((v) => (v === g.label ? null : g.label))}
                >
                  {g.label}
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                <div className={`kn-pop ${g.wide ? "wide" : ""}`}>
                  <div className="kn-grid">
                    {g.items.map((it) => (
                      <button
                        key={it.label}
                        className={`kn-link ${isCurrent(it.href) ? "current" : ""}`}
                        aria-current={isCurrent(it.href) ? "page" : undefined}
                        onClick={() => go(it.href)}
                      >
                        <span className="kn-ico">{ICONS[it.icon]}</span>
                        <span className="kn-txt">
                          <b>{it.label}</b>
                          <span>{it.desc}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </nav>

          <div className="kn-side">
            <ThemeToggle />
            {actions}
            <button
              className={`kn-burger ${sheet ? "on" : ""}`}
              onClick={() => setSheet((v) => !v)}
              aria-expanded={sheet}
              aria-controls="kn-sheet"
              aria-label={sheet ? "بستن منو" : "باز کردن منو"}
            >
              <span />
            </button>
          </div>
        </div>

        <div id="kn-sheet" className={`kn-sheet ${sheet ? "open" : ""}`}>
          <div className="kn-sheet-in">
            {GROUPS.map((g) => (
              <div key={g.label} className="kn-group">
                <div className="kn-group-t">{g.label}</div>
                {g.items.map((it) => (
                  <button
                    key={it.label}
                    className={`kn-link ${isCurrent(it.href) ? "current" : ""}`}
                    aria-current={isCurrent(it.href) ? "page" : undefined}
                    onClick={() => go(it.href)}
                  >
                    <span className="kn-ico">{ICONS[it.icon]}</span>
                    <span className="kn-txt">
                      <b>{it.label}</b>
                      <span>{it.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            ))}

            <div className="kn-sheet-actions">{sheetActions}</div>
          </div>
        </div>
      </div>
    </>
  );
}
