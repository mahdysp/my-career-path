"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function CareerHub() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

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

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const scrollY = window.scrollY;
      const parallaxElement = containerRef.current.querySelector('.parallax-bg') as HTMLElement;
      if (parallaxElement) {
        parallaxElement.style.transform = `translateY(${scrollY * 0.3}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartAnalysis = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/quiz");
    }, 600);
  };

  const features = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B92D9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
        </svg>
      ),
      title: "تحلیل شخصی‌سازی شده",
      desc: "بر اساس مهارت‌ها و علایق شما"
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B92D9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
      title: "نتایج دقیق",
      desc: "۹۴٪ صحت در پیش‌بینی مسیر"
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B92D9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
      ),
      title: "سریع و آسان",
      desc: "فقط ۵ دقیقه زمان می‌برد"
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800;900&display=swap');
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }
        
        @keyframes float-medium {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-15px) scale(1.02); }
        }
        
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes shimmer-text {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes draw-circle {
          from { stroke-dashoffset: 1000; }
          to { stroke-dashoffset: 0; }
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        .hero-icon-container {
          position: relative;
          width: 200px;
          height: 200px;
        }
        
        .hero-icon-ring {
          position: absolute;
          inset: -20px;
          border-radius: 50%;
          border: 1px solid rgba(94, 106, 210, 0.2);
          animation: pulse-ring 3s ease-out infinite;
        }
        
        .hero-icon-ring:nth-child(2) {
          animation-delay: 1s;
        }
        
        .hero-icon-ring:nth-child(3) {
          animation-delay: 2s;
        }
        
        .hero-icon-glow {
          position: absolute;
          inset: -40px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(94, 106, 210, 0.15) 0%, transparent 70%);
          filter: blur(20px);
          animation: float-medium 6s ease-in-out infinite;
        }
        
        .hero-icon {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          animation: float-slow 8s ease-in-out infinite;
          filter: drop-shadow(0 0 30px rgba(94, 106, 210, 0.4));
        }
        
        .orbit-ring {
          position: absolute;
          border: 1px dashed rgba(94, 106, 210, 0.15);
          border-radius: 50%;
          animation: rotate-slow 30s linear infinite;
        }
        
        .orbit-ring-1 {
          width: 280px;
          height: 280px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        
        .orbit-ring-2 {
          width: 360px;
          height: 360px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-direction: reverse;
          animation-duration: 40s;
        }
        
        .orbit-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #5E6AD2;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(94, 106, 210, 0.6);
        }
        
        .btn-mega {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #5E6AD2, #4F5DAA);
          border: none;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .btn-mega::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transition: left 0.5s ease;
        }
        
        .btn-mega:hover::before {
          left: 100%;
        }
        
        .btn-mega:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 
            0 0 0 2px rgba(94, 106, 210, 0.6),
            0 8px 32px rgba(94, 106, 210, 0.4),
            0 16px 48px rgba(94, 106, 210, 0.2),
            inset 0 1px 0 rgba(255,255,255,0.3);
        }
        
        .btn-mega:active {
          transform: scale(0.98);
        }
        
        .feature-card {
          background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
          border: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(10px);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .feature-card:hover {
          background: linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%);
          border-color: rgba(94, 106, 210, 0.25);
          transform: translateY(-4px);
          box-shadow: 
            0 8px 32px rgba(0,0,0,0.3),
            0 0 40px rgba(94, 106, 210, 0.08);
        }
        
        .glow-text {
          background: linear-gradient(135deg, #ffffff 0%, #ffffff 50%, rgba(255,255,255,0.8) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .accent-text {
          background: linear-gradient(90deg, #5E6AD2 0%, #8B92D9 25%, #5E6AD2 50%, #8B92D9 75%, #5E6AD2 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer-text 4s linear infinite;
        }
        
        .glass-card {
          background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 
            0 0 0 1px rgba(255,255,255,0.03) inset,
            0 4px 24px rgba(0,0,0,0.4),
            0 0 60px rgba(94, 106, 210, 0.05);
        }
        
        .stat-item {
          position: relative;
        }
        
        .stat-item::after {
          content: '';
          position: absolute;
          right: 0;
          top: 20%;
          height: 60%;
          width: 1px;
          background: linear-gradient(180deg, transparent, rgba(94, 106, 210, 0.3), transparent);
        }
        
        .stat-item:last-child::after {
          display: none;
        }
        
        .animate-fade-up {
          animation: fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
        
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #5E6AD2;
          border-radius: 50%;
          opacity: 0.3;
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        
        .section-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(94, 106, 210, 0.3), transparent);
        }
        
        .check-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #34d399;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 100px;
        }
        
        .progress-bar {
          height: 4px;
          background: rgba(94, 106, 210, 0.2);
          border-radius: 2px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #5E6AD2, #8B92D9);
          border-radius: 2px;
          animation: shimmer-text 2s linear infinite;
          background-size: 200% 100%;
        }
      `}</style>

      <div
        ref={containerRef}
        style={{
          minHeight: "100vh",
          width: "100%",
          background: "#050507",
          fontFamily: "'Vazirmatn', system-ui, sans-serif",
          direction: "rtl",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Parallax Background Layer */}
        <div 
          className="parallax-bg"
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 100% 60% at 50% -10%, #0d0d1a 0%, #050507 50%, #020204 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Noise Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.02,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            pointerEvents: "none",
          }}
        />

        {/* Grid Pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(94, 106, 210, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(94, 106, 210, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
            pointerEvents: "none",
          }}
        />

        {/* Ambient Glow Blobs */}
        <div
          style={{
            position: "absolute",
            top: "-30%",
            left: "30%",
            width: "800px",
            height: "800px",
            background: "radial-gradient(circle, rgba(94, 106, 210, 0.2) 0%, transparent 60%)",
            filter: "blur(120px)",
            animation: "float-slow 12s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "-20%",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 60%)",
            filter: "blur(100px)",
            animation: "float-medium 10s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "-10%",
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 60%)",
            filter: "blur(80px)",
            animation: "float-slow 8s ease-in-out infinite",
            animationDelay: "2s",
            pointerEvents: "none",
          }}
        />

        {/* Floating Particles */}
        <div className="particle" style={{ top: "20%", left: "15%", animationDelay: "0s" }} />
        <div className="particle" style={{ top: "30%", left: "80%", animationDelay: "0.5s" }} />
        <div className="particle" style={{ top: "60%", left: "10%", animationDelay: "1s" }} />
        <div className="particle" style={{ top: "70%", left: "85%", animationDelay: "1.5s" }} />
        <div className="particle" style={{ top: "85%", left: "30%", animationDelay: "0.8s" }} />

        {/* Main Content */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "60px 20px 80px",
          }}
        >
          {/* Hero Section */}
          <div
            className={`animate-fade-up ${loaded ? '' : 'opacity-0'}`}
            style={{ animationPlayState: loaded ? 'running' : 'paused' }}
          >
            {/* Icon Hero with Orbit Rings */}
            <div className="hero-icon-container" style={{ marginBottom: 40 }}>
              {/* Orbit Rings */}
              <div className="orbit-ring orbit-ring-1">
                <div className="orbit-dot" style={{ top: 0, left: "50%", transform: "translateX(-50%)" }} />
              </div>
              <div className="orbit-ring orbit-ring-2">
                <div className="orbit-dot" style={{ bottom: 0, right: "10%" }} />
              </div>
              
              {/* Glow */}
              <div className="hero-icon-glow" />
              
              {/* Pulsing Rings */}
              <div className="hero-icon-ring" />
              <div className="hero-icon-ring" />
              <div className="hero-icon-ring" />
              
              {/* Main Icon */}
              <img 
                src="/icon.png" 
                alt="مسیریابی شغلی" 
                className="hero-icon"
              />
            </div>
          </div>

          {/* Title Section */}
          <div 
            className={`animate-fade-up delay-100 ${loaded ? '' : 'opacity-0'}`}
            style={{ textAlign: "center", marginBottom: 16 }}
          >
            <h1
              style={{
                fontSize: "clamp(28px, 5vw, 42px)",
                fontWeight: 900,
                lineHeight: 1.3,
                letterSpacing: "-0.03em",
                color: "#EDEDEF",
                marginBottom: 8,
              }}
            >
              <span className="accent-text" style={{ fontWeight: 900 }}>هدایت مسیر</span>
              <br />
              <span className="glow-text">شغلی من</span>
            </h1>
          </div>

          {/* Subtitle */}
          <div 
            className={`animate-fade-up delay-200 ${loaded ? '' : 'opacity-0'}`}
            style={{ textAlign: "center", marginBottom: 40 }}
          >
            <p
              style={{
                fontSize: 16,
                color: "#8A8F98",
                lineHeight: 1.8,
                maxWidth: 500,
                direction: "rtl",
              }}
            >
              با پاسخ به چند سؤال هوشمند، بهترین مسیر شغلی متناسب با علاقه، مهارت و هدف‌هایت رو پیدا کن
            </p>
          </div>

          {/* Features Badge */}
          <div 
            className={`animate-fade-up delay-300 ${loaded ? '' : 'opacity-0'}`}
            style={{ 
              display: "flex", 
              gap: 8, 
              marginBottom: 48,
              flexWrap: "wrap",
              justifyContent: "center"
            }}
          >
            <span className="check-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              رایگان
            </span>
            <span className="check-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              بدون نیاز به ثبت‌نام
            </span>
            <span className="check-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              نتیجه فوری
            </span>
          </div>

          {/* Stats Section */}
          <div 
            className={`glass-card animate-fade-up delay-400 ${loaded ? '' : 'opacity-0'}`}
            style={{
              display: "flex",
              gap: 0,
              borderRadius: 20,
              padding: "24px 48px",
              marginBottom: 40,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Subtle top border gradient */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "10%",
                right: "10%",
                height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(94, 106, 210, 0.5), transparent)",
              }}
            />
            
            <div className="stat-item" style={{ padding: "0 32px" }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: "#EDEDEF", lineHeight: 1 }}>+۲۴۰۰</div>
              <div style={{ fontSize: 13, color: "#8A8F98", marginTop: 6 }}>مسیر شغلی</div>
            </div>
            
            <div className="stat-item" style={{ padding: "0 32px" }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: "#EDEDEF", lineHeight: 1 }}>۵ دقیقه</div>
              <div style={{ fontSize: 13, color: "#8A8F98", marginTop: 6 }}>زمان تحلیل</div>
            </div>
            
            <div className="stat-item" style={{ padding: "0 32px" }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: "#EDEDEF", lineHeight: 1 }}>%۹۴</div>
              <div style={{ fontSize: 13, color: "#8A8F98", marginTop: 6 }}>دقت نتایج</div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div 
            className={`animate-fade-up delay-500 ${loaded ? '' : 'opacity-0'}`}
            style={{
              width: "100%",
              maxWidth: 400,
              marginBottom: 40,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, direction: "rtl" }}>
              <span style={{ fontSize: 12, color: "#8A8F98" }}>آماده شروع</span>
              <span style={{ fontSize: 12, color: "#5E6AD2" }}>۱۰۰٪</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "100%" }} />
            </div>
          </div>

          {/* CTA Button */}
          <button
            className={`btn-mega animate-fade-up delay-600 ${loaded ? '' : 'opacity-0'}`}
            onClick={handleStartAnalysis}
            disabled={isLoading}
            style={{
              width: "100%",
              maxWidth: 400,
              color: "#fff",
              border: "none",
              borderRadius: 16,
              padding: "20px 32px",
              fontFamily: "'Vazirmatn', sans-serif",
              fontSize: 17,
              fontWeight: 700,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              letterSpacing: "-0.01em",
            }}
          >
            {isLoading ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  style={{ animation: "rotate-slow 1s linear infinite" }}
                >
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                در حال پردازش...
              </span>
            ) : (
              "شروع تحلیل مسیر شغلی"
            )}
          </button>

          {/* Features Grid */}
          <div 
            className="animate-fade-up"
            style={{ 
              animationDelay: "0.7s",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 16,
              width: "100%",
              maxWidth: 700,
              marginTop: 60,
              opacity: loaded ? 1 : 0,
            }}
          >
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="feature-card"
                style={{
                  borderRadius: 16,
                  padding: "24px 20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "rgba(94, 106, 210, 0.1)",
                    border: "1px solid rgba(94, 106, 210, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#EDEDEF", marginBottom: 6 }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: 12, color: "#8A8F98", lineHeight: 1.6 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Steps Timeline */}
          <div 
            className="animate-fade-up"
            style={{ 
              animationDelay: "0.8s",
              width: "100%",
              maxWidth: 600,
              marginTop: 60,
              opacity: loaded ? 1 : 0,
            }}
          >
            <div className="section-divider" style={{ marginBottom: 32 }} />
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
              {/* Connection Line */}
              <div
                style={{
                  position: "absolute",
                  top: 20,
                  left: "15%",
                  right: "15%",
                  height: "2px",
                  background: "linear-gradient(90deg, #5E6AD2, rgba(94, 106, 210, 0.3), #5E6AD2)",
                  borderRadius: 1,
                }}
              />
              
              {[
                { num: "۱", title: "پاسخ به سؤالات", desc: "۱۰ سؤال کلیدی" },
                { num: "۲", title: "تحلیل", desc: "بررسی هوشمند" },
                { num: "۳", title: "دریافت نتیجه", desc: "مسیر پیشنهادی" },
              ].map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: idx === 0 
                        ? "linear-gradient(135deg, #5E6AD2, #4F5DAA)" 
                        : "rgba(94, 106, 210, 0.1)",
                      border: idx === 0 
                        ? "none" 
                        : "1px solid rgba(94, 106, 210, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                      fontSize: 16,
                      fontWeight: 700,
                      color: idx === 0 ? "#fff" : "#8B92D9",
                      boxShadow: idx === 0 ? "0 0 20px rgba(94, 106, 210, 0.4)" : "none",
                    }}
                  >
                    {step.num}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#EDEDEF", marginBottom: 4 }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: 12, color: "#8A8F98" }}>
                    {step.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Indicators */}
          <div 
            className="animate-fade-up"
            style={{ 
              animationDelay: "0.9s",
              marginTop: 60,
              paddingBottom: 40,
              opacity: loaded ? 1 : 0,
            }}
          >
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", direction: "rtl" }}>
              بیش از ۲۴۰۰ نفر از این سامانه استفاده کرده‌اند
            </p>
          </div>
        </div>

        {/* Bottom Gradient Fade */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 200,
            background: "linear-gradient(to top, rgba(5, 5, 7, 0.8), transparent)",
            pointerEvents: "none",
          }}
        />
      </div>

      <style>{`
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
