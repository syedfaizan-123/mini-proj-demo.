import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Search from './pages/Search.jsx';
import PharmacyDetail from './pages/PharmacyDetail.jsx';
import RequestMedicine from './pages/RequestMedicine.jsx';
import Admin from './pages/Admin.jsx';

export default function App() {
  const loc = useLocation();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between neu px-5 py-3">
          <Link to="/" className="font-bold text-xl flex items-center gap-2" style={{ color: 'var(--accent)' }}>
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl neu-sm text-sm font-bold" style={{ color: 'var(--accent)' }}>M</span>
            MedFinder
          </Link>
          <div className="flex items-center gap-2">
            <nav className="flex gap-1 text-sm">
              {[
                { to: '/', label: 'Home', active: loc.pathname === '/' },
                { to: '/search', label: 'Search', active: loc.pathname.startsWith('/search') },
                { to: '/request', label: 'Request', active: loc.pathname === '/request' },
                { to: '/admin', label: 'Admin', active: loc.pathname === '/admin' }
              ].map(n => (
                <Link key={n.to} to={n.to} className={`px-3 py-1.5 rounded-xl transition-all ${n.active ? 'neu-inset font-semibold' : 'hover:neu-sm'}`} style={{ color: n.active ? 'var(--accent)' : 'var(--muted)' }}>{n.label}</Link>
              ))}
            </nav>
            <button onClick={() => setDark(d => !d)} className="neu-sm px-3 py-1.5 text-sm" aria-label="Toggle dark mode">{dark ? '☀' : '☾'}</button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/pharmacy/:id" element={<PharmacyDetail />} />
          <Route path="/request" element={<RequestMedicine />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <footer className="text-center text-xs text-slate-500 py-4 border-t bg-white">
        Demo / sample data for college project. Not a real medical service.
      </footer>
    </div>
  );
}
