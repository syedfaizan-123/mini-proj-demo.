import { useState, useEffect } from 'react';

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [err, setErr] = useState('');

  const login = async (e) => {
    e.preventDefault();
    const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: user, password: pass }) });
    if (!r.ok) { setErr('Invalid credentials'); return; }
    const d = await r.json();
    setToken(d.token); localStorage.setItem('adminToken', d.token);
  };
  const logout = () => { setToken(''); localStorage.removeItem('adminToken'); };

  const headers = { Authorization: 'Bearer ' + token };

  const load = async () => {
    const s = await fetch('/api/stats', { headers }).then(r => r.json()).catch(() => null);
    const rq = await fetch('/api/requests', { headers }).then(r => r.json()).catch(() => []);
    setStats(s); setRequests(Array.isArray(rq) ? rq : []);
  };
  useEffect(() => { if (token) load(); }, [token]);

  const updateStatus = async (id, status) => {
    await fetch(`/api/requests/${id}`, { method: 'PATCH', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    load();
  };

  if (!token) {
    return (
      <div className="max-w-sm">
        <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
        <form onSubmit={login} className="bg-white rounded-xl p-5 border shadow-sm space-y-3">
          <p className="text-xs text-slate-500">Demo: admin / admin123</p>
          <input value={user} onChange={e => setUser(e.target.value)} placeholder="Username" className="w-full border rounded-lg px-3 py-2" />
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Password" className="w-full border rounded-lg px-3 py-2" />
          <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold">Login</button>
          {err && <p className="text-sm text-red-600">{err}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <button onClick={logout} className="text-sm text-slate-600">Logout</button>
      </div>
      {stats && (
        <div className="grid sm:grid-cols-5 gap-3">
          {Object.entries(stats).map(([k, v]) => (
            <div key={k} className="bg-white rounded-xl p-4 border shadow-sm text-center">
              <p className="text-2xl font-bold text-emerald-700">{v}</p>
              <p className="text-xs text-slate-500 capitalize">{k}</p>
            </div>
          ))}
        </div>
      )}
      <div className="bg-white rounded-xl border shadow-sm overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr><th className="p-3 text-left">Medicine</th><th className="p-3 text-left">Area</th><th className="p-3 text-left">Contact</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Actions</th></tr>
          </thead>
          <tbody>
            {requests.map(r => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.medicine_name}</td>
                <td className="p-3">{r.area}</td>
                <td className="p-3">{r.contact}</td>
                <td className="p-3">{r.status}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => updateStatus(r.id, 'fulfilled')} className="text-emerald-700">Fulfill</button>
                  <button onClick={() => updateStatus(r.id, 'rejected')} className="text-red-600">Reject</button>
                </td>
              </tr>
            ))}
            {requests.length === 0 && <tr><td colSpan="5" className="p-3 text-slate-500">No requests yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
