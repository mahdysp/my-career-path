'use client';

import { useState } from 'react';

export default function QuizPage() {
  const [name, setName] = useState('');
  const [skill, setSkill] = useState('frontend');
  const [submitted, setSubmitted] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // شبیه‌سازی تأخیر برای حس بهتر
    setTimeout(async () => {
      const response = await fetch('/api/career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, skill }),
      });
      const data = await response.json();
      setAiResult(data.aiResponse);
      setSubmitted(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: '#f3f4f6', 
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' 
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '16px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
        width: '100%', 
        maxWidth: '400px',
        textAlign: 'right',
        direction: 'rtl'
      }}>
        {submitted ? (
          <div>
            <h2 style={{ color: '#111827', marginBottom: '1rem' }}>تحلیل نهایی</h2>
            <div style={{ backgroundColor: '#ecfdf5', padding: '1rem', borderRadius: '8px', border: '1px solid #d1fae5' }}>
              <p style={{ color: '#065f46', lineHeight: '1.6' }}>{aiResult}</p>
            </div>
            <button 
              onClick={() => setSubmitted(false)} 
              style={{ marginTop: '1.5rem', width: '100%', padding: '10px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              شروع دوباره
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h1 style={{ color: '#1f2937', marginBottom: '1.5rem', textAlign: 'center' }}>مشاوره شغلی هوشمند</h1>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#374151' }}>نام شما</label>
              <input 
                type="text" value={name} onChange={(e) => setName(e.target.value)} required
                style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }}
                placeholder="مثلاً: نفیسه"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#374151' }}>مهارت مورد نظر</label>
              <select value={skill} onChange={(e) => setSkill(e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: 'white' }}
              >
                <option value="frontend">برنامه‌نویسی فرانت‌اند</option>
                <option value="backend">برنامه‌نویسی بک‌اند</option>
                <option value="design">طراحی رابط کاربری</option>
                <option value="embedded">سیستم‌های نهفته و سخت‌افزار</option>
              </select>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#9ca3af' : '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}
            >
              {loading ? 'در حال تحلیل...' : 'دریافت مسیر شغلی'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
