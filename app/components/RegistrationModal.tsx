"use client";
import { useState } from "react";

export default function RegistrationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(7, 13, 26, 0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
      <div style={{ background: "#0f172a", border: "1px solid rgba(59, 130, 246, 0.3)", borderRadius: 20, padding: "32px", width: "100%", maxWidth: "400px" }}>
        <h2 style={{ color: "#fff", marginBottom: 20 }}>ثبت‌نام در کارخونه</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input placeholder="نام" style={inputStyle} />
          <input placeholder="نام خانوادگی" style={inputStyle} />
          <input type="email" placeholder="ایمیل" style={inputStyle} />
          <select style={inputStyle}>
            <option>وضعیت تحصیلی</option>
            <option>دانشجو</option>
            <option>فارغ‌التحصیل</option>
            <option>شاغل</option>
          </select>
          <button style={{ background: "#1d4ed8", color: "#fff", padding: "12px", borderRadius: 10, border: "none" }}>تکمیل ثبت‌نام</button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = { background: "#1e293b", border: "1px solid #334155", padding: "12px", borderRadius: 8, color: "#fff" };
