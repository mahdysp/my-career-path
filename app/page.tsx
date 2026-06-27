import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleStartAnalysis = () => {
    setIsLoading(true);
    setTimeout(() => navigate("/quiz"), 600);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800;900&display=swap');
        
        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(94,106,210,0.3); }
          50% { box-shadow: 0 0 40px rgba(94,106,210,0.5); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .page-container {
          min-height: 100vh;
          width: 100%;
          background: #050507;
          font-family: 'Vazirmatn', system-ui, sans-serif;
          direction: rtl;
          position: relative;
          overflow: hidden;
        }
        
        .card {
          background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          position: relative;
          overflow: hidden;
        }
        
        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 10%;
          right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(94,106,210,0.5), transparent);
        }
        
        .glow-text {
          background: linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.85) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .accent-text {
          background: linear-gradient(90deg, #5E6AD2 0%, #8B92D9 50%, #5E6AD2 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s ease infinite;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #5E6AD2 0%, #4F5DAA 100%);
          border: none;
          border-radius: 14px;
          color: #fff;
          font-weight: 700;
          font-size: 16px;
          padding: 16px 32px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          font-family: 'Vazirmatn', sans-serif;
        }
        
        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transition: left 0.5s ease;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(94,106,210,0.4);
        }
        
        .btn-primary:hover::before {
          left: 100%;
        }
        
        .btn-primary:active {
          transform: scale(0.98);
        }
        
        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(94,106,210,0.1);
          border: 1px solid rgba(94,106,210,0.2);
          color: #A5B0E8;
          font-size: 12px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 100px;
        }
        
        .stat-box {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 24px 20px;
          text-align: center;
          transition: all 0.3s ease;
        }
        
        .stat-box:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(94,106,210,0.15);
        }
        
        .feature-box {
          background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          transition: all 0.3s ease;
        }
        
        .feature-box:hover {
          transform: translateY(-4px);
          border-color: rgba(94,106,210,0.2);
          box-shadow: 0 8px 30px rgba(0,0,0,0.2);
        }
        
        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        
        .step-number {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
        }
        
        .step-number.active {
          background: linear-gradient(135deg, #5E6AD2, #4F5DAA);
          color: #fff;
          box-shadow: 0 0 25px rgba(94,106,210,0.4);
        }
        
        .step-number.inactive {
          background: rgba(94,106,210,0.08);
          border: 1px solid rgba(94,106,210,0.2);
          color: #8B92D9;
        }
        
        .progress-bar {
          height: 4px;
          background: rgba(94,106,210,0.15);
          border-radius: 2px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #5E6AD2, #8B92D9);
          border-radius: 2px;
          animation: shimmer 2s ease infinite;
          background-size: 200% 100%;
        }
        
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(94,106,210,0.2), transparent);
        }
        
        .fade-up {
          opacity: 0;
          animation: fade-up 0.6s ease forwards;
        }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
      `}</style>

      <div className="page-container">
        {/* Background Layers */}
        <div style={{
          position: "fixed",
          inset: 0,
          background: "radial-gradient(ellipse 100% 50% at 50% -10%, #0d0d1f 0%, #050507 60%, #020204 100%)",
          pointerEvents: "none",
        }} />

        {/* Subtle Grid */}
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(94,106,210,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(94,106,210,0.02) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }} />

        {/* Ambient Glow - Top */}
        <div style={{
          position: "fixed",
          top: "-30%",
          left: "20%",
          width: "800px",
          height: "800px",
          background: "radial-gradient(circle, rgba(94,106,210,0.2) 0%, transparent 60%)",
          filter: "blur(80px)",
          animation: "pulse-soft 8s ease-in-out infinite",
          pointerEvents: "none",
        }} />

        {/* Ambient Glow - Bottom */}
        <div style={{
          position: "fixed",
          bottom: "-20%",
          right: "10%",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 60%)",
          filter: "blur(60px)",
          animation: "pulse-soft 10s ease-in-out infinite",
          animationDelay: "-4s",
          pointerEvents: "none",
        }} />

        {/* Main Content */}
        <div style={{
          position: "relative",
          zIndex: 10,
          maxWidth: 520,
          margin: "0 auto",
          padding: "60px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
        }}>

          {/* Logo Section */}
          <div className={`fade-up ${loaded ? '' : 'opacity-0'}`} style={{ textAlign: "center" }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              margin: "0 auto 20px",
              background: "linear-gradient(135deg, rgba(94,106,210,0.3), rgba(139,92,246,0.2))",
              border: "1px solid rgba(94,106,210,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "glow-pulse 4s ease-in-out infinite",
            }}>
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#8B92D9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>

            <div style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#8A8F98",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}>
              Karex
            </div>

            <h1 style={{
              fontSize: 36,
              fontWeight: 900,
              lineHeight: 1.3,
              color: "#EDEDEF",
              direction: "rtl",
            }}>
              <span className="accent-text">هدایت مسیر</span>
              <br />
              <span className="glow-text">شغلی من</span>
            </h1>
          </div>

          {/* Subtitle */}
          <div className={`fade-up delay-100 ${loaded ? '' : 'opacity-0'}`} style={{ textAlign: "center" }}>
            <p style={{
              fontSize: 15,
              color: "#8A8F98",
              lineHeight: 1.8,
              direction: "rtl",
            }}>
              با پاسخ به چند سؤال هوشمند،
              <br />
              بهترین مسیر شغلی رو پیدا کن
            </p>
          </div>

          {/* Badges */}
          <div className={`fade-up delay-200 ${loaded ? '' : 'opacity-0'}`} style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
          }}>
            <span className="badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              رایگان
            </span>
            <span className="badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              نتیجه فوری
            </span>
          </div>

          {/* Main Card */}
          <div className={`card fade-up delay-300 ${loaded ? '' : 'opacity-0'}`} style={{
            width: "100%",
            padding: "40px 36px",
          }}>

            {/* Stats */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
              marginBottom: 28,
            }}>
              <div className="stat-box">
                <div style={{ fontSize: 26, fontWeight: 800, color: "#EDEDEF", marginBottom: 4 }}>+2400</div>
                <div style={{ fontSize: 11, color: "#8A8F98" }}>مسیر شغلی</div>
              </div>
              <div className="stat-box">
                <div style={{ fontSize: 26, fontWeight: 800, color: "#EDEDEF", marginBottom: 4 }}>5 دقیقه</div>
                <div style={{ fontSize: 11, color: "#8A8F98" }}>زمان تحلیل</div>
              </div>
              <div className="stat-box">
                <div style={{ fontSize: 26, fontWeight: 800, color: "#EDEDEF", marginBottom: 4 }}>%94</div>
                <div style={{ fontSize: 11, color: "#8A8F98" }}>دقت نتایج</div>
              </div>
            </div>

            {/* Progress */}
            <div style={{ marginBottom: 24 }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
                direction: "rtl",
              }}>
                <span style={{ fontSize: 12, color: "#8A8F98" }}>آماده به تحلیل</span>
                <span style={{ fontSize: 12, color: "#5E6AD2", fontWeight: 600 }}>آماده</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "100%" }} />
              </div>
            </div>

            {/* CTA Button */}
            <button
              className="btn-primary"
              onClick={handleStartAnalysis}
              disabled={isLoading}
              style={{ width: "100%" }}
            >
              {isLoading ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  در حال پردازش...
                </span>
              ) : "شروع تحلیل مسیر شغلی"}
            </button>
          </div>

          {/* Features */}
          <div className={`fade-up delay-400 ${loaded ? '' : 'opacity-0'}`} style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}>
            <div className="feature-box">
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: "rgba(94,106,210,0.1)",
                border: "1px solid rgba(94,106,210,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 12px",
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B92D9" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#EDEDEF", marginBottom: 4 }}>تحلیل دقیق</div>
              <div style={{ fontSize: 11, color: "#8A8F98" }}>بر اساس مهارت‌ها</div>
            </div>

            <div className="feature-box">
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: "rgba(94,106,210,0.1)",
                border: "1px solid rgba(94,106,210,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 12px",
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B92D9" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#EDEDEF", marginBottom: 4 }}>نتایج مطمئن</div>
              <div style={{ fontSize: 11, color: "#8A8F98" }}>94% صحت</div>
            </div>

            <div className="feature-box">
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: "rgba(94,106,210,0.1)",
                border: "1px solid rgba(94,106,210,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 12px",
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B92D9" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#EDEDEF", marginBottom: 4 }}>سریع</div>
              <div style={{ fontSize: 11, color: "#8A8F98" }}>5 دقیقه زمان</div>
            </div>
          </div>

          {/* Steps */}
          <div className={`fade-up delay-500 ${loaded ? '' : 'opacity-0'}`} style={{ width: "100%" }}>
            <div className="divider" style={{ marginBottom: 32 }} />
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
              alignItems: "start",
            }}>
              <div className="step-item">
                <div className="step-number active">1</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#EDEDEF", textAlign: "center" }}>پاسخ به سؤالات</div>
              </div>
              <div className="step-item">
                <div className="step-number inactive">2</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#8A8F98", textAlign: "center" }}>تحلیل</div>
              </div>
              <div className="step-item">
                <div className="step-number inactive">3</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#8A8F98", textAlign: "center" }}>دریافت نتیجه</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`fade-up delay-600 ${loaded ? '' : 'opacity-0'}`} style={{ textAlign: "center", paddingTop: 20 }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>Powered by Karex</p>
          </div>
        </div>

        {/* Bottom Gradient */}
        <div style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          height: 150,
          background: "linear-gradient(to top, rgba(5,5,7,0.8), transparent)",
          pointerEvents: "none",
        }} />
      </div>
    </>
  );
}
