"use client";

import { useCallback, useEffect, useState } from "react";
import AdminShell from "../AdminShell";
import AdminGate from "../AdminGate";
import MediaPicker from "../MediaPicker";
import { api } from "../adminClient";
import type {
  AboutValue,
  ContactChannel,
  FaqItem,
  IntegrationItem,
  PillarItem,
  TimelineStage,
  ShowcaseSlide,
  SiteContent,
} from "@/lib/site-content";

type Payload = { content: SiteContent; defaults: SiteContent };

const rid = () => Math.random().toString(36).slice(2, 8);

const blankValue = (): AboutValue => ({ id: `v-${rid()}`, title: "", body: "" });
const blankChannel = (): ContactChannel => ({
  id: `c-${rid()}`,
  kind: "email",
  label: "",
  value: "",
  href: "",
});

const CHANNEL_KINDS: { v: ContactChannel["kind"]; t: string }[] = [
  { v: "email", t: "ایمیل" },
  { v: "telegram", t: "تلگرام" },
  { v: "instagram", t: "اینستاگرام" },
  { v: "phone", t: "تلفن" },
  { v: "address", t: "نشانی" },
  { v: "link", t: "لینک دیگر" },
];

const blankPillar = (): PillarItem => ({
  id: `p-${rid()}`,
  title: "",
  body: "",
  tags: [],
});

const blankStage = (): TimelineStage => ({
  id: `s-${rid()}`,
  age: "",
  title: "",
  body: "",
  stability: 60,
});

const blankFaq = (): FaqItem => ({ id: `f-${rid()}`, q: "", a: "" });
const blankIntegration = (): IntegrationItem => ({
  id: `i-${rid()}`,
  title: "",
  body: "",
  tags: [],
});

const blank = (): ShowcaseSlide => ({
  id: `slide-${Math.random().toString(36).slice(2, 8)}`,
  src: "",
  video: false,
  alt: "",
  eyebrow: "",
  title: "",
  body: "",
  label: "",
});

export default function AdminContentPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const [slides, setSlides] = useState<ShowcaseSlide[]>([]);
  const [exploded, setExploded] = useState({ eyebrow: "", title: "", subtitle: "" });
  const [about, setAbout] = useState<SiteContent["about"] | null>(null);
  const [pillars, setPillars] = useState<SiteContent["pillars"] | null>(null);
  const [timeline, setTimeline] = useState<SiteContent["timeline"] | null>(null);
  const [faq, setFaq] = useState<SiteContent["faq"] | null>(null);
  const [integrations, setIntegrations] =
    useState<SiteContent["integrations"] | null>(null);
  const [picking, setPicking] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api<Payload>("/api/admin/content")
      .then((d) => {
        setData(d);
        setSlides(d.content.showcase.slides);
        setExploded(d.content.exploded);
        setAbout(d.content.about);
        setPillars(d.content.pillars);
        setTimeline(d.content.timeline);
        setFaq(d.content.faq);
        setIntegrations(d.content.integrations);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  /* load را داخل یک لایه‌ی async صدا می‌زنیم تا setState همگام با اجرای
     افکت نباشد (باعث رندر آبشاری می‌شود). */
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  async function save(key: string, value: unknown) {
    setBusy(true);
    setMsg(null);
    try {
      await api("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      setMsg({ kind: "ok", text: "ذخیره شد. صفحه‌ی اصلی را تازه کنید تا تغییر را ببینید." });
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "ذخیره نشد." });
    } finally {
      setBusy(false);
    }
  }

  const patch = (i: number, p: Partial<ShowcaseSlide>) =>
    setSlides((s) => s.map((sl, j) => (j === i ? { ...sl, ...p } : sl)));

  const move = (i: number, dir: -1 | 1) =>
    setSlides((s) => {
      const j = i + dir;
      if (j < 0 || j >= s.length) return s;
      const out = [...s];
      [out[i], out[j]] = [out[j], out[i]];
      return out;
    });

  return (
    <AdminShell>
      <div className="ad-head">
        <div>
          <h1 className="ad-h1">محتوای سایت</h1>
          <p className="ad-lede">
            متن‌ها و تصاویر صفحه‌ی اصلی. تغییرات بلافاصله پس از ذخیره روی سایت اعمال می‌شود.
          </p>
        </div>
      </div>

      {msg && <div className={`ad-note ${msg.kind === "ok" ? "ok" : "err"}`}>{msg.text}</div>}

      <AdminGate loading={loading} error={error} onRetry={load}>
        {data && (
          <>
            <div className="ad-card">
              <div className="ad-slide-top" style={{ marginBottom: 6 }}>
                <div>
                  <p className="ad-card-title">صفحه‌ی نمایشگر</p>
                  <p className="ad-card-note" style={{ marginBottom: 0 }}>
                    تصاویری که داخل قاب مانیتور روی صفحه‌ی اصلی نمایش داده می‌شوند. نسبت
                    پیشنهادی ۱۶:۱۰ (مثلاً ۱۶۰۰×۱۰۰۰).
                  </p>
                </div>
                <button className="ad-btn sm" onClick={() => setSlides((s) => [...s, blank()])}>
                  + اسلاید
                </button>
              </div>

              <div style={{ marginTop: 14 }}>
                {slides.length === 0 && (
                  <div className="ad-empty">
                    هیچ اسلایدی نیست. بخش نمایشگر روی سایت نمایش داده نمی‌شود.
                  </div>
                )}

                {slides.map((sl, i) => (
                  <div key={sl.id} className="ad-slide">
                    <div className="ad-slide-top">
                      <span className="ad-badge accent">اسلاید {i + 1}</span>
                      <div className="ad-row">
                        <button className="ad-btn sm" disabled={i === 0} onClick={() => move(i, -1)}>
                          ↑
                        </button>
                        <button
                          className="ad-btn sm"
                          disabled={i === slides.length - 1}
                          onClick={() => move(i, 1)}
                        >
                          ↓
                        </button>
                        <button
                          className="ad-btn sm danger"
                          onClick={() => setSlides((s) => s.filter((_, j) => j !== i))}
                        >
                          حذف
                        </button>
                      </div>
                    </div>

                    <div className="ad-slide-grid">
                      <div>
                        <div className="ad-slide-prev">
                          {!sl.src ? (
                            <span>بدون تصویر</span>
                          ) : sl.video ? (
                            <video src={sl.src} muted playsInline />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={sl.src} alt="" />
                          )}
                        </div>
                        <button
                          className="ad-btn sm"
                          style={{ width: "100%", marginTop: 7 }}
                          onClick={() => setPicking(i)}
                        >
                          {sl.src ? "تغییر تصویر" : "انتخاب تصویر"}
                        </button>
                        {sl.src && (
                          <button
                            className="ad-btn sm"
                            style={{ width: "100%", marginTop: 5 }}
                            onClick={() => patch(i, { src: "", video: false })}
                          >
                            برداشتن
                          </button>
                        )}
                      </div>

                      <div>
                        <div className="ad-field">
                          <label className="ad-label">عنوان بالا (کوچک)</label>
                          <input
                            className="ad-input"
                            value={sl.eyebrow}
                            onChange={(e) => patch(i, { eyebrow: e.target.value })}
                            placeholder="مثلاً: نتیجه‌ی آزمون"
                          />
                        </div>
                        <div className="ad-field">
                          <label className="ad-label">تیتر</label>
                          <input
                            className="ad-input"
                            value={sl.title}
                            onChange={(e) => patch(i, { title: e.target.value })}
                          />
                        </div>
                        <div className="ad-field">
                          <label className="ad-label">توضیح</label>
                          <textarea
                            className="ad-textarea"
                            value={sl.body}
                            onChange={(e) => patch(i, { body: e.target.value })}
                          />
                        </div>
                        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                          <div className="ad-field" style={{ marginTop: 0 }}>
                            <label className="ad-label">نوار آدرس پنجره</label>
                            <input
                              className="ad-input"
                              value={sl.label}
                              onChange={(e) => patch(i, { label: e.target.value })}
                              placeholder="karex.ir/result"
                            />
                          </div>
                          <div className="ad-field" style={{ marginTop: 0 }}>
                            <label className="ad-label">متن جایگزین تصویر</label>
                            <input
                              className="ad-input"
                              value={sl.alt}
                              onChange={(e) => patch(i, { alt: e.target.value })}
                              placeholder="برای دسترس‌پذیری"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="ad-row" style={{ marginTop: 16 }}>
                <button
                  className="ad-btn primary"
                  disabled={busy}
                  onClick={() => save("showcase", { slides })}
                >
                  {busy ? "در حال ذخیره…" : "ذخیره‌ی نمایشگر"}
                </button>
                <button
                  className="ad-btn"
                  disabled={busy}
                  onClick={() => setSlides(data.content.showcase.slides)}
                >
                  بازگردانی تغییرات
                </button>
              </div>
            </div>

            <div className="ad-card">
              <p className="ad-card-title">بخش نمای انفجاری</p>
              <p className="ad-card-note">متن بالای انیمیشن شش‌قطعه‌ای روی صفحه‌ی اصلی.</p>

              <div className="ad-field">
                <label className="ad-label">عنوان بالا (کوچک)</label>
                <input
                  className="ad-input"
                  value={exploded.eyebrow}
                  onChange={(e) => setExploded({ ...exploded, eyebrow: e.target.value })}
                />
              </div>
              <div className="ad-field">
                <label className="ad-label">تیتر</label>
                <input
                  className="ad-input"
                  value={exploded.title}
                  onChange={(e) => setExploded({ ...exploded, title: e.target.value })}
                />
              </div>
              <div className="ad-field">
                <label className="ad-label">توضیح</label>
                <textarea
                  className="ad-textarea"
                  value={exploded.subtitle}
                  onChange={(e) => setExploded({ ...exploded, subtitle: e.target.value })}
                />
              </div>

              <div className="ad-row" style={{ marginTop: 16 }}>
                <button className="ad-btn primary" disabled={busy} onClick={() => save("exploded", exploded)}>
                  ذخیره
                </button>
                <button
                  className="ad-btn"
                  disabled={busy}
                  onClick={() => setExploded(data.defaults.exploded)}
                >
                  بازگردانی به پیش‌فرض
                </button>
              </div>
            </div>

            {about && (
              <div className="ad-card">
                <p className="ad-card-title">درباره‌ی ما و راه‌های ارتباطی</p>
                <p className="ad-card-note">
                  محتوای صفحه‌ی <code>/about</code>. برای پنهان کردن کل صفحه، از
                  بخش تنظیمات استفاده کنید.
                </p>

                <div className="ad-field">
                  <label className="ad-label">عنوان بالا (کوچک)</label>
                  <input
                    className="ad-input"
                    value={about.eyebrow}
                    onChange={(e) => setAbout({ ...about, eyebrow: e.target.value })}
                  />
                </div>
                <div className="ad-field">
                  <label className="ad-label">تیتر</label>
                  <input
                    className="ad-input"
                    value={about.title}
                    onChange={(e) => setAbout({ ...about, title: e.target.value })}
                  />
                </div>
                <div className="ad-field">
                  <label className="ad-label">توضیح کوتاه</label>
                  <textarea
                    className="ad-textarea"
                    value={about.lede}
                    onChange={(e) => setAbout({ ...about, lede: e.target.value })}
                  />
                </div>
                <div className="ad-field">
                  <label className="ad-label">
                    داستان ما — هر پاراگراف در یک خط جدا
                  </label>
                  <textarea
                    className="ad-textarea"
                    style={{ minHeight: 140 }}
                    value={about.story.join("\n")}
                    onChange={(e) =>
                      setAbout({
                        ...about,
                        story: e.target.value.split("\n").filter((x) => x.trim()),
                      })
                    }
                  />
                </div>

                <div className="ad-slide-top" style={{ marginTop: 20 }}>
                  <p className="ad-card-title" style={{ margin: 0 }}>
                    اصولی که رعایت می‌کنیم
                  </p>
                  <button
                    className="ad-btn sm"
                    onClick={() =>
                      setAbout({ ...about, values: [...about.values, blankValue()] })
                    }
                  >
                    + مورد
                  </button>
                </div>
                {about.values.map((v, i) => (
                  <div key={v.id} className="ad-slide">
                    <div className="ad-slide-top">
                      <span className="ad-badge accent">{i + 1}</span>
                      <button
                        className="ad-btn sm danger"
                        onClick={() =>
                          setAbout({
                            ...about,
                            values: about.values.filter((_, j) => j !== i),
                          })
                        }
                      >
                        حذف
                      </button>
                    </div>
                    <div className="ad-field" style={{ marginTop: 0 }}>
                      <label className="ad-label">عنوان</label>
                      <input
                        className="ad-input"
                        value={v.title}
                        onChange={(e) =>
                          setAbout({
                            ...about,
                            values: about.values.map((x, j) =>
                              j === i ? { ...x, title: e.target.value } : x
                            ),
                          })
                        }
                      />
                    </div>
                    <div className="ad-field">
                      <label className="ad-label">توضیح</label>
                      <textarea
                        className="ad-textarea"
                        value={v.body}
                        onChange={(e) =>
                          setAbout({
                            ...about,
                            values: about.values.map((x, j) =>
                              j === i ? { ...x, body: e.target.value } : x
                            ),
                          })
                        }
                      />
                    </div>
                  </div>
                ))}

                <div className="ad-field" style={{ marginTop: 20 }}>
                  <label className="ad-label">تیتر بخش تماس</label>
                  <input
                    className="ad-input"
                    value={about.contactTitle}
                    onChange={(e) => setAbout({ ...about, contactTitle: e.target.value })}
                  />
                </div>
                <div className="ad-field">
                  <label className="ad-label">توضیح بخش تماس</label>
                  <textarea
                    className="ad-textarea"
                    value={about.contactBody}
                    onChange={(e) => setAbout({ ...about, contactBody: e.target.value })}
                  />
                </div>

                <div className="ad-slide-top" style={{ marginTop: 20 }}>
                  <p className="ad-card-title" style={{ margin: 0 }}>
                    کانال‌های ارتباطی
                  </p>
                  <button
                    className="ad-btn sm"
                    onClick={() =>
                      setAbout({ ...about, channels: [...about.channels, blankChannel()] })
                    }
                  >
                    + کانال
                  </button>
                </div>
                {about.channels.map((c, i) => (
                  <div key={c.id} className="ad-slide">
                    <div className="ad-slide-top">
                      <span className="ad-badge accent">{i + 1}</span>
                      <button
                        className="ad-btn sm danger"
                        onClick={() =>
                          setAbout({
                            ...about,
                            channels: about.channels.filter((_, j) => j !== i),
                          })
                        }
                      >
                        حذف
                      </button>
                    </div>
                    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "150px 1fr" }}>
                      <div className="ad-field" style={{ marginTop: 0 }}>
                        <label className="ad-label">نوع</label>
                        <select
                          className="ad-select"
                          value={c.kind}
                          onChange={(e) =>
                            setAbout({
                              ...about,
                              channels: about.channels.map((x, j) =>
                                j === i
                                  ? { ...x, kind: e.target.value as ContactChannel["kind"] }
                                  : x
                              ),
                            })
                          }
                        >
                          {CHANNEL_KINDS.map((k) => (
                            <option key={k.v} value={k.v}>
                              {k.t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="ad-field" style={{ marginTop: 0 }}>
                        <label className="ad-label">برچسب</label>
                        <input
                          className="ad-input"
                          value={c.label}
                          placeholder="مثلاً: ایمیل پشتیبانی"
                          onChange={(e) =>
                            setAbout({
                              ...about,
                              channels: about.channels.map((x, j) =>
                                j === i ? { ...x, label: e.target.value } : x
                              ),
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="ad-field">
                      <label className="ad-label">مقدار</label>
                      <input
                        className="ad-input"
                        dir="ltr"
                        value={c.value}
                        placeholder="hello@mykarex.ir"
                        onChange={(e) =>
                          setAbout({
                            ...about,
                            channels: about.channels.map((x, j) =>
                              j === i ? { ...x, value: e.target.value } : x
                            ),
                          })
                        }
                      />
                    </div>
                    <div className="ad-field">
                      <label className="ad-label">
                        آدرس مقصد — خالی بگذارید تا خودکار ساخته شود
                      </label>
                      <input
                        className="ad-input"
                        dir="ltr"
                        value={c.href}
                        placeholder="اختیاری"
                        onChange={(e) =>
                          setAbout({
                            ...about,
                            channels: about.channels.map((x, j) =>
                              j === i ? { ...x, href: e.target.value } : x
                            ),
                          })
                        }
                      />
                    </div>
                  </div>
                ))}

                <div className="ad-field" style={{ marginTop: 20 }}>
                  <label className="ad-label">زمان پاسخ‌گویی</label>
                  <input
                    className="ad-input"
                    value={about.responseTime}
                    placeholder="خالی بگذارید تا نمایش داده نشود"
                    onChange={(e) => setAbout({ ...about, responseTime: e.target.value })}
                  />
                </div>

                <div className="ad-row" style={{ marginTop: 16 }}>
                  <button
                    className="ad-btn primary"
                    disabled={busy}
                    onClick={() => save("about", about)}
                  >
                    {busy ? "در حال ذخیره…" : "ذخیره‌ی درباره‌ی ما"}
                  </button>
                  <button
                    className="ad-btn"
                    disabled={busy}
                    onClick={() => setAbout(data.content.about)}
                  >
                    بازگردانی تغییرات
                  </button>
                  <button
                    className="ad-btn"
                    disabled={busy}
                    onClick={() => setAbout(data.defaults.about)}
                  >
                    بازگردانی به پیش‌فرض
                  </button>
                </div>
              </div>
            )}
            {pillars && (
              <div className="ad-card">
                <div className="ad-slide-top" style={{ marginBottom: 6 }}>
                  <div>
                    <p className="ad-card-title">بخش پشتوانه (صفحه‌ی اصلی)</p>
                    <p className="ad-card-note" style={{ marginBottom: 0 }}>
                      بخشی که بعد از نمایشگر روی صفحه‌ی اصلی می‌آید.
                    </p>
                  </div>
                  <button
                    className="ad-btn sm"
                    onClick={() =>
                      setPillars({ ...pillars, items: [...pillars.items, blankPillar()] })
                    }
                  >
                    + ستون
                  </button>
                </div>

                <div className="ad-field">
                  <label className="ad-label">عنوان بالا (کوچک)</label>
                  <input
                    className="ad-input"
                    value={pillars.eyebrow}
                    onChange={(e) => setPillars({ ...pillars, eyebrow: e.target.value })}
                  />
                </div>
                <div className="ad-field">
                  <label className="ad-label">تیتر</label>
                  <input
                    className="ad-input"
                    value={pillars.title}
                    onChange={(e) => setPillars({ ...pillars, title: e.target.value })}
                  />
                </div>
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                  <div className="ad-field">
                    <label className="ad-label">متن لینک پایین</label>
                    <input
                      className="ad-input"
                      value={pillars.ctaLabel}
                      placeholder="خالی بگذارید تا نمایش داده نشود"
                      onChange={(e) => setPillars({ ...pillars, ctaLabel: e.target.value })}
                    />
                  </div>
                  <div className="ad-field">
                    <label className="ad-label">آدرس لینک</label>
                    <input
                      className="ad-input"
                      dir="ltr"
                      value={pillars.ctaHref}
                      placeholder="/data"
                      onChange={(e) => setPillars({ ...pillars, ctaHref: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  {pillars.items.map((it, i) => (
                    <div key={it.id} className="ad-slide">
                      <div className="ad-slide-top">
                        <span className="ad-badge accent">{i + 1}</span>
                        <div className="ad-row">
                          <button
                            className="ad-btn sm"
                            disabled={i === 0}
                            onClick={() => {
                              const a = [...pillars.items];
                              [a[i - 1], a[i]] = [a[i], a[i - 1]];
                              setPillars({ ...pillars, items: a });
                            }}
                          >
                            ↑
                          </button>
                          <button
                            className="ad-btn sm"
                            disabled={i === pillars.items.length - 1}
                            onClick={() => {
                              const a = [...pillars.items];
                              [a[i + 1], a[i]] = [a[i], a[i + 1]];
                              setPillars({ ...pillars, items: a });
                            }}
                          >
                            ↓
                          </button>
                          <button
                            className="ad-btn sm danger"
                            onClick={() =>
                              setPillars({
                                ...pillars,
                                items: pillars.items.filter((_, j) => j !== i),
                              })
                            }
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                      <div className="ad-field" style={{ marginTop: 0 }}>
                        <label className="ad-label">عنوان</label>
                        <input
                          className="ad-input"
                          value={it.title}
                          onChange={(e) =>
                            setPillars({
                              ...pillars,
                              items: pillars.items.map((x, j) =>
                                j === i ? { ...x, title: e.target.value } : x
                              ),
                            })
                          }
                        />
                      </div>
                      <div className="ad-field">
                        <label className="ad-label">توضیح</label>
                        <textarea
                          className="ad-textarea"
                          value={it.body}
                          onChange={(e) =>
                            setPillars({
                              ...pillars,
                              items: pillars.items.map((x, j) =>
                                j === i ? { ...x, body: e.target.value } : x
                              ),
                            })
                          }
                        />
                      </div>
                      <div className="ad-field">
                        <label className="ad-label">برچسب‌ها — با ویرگول جدا کنید</label>
                        <input
                          className="ad-input"
                          value={it.tags.join("، ")}
                          onChange={(e) =>
                            setPillars({
                              ...pillars,
                              items: pillars.items.map((x, j) =>
                                j === i
                                  ? {
                                      ...x,
                                      tags: e.target.value
                                        .split(/[،,]/)
                                        .map((t) => t.trim())
                                        .filter(Boolean),
                                    }
                                  : x
                              ),
                            })
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="ad-row" style={{ marginTop: 16 }}>
                  <button
                    className="ad-btn primary"
                    disabled={busy}
                    onClick={() => save("pillars", pillars)}
                  >
                    {busy ? "در حال ذخیره…" : "ذخیره‌ی بخش پشتوانه"}
                  </button>
                  <button
                    className="ad-btn"
                    disabled={busy}
                    onClick={() => setPillars(data.content.pillars)}
                  >
                    بازگردانی تغییرات
                  </button>
                  <button
                    className="ad-btn"
                    disabled={busy}
                    onClick={() => setPillars(data.defaults.pillars)}
                  >
                    بازگردانی به پیش‌فرض
                  </button>
                </div>
              </div>
            )}

            {timeline && (
              <div className="ad-card">
                <div className="ad-slide-top" style={{ marginBottom: 6 }}>
                  <div>
                    <p className="ad-card-title">بخش زمان‌بندی (صفحه‌ی اصلی)</p>
                    <p className="ad-card-note" style={{ marginBottom: 0 }}>
                      نمودار تثبیت علاقه‌ها با گذر سن. عدد پایداری از پژوهش
                      می‌آید — بدون منبع تغییرش ندهید.
                    </p>
                  </div>
                  <button
                    className="ad-btn sm"
                    onClick={() =>
                      setTimeline({
                        ...timeline,
                        stages: [...timeline.stages, blankStage()],
                      })
                    }
                  >
                    + مرحله
                  </button>
                </div>

                <div className="ad-field">
                  <label className="ad-label">عنوان بالا (کوچک)</label>
                  <input
                    className="ad-input"
                    value={timeline.eyebrow}
                    onChange={(e) =>
                      setTimeline({ ...timeline, eyebrow: e.target.value })
                    }
                  />
                </div>
                <div className="ad-field">
                  <label className="ad-label">تیتر</label>
                  <input
                    className="ad-input"
                    value={timeline.title}
                    onChange={(e) =>
                      setTimeline({ ...timeline, title: e.target.value })
                    }
                  />
                </div>
                <div className="ad-field">
                  <label className="ad-label">توضیح کوتاه</label>
                  <textarea
                    className="ad-textarea"
                    value={timeline.lede}
                    onChange={(e) =>
                      setTimeline({ ...timeline, lede: e.target.value })
                    }
                  />
                </div>

                <div style={{ marginTop: 16 }}>
                  {timeline.stages.map((st, i) => (
                    <div key={st.id} className="ad-slide">
                      <div className="ad-slide-top">
                        <span className="ad-badge accent">{i + 1}</span>
                        <div className="ad-row">
                          <button
                            className={`ad-btn sm ${st.peak ? "primary" : ""}`}
                            onClick={() =>
                              setTimeline({
                                ...timeline,
                                stages: timeline.stages.map((x, j) => ({
                                  ...x,
                                  peak: j === i ? !x.peak : false,
                                })),
                              })
                            }
                          >
                            نقطه‌ی عطف
                          </button>
                          <button
                            className="ad-btn sm danger"
                            onClick={() =>
                              setTimeline({
                                ...timeline,
                                stages: timeline.stages.filter((_, j) => j !== i),
                              })
                            }
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "140px 1fr" }}>
                        <div className="ad-field" style={{ marginTop: 0 }}>
                          <label className="ad-label">بازه‌ی سنی</label>
                          <input
                            className="ad-input"
                            value={st.age}
                            placeholder="۱۸–۲۲"
                            onChange={(e) =>
                              setTimeline({
                                ...timeline,
                                stages: timeline.stages.map((x, j) =>
                                  j === i ? { ...x, age: e.target.value } : x
                                ),
                              })
                            }
                          />
                        </div>
                        <div className="ad-field" style={{ marginTop: 0 }}>
                          <label className="ad-label">عنوان</label>
                          <input
                            className="ad-input"
                            value={st.title}
                            onChange={(e) =>
                              setTimeline({
                                ...timeline,
                                stages: timeline.stages.map((x, j) =>
                                  j === i ? { ...x, title: e.target.value } : x
                                ),
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="ad-field">
                        <label className="ad-label">توضیح</label>
                        <textarea
                          className="ad-textarea"
                          value={st.body}
                          onChange={(e) =>
                            setTimeline({
                              ...timeline,
                              stages: timeline.stages.map((x, j) =>
                                j === i ? { ...x, body: e.target.value } : x
                              ),
                            })
                          }
                        />
                      </div>
                      <div className="ad-field">
                        <label className="ad-label">
                          پایداری ({st.stability}) — ارتفاع ستون
                        </label>
                        <input
                          className="ad-input"
                          type="range"
                          min={40}
                          max={85}
                          value={st.stability}
                          onChange={(e) =>
                            setTimeline({
                              ...timeline,
                              stages: timeline.stages.map((x, j) =>
                                j === i
                                  ? { ...x, stability: Number(e.target.value) }
                                  : x
                              ),
                            })
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="ad-field" style={{ marginTop: 20 }}>
                  <label className="ad-label">جمع‌بندی زیر نمودار</label>
                  <textarea
                    className="ad-textarea"
                    value={timeline.footnote}
                    onChange={(e) =>
                      setTimeline({ ...timeline, footnote: e.target.value })
                    }
                  />
                </div>
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 200px" }}>
                  <div className="ad-field">
                    <label className="ad-label">متن منبع</label>
                    <input
                      className="ad-input"
                      value={timeline.source}
                      onChange={(e) =>
                        setTimeline({ ...timeline, source: e.target.value })
                      }
                    />
                  </div>
                  <div className="ad-field">
                    <label className="ad-label">لینک منبع</label>
                    <input
                      className="ad-input"
                      dir="ltr"
                      value={timeline.sourceHref}
                      onChange={(e) =>
                        setTimeline({ ...timeline, sourceHref: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="ad-row" style={{ marginTop: 16 }}>
                  <button
                    className="ad-btn primary"
                    disabled={busy}
                    onClick={() => save("timeline", timeline)}
                  >
                    {busy ? "در حال ذخیره…" : "ذخیره‌ی بخش زمان‌بندی"}
                  </button>
                  <button
                    className="ad-btn"
                    disabled={busy}
                    onClick={() => setTimeline(data.content.timeline)}
                  >
                    بازگردانی تغییرات
                  </button>
                  <button
                    className="ad-btn"
                    disabled={busy}
                    onClick={() => setTimeline(data.defaults.timeline)}
                  >
                    بازگردانی به پیش‌فرض
                  </button>
                </div>
              </div>
            )}

            {faq && (
              <div className="ad-card">
                <div className="ad-slide-top" style={{ marginBottom: 6 }}>
                  <div>
                    <p className="ad-card-title">پرسش‌های متداول</p>
                    <p className="ad-card-note" style={{ marginBottom: 0 }}>
                      محتوای صفحه‌ی <code>/faq</code>. ترتیب همان ترتیب نمایش است.
                    </p>
                  </div>
                  <button
                    className="ad-btn sm"
                    onClick={() => setFaq({ ...faq, items: [...faq.items, blankFaq()] })}
                  >
                    + پرسش
                  </button>
                </div>

                <div className="ad-field">
                  <label className="ad-label">عنوان بالا (کوچک)</label>
                  <input
                    className="ad-input"
                    value={faq.eyebrow}
                    onChange={(e) => setFaq({ ...faq, eyebrow: e.target.value })}
                  />
                </div>
                <div className="ad-field">
                  <label className="ad-label">تیتر</label>
                  <input
                    className="ad-input"
                    value={faq.title}
                    onChange={(e) => setFaq({ ...faq, title: e.target.value })}
                  />
                </div>
                <div className="ad-field">
                  <label className="ad-label">توضیح کوتاه</label>
                  <textarea
                    className="ad-textarea"
                    value={faq.lede}
                    onChange={(e) => setFaq({ ...faq, lede: e.target.value })}
                  />
                </div>

                <div style={{ marginTop: 16 }}>
                  {faq.items.map((it, i) => (
                    <div key={it.id} className="ad-slide">
                      <div className="ad-slide-top">
                        <span className="ad-badge accent">{i + 1}</span>
                        <div className="ad-row">
                          <button
                            className="ad-btn sm"
                            disabled={i === 0}
                            onClick={() => {
                              const a = [...faq.items];
                              [a[i - 1], a[i]] = [a[i], a[i - 1]];
                              setFaq({ ...faq, items: a });
                            }}
                          >
                            ↑
                          </button>
                          <button
                            className="ad-btn sm"
                            disabled={i === faq.items.length - 1}
                            onClick={() => {
                              const a = [...faq.items];
                              [a[i + 1], a[i]] = [a[i], a[i + 1]];
                              setFaq({ ...faq, items: a });
                            }}
                          >
                            ↓
                          </button>
                          <button
                            className="ad-btn sm danger"
                            onClick={() =>
                              setFaq({
                                ...faq,
                                items: faq.items.filter((_, j) => j !== i),
                              })
                            }
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                      <div className="ad-field" style={{ marginTop: 0 }}>
                        <label className="ad-label">پرسش</label>
                        <input
                          className="ad-input"
                          value={it.q}
                          onChange={(e) =>
                            setFaq({
                              ...faq,
                              items: faq.items.map((x, j) =>
                                j === i ? { ...x, q: e.target.value } : x
                              ),
                            })
                          }
                        />
                      </div>
                      <div className="ad-field">
                        <label className="ad-label">پاسخ</label>
                        <textarea
                          className="ad-textarea"
                          value={it.a}
                          onChange={(e) =>
                            setFaq({
                              ...faq,
                              items: faq.items.map((x, j) =>
                                j === i ? { ...x, a: e.target.value } : x
                              ),
                            })
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="ad-row" style={{ marginTop: 16 }}>
                  <button className="ad-btn primary" disabled={busy} onClick={() => save("faq", faq)}>
                    {busy ? "در حال ذخیره…" : "ذخیره‌ی پرسش‌ها"}
                  </button>
                  <button className="ad-btn" disabled={busy} onClick={() => setFaq(data.content.faq)}>
                    بازگردانی تغییرات
                  </button>
                  <button className="ad-btn" disabled={busy} onClick={() => setFaq(data.defaults.faq)}>
                    بازگردانی به پیش‌فرض
                  </button>
                </div>
              </div>
            )}

            {integrations && (
              <div className="ad-card">
                <div className="ad-slide-top" style={{ marginBottom: 6 }}>
                  <div>
                    <p className="ad-card-title">داده و یکپارچگی</p>
                    <p className="ad-card-note" style={{ marginBottom: 0 }}>
                      محتوای صفحه‌ی <code>/data</code>.
                    </p>
                  </div>
                  <button
                    className="ad-btn sm"
                    onClick={() =>
                      setIntegrations({
                        ...integrations,
                        items: [...integrations.items, blankIntegration()],
                      })
                    }
                  >
                    + مورد
                  </button>
                </div>

                <div className="ad-field">
                  <label className="ad-label">عنوان بالا (کوچک)</label>
                  <input
                    className="ad-input"
                    value={integrations.eyebrow}
                    onChange={(e) =>
                      setIntegrations({ ...integrations, eyebrow: e.target.value })
                    }
                  />
                </div>
                <div className="ad-field">
                  <label className="ad-label">تیتر</label>
                  <input
                    className="ad-input"
                    value={integrations.title}
                    onChange={(e) =>
                      setIntegrations({ ...integrations, title: e.target.value })
                    }
                  />
                </div>
                <div className="ad-field">
                  <label className="ad-label">توضیح کوتاه</label>
                  <textarea
                    className="ad-textarea"
                    value={integrations.lede}
                    onChange={(e) =>
                      setIntegrations({ ...integrations, lede: e.target.value })
                    }
                  />
                </div>

                <div style={{ marginTop: 16 }}>
                  {integrations.items.map((it, i) => (
                    <div key={it.id} className="ad-slide">
                      <div className="ad-slide-top">
                        <span className="ad-badge accent">{i + 1}</span>
                        <button
                          className="ad-btn sm danger"
                          onClick={() =>
                            setIntegrations({
                              ...integrations,
                              items: integrations.items.filter((_, j) => j !== i),
                            })
                          }
                        >
                          حذف
                        </button>
                      </div>
                      <div className="ad-field" style={{ marginTop: 0 }}>
                        <label className="ad-label">عنوان</label>
                        <input
                          className="ad-input"
                          value={it.title}
                          onChange={(e) =>
                            setIntegrations({
                              ...integrations,
                              items: integrations.items.map((x, j) =>
                                j === i ? { ...x, title: e.target.value } : x
                              ),
                            })
                          }
                        />
                      </div>
                      <div className="ad-field">
                        <label className="ad-label">توضیح</label>
                        <textarea
                          className="ad-textarea"
                          value={it.body}
                          onChange={(e) =>
                            setIntegrations({
                              ...integrations,
                              items: integrations.items.map((x, j) =>
                                j === i ? { ...x, body: e.target.value } : x
                              ),
                            })
                          }
                        />
                      </div>
                      <div className="ad-field">
                        <label className="ad-label">
                          برچسب‌ها — با ویرگول جدا کنید
                        </label>
                        <input
                          className="ad-input"
                          value={it.tags.join("، ")}
                          placeholder="مثلاً: O*NET 30.0، CC BY 4.0"
                          onChange={(e) =>
                            setIntegrations({
                              ...integrations,
                              items: integrations.items.map((x, j) =>
                                j === i
                                  ? {
                                      ...x,
                                      tags: e.target.value
                                        .split(/[،,]/)
                                        .map((t) => t.trim())
                                        .filter(Boolean),
                                    }
                                  : x
                              ),
                            })
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="ad-row" style={{ marginTop: 16 }}>
                  <button
                    className="ad-btn primary"
                    disabled={busy}
                    onClick={() => save("integrations", integrations)}
                  >
                    {busy ? "در حال ذخیره…" : "ذخیره‌ی داده و یکپارچگی"}
                  </button>
                  <button
                    className="ad-btn"
                    disabled={busy}
                    onClick={() => setIntegrations(data.content.integrations)}
                  >
                    بازگردانی تغییرات
                  </button>
                  <button
                    className="ad-btn"
                    disabled={busy}
                    onClick={() => setIntegrations(data.defaults.integrations)}
                  >
                    بازگردانی به پیش‌فرض
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </AdminGate>

      {picking !== null && (
        <MediaPicker
          onClose={() => setPicking(null)}
          onPick={(f) => {
            patch(picking, { src: f.url, video: f.type.startsWith("video/") });
            setPicking(null);
          }}
        />
      )}
    </AdminShell>
  );
}
