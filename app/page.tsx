"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function CareerHub() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleStartAnalysis = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/quiz");
    }, 600);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y });
    };

    const card = cardRef.current;
    if (card) {
      card.addEventListener("mousemove", handleMouseMove);
      return () => card.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  const stats = [
    { num: "+۲۴۰۰", lbl: "مسیر شغلی", icon: "path" },
    { num: "۵ دقیقه", lbl: "زمان تحلیل", icon: "clock" },
    { num: "%۹۴", lbl: "دقت نتایج", icon: "target" },
  ];

  const steps = [
    { n: "۱", lbl: "پرسش‌نامه" },
    { n: "۲", lbl: "تحلیل" },
    { n: "۳", lbl: "نتیجه" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800;900&display=swap');
        
        @keyframes float-blob-1 {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); }
          50% { transform: translateY(-30px) translateX(10px) scale(1.05); }
        }
        
        @keyframes float-blob-2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        
        @keyframes float-blob-3 {
          0%, 100% { transform: translateY(0) scale(1); }
          33% { transform: translateY(-15px) scale(1.02); }
          66% { transform: translateY(-25px) scale(0.98); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        .btn-primary {
          position: relative;
          overflow: hidden;
        }
        
        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          transition: left 0.5s ease;
        }
        
        .btn-primary:hover::before {
          left: 100%;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 0 0 1px rgba(94, 106, 210, 0.5),
            0 4px 12px rgba(94, 106, 210, 0.3),
            0 8px 32px rgba(94, 106, 210, 0.2),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.2);
        }
        
        .btn-primary:active {
          transform: scale(0.98);
        }
        
        .card-spotlight {
          background: radial-gradient(
            300px circle at var(--mouse-x) var(--mouse-y),
            rgba(94, 106, 210, 0.12),
            transparent 100%
          );
        }
        
        .step-line {
          background: linear-gradient(90deg, rgba(94, 106, 210, 0.4), rgba(94, 106, 210, 0.2));
        }
        
        .stat-icon {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(94, 106, 210, 0.15);
          border: 1px solid rgba(94, 106, 210, 0.2);
        }
        
        .badge-pulse {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .text-gradient {
          background: linear-gradient(
            135deg,
            #ffffff 0%,
            #ffffff 40%,
            rgba(255, 255, 255, 0.7) 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .text-gradient-accent {
          background: linear-gradient(
            90deg,
            #5E6AD2 0%,
            #8B92D9 25%,
            #5E6AD2 50%,
            #8B92D9 75%,
            #5E6AD2 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          background: "#050506",
          fontFamily: "'Vazirmatn', system-ui, sans-serif",
          direction: "rtl",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          padding: "40px 20px",
        }}
      >
        {/* Layer 1: Base gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, #0a0a0f 0%, #050506 50%, #020203 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Layer 2: Noise texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.015,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            pointerEvents: "none",
          }}
        />

        {/* Layer 3: Grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
            pointerEvents: "none",
          }}
        />

        {/* Layer 4: Animated gradient blobs */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "20%",
            width: "900px",
            height: "1400px",
            background: "radial-gradient(ellipse, rgba(94, 106, 210, 0.25) 0%, transparent 70%)",
            filter: "blur(150px)",
            animation: "float-blob-1 10s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: "30%",
            right: "-10%",
            width: "600px",
            height: "800px",
            background: "radial-gradient(ellipse, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
            filter: "blur(120px)",
            animation: "float-blob-2 12s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "30%",
            width: "500px",
            height: "700px",
            background: "radial-gradient(ellipse, rgba(99, 102, 241, 0.12) 0%, transparent 70%)",
            filter: "blur(100px)",
            animation: "float-blob-3 8s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "0%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "400px",
            background: "radial-gradient(ellipse at center bottom, rgba(94, 106, 210, 0.1) 0%, transparent 60%)",
            filter: "blur(80px)",
            animation: "pulse-glow 4s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />

        

        {/* Card with spotlight effect */}
        <div
          ref={cardRef}
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: 480,
            textAlign: "center",
            background: "linear-gradient(to bottom, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 20,
            padding: "48px 44px",
            boxShadow: `
              0 0 0 1px rgba(255,255,255,0.04) inset,
              0 2px 20px rgba(0,0,0,0.4),
              0 0 40px rgba(0,0,0,0.2),
              0 0 80px rgba(94, 106, 210, 0.06)
            `,
            "--mouse-x": `${mousePos.x}%`,
            "--mouse-y": `${mousePos.y}%`,
          } as React.CSSProperties}
          className="card-spotlight"
        >
          {/* Top accent line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "20%",
              right: "20%",
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(94, 106, 210, 0.5), transparent)",
            }}
          />

          {/* Icon */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              margin: "0 auto 28px",
              background: "linear-gradient(135deg, rgba(94, 106, 210, 0.2), rgba(139, 92, 246, 0.1))",
              border: "1px solid rgba(94, 106, 210, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              boxShadow: `
                0 0 24px rgba(94, 106, 210, 0.15),
                0 0 48px rgba(94, 106, 210, 0.1) inset
              `,
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(139, 146, 217, 0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
              <line x1="12" y1="2" x2="12" y2="4" />
              <line x1="12" y1="20" x2="12" y2="22" />
              <line x1="2" y1="12" x2="4" y2="12" />
              <line x1="20" y1="12" x2="22" y2="12" />
            </svg>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              color: "#EDEDEF",
              marginBottom: 16,
              direction: "rtl",
            }}
          >
            سامانه{" "}
            <span
              className="text-gradient-accent"
              style={{ fontWeight: 800 }}
            >
              هدایت مسیر
            </span>
            <br />
            <span className="text-gradient">شغلی من</span>
          </h1>

          <p
            style={{
              fontSize: 15,
              color: "#8A8F98",
              lineHeight: 1.7,
              marginBottom: 36,
              direction: "rtl",
            }}
          >
            با پاسخ به چند سؤال هوشمند، بهترین مسیر شغلی متناسب با علاقه، مهارت و هدف‌هایت رو پیدا کن.
          </p>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 36,
            }}
          >
            {stats.map((s) => (
              <div
                key={s.lbl}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 14,
                  padding: "16px 12px",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  className="stat-icon"
                  style={{ margin: "0 auto 10px" }}
                >
                  {s.icon === "path" && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5E6AD2" strokeWidth="2">
                      <path d="M3 12h4l3-9 4 18 3-9h4" />
                    </svg>
                  )}
                  {s.icon === "clock" && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5E6AD2" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  )}
                  {s.icon === "target" && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5E6AD2" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#EDEDEF",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {s.num}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#8A8F98",
                    marginTop: 4,
                    fontWeight: 500,
                  }}
                >
                  {s.lbl}
                </div>
              </div>
            ))}
          </div>

          {/* Button */}
          <button
            onClick={handleStartAnalysis}
            disabled={isLoading}
            className="btn-primary"
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #5E6AD2, #4F5DAA)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "16px 24px",
              fontFamily: "'Vazirmatn', sans-serif",
              fontSize: 15,
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              letterSpacing: "-0.01em",
            }}
          >
            {isLoading ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ animation: "spin 1s linear infinite" }}
                >
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                در حال پردازش...
              </span>
            ) : (
              "شروع تحلیل رایگان ←"
            )}
          </button>

          {/* Steps */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 32,
            }}
          >
            {steps.map((step, idx) => (
              <div
                key={step.n}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  position: "relative",
                }}
              >
                {idx > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 11,
                      right: 0,
                      width: "calc(50% - 14px)",
                      height: "1px",
                    }}
                    className="step-line"
                  />
                )}
                {idx < steps.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 11,
                      left: 0,
                      width: "calc(50% - 14px)",
                      height: "1px",
                    }}
                    className="step-line"
                  />
                )}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: idx === 0 ? "#5E6AD2" : "rgba(94, 106, 210, 0.1)",
                    border: `1px solid ${idx === 0 ? "#5E6AD2" : "rgba(94, 106, 210, 0.3)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 600,
                    color: idx === 0 ? "#fff" : "#8B92D9",
                    transition: "all 0.2s ease",
                    boxShadow: idx === 0 ? "0 0 16px rgba(94, 106, 210, 0.4)" : "none",
                  }}
                >
                  {step.n}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#8A8F98",
                    fontWeight: 500,
                  }}
                >
                  {step.lbl}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer hint */}
        <p
          style={{
            marginTop: 24,
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
            direction: "rtl",
          }}
        >
          تجزیه و تحلیل با هوش مصنوعی پیشرفته
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
