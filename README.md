# Tokoku — Kasir & Analitik Penjualan untuk UMKM 🇮🇩

Aplikasi kasir modern berbasis web untuk UMKM Indonesia, dibangun dengan **React + TypeScript + Supabase**.

Desain terinspirasi dari nota kasir & warung — saffron gold, ink charcoal, dan jade hijau — dengan tipografi *Sora* untuk judul dan *JetBrains Mono* untuk angka, sebagai penghormatan pada printer struk thermal.

---

## ✨ Fitur

| Fitur | Keterangan |
|---|---|
| 🔐 Auth | Daftar / Masuk dengan Supabase Auth, sesi tersimpan otomatis |
| 🧾 Kasir / POS | Grid produk, filter kategori, keranjang interaktif, struk digital |
| 🍱 Varian Produk | Grup pilihan (pedas, topping, ukuran) — wajib/opsional, harga tambahan |
| 📦 Produk | CRUD lengkap, unggah foto ke Supabase Storage, diskon % / nominal |
| 🏷️ Kategori | Tambah / ubah / hapus kategori dengan kartu berwarna |
| 📊 Analitik | Grafik 30 hari, perbandingan Hari ini vs Kemarin / Bulan vs Bulan / Tahun vs Tahun |
| 🏠 Landing Page | Hero dengan struk digital, fitur, FAQ, CTA |
| 📱 Mobile-first | Bottom nav, cart sebagai bottom sheet, modal full-screen di HP |

---

## 🗂️ Struktur Direktori

```
tokoku/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── .env.example               ← salin ke .env dan isi kredensial
├── supabase_schema.sql        ← jalankan di Supabase SQL Editor
├── supabase_addons.sql        ← jalankan setelah schema utama (varian produk)
└── src/
    ├── main.tsx
    ├── App.tsx                ← router + protected routes
    ├── styles/
    │   └── globals.css        ← design system Tokoku (saffron/ink/jade, scallop signature)
    ├── types/
    │   └── index.ts
    ├── lib/
    │   ├── supabase.ts
    │   └── utils.ts
    ├── hooks/
    │   ├── useAuth.tsx
    │   ├── useProducts.ts
    │   ├── useCategories.ts
    │   ├── useProductOptions.ts
    │   └── useTransactions.ts
    ├── components/
    │   ├── layout/
    │   │   ├── Sidebar.tsx
    │   │   └── MobileNav.tsx
    │   ├── pos/
    │   │   └── OptionSelectModal.tsx
    │   ├── inventory/
    │   │   └── OptionManager.tsx
    │   └── ui/
    │       └── Toast.tsx
    └── pages/
        ├── LandingPage.tsx
        ├── AuthPages.tsx
        ├── DashboardPage.tsx
        ├── POSPage.tsx
        ├── ProductsPage.tsx
        ├── CategoriesPage.tsx
        └── AnalyticsPage.tsx
```

---

## 🚀 Setup (3 Langkah)

### Langkah 1 — Buat Project Supabase
1. Buka [supabase.com](https://supabase.com) → **New project**
2. Buka **SQL Editor** → jalankan `supabase_schema.sql`
3. Lanjutkan jalankan `supabase_addons.sql` (untuk fitur varian produk)

### Langkah 2 — Konfigurasi Environment
```bash
cp .env.example .env
```
Isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` dari Supabase Dashboard → Project Settings → API.

### Langkah 3 — Jalankan
```bash
npm install
npm run dev
```
Buka http://localhost:5173

---

## 🎨 Sistem Desain

| Token | Nilai | Peran |
|---|---|---|
| `--brand-500` | `#D9821C` | Saffron — warna utama (tombol, aksen, logo) |
| `--accent-emerald` | `#3C8160` | Jade — pertumbuhan positif, sukses |
| `--accent-amber` | `#C2562E` | Clay/terracotta — peringatan |
| `--accent-rose` | `#BD4438` | Merah hangat — bahaya/negatif |
| `--gray-900` | `#1B140D` | Ink — sidebar gelap, teks utama |
| `--font-display` | Sora | Judul, brand |
| `--font-body` | Inter | Teks UI |
| `--font-mono` | JetBrains Mono | Harga, nomor transaksi (gaya struk kasir) |

Elemen signature: **scalloped receipt edge** (`.scallop-bottom`) — tepi bergerigi meniru robekan kertas struk thermal, dipakai pada kartu hero landing page.

---

## 🛠️ Tech Stack

React 18 · TypeScript · Vite · React Router v6 · Supabase (PostgreSQL + Auth + Storage) · Recharts · Lucide React · date-fns

---

> Dibuat dengan ❤️ untuk UMKM Indonesia 🇮🇩
