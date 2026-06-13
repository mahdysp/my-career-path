import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1 style={{ color: '#2563eb' }}>سامانه هدایت مسیر شغلی من</h1>
      <p>اینجا اولین قدم برای آینده شغلی توست.</p>
      
      <Link href="/quiz">
        <button style={{ 
          marginTop: '20px', 
          padding: '10px 20px', 
          backgroundColor: '#2563eb', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer' 
        }}>
          شروع تحلیل
        </button>
      </Link>
    </div>
  );
}

