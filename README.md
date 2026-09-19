# Logbook Magang BSI

Portal pencatatan kegiatan magang mahasiswa Bank Syariah Indonesia (BSI) yang menggabungkan **logbook harian**, **galeri foto & video**, dan **daftar kehadiran** dalam satu tempat.

Dibangun untuk memudahkan mahasiswa mendokumentasikan kegiatan magang, serta memberikan akses **publik** (tanpa login) kepada Dosen Pembimbing (Dospem) dan Kaprodi untuk memantau progres tim.

## ✨ Fitur Utama

### Untuk Mahasiswa (Login)
- **Dashboard** dengan empat tab: Logbook, Galeri, Daftar Hadir, dan Profil.
- **Form Logbook** interaktif: kolom Kendala / Solusi / Pembelajaran melebar otomatis saat difokuskan atau terisi, dengan animasi halus pada kartu form dan tombol Simpan.
- **Upload foto** otomatis dikonversi ke WebP ringan (mendukung HEIC iPhone).
- **Upload video** melalui YouTube (unlisted) dengan sistem kuota harian per project, atau alternatif link YouTube/Google Drive.
- **Proteksi draf**: konfirmasi otomatis saat pindah tab, pindah halaman, refresh, tutup tab, batal edit, atau menimpa draf melalui tombol Edit.
- **Profil & avatar** dengan upload foto profil sendiri.

### Untuk Dosen Pembimbing & Kaprodi (Publik)
- Halaman **Beranda** menampilkan logbook terbaru tim yang sudah dibagikan.
- Halaman **Logbook**, **Galeri**, dan **Absen** dengan filter & pencarian.
- Halaman **Dospem** menampilkan profil tim magang beserta rekap kehadiran (Masuk / Izin / Bolos) dan grafik per mahasiswa.
- Semua halaman tersedia dalam mode terang & gelap.

### Umum
- **Pagination responsif**: ikon panah + elipsis `...` ala web korporat, tampil satu baris rapi di mobile, tablet, dan desktop.
- **Dark mode** dengan transisi tema halus.
- **Tampilan responsif** penuh dari 360px hingga desktop lebar.
- **Skeleton loading** yang konsisten di setiap daftar.

## 🛠️ Tech Stack

| Lapisan | Teknologi |
|---------|-----------|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 |
| Routing | React Router |
| Database & Auth | Supabase (PostgreSQL + Row Level Security) |
| Penyimpanan File | Cloudflare R2 |
| Video Hosting | YouTube Data API v3 (unlisted) |
| Hosting | Vercel (frontend + serverless functions) |
| Build Tool | Vite, PostCSS |

## 📁 Struktur Proyek

```
mbsi-logbook/
├── api/                    # Fungsi serverless Vercel
│   ├── _lib/               # Helper server (supabase admin, r2, youtube)
│   ├── r2/                 # Endpoint upload/unduh/hapus media R2
│   └── youtube/            # Endpoint kuota, sesi upload, cek video terbaru
├── public/                 # File statis (favicon, robots.txt, llms.txt)
├── src/
│   ├── components/         # Komponen UI bersama
│   │   ├── ui.jsx          # Toast, Modal, Pagination, AutoTextArea, dll.
│   │   ├── cards.jsx       # Kartu logbook, galeri, kehadiran
│   │   ├── controls.jsx    # Filter, pencarian, dropdown
│   │   ├── Layout.jsx      # Navbar, footer, guard unsaved changes
│   │   ├── Carousel.jsx    # Carousel media
│   │   ├── PemutarVideo.jsx# Custom video player
│   │   └── icons.jsx       # Kumpulan ikon SVG inline
│   ├── lib/                # Logika & helper
│   │   ├── auth.js         # Sesi & autentikasi
│   │   ├── upload.js       # Pipeline upload foto/video
│   │   ├── konversi.js     # Konversi HEIC → WebP
│   │   ├── youtube.js      # Helper YouTube API
│   │   ├── drive.js        # Helper Google Drive
│   │   ├── profil.js       # Upload avatar
│   │   ├── logbook.js      # Logika form logbook
│   │   ├── format.js       # Format tanggal, angka, file size
│   │   └── constants.js    # Konstanta bersama
│   ├── pages/              # Halaman utama
│   │   ├── HomePage.jsx    # Landing page publik
│   │   ├── LoginPage.jsx   # Login mahasiswa
│   │   ├── DashboardPage.jsx # Dashboard mahasiswa (4 tab)
│   │   ├── LogbookPage.jsx # Daftar logbook publik
│   │   ├── GalleryPage.jsx # Galeri publik
│   │   ├── AttendancePage.jsx # Daftar hadir publik
│   │   └── DospemPage.jsx  # Halaman Dospem/Kaprodi
│   ├── App.jsx             # Router utama
│   ├── main.jsx            # Entry point + animasi halaman
│   └── index.css           # Tema & utilitas global
├── supabase/
│   ├── schema.sql          # Skema database lengkap
│   └── migrasi-drive-download.sql
├── .env.example            # Contoh variabel lingkungan
├── vercel.json             # Konfigurasi Vercel (rewrite SPA)
├── vite.config.js          # Plugin Vite untuk middleware API lokal
└── tailwind.config.js      # Konfigurasi Tailwind + tema BSI
```

## 🚀 Menjalankan di Lokal

### Prasyarat
- Node.js 18+
- Akun [Supabase](https://supabase.com) (untuk DB + Auth)
- Akun [Cloudflare](https://cloudflare.com) (untuk R2)
- Akun [Google Cloud Console](https://console.cloud.google.com) (untuk YouTube API)

### Langkah Setup

1. **Clone & install**
   ```bash
   git clone <repo-url>
   cd mbsi-logbook
   npm install
   ```

2. **Salin `.env.example` menjadi `.env.local`**
   ```bash
   cp .env.example .env.local
   ```
   Isi semua variabel sesuai layanan yang kamu miliki (lihat bagian **Variabel Lingkungan**).

3. **Jalankan skema database**
   - Buka Supabase → SQL Editor.
   - Tempel seluruh isi `supabase/schema.sql`, lalu jalankan.
   - Buat user Auth dengan pola `NIM@mbsi.local` (sesuai konvensi kampus) dan isi tabel `mahasiswa` dengan `auth_uid` yang cocok.

4. **Jalankan server lokal**
   ```bash
   npm run dev
   ```
   Buka `http://localhost:5173` (atau `http://<IP-lokal>:5173` untuk uji dari HP satu jaringan).

5. **Preview build production**
   ```bash
   npm run build
   npm run preview
   ```

## 🔐 Variabel Lingkungan

### Client (dipakai saat build, prefix `VITE_`)
| Variabel | Keterangan |
|----------|-----------|
| `VITE_SUPABASE_URL` | URL proyek Supabase |
| `VITE_SUPABASE_ANON_KEY` | Public anon key Supabase |

### Server (dipakai fungsi `api/` saat runtime)
| Variabel | Keterangan |
|----------|-----------|
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (hanya di server) |
| `R2_ACCOUNT_ID` | Cloudflare Account ID |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |
| `R2_BUCKET_NAME` | Nama bucket R2 |
| `R2_PUBLIC_BASE_URL` | URL publik bucket (mis. `https://pub-xxx.r2.dev`) |
| `YOUTUBE_CLIENT_ID_1` | OAuth client ID Google project ke-1 |
| `YOUTUBE_CLIENT_SECRET_1` | OAuth client secret project ke-1 |
| `YOUTUBE_REFRESH_TOKEN_1` | Refresh token project ke-1 |
| `YOUTUBE_CLIENT_ID_2.._6` | Opsional — untuk kuota video lebih besar |
| `YOUTUBE_CLIENT_SECRET_2.._6` | Opsional |
| `YOUTUBE_REFRESH_TOKEN_2.._6` | Opsional |

Setiap project YouTube mendapat kuota **5 upload/hari** (zona waktu Pacific). Tambahkan project 2–6 bila butuh kuota harian lebih besar (total hingga 30 upload/hari).

## 🌐 Deploy ke Vercel

1. Push repo ke GitHub.
2. Import proyek di [Vercel](https://vercel.com).
3. Salin seluruh isi `.env.local` ke **Settings → Environment Variables** (berlaku untuk Production + Preview).
4. Deploy. Vercel otomatis mendeteksi framework Vite dan menjalankan fungsi serverless dari folder `api/`.

> ⚠️ Tanpa variabel server (terutama `SUPABASE_SERVICE_ROLE_KEY`, `R2_*`, dan `YOUTUBE_*`), build akan sukses tetapi API akan mengembalikan `500` / "Kredensial belum dikonfigurasi".

## 📏 Batasan & Catatan Produksi

- **Ukuran foto maksimum**: 15 MB (dikonversi ke WebP sebelum diunggah).
- **Ukuran video maksimum**: 50 MB (diperiksa di sisi klien).
- **Kuota video YouTube**: 5 upload/project/hari; bila habis, sistem menyarankan link eksternal.
- **Privasi video YouTube**: `unlisted` (hanya dapat diakses lewat link tertanam).
- **Row Level Security (RLS)** Supabase wajib aktif di semua tabel produksi (`logbooks`, `logbook_items`, `galeri`, `daftar_hadir`, `mahasiswa`, `youtube_quota_usage`).
- **Service role key Supabase** hanya boleh berada di sisi server (`api/`), jangan pernah masuk ke kode klien.

## 📄 Lisensi

Proyek internal untuk kegiatan magang Bank Syariah Indonesia. Hak cipta © 2026 Tim Magang BSI.