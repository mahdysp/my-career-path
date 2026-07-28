import { Suspense } from "react";
import AuthClient from "./AuthClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div
          dir="rtl"
          style={{
            minHeight: "100vh",
            background: "var(--page-gradient)",
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
      <AuthClient />
    </Suspense>
  );
}
