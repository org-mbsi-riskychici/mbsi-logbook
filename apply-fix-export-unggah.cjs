const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memperbaiki export unggahVideoYouTube dan favicon...')
console.log('')

/* ===== 1. youtube.js: tambahkan export jembatan unggahVideoYouTube ===== */
const FILE_Y = 'src/lib/youtube.js'
let y = baca(FILE_Y)
if (y.includes('export async function unggahVideoYouTube')) {
  console.log('[SUDAH ADA] export unggahVideoYouTube di youtube.js')
} else if (!y.includes('export async function uploadToYouTube') || !y.includes('export async function startYouTubeSession')) {
  console.log('[TIDAK KETEMU] startYouTubeSession atau uploadToYouTube di youtube.js, batal menambahkan')
} else {
  y = y.trimEnd() + '\n\n' + [
    'export async function unggahVideoYouTube(file, judul, onProgress) {',
    '  const sesiData = await supabase.auth.getSession()',
    '  const token = sesiData.data.session ? sesiData.session.access_token : \'\'',
    '  const sesi = await startYouTubeSession(judul || \'Dokumentasi Magang\', \'Diunggah dari portal logbook magang BSI.\', file.type || \'video/mp4\', token)',
    '  return await uploadToYouTube(sesi.sessionUri, file, onProgress)',
    '}',
    ''
  ].join('\n')
  simpan(FILE_Y, y)
  console.log('[BERHASIL] export unggahVideoYouTube ditambahkan di youtube.js')
}

/* ===== 2. index.html: tambahkan favicon supaya tidak 404 ===== */
const FILE_H = 'index.html'
let h = baca(FILE_H)
if (h.includes('rel="icon"')) {
  console.log('[SUDAH ADA] favicon di index.html')
} else {
  const favicon = '    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg%20xmlns=\'http://www.w3.org/2000/svg\'%20viewBox=\'0%200%2064%2064\'%3E%3Crect%20width=\'64\'%20height=\'64\'%20rx=\'14\'%20fill=\'%2316623c\'/%3E%3Ctext%20x=\'32\'%20y=\'44\'%20font-size=\'34\'%20font-weight=\'700\'%20text-anchor=\'middle\'%20fill=\'%23ffffff\'%20font-family=\'Arial,%20sans-serif\'%3EB%3C/text%3E%3C/svg%3E" />\n'
  if (h.includes('    <title>')) {
    h = h.replace('    <title>', favicon + '    <title>')
    simpan(FILE_H, h)
    console.log('[BERHASIL] favicon ditambahkan di index.html')
  } else {
    console.log('[TIDAK KETEMU] baris title di index.html, favicon dilewati')
  }
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka kembali http://localhost:5173/dashboard, halaman tidak lagi blank.')
console.log('2. Uji upload video: progres naik, lalu logbook tersimpan dan kartu menampilkan thumbnail YouTube.')
console.log('3. Favicon hijau muncul di tab browser dan permintaan favicon.ico tidak lagi 404.')