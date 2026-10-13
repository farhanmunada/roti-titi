# Riset Sistem Produksi Roti (Bakery Production System)

## 1. Analisis Kebutuhan Operasional Bakery
Dapur produksi roti memiliki karakteristik khusus:
1. **Kecepatan & Kebersihan Tangan**: Operator/baker sering memiliki tangan bertepung atau berminyak. Mengetik keyboard rumit memperlambat kerja dan mengotori perangkat.
2. **First-Expired, First-Out (FEFO/FIFO)**: Bahan baku seperti ragi, susu, telur, mentega, dan keju memiliki masa simpan pendek. Pengurangan stok wajib mengutamakan lot yang mendekati tanggal kedaluwarsa.
3. **Konversi Batch ke Bahan Baku**: 1 batch produksi roti (misal: 24 pcs Croissant) membutuhkan sekumpulan bahan baku dengan takaran pasti (flour, butter, sugar, yeast).
4. **Peramalan Kebutuhan (Demand Forecast)**: Penggunaan bahan fluktuatif berdasarkan tren produksi harian. Moving average 7 hari memberikan proyeksi hari habis (runway) yang akurat.

## 2. Stack Teknologi
- **Frontend / Framework**: Next.js 16 (App Router, Server Actions, Client Components reaktif).
- **Styling**: Tailwind CSS v4, Lucide Icons, Clean Modern Aesthetic dengan whitespace 24px-32px padding, layout card modular.
- **Database**: Neon Serverless Postgres via Drizzle ORM.
- **Strategi Penyimpanan**: Dual-mode data access layer (Neon Postgres dengan fallback in-memory stateful store bila `DATABASE_URL` belum diisi, memastikan zero-config cold start langsung berjalan).
