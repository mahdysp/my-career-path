import type { Metadata } from "next";
import StatusScreen from "./components/StatusScreen";

export const metadata: Metadata = {
  title: "صفحه پیدا نشد | Karex",
};

export default function NotFound() {
  return (
    <StatusScreen
      code="404"
      title="این صفحه پیدا نشد"
      description="آدرسی که دنبالش بودید وجود ندارد یا جابه‌جا شده است. از صفحه اصلی ادامه دهید."
      primary={{ label: "بازگشت به خانه", href: "/" }}
      secondary={{ label: "شروع آزمون", href: "/quiz" }}
    />
  );
}
