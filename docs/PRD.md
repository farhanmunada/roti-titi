# PRD: Bakery Production & Inventory Management System (Roti Titi)

## 1. Tujuan Produk
Menyediakan sistem manajemen produksi dan inventaris bakery yang cepat, akurat, dan bebas friksi input teks, mengoptimalkan proses di lantai dapur roti.

## 2. Fitur Utama
1. **Manajemen Batch Produksi (Production Batches)**
   - Pilihan resep roti siap pakai (Croissant, Brioche, Roti Sobek, Sourdough, Baguette).
   - Pengaturan jumlah target dengan stepper tombol sentuh (+1, +6, +12, +24 pcs/loyang).
   - Tahapan status alur produksi visual 1-klik: `Direncanakan` → `Mixing` → `Proofing` → `Baking` → `Selesai`.
   - Pemotongan otomatis bahan baku secara FEFO saat batch dimulai.

2. **Stok Bahan Baku & Batch Expired Tracking (FEFO Inventory)**
   - Pelacakan stok per batch kedatangan (Lot No, Qty Masuk, Qty Sisa, Expired Date).
   - Status visual:
     - Merah: Expired / Kurang dari 3 hari.
     - Kuning: Expiring soon (3 - 7 hari).
     - Hijau: Aman (> 7 hari).
   - Tambah stok minim ketik: quick chips penambahan (+5kg, +10kg, +25kg) dan preset expiry (+7 hari, +14 hari, +30 hari, +90 hari).

3. **Peramalan Permintaan & Runway Stok (Demand Forecast)**
   - Estimasi sisa hari bahan bertahan berdasarkan konsumsi riil rata-rata harian (Runway Days).
   - Peringatan stok kritis otomatis jika sisa hari < 3 hari.
   - Tombol 1-tap Restock Generator.

4. **Desain Interaksi (Minim Ketik Text)**
   - Segmented buttons, stepper chips, card selectors, modal preset.
   - Whitespace lapang (p-6, p-8, gap-6), kontras ramah mata, responsif tablet/desktop dapur.
