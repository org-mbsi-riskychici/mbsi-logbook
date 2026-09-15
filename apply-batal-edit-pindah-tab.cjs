const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_D = 'src/pages/DashboardPage.jsx'

if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[GAGAL] DashboardPage.jsx tidak ditemukan')
  process.exit(1)
}

let d = fs.readFileSync(path.join(root, FILE_D), 'utf8').replace(/\r\n/g, '\n')

console.log('Mulai menerapkan pembatalan otomatis mode edit saat pindah tab...')
console.log('')

/* ===== 1. Sisipkan Fungsi gantiTab ===== */
const GANTI_TAB_CODE = `  function gantiTab(tabBaru) {
    if (tabBaru !== tab) {
      cancelEditLog()
      cancelEditGal()
      cancelEditHadir()
      setTab(tabBaru)
    }
  }

`
if (d.includes('function gantiTab(tabBaru)')) {
  console.log('[SUDAH ADA] Fungsi gantiTab di DashboardPage.jsx')
} else {
  const anchor = 'const tabCls = function (t) {'
  if (d.includes(anchor)) {
    d = d.replace(anchor, GANTI_TAB_CODE + '  ' + anchor)
    console.log('[BERHASIL] Fungsi gantiTab berhasil disisipkan')
  } else {
    console.log('[TIDAK KETEMU] Anchor untuk menyisipkan fungsi gantiTab')
  }
}

/* ===== 2. Ubah Navigasi ke gantiTab ===== */
const targets = [
  { old: "onClick={function () { setTab('profil') }} title=\"Kelola foto profil\"", new: "onClick={function () { gantiTab('profil') }} title=\"Kelola foto profil\"" },
  { old: "onClick={function () { setTab('logbook') }} className={tabCls('logbook')}", new: "onClick={function () { gantiTab('logbook') }} className={tabCls('logbook')}" },
  { old: "onClick={function () { setTab('galeri') }} className={tabCls('galeri')}", new: "onClick={function () { gantiTab('galeri') }} className={tabCls('galeri')}" },
  { old: "onClick={function () { setTab('absen') }} className={tabCls('absen')}", new: "onClick={function () { gantiTab('absen') }} className={tabCls('absen')}" },
  { old: "onClick={function () { setTab('profil') }} className={tabCls('profil')}", new: "onClick={function () { gantiTab('profil') }} className={tabCls('profil')}" }
]

let replacements = 0
targets.forEach(t => {
  if (d.includes(t.old)) {
    d = d.replace(t.old, t.new)
    replacements++
  }
})

if (replacements > 0) {
  console.log('[BERHASIL] ' + replacements + ' lokasi navigasi diubah untuk menggunakan gantiTab')
} else {
  console.log('[INFO] Tombol navigasi sudah menggunakan gantiTab atau tidak ditemukan')
}

fs.writeFileSync(path.join(root, FILE_D), d, 'utf8')

console.log('')
console.log('Selesai. Silakan muat ulang browser (Ctrl + Shift + R).')
console.log('')
console.log('Perilaku baru:')
console.log('1. Berpindah tab lewat tombol navigasi kini akan selalu melewati gantiTab().')
console.log('2. Semua Mode Edit (Logbook, Galeri, atau Daftar Hadir) akan otomatis dibatalkan jika kamu pindah ke tab lain.')
console.log('3. Form akan tersetting ulang dengan aman agar tidak ada data sisa yang tertinggal.')