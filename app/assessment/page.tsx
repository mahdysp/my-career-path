import { Suspense } from "react";
import AssessmentPage from "./AssessmentClient";

export default function Page() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100vh", background: "#070d1a",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#94a3b8", fontFamily: "Vazirmatn, sans-serif",
        fontSize: 14,
      }}>
        در حال بارگذاری...
      </div>
    }>
      <AssessmentPage />
    </Suspense>
  );
}
