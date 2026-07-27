"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

/**
 * صحنه‌ی سه‌بعدی را فقط وقتی بارگذاری می‌کند که کاربر به آن نزدیک شود.
 *
 * چرا: کتابخانه‌ی three حدود ۹۰۰ کیلوبایت است. اگر همراه صفحه لود شود،
 * زمان بارگذاری اولیه برای همه‌ی کاربران — حتی آن‌ها که تا این بخش
 * اسکرول نمی‌کنند — به‌شدت بالا می‌رود.
 */
const CompassScene = dynamic(() => import("./CompassScene"), { ssr: false });

export default function LazyCompass() {
  const ref = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || load) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLoad(true);
          io.disconnect();
        }
      },
      // یک صفحه زودتر شروع به دانلود می‌کند تا آماده باشد
      { rootMargin: "600px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [load]);

  return (
    <div ref={ref} style={{ minHeight: load ? undefined : 420 }}>
      {load && <CompassScene />}
    </div>
  );
}
