import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

export default function PharmacyDetail() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [inv, setInv] = useState([]);
  useEffect(() => {
    fetch('/api/pharmacies').then(r => r.json()).then(list => setP(list.find(x => x.id === Number(id))));
    fetch(`/api/search?medicine=&lat=0&lng=0`).catch(() => {});
  }, [id]);
  return (
    <div className="space-y-4">
      {!p ? <p>Loading...</p> : (
        <>
          <h2 className="text-2xl font-bold">{p.name}</h2>
          <p className="text-slate-600">{p.address} · {p.area}</p>
          <p className="text-sm">📞 {p.phone} · {p.open_time}–{p.close_time} · ⭐ {p.rating}</p>
          <div className="leaflet-container">
            <MapContainer center={[p.lat, p.lng]} zoom={15} scrollWheelZoom={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[p.lat, p.lng]}><Popup>{p.name}</Popup></Marker>
            </MapContainer>
          </div>
          <Link to="/search" className="text-emerald-700 text-sm">← Back to search</Link>
        </>
      )}
    </div>
  );
}
