"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./CareerHubLanding.module.css";

const STEPS = [
  {
    num: "01",
    title: "پاسخ به سؤالات کوتاه",
    desc: "چند سؤال ساده درباره‌ی علایق، مهارت‌ها و اهدافتان.",
  },
  {
    num: "02",
    title: "تحلیل پاسخ‌ها",
    desc: "سیستم پاسخ‌های شما را در چند ثانیه تحلیل می‌کند.",
  },
  {
    num: "03",
    title: "دریافت نقشه راه",
    desc: "مسیرهای شغلی پیشنهادی به‌همراه برنامه یادگیری را می‌بینید.",
  },
] as const;

const STATS = [
  { num: "2,400+", lbl: "مسیر شغلی" },
  { num: "94%", lbl: "دقت تحلیل" },
  { num: "4.9", lbl: "امتیاز کاربران" },
] as const;

function NavBar({ menuOpen, setMenuOpen }: { menuOpen: boolean; setMenuOpen: (value: boolean) => void }) {
  const router = useRouter();

  return (
    <nav className={styles.nav}>
      <div className={styles.navInner}>
        <span className={styles.brand}>Karex</span>

        <div className={styles.navLinks}>
          <a href="#features" className={styles.navLink}>
            ویژگی‌ها
          </a>
          <a href="#how-it-works" className={styles.navLink}>
            روش کار
          </a>
        </div>

        <div className={styles.desktopActions}>
          <Link href="/auth" className={`${styles.btn} ${styles.btnGhost}`}>
            ورود
          </Link>
          <Link href="/register" className={`${styles.btn} ${styles.btnPrimary}`}>
            ثبت‌نام
          </Link>
        </div>

        <button
          type="button"
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "بستن منو" : "باز کردن منو"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <span aria-hidden="true">{menuOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      <div id="mobile-menu" className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ""}`}>
        <div className={styles.mobileMenuContent}>
          <a href="#features" className={styles.navLink} onClick={() => setMenuOpen(false)}>
            ویژگی‌ها
          </a>
          <a href="#how-it-works" className={styles.navLink} onClick={() => setMenuOpen(false)}>
            روش کار
          </a>
          <Link href="/auth" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setMenuOpen(false)}>
            ورود
          </Link>
          <Link href="/register" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setMenuOpen(false)}>
            ثبت‌نام رایگان
          </Link>
        </div>
      </div>
    </nav>
  );
}

function HeroSection({
  mounted,
  heroOpacity,
  heroScale,
  heroTranslate,
  isLoading,
  onStart,
}: {
  mounted: boolean;
  heroOpacity: number;
  heroScale: number;
  heroTranslate: number;
  isLoading: boolean;
  onStart: () => void;
}) {
  return (
    <section
      className={styles.hero}
      style={{
        opacity: mounted ? heroOpacity : 1,
        transform: mounted ? `translateY(${heroTranslate}px) scale(${heroScale})` : "none",
      }}
    >
      <h1 className={`${styles.heroTitle} ${mounted ? styles.fade1 : ""}`}>مسیر شغلی خودتان را پیدا کنید</h1>

      <p className={`${styles.heroSub} ${mounted ? styles.fade2 : ""}`}>
        با پاسخ به چند سؤال کوتاه، علایق و مهارت‌های شما با هوش مصنوعی تحلیل می‌شود و مسیرهای شغلی متناسب
        به‌همراه یک نقشه راه یادگیری پیشنهاد داده می‌شود.
      </p>

      <div className={`${styles.heroActions} ${mounted ? styles.fade3 : ""}`}>
        <button type="button" className={`${styles.btn} ${styles.btnPrimary} ${styles.heroButton}`} onClick={onStart} disabled={isLoading}>
          {isLoading ? "در حال آماده‌سازی..." : "شروع آزمون"}
        </button>
        <a href="#how-it-works" className={`${styles.btn} ${styles.btnSecondary} ${styles.heroButton}`}>
          بیشتر بدانید
        </a>
      </div>

      <div className={`${styles.statsRow} ${mounted ? styles.fade4 : ""}`}>
        {STATS.map((s, i) => (
          <div key={s.lbl} className={styles.statWrap}>
            <div className={styles.statItem}>
              <div className={styles.gradientTextStat}>{s.num}</div>
              <div className={styles.statLabel}>{s.lbl}</div>
            </div>
            {i < STATS.length - 1 ? <div className={styles.statDivider} /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturesSection({
  onSpotlight,
}: {
  onSpotlight: (e: React.MouseEvent<HTMLDivElement>) => void;
}) {
  return (
    <section id="features" className={styles.featuresSection}>
      <div className={styles.sectionHeading}>
        <span className={styles.sectionKicker}>ویژگی‌ها</span>
        <h2 className={styles.sectionTitle}>چه امکاناتی دریافت می‌کنید؟</h2>
      </div>

      <div className={styles.bento}>
        <div className={`${styles.card} ${styles.cardLarge}`} onMouseMove={onSpotlight}>
          <div className={styles.iconBox} aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 19V5m5 14V9m5 10V13m5 6V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h3 className={styles.cardTitleLarge}>تحلیل شخصیت شغلی مبتنی بر داده</h3>
            <p className={styles.cardTextLarge}>
              پاسخ‌های شما بر اساس مدل‌های شناخته‌شده‌ی روان‌شناسی شغلی سنجیده می‌شود، نه یک تست حدسی. هوش
              مصنوعی الگوهای پنهان علاقه و مهارت شما را شناسایی می‌کند.
            </p>
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardSmall}`} onMouseMove={onSpotlight}>
          <div className={styles.iconBox} aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3l2.6 6.2L21 10l-5 4.6L17.4 21 12 17.3 6.6 21 8 14.6 3 10l6.4-.8z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h3 className={styles.cardTitle}>پیشنهاد مسیر متناسب</h3>
            <p className={styles.cardText}>فقط مسیرهایی که با مهارت و علاقه شما هم‌خوانی دارند نشان داده می‌شود.</p>
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardSmall}`} onMouseMove={onSpotlight}>
          <div className={styles.iconBox} aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h10M4 18h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h3 className={styles.cardTitle}>نقشه راه یادگیری</h3>
            <p className={styles.cardText}>گام‌به‌گام مشخص می‌کنیم چه چیزی یاد بگیرید و از کجا شروع کنید.</p>
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardWide}`} onMouseMove={onSpotlight}>
          <div className={styles.iconBox} aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v4l3 2M12 3a9 9 0 1 0 9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h3 className={styles.cardTitle}>پشتیبانی هوش مصنوعی، هر زمان که نیاز دارید</h3>
            <p className={styles.cardText}>
              سؤال دارید؟ در هر مرحله از مسیر، دستیار هوشمند کارکس همراه شماست و راهنمایی می‌کند.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks({ isLoading, onStart }: { isLoading: boolean; onStart: () => void }) {
  return (
    <section id="how-it-works" className={styles.howSection}>
      <div className={styles.sectionHeading}>
        <span className={styles.sectionKicker}>روش کار</span>
        <h2 className={styles.sectionTitle}>سه گام تا مسیر روشن</h2>
      </div>

      <div className={styles.card}>
        {STEPS.map((s) => (
          <div key={s.num} className={styles.stepRow}>
            <span className={styles.stepNum}>{s.num}</span>
            <div className={styles.stepTextWrap}>
              <div className={styles.stepTitle}>{s.title}</div>
              <div className={styles.stepDesc}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.howCtaWrap}>
        <button type="button" className={`${styles.btn} ${styles.btnPrimary} ${styles.heroButton}`} onClick={onStart} disabled={isLoading}>
          {isLoading ? "در حال آماده‌سازی..." : "شروع آزمون"}
        </button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.footerText}>© Karex — تمامی حقوق محفوظ است</p>
    </footer>
  );
}

export default function CareerHubLanding() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    router.prefetch("/quiz");

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [router]);

  const handleStart = useCallback(() => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    timeoutRef.current = setTimeout(() => {
      router.push("/quiz");
    }, 400);
  }, [isLoading, router]);

  const handleSpotlight = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }, []);

  const { heroOpacity, heroScale, heroTranslate } = useMemo(() => {
    return {
      heroOpacity: Math.max(1 - scrollY / 480, 0),
      heroScale: Math.max(1 - scrollY / 4000, 0.94),
      heroTranslate: Math.min(scrollY * 0.18, 90),
    };
  }, [scrollY]);

  return (
    <main dir="rtl" className={styles.main}>
      <div className={styles.ambientPrimary} aria-hidden="true" />
      <div className={styles.ambientSecondary} aria-hidden="true" />
      <div className={styles.ambientTertiary} aria-hidden="true" />
      <div className={styles.gridOverlay} aria-hidden="true" />
      <div className={styles.noiseOverlay} aria-hidden="true" />

      <div className={styles.contentWrap}>
        <NavBar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <HeroSection
          mounted={mounted}
          heroOpacity={heroOpacity}
          heroScale={heroScale}
          heroTranslate={heroTranslate}
          isLoading={isLoading}
          onStart={handleStart}
        />
        <FeaturesSection onSpotlight={handleSpotlight} />
        <HowItWorks isLoading={isLoading} onStart={handleStart} />
        <Footer />
      </div>
    </main>
  );
}
