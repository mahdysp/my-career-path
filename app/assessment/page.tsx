import { Suspense } from "react";
import AssessmentClient from "./AssessmentClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div
          dir="rtl"
          style={{
            minHeight: "100vh",
            background:
              "radial-gradient(ellipse 1200px 800px at 50% -10%, #0e0e16 0%, #050506 55%, #020203 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--foreground-muted)",
            fontFamily: "var(--font-sans)",
            fontSize: 14,
          }}
        >
          در حال بارگذاری…
        </div>
      }
    >
      <AssessmentClient />
    </Suspense>
  );
}
