const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

const regexBaris = /^([ \t]*)const ([A-Za-z0-9_]+) = [^\n]*\.access_token[^\n]*$/gm

console.log('Mulai mengamankan pengambilan token sesi...')
console.log('')

/* ===== 1. youtube.js ===== */
const FILE_Y = 'src/lib/youtube.js'
let y = baca(FILE_Y)
const ySebelum = y
y = y.replace(regexBaris, function (m, indent, name) {
  return indent + 'const ' + name + ' = await ambilTokenSesi()'
})
if (y !== ySebelum) console.log('[BERHASIL] Baris access_token di youtube.js diganti fungsi aman')

if (!y.includes('export async function ambilTokenSesi')) {
  y = y.trimEnd() + '\n\n' + [
    'export async function ambilTokenSesi() {',
    '  try {',
    '    const r = await supabase.auth.getSession()',
    '    const ssn = r && r.data ? r.data.session : null',
    '    return ssn && ssn.access_token ? ssn.access_token : \'\'',
    '  } catch (e) {',
    '    return \'\'',
    '  }',
    '}',
    ''
  ].join('\n')
  console.log('[BERHASIL] Fungsi ambilTokenSesi ditambahkan di youtube.js')
} else {
  console.log('[SUDAH ADA] Fungsi ambilTokenSesi di youtube.js')
}

if (!y.includes('Sesi login tidak terbaca')) {
  const cariGuard = `export async function startYouTubeSession(title, description, contentType, token) {
  const r = await fetch('/api/youtube/session', {`
  const gantiGuard = `export async function startYouTubeSession(title, description, contentType, token) {
  if (!token) throw new Error('Sesi login tidak terbaca. Silakan masuk ulang lalu coba lagi.')
  const r = await fetch('/api/youtube/session', {`
  if (y.includes(cariGuard)) {
    y = y.replace(cariGuard, gantiGuard)
    console.log('[BERHASIL] Penjaga token kosong di startYouTubeSession')
  } else {
    console.log('[TIDAK KETEMU] Pola startYouTubeSession, penjaga dilewati')
  }
} else {
  console.log('[SUDAH ADA] Penjaga token kosong di startYouTubeSession')
}
simpan(FILE_Y, y)

/* ===== 2. DashboardPage.jsx ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
let d = baca(FILE_D)
const dSebelum = d
d = d.replace(regexBaris, function (m, indent, name) {
  return indent + 'const ' + name + ' = await ambilTokenSesi()'
})
if (d !== dSebelum) {
  console.log('[BERHASIL] Baris access_token di DashboardPage diganti fungsi aman')
  if (d.includes('ambilTokenSesi()') && !d.includes('ambilTokenSesi }')) {
    d = d.replace("} from '../lib/youtube.js'", ", ambilTokenSesi } from '../lib/youtube.js'")
    console.log('[BERHASIL] Import ambilTokenSesi ditambahkan di DashboardPage')
  }
  simpan(FILE_D, d)
} else {
  console.log('[SUDAH AMAAN] Tidak ada baris access_token langsung di DashboardPage')
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard, pilih mode Video dengan file video kecil, lalu simpan.')
console.log('2. Bila sesi login valid, progres upload berjalan dan logbook tersimpan.')
console.log('3. Bila sesi kedaluwarsa, pesan yang muncul kini kalimat ramah, bukan error access_token.')
console.log('4. Uji juga mode Foto dan mode link YouTube untuk memastikan tidak ada regresi.')