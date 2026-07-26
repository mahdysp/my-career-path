"use client";

import { useEffect } from "react";
import StatusScreen from "./components/StatusScreen";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusScreen
      code="خطا"
      title="مشکلی پیش آمد"
      description="در نمایش این صفحه خطایی رخ داد. می‌توانید دوباره تلاش کنید یا به صفحه اصلی برگردید."
      primary={{ label: "تلاش دوباره", onClick: reset }}
      secondary={{ label: "بازگشت به خانه", href: "/" }}
    />
  );
}
