#!/usr/bin/env node
/*
 * terapkan-animasi-upload-foto.cjs
 * Patch otomatis khusus animasi panel upload foto profil di tab Profil dashboard:
 * panel tidak lagi mount dan unmount mendadak, melainkan mengembang dan merapat
 * mulus lewat transisi grid-template-rows, plus fade dan geser halus pada isinya.
 *
 * Target:
 * 1) src/index.css: menambah blok kelas unggah-foto-wrap, unggah-foto-dalam, unggah-foto-isi
 * 2) src/pages/DashboardPage.jsx:
 *    a) membungkus panel dengan wrapper permanen berkelas animasi
 *    b) tombol Ganti atau Upload Foto mereset isi saat membuka
 *    c) tombol Batal hanya menutup panel supaya animasi keluar tidak melompat
 *    d) simpanFotoProfil tidak langsung mengosongkan pratinjau setelah sukses
 *
 * Cara pakai dari root project:
 *   node terapkan-animasi-upload-foto.cjs
 * Mode aman tanpa menulis file:
 *   node terapkan-animasi-upload-foto.cjs --dry-run
 *
 * Script ini idempoten. Bagian yang sudah terpatch dilaporkan dilewati.
 */
const fs = require('fs')
const path = require('path')

const ROOT = process.cwd()
const DRY = process.argv.indexOf('--dry-run') !== -1
const CSS_TARGET = path.join(ROOT, 'src', 'index.css')
const JSX_TARGET = path.join(ROOT, 'src', 'pages', 'DashboardPage.jsx')

const CSS_BLOK = `/* unggah-foto-halus: panel upload foto profil mengembang dan merapat mulus tanpa lompatan layout */
.unggah-foto-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.34s cubic-bezier(0.32, 0.72, 0, 1);
}
.unggah-foto-wrap.unggah-foto-buka { grid-template-rows: 1fr; }
.unggah-foto-dalam {
  overflow: hidden;
  min-height: 0;
  visibility: hidden;
  transition: visibility 0.34s;
}
.unggah-foto-buka .unggah-foto-dalam { visibility: visible; }
.unggah-foto-isi {
  opacity: 0;
  transform: translateY(-6px);
  transition: opacity 0.18s ease, transform 0.22s cubic-bezier(0.32, 0.72, 0, 1);
}
.unggah-foto-buka .unggah-foto-isi {
  opacity: 1;
  transform: none;
  transition: opacity 0.3s ease 0.08s, transform 0.34s cubic-bezier(0.32, 0.72, 0, 1) 0.06s;
}
`

const BUKA_BARU = [
  "<div className={'unggah-foto-wrap w-full' + (showUploadFoto ? ' unggah-foto-buka' : '')}>",
  '<div className="unggah-foto-dalam">',
  '<div className="unggah-foto-isi mt-5 w-full border-t border-slate-200 pt-5 text-left">'
]

const TGL_LAMA = 'onClick={function () { setShowUploadFoto(!showUploadFoto) }}'
const TGL_BARU = 'onClick={function () { if (showUploadFoto) { setShowUploadFoto(false); return } setFotoPreview(null); setFotoFile(null); setShowUploadFoto(true) }}'
const BATAL_LAMA = 'onClick={function () { setShowUploadFoto(false); setFotoPreview(null); setFotoFile(null) }}'
const BATAL_BARU = 'onClick={function () { setShowUploadFoto(false) }}'

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

function patchCss() {
  const nama = 'src/index.css (unggah-foto-halus)'
  if (!fs.existsSync(CSS_TARGET)) return catat(nama, 'gagal', 'file tidak ditemukan')
  const isi = fs.readFileSync(CSS_TARGET, 'utf8')
  if (isi.indexOf('.unggah-foto-wrap {') !== -1) return catat(nama, 'lewati', 'blok CSS sudah ada')
  const sambung = isi.endsWith('\n') ? '\n' : '\n\n'
  if (!DRY) fs.writeFileSync(CSS_TARGET, isi + sambung + CSS_BLOK, 'utf8')
  catat(nama, 'ok', 'blok CSS animasi panel ditambahkan di akhir file')
}

function patchJsx() {
  const namaPanel = 'DashboardPage.jsx (wrapper panel)'
  const namaTombol = 'DashboardPage.jsx (tombol buka)'
  const namaBatal = 'DashboardPage.jsx (tombol Batal)'
  const namaSimpan = 'DashboardPage.jsx (simpanFotoProfil)'
  if (!fs.existsSync(JSX_TARGET)) {
    catat(namaPanel, 'gagal', 'file tidak ditemukan')
    catat(namaTombol, 'gagal', 'file tidak ditemukan')
    catat(namaBatal, 'gagal', 'file tidak ditemukan')
    catat(namaSimpan, 'gagal', 'file tidak ditemukan')
    return
  }
  const isi = fs.readFileSync(JSX_TARGET, 'utf8')
  const EOL = isi.indexOf('\r\n') !== -1 ? '\r\n' : '\n'
  const lines = isi.split(EOL)
  let berubah = false
  let gagal = false

  if (isi.indexOf('unggah-foto-wrap w-full') !== -1) {
    catat(namaPanel, 'lewati', 'wrapper animasi sudah dipakai')
  } else {
    const i = lines.findIndex(function (l) { return l.trim() === '{showUploadFoto ? (' })
    const bukaOk = i !== -1 && lines[i + 1] && lines[i + 1].trim() === '<div className="mt-5 w-full border-t border-slate-200 pt-5 text-left">'
    if (!bukaOk) {
      gagal = true
      catat(namaPanel, 'gagal', 'pembuka panel kondisional tidak ditemukan')
    } else {
      const ind = indentOf(lines[i])
      lines.splice(i, 2, ind + BUKA_BARU[0], ind + BUKA_BARU[1], ind + BUKA_BARU[2])
      const b = lines.findIndex(function (l) { return l.indexOf(BATAL_LAMA) !== -1 })
      let j = -1
      if (b !== -1) {
        for (let k = b; k < lines.length; k++) {
          if (lines[k].trim() === ') : null}') { j = k; break }
        }
      }
      if (b === -1 || j === -1 || !lines[j - 1] || lines[j - 1].trim() !== '</div>') {
        gagal = true
        catat(namaPanel, 'gagal', 'penutup panel tidak terbaca setelah pembuka diganti')
      } else {
        const ind2 = indentOf(lines[j - 1])
        lines.splice(j - 1, 2, ind2 + '</div>', ind2 + '</div>', ind2 + '</div>')
        berubah = true
        catat(namaPanel, 'ok', 'panel dibungkus wrapper animasi buka dan tutup')
      }
    }
  }

  const t = lines.findIndex(function (l) { return l.indexOf(TGL_LAMA) !== -1 })
  if (t === -1) {
    if (isi.indexOf(TGL_BARU) !== -1) catat(namaTombol, 'lewati', 'tombol buka sudah mereset isi')
    else { gagal = true; catat(namaTombol, 'gagal', 'tombol Ganti atau Upload Foto tidak ditemukan') }
  } else {
    lines[t] = lines[t].split(TGL_LAMA).join(TGL_BARU)
    berubah = true
    catat(namaTombol, 'ok', 'membuka panel kini mereset pratinjau dan file lama')
  }

  const b2 = lines.findIndex(function (l) { return l.indexOf(BATAL_LAMA) !== -1 })
  if (b2 === -1) {
    if (lines.some(function (l) { return l.indexOf(BATAL_BARU) !== -1 })) catat(namaBatal, 'lewati', 'tombol Batal sudah hanya menutup panel')
    else { gagal = true; catat(namaBatal, 'gagal', 'tombol Batal tidak ditemukan') }
  } else {
    lines[b2] = lines[b2].split(BATAL_LAMA).join(BATAL_BARU)
    berubah = true
    catat(namaBatal, 'ok', 'Batal hanya menutup supaya animasi keluar mulus')
  }

  const s = lines.findIndex(function (l) { return l.trim() === 'setShowUploadFoto(false)' })
  if (s === -1) {
    gagal = true
    catat(namaSimpan, 'gagal', 'baris setShowUploadFoto(false) di simpanFotoProfil tidak ditemukan')
  } else if (lines[s + 1] && lines[s + 1].trim() === 'setFotoPreview(null)' && lines[s + 2] && lines[s + 2].trim() === 'setFotoFile(null)') {
    lines.splice(s + 1, 2)
    berubah = true
    catat(namaSimpan, 'ok', 'pembersihan segera setelah simpan dihapus agar panel merapat utuh')
  } else {
    catat(namaSimpan, 'lewati', 'pembersihan segera sudah tidak ada')
  }

  if (gagal) return
  if (berubah && !DRY) fs.writeFileSync(JSX_TARGET, lines.join(EOL), 'utf8')
}

console.log('Mode: ' + (DRY ? 'dry run, tidak ada file yang ditulis' : 'patch langsung ke file'))
console.log('')

patchCss()
patchJsx()

const gagal = laporan.filter(function (l) { return l.status === 'gagal' })
const ok = laporan.filter(function (l) { return l.status === 'ok' })
console.log('')
if (gagal.length) {
  console.log('Patch dibatalkan karena ada langkah gagal. Tidak ada file yang ditulis.')
  process.exit(1)
}
if (!ok.length) {
  console.log('Semua bagian sudah ada sebelumnya. Tidak ada yang perlu diubah.')
  process.exit(0)
}
console.log(DRY ? 'Dry run selesai. Jalankan tanpa --dry-run untuk menulis perubahan.' : 'Animasi panel upload foto profil berhasil diterapkan.')