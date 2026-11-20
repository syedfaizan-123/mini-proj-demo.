import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [areas, setAreas] = useState([]);
  useEffect(() => { fetch('/api/areas').then(r => r.json()).then(setAreas).catch(() => {}); }, []);
  return (
    <div className="space-y-8">
      <section className="neu p-8 fade-in">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--accent)' }}>Find medicines near you, instantly</h1>
        <p className="max-w-2xl" style={{ color: 'var(--muted)' }}>Search availability, price and distance across nearby pharmacies. Suggest substitutes when a medicine is out of stock.</p>
        <Link to="/search" className="btn-primary inline-block mt-4">Start Searching</Link>
      </section>
      <section className="grid md:grid-cols-3 gap-4">
        <div className="neu p-5 fade-in"><h3 className="font-semibold" style={{ color: 'var(--accent)' }}>Live Availability</h3><p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>See which stores have your medicine in stock right now.</p></div>
        <div className="neu p-5 fade-in"><h3 className="font-semibold" style={{ color: 'var(--accent)' }}>Smart Substitutes</h3><p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Same-salt alternatives with price comparison.</p></div>
        <div className="neu p-5 fade-in"><h3 className="font-semibold" style={{ color: 'var(--accent)' }}>Request Medicine</h3><p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Can't find it? Submit a request for admins to fulfill.</p></div>
      </section>
      <section>
        <h2 className="font-semibold text-lg mb-3">Covered Areas (demo)</h2>
        <div className="flex flex-wrap gap-2">
          {areas.map(a => <span key={a} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm border border-emerald-200">{a}</span>)}
        </div>
      </section>
    </div>
  );
}
