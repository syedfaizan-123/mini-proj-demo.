import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, initDb } from './db.js';
import { seed } from './seed.js';

initDb();
seed();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;
const ADMIN_TOKEN = 'demo-admin-token';

app.use(cors());
app.use(express.json());

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isOpenNow(open, close) {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = open.split(':').map(Number);
  const [ch, cm] = close.split(':').map(Number);
  const openM = oh * 60 + om;
  const closeM = ch * 60 + cm;
  return mins >= openM && mins <= closeM;
}

function authAdmin(req, res, next) {
  const t = (req.headers.authorization || '').replace('Bearer ', '');
  if (t !== ADMIN_TOKEN) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// Areas
app.get('/api/areas', (req, res) => {
  const rows = db.prepare('SELECT DISTINCT area FROM pharmacies ORDER BY area').all();
  res.json(rows.map(r => r.area));
});

// Medicines list/search
app.get('/api/medicines', (req, res) => {
  const q = (req.query.q || '').trim();
  let rows;
  if (q) {
    rows = db.prepare("SELECT * FROM medicines WHERE name LIKE ? OR salt LIKE ? ORDER BY name").all(`%${q}%`, `%${q}%`);
  } else {
    rows = db.prepare('SELECT * FROM medicines ORDER BY name').all();
  }
  res.json(rows.map(m => ({ ...m, prescription_required: !!m.prescription_required })));
});

// Pharmacies list
app.get('/api/pharmacies', (req, res) => {
  const rows = db.prepare('SELECT * FROM pharmacies ORDER BY name').all();
  res.json(rows);
});

// Search availability
app.get('/api/search', (req, res) => {
  const medicine = (req.query.medicine || '').trim();
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const radius = parseFloat(req.query.radius || '10');
  const hasLoc = !isNaN(lat) && !isNaN(lng);

  if (!medicine) return res.status(400).json({ error: 'medicine required' });

  const meds = db.prepare("SELECT * FROM medicines WHERE name LIKE ? OR salt LIKE ?").all(`%${medicine}%`, `%${medicine}%`);
  if (meds.length === 0) {
    // substitute suggestions by salt keyword
    const subs = db.prepare("SELECT * FROM medicines WHERE name LIKE ? OR salt LIKE ? LIMIT 5").all(`%${medicine}%`, `%${medicine}%`);
    return res.json({ medicine: null, results: [], substitutes: subs.map(m => ({ ...m, prescription_required: !!m.prescription_required })) });
  }

  const target = meds[0];
  const subs = db.prepare("SELECT * FROM medicines WHERE salt = ? AND id <> ?").all(target.salt, target.id);

  const pharmacies = db.prepare('SELECT * FROM pharmacies').all();
  const inv = db.prepare('SELECT * FROM inventory WHERE medicine_id = ?').all(target.id);
  const invMap = new Map(inv.map(i => [i.pharmacy_id, i]));

  const results = pharmacies.map(p => {
    const i = invMap.get(p.id);
    const distance = hasLoc ? Math.round(haversine(lat, lng, p.lat, p.lng) * 10) / 10 : null;
    return {
      pharmacy: p,
      available: !!i,
      stock: i ? i.stock : 'not_listed',
      price: i ? i.price : null,
      distance,
      inRadius: hasLoc ? (distance <= radius) : true,
      openNow: isOpenNow(p.open_time, p.close_time)
    };
  }).filter(r => r.available).sort((a, b) => {
    if (a.distance != null && b.distance != null) return a.distance - b.distance;
    return (a.price || 0) - (b.price || 0);
  });

  const filtered = hasLoc ? results.filter(r => r.inRadius) : results;

  res.json({
    medicine: { ...target, prescription_required: !!target.prescription_required },
    results: filtered,
    substitutes: subs.map(m => ({ ...m, prescription_required: !!m.prescription_required }))
  });
});

// Requests
app.post('/api/requests', (req, res) => {
  const { medicine_name, area, contact, note } = req.body || {};
  if (!medicine_name || !area || !contact) return res.status(400).json({ error: 'medicine_name, area, contact required' });
  const info = db.prepare('INSERT INTO requests (medicine_name,area,contact,note) VALUES (?,?,?,?)').run(medicine_name, area, contact, note || '');
  res.json({ id: info.lastInsertRowid, status: 'pending' });
});

app.get('/api/requests', authAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM requests ORDER BY created_at DESC').all();
  res.json(rows);
});

app.patch('/api/requests/:id', authAdmin, (req, res) => {
  const { status } = req.body || {};
  if (!['pending', 'fulfilled', 'rejected'].includes(status)) return res.status(400).json({ error: 'bad status' });
  db.prepare('UPDATE requests SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ ok: true });
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  const row = db.prepare('SELECT * FROM admins WHERE username = ? AND password = ?').get(username, password);
  if (!row) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ token: ADMIN_TOKEN, username });
});

// Admin inventory update
app.patch('/api/inventory/:pharmacyId/:medicineId', authAdmin, (req, res) => {
  const { stock, price } = req.body || {};
  const exists = db.prepare('SELECT * FROM inventory WHERE pharmacy_id=? AND medicine_id=?').get(req.params.pharmacyId, req.params.medicineId);
  if (exists) {
    db.prepare('UPDATE inventory SET stock=?, price=?, updated_at=datetime(\'now\') WHERE pharmacy_id=? AND medicine_id=?')
      .run(stock ?? exists.stock, price ?? exists.price, req.params.pharmacyId, req.params.medicineId);
  } else {
    const med = db.prepare('SELECT price FROM medicines WHERE id=?').get(req.params.medicineId);
    db.prepare('INSERT INTO inventory (pharmacy_id,medicine_id,stock,price) VALUES (?,?,?,?)')
      .run(req.params.pharmacyId, req.params.medicineId, stock || 'in_stock', price ?? med?.price ?? 0);
  }
  res.json({ ok: true });
});

// Admin: add pharmacy / medicine (simple)
app.post('/api/pharmacies', authAdmin, (req, res) => {
  const { name, address, area, lat, lng, phone, open_time, close_time } = req.body || {};
  const info = db.prepare('INSERT INTO pharmacies (name,address,area,lat,lng,phone,open_time,close_time) VALUES (?,?,?,?,?,?,?,?)')
    .run(name, address, area, lat, lng, phone, open_time || '09:00', close_time || '21:00');
  res.json({ id: info.lastInsertRowid });
});

app.post('/api/medicines', authAdmin, (req, res) => {
  const { name, salt, manufacturer, category, price, prescription_required } = req.body || {};
  const info = db.prepare('INSERT INTO medicines (name,salt,manufacturer,category,price,prescription_required) VALUES (?,?,?,?,?,?)')
    .run(name, salt, manufacturer, category, price, prescription_required ? 1 : 0);
  res.json({ id: info.lastInsertRowid });
});

// Stats
app.get('/api/stats', authAdmin, (req, res) => {
  const pharmacies = db.prepare('SELECT COUNT(*) AS c FROM pharmacies').get().c;
  const medicines = db.prepare('SELECT COUNT(*) AS c FROM medicines').get().c;
  const inventory = db.prepare('SELECT COUNT(*) AS c FROM inventory').get().c;
  const requests = db.prepare('SELECT COUNT(*) AS c FROM requests').get().c;
  const pending = db.prepare("SELECT COUNT(*) AS c FROM requests WHERE status='pending'").get().c;
  res.json({ pharmacies, medicines, inventory, requests, pending });
});

// Serve client build in production
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'not found' });
  res.sendFile(path.join(clientDist, 'index.html'), err => {
    if (err) res.status(404).send('API running. Start client dev server.');
  });
});

app.listen(PORT, () => console.log(`Medicine Finder API running on http://localhost:${PORT}`));
export default app;
