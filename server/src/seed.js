import { db, initDb } from './db.js';

initDb();

const pharmacies = [
  { name: 'Apollo Pharmacy, Koramangala', address: '80 Feet Rd, 4th Block, Koramangala', area: 'Koramangala', lat: 12.9352, lng: 77.6245, phone: '+91 98765 43210', open_time: '08:00', close_time: '22:30', rating: 4.6 },
  { name: 'MedPlus, Indiranagar', address: '100 Feet Rd, Indiranagar', area: 'Indiranagar', lat: 12.9719, lng: 77.6412, phone: '+91 99887 66554', open_time: '09:00', close_time: '23:00', rating: 4.4 },
  { name: 'Netmeds Local, HSR Layout', address: '27th Main, HSR Layout Sector 1', area: 'HSR Layout', lat: 12.9116, lng: 77.6389, phone: '+91 91234 56789', open_time: '08:30', close_time: '22:00', rating: 4.3 },
  { name: 'Royal Chemist, Jayanagar', address: '4th Block, Jayanagar', area: 'Jayanagar', lat: 12.9279, lng: 77.5896, phone: '+91 90000 11223', open_time: '09:00', close_time: '21:30', rating: 4.5 },
  { name: 'Sri Venkateswara Medicals, Malleshwaram', address: '8th Cross, Malleshwaram', area: 'Malleshwaram', lat: 12.9963, lng: 77.5872, phone: '+91 98888 77665', open_time: '08:00', close_time: '22:00', rating: 4.2 },
  { name: 'Wellness Pharmacy, Whitefield', address: 'ITPL Main Rd, Whitefield', area: 'Whitefield', lat: 12.9698, lng: 77.7500, phone: '+91 97777 33445', open_time: '09:00', close_time: '22:30', rating: 4.4 },
  { name: 'City Chemist, Electronic City', address: 'Phase 1, Electronic City', area: 'Electronic City', lat: 12.8452, lng: 77.6602, phone: '+91 96666 22113', open_time: '08:00', close_time: '21:00', rating: 4.1 },
  { name: 'LifeCare Pharmacy, Banashankari', address: '2nd Stage, Banashankari', area: 'Banashankari', lat: 12.9250, lng: 77.5468, phone: '+91 95555 44332', open_time: '09:00', close_time: '22:00', rating: 4.3 }
];

const medicines = [
  ['Dolo 650', 'Paracetamol 650mg', 'Micro Labs', 'Fever & Pain', 32, 0],
  ['Calpol 650', 'Paracetamol 650mg', 'GSK', 'Fever & Pain', 30, 0],
  ['Paracetamol 650mg', 'Paracetamol 650mg', 'Cipla', 'Fever & Pain', 18, 0],
  ['Crocin Advance', 'Paracetamol 500mg', 'GSK', 'Fever & Pain', 25, 0],
  ['Paracetamol 500mg', 'Paracetamol 500mg', 'Generic', 'Fever & Pain', 12, 0],
  ['Ibuprofen 400mg', 'Ibuprofen 400mg', 'Cipla', 'Fever & Pain', 20, 0],
  ['Combiflam', 'Ibuprofen 400mg + Paracetamol 325mg', 'Sanofi', 'Fever & Pain', 45, 0],
  ['Aspirin 75mg', 'Aspirin 75mg', 'Bayer', 'Heart Care', 15, 0],
  ['Diclofenac 50mg', 'Diclofenac 50mg', 'Novartis', 'Fever & Pain', 22, 0],
  ['Glycomet 500', 'Metformin 500mg', 'USV', 'Diabetes', 42, 1],
  ['Metformin 500mg', 'Metformin 500mg', 'Cipla', 'Diabetes', 35, 1],
  ['Glucophage 500', 'Metformin 500mg', 'Merck', 'Diabetes', 48, 1],
  ['Atorva 10', 'Atorvastatin 10mg', 'Zydus', 'Heart Care', 55, 1],
  ['Telma 40', 'Telmisartan 40mg', 'Glenmark', 'Heart Care', 58, 1],
  ['Amlor 5', 'Amlodipine 5mg', 'Cipla', 'Heart Care', 38, 1],
  ['Pan 40', 'Pantoprazole 40mg', 'Alkem', 'Digestion', 42, 1],
  ['Omeprazole 20mg', 'Omeprazole 20mg', 'Cipla', 'Digestion', 25, 0],
  ['Cetzine', 'Cetirizine 10mg', "Dr Reddy's", 'Allergy', 28, 0],
  ['Loratadine 10mg', 'Loratadine 10mg', 'Cipla', 'Allergy', 32, 0],
  ['Azithral 500', 'Azithromycin 500mg', 'Alembic', 'Antibiotics', 95, 1],
  ['Amoxil 500', 'Amoxicillin 500mg', 'GSK', 'Antibiotics', 70, 1],
  ['Ciplox 500', 'Ciprofloxacin 500mg', 'Cipla', 'Antibiotics', 64, 1],
  ['Vitamin D3 60K', 'Cholecalciferol 60000 IU', 'USV', 'Vitamins', 120, 0],
  ['B12 500mcg', 'Methylcobalamin 500mcg', 'Cipla', 'Vitamins', 90, 0],
  ['Supradyn', 'Multivitamin + Minerals', 'Bayer', 'Vitamins', 145, 0],
  ['Zincovit', 'Multivitamin + Zinc', 'Apex', 'Vitamins', 130, 0],
  ['Electral', 'ORS Powder', 'FDC', 'Hydration', 22, 0],
  ['ORS Sachet', 'Oral Rehydration Salt', 'Generic', 'Hydration', 10, 0],
  ['Montair 10', 'Montelukast 10mg', 'Cipla', 'Allergy', 88, 1],
  ['Eltroxin 50', 'Levothyroxine 50mcg', 'GSK', 'Thyroid', 46, 1],
  ['Salbutamol Inhaler', 'Salbutamol 100mcg', 'Cipla', 'Respiratory', 185, 1],
  ['Budesonide Inhaler', 'Budesonide 200mcg', 'Cipla', 'Respiratory', 390, 1],
  ['Shelcal 500', 'Calcium + Vitamin D3', 'Torrent', 'Vitamins', 110, 0],
  ['Ecosprin 75', 'Aspirin 75mg', 'USV', 'Heart Care', 16, 0],
  ['Thrombo AS 75', 'Aspirin 75mg', 'Cipla', 'Heart Care', 14, 0],
  ['Volini Gel', 'Diclofenac Topical', 'Sun Pharma', 'Fever & Pain', 95, 0],
  ['Digene Gel', 'Antacid', 'Abbott', 'Digestion', 105, 0],
  ['Rantac 150', 'Ranitidine 150mg', 'JB Chemicals', 'Digestion', 35, 0],
  ['Allegra 120', 'Fexofenadine 120mg', 'Sanofi', 'Allergy', 120, 0],
  ['Augmentin 625', 'Amoxicillin + Clavulanic Acid', 'GSK', 'Antibiotics', 180, 1],
  ['Paracetamol 125 Susp', 'Paracetamol 125mg/5ml', 'Cipla', 'Fever & Pain', 40, 0]
];

export function seed() {
  const pCount = db.prepare('SELECT COUNT(*) AS c FROM pharmacies').get().c;
  if (pCount > 0) return;

  const insPharmacy = db.prepare(
    'INSERT INTO pharmacies (name,address,area,lat,lng,phone,open_time,close_time,rating) VALUES (?,?,?,?,?,?,?,?,?)'
  );
  for (const p of pharmacies) {
    insPharmacy.run(p.name, p.address, p.area, p.lat, p.lng, p.phone, p.open_time, p.close_time, p.rating);
  }

  const insMedicine = db.prepare(
    'INSERT INTO medicines (name,salt,manufacturer,category,price,prescription_required) VALUES (?,?,?,?,?,?)'
  );
  for (const m of medicines) {
    insMedicine.run(m[0], m[1], m[2], m[3], m[4], m[5]);
  }

  const phCount = pharmacies.length;
  const medCount = medicines.length;
  const insInv = db.prepare(
    'INSERT OR IGNORE INTO inventory (pharmacy_id,medicine_id,stock,price) VALUES (?,?,?,?)'
  );
  for (let pi = 0; pi < phCount; pi++) {
    for (let mi = 0; mi < medCount; mi++) {
      if ((mi + pi) % 4 === 0) continue; // ~75% availability
      let stock = 'in_stock';
      if ((mi + pi * 3) % 11 === 0) stock = 'out_of_stock';
      else if ((mi + pi) % 7 === 0) stock = 'low_stock';
      const base = medicines[mi][4];
      const price = Math.max(5, Math.round((base + ((mi + pi) % 5 - 2) * 1.5) * 10) / 10);
      insInv.run(pi + 1, mi + 1, stock, price);
    }
  }

  db.prepare("INSERT OR IGNORE INTO admins (username,password) VALUES ('admin','admin123')").run();
}
