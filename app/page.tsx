"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function CareerHub() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
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

  const handleStartAnalysis = () => {
    setIsLoading(true);
    setTimeout(() => router.push("/quiz"), 600);
  };

  // Generate random stars
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 5,
  }));

  // Generate floating particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 6 + 4,
    delay: Math.random() * 3,
    color: i % 4 === 0 ? "#5E6AD2" : i % 4 === 1 ? "#8B92D9" : i % 4 === 2 ? "#A5B0E8" : "#C4BDE8",
  }));

  // Light rays positions
  const lightRays = [
    { left: "20%", top: "0%", height: "70%", angle: 15 },
    { left: "35%", top: "0%", height: "60%", angle: 8 },
    { left: "50%", top: "0%", height: "80%", angle: 0 },
    { left: "65%", top: "0%", height: "65%", angle: -10 },
    { left: "80%", top: "0%", height: "75%", angle: -18 },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800;900&display=swap');
        
        @keyframes float-1 {
          0%, 100% { transform: translateY(0) scale(1); }
          33% { transform: translateY(-30px) scale(1.05); }
          66% { transform: translateY(-15px) scale(0.98); }
        }
        
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(15px, -20px) rotate(3deg); }
          50% { transform: translate(-10px, -30px) rotate(-2deg); }
          75% { transform: translate(5px, -15px) rotate(1deg); }
        }
        
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-30px) translateX(10px); opacity: 0.6; }
          50% { transform: translateY(-50px) translateX(-5px); opacity: 0.4; }
          75% { transform: translateY(-20px) translateX(15px); opacity: 0.5; }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.3); }
        }
        
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes orbit-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        @keyframes shimmer-text {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scale-in {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes rotate-loader {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes aurora-drift {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.5; }
          25% { transform: translate(40px, -30px) scale(1.1) rotate(5deg); opacity: 0.7; }
          50% { transform: translate(-30px, -50px) scale(0.95) rotate(-3deg); opacity: 0.55; }
          75% { transform: translate(20px, -70px) scale(1.05) rotate(2deg); opacity: 0.45; }
        }
        
        @keyframes aurora-drift-2 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.4; }
          33% { transform: translate(-50px, 25px) scale(1.15) rotate(-4deg); opacity: 0.6; }
          66% { transform: translate(25px, -35px) scale(0.9) rotate(3deg); opacity: 0.45; }
        }
        
        @keyframes nebula-pulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.08); }
        }
        
        @keyframes light-ray-glow {
          0%, 100% { opacity: 0.04; }
          50% { opacity: 0.12; }
        }
        
        .container {
          min-height: 100vh;
          width: 100%;
          background: #050507;
          font-family: 'Vazirmatn', system-ui, sans-serif;
          direction: rtl;
          position: relative;
          overflow: hidden;
        }
        
        .main-card {
          position: relative;
          background: linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 28px;
          overflow: hidden;
        }
        
        .main-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(400px circle at var(--mx) var(--my), rgba(94,106,210,0.12), transparent 100%);
          transition: opacity 0.3s;
          opacity: 0;
        }
        
        .main-card:hover::before {
          opacity: 1;
        }
        
        .card-top-line {
          position: absolute;
          top: 0;
          left: 10%;
          right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(94,106,210,0.6), transparent);
        }
        
        .glow-text {
          background: linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.9) 40%, rgba(255,255,255,0.7) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .accent-text {
          background: linear-gradient(90deg, #5E6AD2 0%, #8B92D9 20%, #A5B0E8 40%, #8B92D9 60%, #5E6AD2 80%, #8B92D9 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer-text 4s ease infinite;
        }
        
        .hero-wrapper {
          position: relative;
          width: 220px;
          height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .hero-icon-bg {
          position: absolute;
          inset: -40px;
          background: radial-gradient(circle, rgba(94,106,210,0.3) 0%, rgba(139,92,246,0.15) 40%, rgba(99,102,241,0.08) 70%, transparent 100%);
          filter: blur(40px);
          animation: float-1 6s ease-in-out infinite;
        }
        
        .hero-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(94,106,210,0.25);
        }
        
        .hero-ring-1 {
          width: 260px;
          height: 260px;
          animation: orbit 25s linear infinite;
        }
        
        .hero-ring-2 {
          width: 320px;
          height: 320px;
          animation: orbit-reverse 35s linear infinite;
          border-style: dashed;
          border-color: rgba(139,92,246,0.2);
        }
        
        .hero-ring-3 {
          width: 380px;
          height: 380px;
          animation: orbit 45s linear infinite;
          border-color: rgba(99,102,241,0.12);
        }
        
        .orbit-dot {
          position: absolute;
          width: 12px;
          height: 12px;
          background: linear-gradient(135deg, #5E6AD2, #8B92D9);
          border-radius: 50%;
          box-shadow: 0 0 20px rgba(94,106,210,0.9), 0 0 40px rgba(94,106,210,0.4);
        }
        
        .hero-icon-inner {
          position: relative;
          width: 160px;
          height: 160px;
        }
        
        .hero-icon {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          animation: float-2 7s ease-in-out infinite;
          box-shadow: 0 0 60px rgba(94,106,210,0.5), 0 0 120px rgba(94,106,210,0.25), inset 0 0 50px rgba(94,106,210,0.2);
        }
        
        .pulse-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid rgba(94,106,210,0.6);
          animation: pulse-ring 2.5s ease-out infinite;
        }
        
        .pulse-dot:nth-child(2) { animation-delay: 0.8s; }
        .pulse-dot:nth-child(3) { animation-delay: 1.6s; }
        
        .btn-main {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #5E6AD2 0%, #4F5DAA 100%);
          border: none;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .btn-main::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 200%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: skewX(-20deg);
          transition: left 0.5s ease;
        }
        
        .btn-main:hover::before {
          left: 100%;
        }
        
        .btn-main:hover {
          transform: translateY(-3px) scale(1.01);
          box-shadow: 0 0 0 2px rgba(94,106,210,0.5), 0 10px 40px rgba(94,106,210,0.35), 0 20px 60px rgba(94,106,210,0.15), inset 0 1px 0 rgba(255,255,255,0.25);
        }
        
        .btn-main:active {
          transform: scale(0.98);
        }
        
        .stat-box {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 20px;
          transition: all 0.3s ease;
        }
        
        .stat-box:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(94,106,210,0.2);
          transform: translateY(-2px);
        }
        
        .badge-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(94,106,210,0.08);
          border: 1px solid rgba(94,106,210,0.2);
          color: #A5B0E8;
          font-size: 12px;
          font-weight: 600;
          padding: 8px 14px;
          border-radius: 100px;
          transition: all 0.2s ease;
        }
        
        .badge-item:hover {
          background: rgba(94,106,210,0.12);
          border-color: rgba(94,106,210,0.3);
        }
        
        .feature-card {
          background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 18px;
          padding: 24px 20px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: default;
        }
        
        .feature-card:hover {
          background: linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%);
          border-color: rgba(94,106,210,0.25);
          transform: translateY(-6px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.3), 0 0 50px rgba(94,106,210,0.08);
        }
        
        .progress-track {
          height: 4px;
          background: rgba(94,106,210,0.15);
          border-radius: 2px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #5E6AD2, #8B92D9, #A5B0E8, #5E6AD2);
          background-size: 200% 100%;
          animation: shimmer-text 2s ease infinite;
          border-radius: 2px;
        }
        
        .section-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(94,106,210,0.25), transparent);
        }
        
        .fade-up {
          opacity: 0;
          animation: fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .scale-in {
          opacity: 0;
          animation: scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
        .delay-700 { animation-delay: 0.7s; }
        .delay-800 { animation-delay: 0.8s; }
      `}</style>

      <div className="container">
        {/* Base Gradient Layer */}
        <div style={{
          position: "fixed",
          inset: 0,
          background: `
            radial-gradient(ellipse 140% 70% at 50% -10%, #12122a 0%, #0a0a18 30%, #050507 60%, #020204 100%),
            radial-gradient(ellipse 80% 50% at 80% 80%, rgba(94,106,210,0.08) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 20% 70%, rgba(139,92,246,0.06) 0%, transparent 50%)
          `,
          pointerEvents: "none",
        }} />

        {/* Noise Texture - Subtle Film Grain */}
        <div style={{
          position: "fixed",
          inset: 0,
          opacity: 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch' seed='15'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          pointerEvents: "none",
        }} />

        {/* Grid Overlay - Technical Precision */}
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(94,106,210,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(94,106,210,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }} />

        {/* Aurora Effect 1 - Primary Indigo */}
        <div style={{
          position: "fixed",
          top: "-50%",
          left: "20%",
          width: "1000px",
          height: "1000px",
          background: `
            radial-gradient(ellipse at center, 
              rgba(94,106,210,0.35) 0%, 
              rgba(94,106,210,0.2) 20%,
              rgba(99,102,241,0.15) 40%,
              transparent 70%
            )
          `,
          filter: "blur(60px)",
          animation: "aurora-drift 15s ease-in-out infinite",
          pointerEvents: "none",
        }} />

        {/* Aurora Effect 2 - Purple Accent */}
        <div style={{
          position: "fixed",
          top: "20%",
          right: "-30%",
          width: "800px",
          height: "800px",
          background: `
            radial-gradient(ellipse at center,
              rgba(139,92,246,0.25) 0%,
              rgba(139,92,246,0.15) 30%,
              rgba(167,139,250,0.08) 50%,
              transparent 70%
            )
          `,
          filter: "blur(70px)",
          animation: "aurora-drift-2 18s ease-in-out infinite",
          pointerEvents: "none",
        }} />

        {/* Aurora Effect 3 - Deep Blue */}
        <div style={{
          position: "fixed",
          bottom: "-20%",
          left: "30%",
          width: "900px",
          height: "600px",
          background: `
            radial-gradient(ellipse at center bottom,
              rgba(59,130,246,0.15) 0%,
              rgba(99,102,241,0.1) 40%,
              transparent 70%
            )
          `,
          filter: "blur(80px)",
          animation: "nebula-pulse 12s ease-in-out infinite",
          pointerEvents: "none",
        }} />

        {/* Aurora Effect 4 - Soft Lavender */}
        <div style={{
          position: "fixed",
          top: "40%",
          left: "-20%",
          width: "600px",
          height: "600px",
          background: `
            radial-gradient(ellipse at center,
              rgba(165,180,232,0.12) 0%,
              rgba(139,92,246,0.06) 50%,
              transparent 70%
            )
          `,
          filter: "blur(90px)",
          animation: "aurora-drift 20s ease-in-out infinite",
          animationDelay: "-5s",
          pointerEvents: "none",
        }} />

        {/* Light Rays */}
        {lightRays.map((ray, i) => (
          <div
            key={i}
            style={{
              position: "fixed",
              left: ray.left,
              top: ray.top,
              width: "2px",
              height: ray.height,
              background: `linear-gradient(to bottom, 
                transparent 0%, 
                rgba(94,106,210,${0.08 + i * 0.02}) 30%,
                rgba(139,92,246,${0.05 + i * 0.01}) 60%,
                transparent 100%
              )`,
              transform: `rotate(${ray.angle}deg)`,
              transformOrigin: "top center",
              animation: "light-ray-glow 8s ease-in-out infinite",
              animationDelay: `${i * 1.5}s`,
              pointerEvents: "none",
              filter: "blur(1px)",
            }}
          />
        ))}

        {/* Nebula Cloud 1 */}
        <div style={{
          position: "fixed",
          top: "10%",
          right: "10%",
          width: "400px",
          height: "300px",
          background: `
            radial-gradient(ellipse at 30% 50%,
              rgba(94,106,210,0.08) 0%,
              rgba(139,92,246,0.04) 40%,
              transparent 70%
            )
          `,
          filter: "blur(50px)",
          animation: "nebula-pulse 10s ease-in-out infinite",
          pointerEvents: "none",
        }} />

        {/* Nebula Cloud 2 */}
        <div style={{
          position: "fixed",
          bottom: "20%",
          left: "5%",
          width: "500px",
          height: "400px",
          background: `
            radial-gradient(ellipse at 70% 60%,
              rgba(99,102,241,0.06) 0%,
              rgba(165,180,232,0.04) 50%,
              transparent 70%
            )
          `,
          filter: "blur(60px)",
          animation: "aurora-drift-2 14s ease-in-out infinite",
          animationDelay: "-3s",
          pointerEvents: "none",
        }} />

        {/* Twinkling Stars */}
        {stars.map((star) => (
          <div
            key={star.id}
            style={{
              position: "fixed",
              top: `${star.y}%`,
              left: `${star.x}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: "white",
              borderRadius: "50%",
              boxShadow: `0 0 ${star.size * 2}px rgba(255,255,255,0.8), 0 0 ${star.size * 4}px rgba(94,106,210,0.3)`,
              animation: `twinkle ${star.duration}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Floating Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: "fixed",
              top: `${p.y}%`,
              left: `${p.x}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              borderRadius: "50%",
              filter: "blur(1px)",
              animation: `float-particle ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Vignette Effect */}
        <div style={{
          position: "fixed",
          inset: 0,
          background: `
            radial-gradient(ellipse at center, transparent 40%, rgba(5,5,7,0.4) 100%),
            radial-gradient(ellipse at top, transparent 60%, rgba(2,2,4,0.3) 100%)
          `,
          pointerEvents: "none",
        }} />

        {/* Main Content */}
        <div style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "80px 20px 100px",
          maxWidth: 600,
          margin: "0 auto",
        }}>
          
          {/* Hero Icon Section */}
          <div className={`scale-in ${loaded ? '' : 'opacity-0'}`} style={{ marginBottom: 48 }}>
            <div className="hero-wrapper">
              {/* Rings */}
              <div className="hero-ring hero-ring-1">
                <div className="orbit-dot" style={{ top: 0, left: "50%", transform: "translateX(-50%)" }} />
              </div>
              <div className="hero-ring hero-ring-2">
                <div className="orbit-dot" style={{ bottom: "15%", right: "5%" }} />
                <div className="orbit-dot" style={{ top: "30%", left: "5%" }} />
              </div>
              <div className="hero-ring hero-ring-3" />
              
              {/* Glow */}
              <div className="hero-icon-bg" />
              
              {/* Icon */}
              <div className="hero-icon-inner">
                <div className="pulse-dot" />
                <div className="pulse-dot" />
                <div className="pulse-dot" />
                <img src="/icon.png" alt="مسیر شغلی" className="hero-icon" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className={`fade-up delay-100 ${loaded ? '' : 'opacity-0'}`} style={{ textAlign: "center", marginBottom: 20 }}>
            <h1 style={{
              fontSize: "clamp(32px, 7vw, 48px)",
              fontWeight: 900,
              lineHeight: 1.25,
              letterSpacing: "-0.035em",
              color: "#EDEDEF",
              direction: "rtl",
            }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#8A8F98", display: "block", marginBottom: 8, letterSpacing: "0.15em", textTransform: "uppercase" }}>Karex</span>
              <span className="accent-text">هدایت مسیر</span>
              <br />
              <span className="glow-text">شغلی من</span>
            </h1>
          </div>

          {/* Subtitle */}
          <div className={`fade-up delay-200 ${loaded ? '' : 'opacity-0'}`} style={{ textAlign: "center", marginBottom: 32 }}>
            <p style={{ fontSize: 16, color: "#8A8F98", lineHeight: 1.9, direction: "rtl" }}>
              با پاسخ به چند سؤال هوشمند،
              <br />
              بهترین مسیر شغلی رو پیدا کن
            </p>
          </div>

          {/* Trust Badges */}
          <div className={`fade-up delay-300 ${loaded ? '' : 'opacity-0'}`} style={{
            display: "flex",
            gap: 10,
            marginBottom: 40,
            flexWrap: "wrap",
            justifyContent: "center",
          }}>
            {["رایگان", "نتیجه فوری"].map((text, i) => (
              <span key={i} className="badge-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {text}
              </span>
            ))}
          </div>

          {/* Main Card */}
          <div
            ref={cardRef}
            className={`main-card fade-up delay-400 ${loaded ? '' : 'opacity-0'}`}
            style={{
              width: "100%",
              padding: "48px 40px",
              marginBottom: 32,
              "--mx": `${mousePos.x}%`,
              "--my": `${mousePos.y}%`,
            } as React.CSSProperties}
          >
            <div className="card-top-line" />

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
              {[
                { num: "+2400", label: "مسیر شغلی" },
                { num: "5 دقیقه", label: "زمان تحلیل" },
                { num: "%94", label: "دقت نتایج" },
              ].map((stat, i) => (
                <div key={i} className="stat-box" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#EDEDEF", letterSpacing: "-0.02em", marginBottom: 6 }}>
                    {stat.num}
                  </div>
                  <div style={{ fontSize: 12, color: "#8A8F98" }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, direction: "rtl" }}>
                <span style={{ fontSize: 12, color: "#8A8F98" }}>آماده به تحلیل</span>
                <span style={{ fontSize: 12, color: "#5E6AD2", fontWeight: 600 }}>آماده</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: "100%" }} />
              </div>
            </div>

            {/* CTA Button */}
            <button
              className={`btn-main fade-up delay-500 ${loaded ? '' : 'opacity-0'}`}
              onClick={handleStartAnalysis}
              disabled={isLoading}
              style={{
                width: "100%",
                color: "#fff",
                border: "none",
                borderRadius: 16,
                padding: "18px 32px",
                fontSize: 16,
                fontWeight: 700,
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.7 : 1,
                fontFamily: "'Vazirmatn', sans-serif",
                letterSpacing: "-0.01em",
              }}
            >
              {isLoading ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "rotate-loader 1s linear infinite" }}>
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  در حال پردازش...
                </span>
              ) : "شروع تحلیل مسیر شغلی"}
            </button>
          </div>

          {/* Features */}
          <div className={`fade-up delay-600 ${loaded ? '' : 'opacity-0'}`} style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 16,
            marginBottom: 48,
          }}>
            {[
              { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B92D9" strokeWidth="1.8"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>, title: "تحلیل دقیق", desc: "بر اساس مهارت‌های شما" },
              { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B92D9" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, title: "نتایج مطمئن", desc: "94% صحت پیش‌بینی" },
              { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B92D9" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>, title: "سریع", desc: "فقط 5 دقیقه زمان" },
            ].map((feature, i) => (
              <div key={i} className="feature-card" style={{ textAlign: "center" }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: "rgba(94,106,210,0.1)",
                  border: "1px solid rgba(94,106,210,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#EDEDEF", marginBottom: 4 }}>{feature.title}</h3>
                <p style={{ fontSize: 11, color: "#8A8F98", lineHeight: 1.6 }}>{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Steps Timeline */}
          <div className={`fade-up delay-700 ${loaded ? '' : 'opacity-0'}`} style={{ width: "100%", marginBottom: 40 }}>
            <div className="section-divider" style={{ marginBottom: 36 }} />
            
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              gap: 0, 
              position: "relative",
              flexWrap: "wrap",
            }}>
              
              {[
                { num: "1", title: "پاسخ به سؤالات" },
                { num: "2", title: "تحلیل" },
                { num: "3", title: "دریافت نتیجه" },
              ].map((step, i) => (
                <div key={i} style={{ 
                  display: "flex", 
                  alignItems: "center",
                  gap: 0,
                }}>
                  {i > 0 && (
                    <div style={{
                      width: 60,
                      height: 2,
                      background: "linear-gradient(90deg, rgba(94,106,210,0.3), rgba(94,106,210,0.1))",
                      margin: "0 -1px",
                    }} />
                  )}
                  <div style={{ 
                    textAlign: "center", 
                    position: "relative", 
                    zIndex: 1,
                    minWidth: 100,
                    padding: "16px 20px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 12,
                    transition: "all 0.3s ease",
                  }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: i === 0 ? "linear-gradient(135deg, #5E6AD2, #4F5DAA)" : "rgba(94,106,210,0.1)",
                      border: i === 0 ? "none" : "1px solid rgba(94,106,210,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      fontWeight: 700,
                      color: i === 0 ? "#fff" : "#8B92D9",
                      boxShadow: i === 0 ? "0 0 20px rgba(94,106,210,0.4)" : "none",
                      margin: "0 auto 10px",
                    }}>
                      {step.num}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#EDEDEF" }}>{step.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className={`fade-up delay-800 ${loaded ? '' : 'opacity-0'}`} style={{ textAlign: "center", paddingBottom: 20 }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>Powered by Karex</p>
          </div>
        </div>

        {/* Bottom Fade */}
        <div style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: 200,
          background: "linear-gradient(to top, rgba(2,2,4,0.95) 0%, rgba(5,5,7,0.5) 50%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 5,
        }} />
      </div>
    </>
  );
}
