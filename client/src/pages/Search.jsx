import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Search() {
  const [q, setQ] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [medicine, setMedicine] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [radius, setRadius] = useState('10');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/medicines').then(r => r.json()).then(setMedicines).catch(() => {});
  }, []);

  const doSearch = async (name) => {
    const m = name || medicine;
    if (!m) return;
    setLoading(true);
    const params = new URLSearchParams({ medicine: m, radius });
    if (lat && lng) { params.set('lat', lat); params.set('lng', lng); }
    const r = await fetch('/api/search?' + params);
    setResult(await r.json());
    setLoading(false);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(p => { setLat(p.coords.latitude.toFixed(4)); setLng(p.coords.longitude.toFixed(4)); });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-800">Search Medicine</h2>
      <div className="neu p-5 space-y-3 fade-in">
        <div className="flex gap-2">
          <input value={q} onChange={e => { setQ(e.target.value); setMedicine(e.target.value); }} placeholder="Medicine name (e.g. Dolo 650)" className="flex-1 input" />
          <button onClick={() => doSearch()} className="btn-primary">Search</button>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {medicines.slice(0, 8).map(m => (
            <button key={m.id} onClick={() => { setMedicine(m.name); doSearch(m.name); }} className="chip">{m.name}</button>
          ))}
        </div>
        <div className="grid sm:grid-cols-4 gap-2">
          <input value={lat} onChange={e => setLat(e.target.value)} placeholder="Latitude" className="input" />
          <input value={lng} onChange={e => setLng(e.target.value)} placeholder="Longitude" className="input" />
          <button onClick={useMyLocation} className="neu-sm px-3 py-2 text-sm">Use my location</button>
          <input value={radius} onChange={e => setRadius(e.target.value)} placeholder="Radius km" className="input" />
        </div>
      </div>

      {loading && <p className="text-slate-500">Searching...</p>}

      {result && (
        <div className="space-y-4">
          {result.medicine ? (
            <>
              <div className="neu p-4">
                <h3 className="font-bold text-lg text-emerald-700">{result.medicine.name}</h3>
                <p className="text-sm text-slate-600">{result.medicine.salt} · {result.medicine.manufacturer} · {result.medicine.category}</p>
                <p className="text-sm mt-1">MRP ~ ₹{result.medicine.price} {result.medicine.prescription_required ? '· Rx required' : ''}</p>
              </div>
              {result.results.length === 0 ? (
                <p className="text-slate-500">No pharmacies in range have this in stock.</p>
              ) : (
                <div className="grid gap-3">
                  {result.results.map(r => (
                    <div key={r.pharmacy.id} className="neu p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <Link to={`/pharmacy/${r.pharmacy.id}`} className="font-semibold text-slate-800 hover:text-emerald-700">{r.pharmacy.name}</Link>
                        <p className="text-sm text-slate-500">{r.pharmacy.address}</p>
                        <p className="text-xs text-slate-400">{r.pharmacy.open_time}–{r.pharmacy.close_time} · {r.openNow ? 'Open now' : 'Closed'} · ⭐ {r.pharmacy.rating}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-700">₹{r.price}</p>
                        <p className="text-xs text-slate-500">{r.stock.replace('_', ' ')}{r.distance != null ? ` · ${r.distance} km` : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-slate-500">No medicine matched. Try another name.</p>
          )}

          {result.substitutes?.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h4 className="font-semibold text-amber-800 mb-2">Substitute options (same salt)</h4>
              <ul className="text-sm space-y-1">
                {result.substitutes.map(s => (
                  <li key={s.id} className="flex justify-between">
                    <span>{s.name} <span className="text-slate-500">({s.manufacturer})</span></span>
                    <span className="font-semibold">₹{s.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
