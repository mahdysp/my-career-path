"use client";

import { useEffect, useRef, useState } from "react";

/**
 * خط زمانی عمودی که با اسکرول پر می‌شود.
 *
 * ابتدا فقط در صفحه‌ی «روش کار» بود؛ حالا هر شش صفحه‌ی امکانات و منابع
 * از همین یک پیاده‌سازی استفاده می‌کنند تا رفتارشان دقیقاً یکسان باشد.
 *
 * منطق: خط تا ایستگاهی پر می‌شود که از خط میانی پنجره رد شده، و بین دو
 * ایستگاه درون‌یابی خطی می‌شود تا حرکت پیوسته باشد نه پله‌ای.
 *
 * @param count تعداد ایستگاه‌ها — با تغییرش اندازه‌گیری دوباره انجام می‌شود
 * @param selector گزینشگر ایستگاه‌ها داخل ظرف
 */
export function useScrollTrack(count: number, selector = "[data-stage]") {
  const trackRef = useRef<HTMLDivElement>(null);
  const [fill, setFill] = useState(0);
  /** ایندکس آخرین ایستگاه ردشده (-1 = هنوز هیچ‌کدام) */
  const [reached, setReached] = useState(-1);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let ticking = false;

    const update = () => {
      ticking = false;
      const stages = Array.from(track.querySelectorAll<HTMLElement>(selector));
      if (!stages.length) return;

      /* خط میانی پنجره معیار است. اگر از بالای پنجره استفاده می‌کردیم،
         ایستگاه‌ها قبل از دیده شدن روشن می‌شدند. */
      const mid = window.innerHeight * 0.55;
      const trackTop = track.getBoundingClientRect().top;

      let last = -1;
      for (let i = 0; i < stages.length; i++) {
        if (stages[i].getBoundingClientRect().top + 14 <= mid) last = i;
      }

      let filled: number;
      if (last < 0) {
        // هنوز به اولین ایستگاه نرسیده‌ایم — خط از بالا کمی رشد می‌کند
        filled = Math.max(0, Math.min(stages[0].offsetTop, mid - trackTop));
      } else {
        filled = stages[last].offsetTop + 14;
        const next = stages[last + 1];
        if (next) {
          // درون‌یابی بین دو ایستگاه تا حرکت نرم باشد
          const a = stages[last].getBoundingClientRect().top + 14;
          const b = next.getBoundingClientRect().top + 14;
          const t = Math.max(0, Math.min(1, (mid - a) / Math.max(1, b - a)));
          filled += (next.offsetTop - stages[last].offsetTop) * t;
        }
      }

      setFill(Math.max(0, filled));
      setReached(last);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    /* محتوا ممکن است بعد از رندر اول جابه‌جا شود (فونت، تصویر). بدون این،
       ارتفاع خط با موقعیت واقعی ایستگاه‌ها نمی‌خواند. */
    const ro = new ResizeObserver(onScroll);
    ro.observe(track);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      ro.disconnect();
    };
  }, [count, selector]);

  return { trackRef, fill, reached };
}
