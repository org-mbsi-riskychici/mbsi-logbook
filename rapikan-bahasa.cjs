#!/usr/bin/env node
/*
 * rapikan-bahasa.cjs
 * Mengganti kata-kata bernuasa developer/teknis di UI menjadi kata singkat
 * yang langsung dipahami pengguna. Idempoten + cadangan .bak per file.
 *
 * Pakai (dari root proyek):  node rapikan-bahasa.cjs
 */
const fs = require('fs')
const path = require('path')

const PETA = [
  // Status & opsi (Published/Draft -> Publik/Draf)
  ["{publik ? 'Published' : 'Draft'}", "{publik ? 'Publik' : 'Draf'}"],
  ["label: 'Draft'", "label: 'Draf'"],
  ["label: 'Published'", "label: 'Publik'"],
  ['desc="Logbook yang sudah berstatus Published akan tampil di sini."', 'desc="Logbook yang sudah dibagikan akan tampil di sini."'],
  // Login & area intern
  ['>Masuk Intern<', '>Masuk Akun<'],
  ['Login Mahasiswa Magang', 'Masuk Akun Magang'],
  ['Area Intern', 'Khusus Peserta Magang'],
  ['Halaman ini hanya digunakan oleh mahasiswa magang. Dosen pembimbing dan kaprodi tidak perlu login untuk melihat halaman publik.', 'Halaman ini khusus mahasiswa magang. Dosen pembimbing dan kaprodi dapat melihat halaman umum tanpa masuk.'],
  ["{busy ? 'Memproses...' : 'Masuk ke Dashboard'}", "{busy ? 'Memproses...' : 'Masuk'}"],
  // Upload -> Unggah, kuota, tautan
  ["'Ganti Foto' : 'Upload Foto'", "'Ganti Foto' : 'Unggah Foto'"],
  ['Format JPG, PNG, WebP, atau HEIC iPhone. Otomatis dikonversi ke WebP ringan. Maksimal 5 MB.', 'Format JPG, PNG, atau HEIC. Ukuran maksimal 5 MB.'],
  ['Sisa kuota upload video hari ini: ', 'Sisa kuota unggah video hari ini: '],
  ['Kuota habis. Gunakan link video di bawah.', 'Kuota habis. Gunakan tautan video di bawah.'],
  ['placeholder="Link video YouTube untuk tampilan (opsional)"', 'placeholder="Tautan video YouTube (opsional)"'],
  ['placeholder="Link Google Drive untuk unduhan (opsional)"', 'placeholder="Tautan Google Drive (opsional)"'],
  ['aria-label="Link video YouTube"', 'aria-label="Tautan video YouTube"'],
  ['aria-label="Link Google Drive"', 'aria-label="Tautan Google Drive"'],
  // Catatan yang terlalu teknis
  ['Media ini berasal dari logbook. Perubahan judul, deskripsi, kegiatan, dan tanggal hanya memengaruhi galeri dan tidak akan ditimpa saat logbook disimpan.', 'Media ini berasal dari logbook. Perubahan hanya berlaku di galeri dan tidak mengubah logbook aslinya.'],
  ['Field ini hanya terisi untuk status Izin atau Bolos.', 'Alasan hanya diisi untuk status Izin atau Bolos.'],
  // Konfirmasi "Timpa" -> "Ganti"
  ["'Timpa Draf Logbook?'", "'Ganti Draf Logbook?'"],
  ["'Timpa Draf Galeri?'", "'Ganti Draf Galeri?'"],
  ["'Timpa Draf Daftar Hadir?'", "'Ganti Draf Daftar Hadir?'"],
  ['confirmLabel="Ya, Timpa"', 'confirmLabel="Ya, Ganti"'],
  // Monitoring -> Rekap / Untuk
  ['Monitoring Kehadiran Tim Magang', 'Rekap Kehadiran Tim Magang'],
  ['Monitoring Dospem dan Kaprodi', 'Untuk Dospem & Kaprodi'],
  ['Aktivitas yang Sudah Dipublikasikan', 'Aktivitas yang Sudah Dibagikan'],
  // Kalimat petunjuk lebih singkat
  ['Setiap kartu mewakili satu kegiatan. Klik media untuk melihat detail.', 'Setiap foto atau video mewakili satu kegiatan. Klik untuk melihat detail.'],
  ['Klik kartu untuk melihat detail', 'Klik untuk melihat detail'],
  ['Periksa koneksi atau ketersediaan video di saluran.', 'Periksa koneksi internet atau ketersediaan video.'],
  ['<span>Reset</span>', '<span>Hapus Filter</span>']
]

function daftarFile(dir, hasil) {
  for (const nama of fs.readdirSync(dir)) {
    const p = path.join(dir, nama)
    const st = fs.statSync(p)
    if (st.isDirectory()) daftarFile(p, hasil)
    else if (/\.(jsx|js)$/.test(nama)) hasil.push(p)
  }
  return hasil
}

function main() {
  const root = path.resolve(process.cwd(), 'src')
  if (!fs.existsSync(root)) { console.error('✗ Folder src tidak ditemukan.'); process.exit(1) }
  const files = daftarFile(root, [])
  let total = 0
  for (const f of files) {
    let isi = fs.readFileSync(f, 'utf8')
    const asli = isi
    let kena = 0
    for (const [lama, baru] of PETA) {
      if (isi.indexOf(lama) !== -1) { isi = isi.split(lama).join(baru); kena++; total++ }
    }
    if (kena > 0) {
      fs.writeFileSync(f + '.bak', asli, 'utf8')
      fs.writeFileSync(f, isi, 'utf8')
      console.log('  ✓ ' + path.relative(process.cwd(), f) + ' (' + kena + ' pengganti)')
    }
  }
  console.log('')
  console.log('✓ SELESAI: ' + total + ' pengganti teks diterapkan.')
  console.log('Cadangan tersimpan sebagai *.bak di samping file yang berubah.')
  console.log('Cek cepat: npm run dev, lalu buka Login, Dashboard, Logbook, Galeri, Absen, Dospem.')
}

main()