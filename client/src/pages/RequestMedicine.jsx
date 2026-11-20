import { useState } from 'react';

export default function RequestMedicine() {
  const [form, setForm] = useState({ medicine_name: '', area: '', contact: '', note: '' });
  const [msg, setMsg] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    const r = await fetch('/api/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (r.ok) { setMsg('Request submitted! Admins will follow up.'); setForm({ medicine_name: '', area: '', contact: '', note: '' }); }
    else setMsg('Failed to submit.');
  };
  return (
    <div className="max-w-lg">
      <h2 className="text-2xl font-bold mb-4">Request a Medicine</h2>
      <form onSubmit={submit} className="bg-white rounded-xl p-5 border shadow-sm space-y-3">
        <input required value={form.medicine_name} onChange={e => setForm({ ...form, medicine_name: e.target.value })} placeholder="Medicine name" className="w-full border rounded-lg px-3 py-2" />
        <input required value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} placeholder="Your area" className="w-full border rounded-lg px-3 py-2" />
        <input required value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} placeholder="Contact (phone/email)" className="w-full border rounded-lg px-3 py-2" />
        <textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Note (optional)" className="w-full border rounded-lg px-3 py-2" />
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold">Submit Request</button>
        {msg && <p className="text-sm text-emerald-700">{msg}</p>}
      </form>
    </div>
  );
}
