"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SiteNav from "@/app/components/SiteNav";
import {
  AI_DOES,
  AI_DOES_NOT,
  CITATIONS,
  DIMENSIONS,
  FINDINGS,
  LIMITS,
  PIPELINE,
  cite,
} from "@/lib/science-content";
import { scienceStyles } from "./scienceStyles";

/**
 * صفحه‌ی «پشتوانه‌ی علمی».
 *
 * هدف: کاربر بتواند خودش قضاوت کند که به این آزمون اعتماد کند یا نه.
 * به همین دلیل محدودیت‌ها به‌اندازه‌ی نقاط قوت برجسته‌اند و هر عدد به
 * منبعش لینک دارد.
 */

/* هم‌فام با رنگ قطعات در نمای انفجاری صفحه‌ی اصلی */
const HUES: Record<string, string> = {
  R: "hsl(193 78% 58%)",
  I: "hsl(213 78% 62%)",
  A: "hsl(233 78% 68%)",
  S: "hsl(256 72% 70%)",
  E: "hsl(280 68% 70%)",
  C: "hsl(308 66% 68%)",
};

const SECTIONS = [
  { id: "model", label: "مدل RIASEC" },
  { id: "dimensions", label: "شش بُعد" },
  { id: "evidence", label: "شواهد کمّی" },
  { id: "data", label: "منبع داده" },
  { id: "method", label: "روش محاسبه" },
  { id: "ai", label: "نقش هوش مصنوعی" },
  { id: "limits", label: "محدودیت‌ها" },
  { id: "refs", label: "منابع" },
];

/** ارجاع درون‌متنی که به فهرست منابع پایین صفحه پرش می‌کند */
function Ref({ id }: { id: string }) {
  const c = cite(id);
  const n = CITATIONS.findIndex((x) => x.id === id) + 1;
  return (
    <a className="sc-ref" href={`#ref-${id}`} title={`${c.authors} (${c.year})`}>
      [{n}]
    </a>
  );
}

export default function ScienceClient() {
  const [active, setActive] = useState("model");

  /* برجسته کردن بخش فعال در فهرست کناری */
  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (e): e is HTMLElement => Boolean(e)
    );
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -62% 0px" }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  return (
    <main
      dir="rtl"
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "var(--page-gradient)",
        fontFamily: "var(--font-sans)",
        overflowX: "clip",
      }}
    >
      <style>{scienceStyles}</style>

      <SiteNav />
      <div className="kn-spacer" />

      <div className="sc">
        <header className="sc-hero">
          <span className="sc-eyebrow">
            <span className="sc-tri" />
            پشتوانه‌ی علمی
          </span>
          <h1 className="sc-h1">این آزمون بر چه چیزی استوار است؟</h1>
          <p className="sc-lede">
            Karex از مدل RIASEC جان هالند و داده‌های رسمی O*NET وزارت کار آمریکا
            استفاده می‌کند. این صفحه دقیقاً توضیح می‌دهد چه چیزی پشتوانه‌ی پژوهشی
            دارد، عدد تطابق چطور حساب می‌شود، و — مهم‌تر — این آزمون چه کارهایی
            را <strong style={{ color: "var(--foreground)" }}>نمی‌تواند</strong>{" "}
            انجام دهد.
          </p>
        </header>

        <div className="sc-layout">
          <nav className="sc-toc" aria-label="فهرست مطالب">
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`} className={active === s.id ? "on" : ""}>
                {s.label}
              </a>
            ))}
          </nav>

          <div>
            {/* ── مدل ── */}
            <section id="model" className="sc-sec">
              <span className="sc-sec-n">01</span>
              <h2 className="sc-h2">مدل RIASEC هالند</h2>
              <div className="sc-body">
                <p>
                  در سال ۱۹۵۹، روان‌شناس آمریکایی{" "}
                  <strong>جان هالند</strong> نظریه‌ای منتشر کرد با یک ادعای ساده:
                  علاقه‌ی شغلی، بیانِ شخصیت است
                  <Ref id="holland1959" />. او پیشنهاد داد هم آدم‌ها و هم محیط‌های
                  کاری را می‌توان با شش تیپ توصیف کرد — عمل‌گرا، پژوهشگر، هنرمند،
                  اجتماعی، رهبر و منظم — که سرواژه‌شان می‌شود RIASEC.
                </p>
                <p>
                  نکته‌ی کلیدی نظریه این است که این شش تیپ روی یک دایره می‌نشینند و
                  فاصله‌شان معنا دارد: تیپ‌های مجاور به هم شبیه‌اند و تیپ‌های روبه‌رو
                  کمترین شباهت را دارند
                  <Ref id="holland1997" />. کسی که دو تیپ غالبش کنار هم باشند
                  پروفایل منسجم‌تری دارد تا کسی که دو تیپ متضاد دارد.
                </p>
                <p>
                  چرا این مدل و نه مدل دیگری؟ چون بیش از شصت سال آزموده شده، و چون{" "}
                  <strong>
                    وزارت کار آمریکا آن را مبنای پایگاه داده‌ی رسمی مشاغل خود قرار
                    داده
                  </strong>
                  <Ref id="onet" />. این یعنی می‌توانیم پروفایل شما را با نمره‌های
                  واقعی و منتشرشده‌ی مشاغل مقایسه کنیم، نه با حدس.
                </p>
              </div>
            </section>

            {/* ── ابعاد ── */}
            <section id="dimensions" className="sc-sec">
              <span className="sc-sec-n">02</span>
              <h2 className="sc-h2">شش بُعد، و اینکه هرکدام چه می‌سنجند</h2>
              <p className="sc-intro">
                نمونه‌ی هر بُعد یک شغل واقعی از دیتابیس O*NET است با نمره‌ی همان بُعد.
                توجه کنید که مشاغل ترکیبی‌اند: «توسعه‌دهنده نرم‌افزار» هم در بُعد
                منظم نمره‌ی بالا دارد هم در پژوهشگر.
              </p>

              <div className="sc-dims">
                {DIMENSIONS.map((d) => (
                  <article
                    key={d.key}
                    className="sc-dim"
                    style={{ ["--dim-hue" as string]: HUES[d.key] }}
                  >
                    <div className="sc-dim-top">
                      <span className="sc-dim-k">{d.key}</span>
                      <span className="sc-dim-fa">{d.fa}</span>
                      <span className="sc-dim-en">{d.en}</span>
                    </div>
                    <p className="sc-dim-gist">{d.gist}</p>
                    <div className="sc-chips">
                      {d.activities.map((a) => (
                        <span key={a} className="sc-chip">
                          {a}
                        </span>
                      ))}
                    </div>
                    <div className="sc-dim-ex">
                      <span className="sc-dim-ex-t">
                        <b>{d.example.role}</b>
                        <span style={{ fontFamily: "var(--font-mono)" }}>
                          {d.example.code}
                        </span>
                      </span>
                      <span className="sc-dim-ex-v">{d.example.score}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* ── شواهد ── */}
            <section id="evidence" className="sc-sec">
              <span className="sc-sec-n">03</span>
              <h2 className="sc-h2">شواهد کمّی — و اینکه چقدر قوی‌اند</h2>
              <p className="sc-intro">
                اعداد زیر از فراتحلیل‌ها می‌آیند؛ یعنی پژوهش‌هایی که نتیجه‌ی ده‌ها
                مطالعه‌ی مستقل را با هم ترکیب می‌کنند. حرف <code>r</code> ضریب
                همبستگی است: صفر یعنی هیچ رابطه‌ای نیست و یک یعنی رابطه‌ی کامل.
                در علوم رفتاری، <code>r</code> حدود ۰٫۳ یک اثر متوسط و معنادار
                محسوب می‌شود.
              </p>

              <div className="sc-findings">
                {FINDINGS.map((f) => (
                  <article key={f.label} className="sc-finding">
                    <span className="sc-finding-v">{f.value}</span>
                    <span className="sc-finding-l">{f.label}</span>
                    <p className="sc-finding-d">{f.detail}</p>
                    <span className="sc-finding-c">
                      <Ref id={f.citationId} />
                    </span>
                  </article>
                ))}
              </div>

              <div className="sc-honest">
                <h3>این اعداد را بیش از حد بزرگ نکنیم</h3>
                <p>
                  همبستگی ۰٫۳ یعنی علاقه یکی از عوامل مؤثر است، نه تعیین‌کننده‌ی
                  سرنوشت. مهارت، فرصت، شبکه‌ی ارتباطی، شرایط اقتصادی و شانس هم نقش
                  دارند و هیچ‌کدام در این آزمون سنجیده نمی‌شوند. هر ابزاری که
                  ادعا کند شغل «درست» شما را با قطعیت پیدا می‌کند، دارد اغراق
                  می‌کند.
                </p>
              </div>
            </section>

            {/* ── داده ── */}
            <section id="data" className="sc-sec">
              <span className="sc-sec-n">04</span>
              <h2 className="sc-h2">داده‌ی مشاغل از کجا می‌آید</h2>
              <div className="sc-body">
                <p>
                  نمره‌های RIASEC هر شغل مستقیماً از دیتابیس{" "}
                  <strong>O*NET نسخه‌ی ۳۰٫۰</strong> نقل شده‌اند — پایگاه داده‌ی
                  رسمی مشاغل وزارت کار ایالات متحده، منتشرشده در اوت ۲۰۲۵ با مجوز{" "}
                  <strong>CC BY 4.0</strong>
                  <Ref id="onet" />. این اعداد از نظرسنجی از شاغلان و ارزیابی
                  کارشناسان شغلی به دست می‌آیند.
                </p>
                <p>
                  <strong>هیچ نمره‌ای را ما نساخته‌ایم.</strong> اگر کد استاندارد
                  شغل (مثل <code>15-1252.00</code>) را در سایت O*NET جست‌وجو کنید،
                  دقیقاً همان اعدادی را می‌بینید که ما استفاده می‌کنیم. داده‌های
                  حقوق و اشتغال هم از اداره‌ی آمار کار آمریکا (BLS) می‌آید.
                </p>
                <p>
                  دو نکته‌ی صادقانه: اول اینکه نسخه‌ی فعلی O*NET حالا{" "}
                  <strong>۳۰٫۳</strong> است و ما هنوز روی ۳۰٫۰ هستیم؛ نمره‌های
                  RIASEC در این فاصله برای مشاغل ما تغییر نکرده‌اند ولی این را
                  می‌نویسیم تا بدانید. دوم اینکه پایگاه ما در حال حاضر شامل{" "}
                  <strong>پنج شغل</strong> است، نه هزاران شغل — در حال گسترش است و
                  ترجیح می‌دهیم پنج پروفایل دقیق داشته باشیم تا هزار پروفایل حدسی.
                </p>
              </div>
            </section>

            {/* ── روش ── */}
            <section id="method" className="sc-sec">
              <span className="sc-sec-n">05</span>
              <h2 className="sc-h2">درصد تطابق دقیقاً چطور حساب می‌شود</h2>
              <p className="sc-intro">
                این بخش کامل و بدون ساده‌سازی نوشته شده تا بتوانید خودتان بررسی
                کنید. محاسبه کاملاً قطعی است: با ورودی یکسان، همیشه خروجی یکسان
                می‌دهد.
              </p>

              <div className="sc-steps">
                {PIPELINE.map((s) => (
                  <article key={s.n} className="sc-step">
                    <span className="sc-step-n">{s.n}</span>
                    <div>
                      <h3 className="sc-step-t">{s.title}</h3>
                      <p className="sc-step-b">{s.body}</p>
                      {s.formula && <code className="sc-formula">{s.formula}</code>}
                    </div>
                  </article>
                ))}
              </div>

              <div className="sc-honest" style={{ marginTop: 18 }}>
                <h3>چرا قبلاً این‌طور نبود</h3>
                <p>
                  در نسخه‌های اولیه‌ی Karex، درصد تطابق را مدل زبانی «حدس» می‌زد.
                  آن عدد نه قابل تکرار بود و نه تعریف مشخصی داشت — دو بار اجرای
                  یکسان می‌توانست دو عدد متفاوت بدهد. آن روش کنار گذاشته شد و
                  جایش را همین محاسبه‌ی عددی گرفت. نوشتن این موضوع برای ما
                  خوشایند نیست، ولی پنهان کردنش بدتر است.
                </p>
              </div>
            </section>

            {/* ── هوش مصنوعی ── */}
            <section id="ai" className="sc-sec">
              <span className="sc-sec-n">06</span>
              <h2 className="sc-h2">هوش مصنوعی کجا دخالت دارد و کجا ندارد</h2>
              <p className="sc-intro">
                شفافیت در این مورد مهم است، چون خیلی از ابزارهای مشابه مرز را
                روشن نمی‌کنند.
              </p>

              <div className="sc-split">
                <div className="sc-card">
                  <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700 }}>
                    کارهایی که مدل زبانی انجام می‌دهد
                  </h3>
                  <ul className="sc-list">
                    {AI_DOES.map((t) => (
                      <li key={t}>
                        <svg className="sc-tick yes" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m5 13 4.5 4.5L19 7" />
                        </svg>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="sc-card">
                  <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700 }}>
                    کارهایی که انجام نمی‌دهد
                  </h3>
                  <ul className="sc-list">
                    {AI_DOES_NOT.map((t) => (
                      <li key={t}>
                        <svg className="sc-tick no" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 6l12 12M18 6 6 18" />
                        </svg>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="sc-body">
                <p>
                  خلاصه: هوش مصنوعی <strong>متن</strong> می‌نویسد، اما{" "}
                  <strong>عدد</strong> نمی‌سازد. هر رقمی که در نتیجه می‌بینید از
                  فرمول ثابت یا از داده‌ی O*NET آمده است.
                </p>
              </div>
            </section>

            {/* ── محدودیت‌ها ── */}
            <section id="limits" className="sc-sec">
              <span className="sc-sec-n">07</span>
              <h2 className="sc-h2">محدودیت‌ها</h2>
              <p className="sc-intro">
                این بخش را عمداً مفصل نوشته‌ایم. ابزاری که محدودیت‌هایش را نگوید،
                قابل اعتماد نیست.
              </p>

              <div className="sc-limits">
                {LIMITS.map((l) => (
                  <article key={l.title} className="sc-limit">
                    <h3 className="sc-limit-t">
                      {l.title}
                      {l.citationId && <Ref id={l.citationId} />}
                    </h3>
                    <p className="sc-limit-b">{l.body}</p>
                  </article>
                ))}
              </div>
            </section>

            {/* ── منابع ── */}
            <section id="refs" className="sc-sec">
              <span className="sc-sec-n">08</span>
              <h2 className="sc-h2">منابع</h2>
              <p className="sc-intro">
                همه‌ی مقالات زیر داوری‌شده‌اند و شناسه‌ی دیجیتال دارند. اگر ادعایی
                در این صفحه بدون منبع دیدید، به ما بگویید — یا منبعش را اضافه
                می‌کنیم یا حذفش می‌کنیم.
              </p>

              <ol className="sc-cites" style={{ listStyle: "none", padding: 0 }}>
                {CITATIONS.map((c, i) => (
                  <li key={c.id} id={`ref-${c.id}`} className="sc-cite">
                    <span className="sc-cite-n">[{i + 1}]</span>
                    <div>
                      <div className="sc-cite-t">{c.title}</div>
                      <div className="sc-cite-m">
                        {c.authors} ({c.year}). {c.venue}
                      </div>
                      <a
                        className="sc-cite-l"
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {c.doi ? `doi:${c.doi}` : c.url}
                      </a>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <div className="sc-cta">
              <h2>حالا که می‌دانید چطور کار می‌کند</h2>
              <p>
                آزمون حدود ده دقیقه وقت می‌گیرد. نتیجه یک نقطه‌ی شروع برای فکر
                کردن است، نه یک حکم قطعی.
              </p>
              <div className="sc-cta-row">
                <Link href="/quiz" className="sc-btn primary">
                  شروع آزمون
                </Link>
                <Link href="/how-it-works" className="sc-btn ghost">
                  روش کار گام‌به‌گام
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
