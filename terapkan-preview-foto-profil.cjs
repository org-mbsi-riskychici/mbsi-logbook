#!/usr/bin/env node
/*
 * terapkan-preview-foto-profil.cjs
 * Patch otomatis khusus perbaikan pratinjau foto profil:
 * file HEIC atau HEIF dikonversi dulu lewat pratinjauHeic sebelum ditampilkan,
 * sama seperti pola pratinjau di form logbook dan galeri.
 *
 * Target hanya satu file: src/pages/DashboardPage.jsx
 * 1) menambah state previewLoadingFoto
 * 2) mengganti fungsi pilihFotoProfil menjadi versi async dengan deteksi HEIC
 * 3) mengganti blok img pratinjau agar menampilkan spinner saat konversi
 *
 * Cara pakai dari root project:
 *   node terapkan-preview-foto-profil.cjs
 * Mode aman tanpa menulis file:
 *   node terapkan-preview-foto-profil.cjs --dry-run
 *
 * Script ini idempoten. Bagian yang sudah terpatch akan dilaporkan dilewati.
 */
const fs = require('fs')
const path = require('path')

const ROOT = process.cwd()
const DRY = process.argv.indexOf('--dry-run') !== -1
const TARGET = path.join(ROOT, 'src', 'pages', 'DashboardPage.jsx')

const MARK_STATE = 'const [previewLoadingFoto, setPreviewLoadingFoto] = useState(false)'
const MARK_FUNGSI = 'async function pilihFotoProfil('

const FUNC_BARU = [
  'async function pilihFotoProfil(e) {',
  '  const f = e.target.files[0]',
  '  if (!f) return',
  "  if (f.size > 5 * 1024 * 1024) { toast.gagal('Ukuran foto maksimal 5 MB.'); e.target.value = ''; return }",
  "  if (fotoPreview && String(fotoPreview).indexOf('blob:') === 0) URL.revokeObjectURL(fotoPreview)",
  '  setFotoFile(f)',
  '  if (formatHeic(f)) {',
  '    setPreviewLoadingFoto(true)',
  '    setFotoPreview(null)',
  '    const blob = await pratinjauHeic(f)',
  '    setFotoPreview(blob ? URL.createObjectURL(blob) : URL.createObjectURL(f))',
  '    setPreviewLoadingFoto(false)',
  '  } else {',
  '    setFotoPreview(URL.createObjectURL(f))',
  '    setPreviewLoadingFoto(false)',
  '  }',
  '}'
]

const BLOK_BARU = [
  '{previewLoadingFoto ? (',
  '  <div className="h-20 w-20 rounded-[28%] bg-slate-100 flex items-center justify-center">',
  '    <div className="h-6 w-6 rounded-full border-2 border-bsi-500 border-t-transparent animate-spin"></div>',
  '  </div>',
  ') : fotoPreview ? <img src={fotoPreview} alt="Pratinjau foto profil" className="h-20 w-20 rounded-[28%] object-cover shadow-lg" /> : null}'
]

const laporan = []

function catat(nama, status, pesan) {
  laporan.push({ nama: nama, status: status })
  const ikon = status === 'ok' ? '[DIPATCH]' : (status === 'lewati' ? '[SUDAH ADA]' : '[GAGAL]')
  console.log(ikon + ' ' + nama + (pesan ? ' : ' + pesan : ''))
}

function indentOf(line) {
  const m = line.match(/^\s*/)
  return m ? m[0] : ''
}

function hitungBrace(line) {
  let n = 0
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '{') n++
    else if (line[i] === '}') n--
  }
  return n
}

function main() {
  if (!fs.existsSync(TARGET)) {
    catat('DashboardPage.jsx', 'gagal', 'file tidak ditemukan di src/pages')
    return 1
  }
  const isi = fs.readFileSync(TARGET, 'utf8')
  const EOL = isi.indexOf('\r\n') !== -1 ? '\r\n' : '\n'
  const lines = isi.split(EOL)

  if (isi.indexOf(MARK_STATE) !== -1) {
    catat('state previewLoadingFoto', 'lewati', 'state sudah ada')
  } else {
    const idx = lines.findIndex(function (l) { return l.trim() === 'const [fotoFile, setFotoFile] = useState(null)' })
    if (idx === -1) {
      catat('state previewLoadingFoto', 'gagal', 'baris state fotoFile tidak ditemukan')
    } else {
      lines.splice(idx + 1, 0, indentOf(lines[idx]) + MARK_STATE)
      catat('state previewLoadingFoto', 'ok', 'state loading pratinjau ditambahkan')
    }
  }

  if (isi.indexOf(MARK_FUNGSI) !== -1) {
    catat('fungsi pilihFotoProfil', 'lewati', 'fungsi async sudah ada')
  } else {
    const start = lines.findIndex(function (l) { return l.trim().indexOf('function pilihFotoProfil(') === 0 })
    if (start === -1) {
      catat('fungsi pilihFotoProfil', 'gagal', 'fungsi pilihFotoProfil tidak ditemukan')
    } else {
      const ind = indentOf(lines[start])
      let depth = 0
      let end = -1
      for (let j = start; j < lines.length; j++) {
        depth += hitungBrace(lines[j])
        if (j > start && depth <= 0) { end = j; break }
      }
      if (end === -1) {
        catat('fungsi pilihFotoProfil', 'gagal', 'batas akhir fungsi tidak terbaca')
      } else {
        const baru = FUNC_BARU.map(function (l) { return ind + l })
        lines.splice(start, end - start + 1, ...baru)
        catat('fungsi pilihFotoProfil', 'ok', 'fungsi diganti versi async dengan deteksi HEIC')
      }
    }
  }

  const k = lines.findIndex(function (l) { return l.indexOf('alt="Pratinjau foto profil"') !== -1 })
  if (k === -1) {
    catat('blok pratinjau', 'gagal', 'baris img pratinjau tidak ditemukan')
  } else if (lines[k].indexOf('previewLoadingFoto') !== -1) {
    catat('blok pratinjau', 'lewati', 'blok sudah memakai previewLoadingFoto')
  } else {
    const ind = indentOf(lines[k])
    const baru = BLOK_BARU.map(function (l) { return ind + l })
    lines.splice(k, 1, ...baru)
    catat('blok pratinjau', 'ok', 'spinner konversi ditampilkan saat pratinjau HEIC diproses')
  }

  const gagal = laporan.filter(function (l) { return l.status === 'gagal' })
  const ok = laporan.filter(function (l) { return l.status === 'ok' })
  console.log('')
  if (gagal.length) {
    console.log('Patch dibatalkan karena ada langkah gagal. Tidak ada file yang ditulis.')
    return 1
  }
  if (!ok.length) {
    console.log('Semua bagian sudah ada sebelumnya. Tidak ada yang perlu diubah.')
    return 0
  }
  if (!DRY) fs.writeFileSync(TARGET, lines.join(EOL), 'utf8')
  console.log(DRY ? 'Dry run selesai. Jalankan tanpa --dry-run untuk menulis perubahan.' : 'Patch pratinjau foto profil berhasil diterapkan.')
  return 0
}

console.log('Mode: ' + (DRY ? 'dry run, tidak ada file yang ditulis' : 'patch langsung ke file'))
console.log('')
process.exit(main())