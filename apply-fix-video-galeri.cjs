const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

function gantiStr(rel, cari, ganti, label) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  if (isi.includes(ganti)) { console.log('[SUDAH ADA] ' + label); return }
  if (!isi.includes(cari)) { console.log('[TIDAK KETEMU] ' + label); return }
  isi = isi.replace(cari, ganti)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

function gantiRegex(rel, re, ganti, label) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  if (!re.test(isi)) { console.log('[TIDAK KETEMU] ' + label); return }
  isi = isi.replace(re, ganti)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

console.log('Mulai memperbaiki penyimpanan video YouTube pada logbook dan galeri...')
console.log('')

/* ===== 1. submitLogbook: pertahankan video YouTube lama saat simpan ulang ===== */
gantiStr('src/pages/DashboardPage.jsx',
  `} else if (it.oldPath) {`,
  `} else if (it.mode === 'video' && !it.file && !it.ytLink && it.oldYtId) {
          mediaSource = 'youtube'
          youtubeId = it.oldYtId
          mediaPath = ytThumb(it.oldYtId)
          mediaThumb = ytThumb(it.oldYtId)
          mediaType = 'video'
        } else if (it.oldPath) {`,
  'Cabang pertahankan video YouTube lama di submitLogbook')

/* ===== 2. startEditLog: tampilkan thumbnail video YouTube di form ===== */
gantiRegex('src/pages/DashboardPage.jsx',
  /preview: it\.media_source === 'youtube' \? '' : \(it\.media_path \|\| ''\)/,
  `preview: it.media_path || ''`,
  'Pratinjau edit logbook menampilkan thumbnail YouTube')

/* ===== 3. startEditLog: isi otomatis kolom link dengan link video tersimpan ===== */
gantiRegex('src/pages/DashboardPage.jsx',
  /ytLink: '', oldYtId: it\.youtube_id \|\| null/,
  `ytLink: it.media_source === 'youtube' && it.youtube_id ? 'https://youtu.be/' + it.youtube_id : '', oldYtId: it.youtube_id || null`,
  'Kolom link terisi otomatis saat edit logbook YouTube')

/* ===== 4. submitGaleri: pertahankan video YouTube lama saat simpan ulang ===== */
gantiStr('src/pages/DashboardPage.jsx',
  `} else if (galForm.oldPath) {`,
  `} else if (galMode === 'video' && !galForm.file && !galYtLink && galOldYt) {
        mediaSource = 'youtube'
        youtubeId = galOldYt
        mediaPath = ytThumb(galOldYt)
        mediaThumb = ytThumb(galOldYt)
        mediaType = 'video'
      } else if (galForm.oldPath) {`,
  'Cabang pertahankan video YouTube lama di submitGaleri')

/* ===== 5. startEditGal: isi otomatis kolom link dengan link video tersimpan ===== */
gantiRegex('src/pages/DashboardPage.jsx',
  /setGalYtLink\(''\)([\s\S]{0,60}?)setGalOldYt\(g\.youtube_id/,
  `setGalYtLink(g.media_source === 'youtube' && g.youtube_id ? 'https://youtu.be/' + g.youtube_id : '')$1setGalOldYt(g.youtube_id`,
  'Kolom link terisi otomatis saat edit galeri YouTube')

/* ===== 6. startEditGal: tampilkan thumbnail video YouTube di form ===== */
gantiRegex('src/pages/DashboardPage.jsx',
  /preview: g\.media_source === 'youtube' \? '' : \(g\.media_path \|\| ''\)/,
  `preview: g.media_path || ''`,
  'Pratinjau edit galeri menampilkan thumbnail YouTube')

/* ===== 7. logbook.js: sync galeri membawa media_source dan youtube_id ===== */
const FILE_L = 'src/lib/logbook.js'
if (!fs.existsSync(path.join(root, FILE_L))) {
  console.log('[LEWATI] logbook.js tidak ditemukan')
} else {
  let l = baca(FILE_L)
  let berubahL = false
  l = l.replace(/from\('galeri'\)\.update\(\{([\s\S]*?)\}\)\.eq\(/, function (m, isi) {
    if (isi.includes('media_source')) return m
    berubahL = true
    return "from('galeri').update({" + isi + "media_source: item.media_source || 'r2', youtube_id: item.youtube_id || null }).eq("
  })
  l = l.replace(/from\('galeri'\)\.insert\(\{([\s\S]*?)\}\)/, function (m, isi) {
    if (isi.includes('media_source')) return m
    berubahL = true
    return "from('galeri').insert({" + isi + "media_source: item.media_source || 'r2', youtube_id: item.youtube_id || null })"
  })
  if (berubahL) {
    simpan(FILE_L, l)
    console.log('[BERHASIL] syncGaleri kini membawa media_source dan youtube_id')
  } else {
    console.log('[SUDAH ADA] syncGaleri sudah membawa kolom YouTube')
  }
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('PERBAIKAN DATA LAMA (opsional tetapi disarankan).')
console.log('Jalankan dua SQL berikut di Supabase SQL Editor untuk menyembuhkan baris yang telanjur rusak:')
console.log('')
console.log("update public.logbook_items")
console.log("set media_path = 'https://i.ytimg.com/vi/' || youtube_id || '/hqdefault.jpg',")
console.log("    media_thumb = 'https://i.ytimg.com/vi/' || youtube_id || '/hqdefault.jpg',")
console.log("    media_type = 'video'")
console.log("where media_source = 'youtube' and youtube_id is not null and (media_path is null or media_path = '');")
console.log('')
console.log("update public.galeri")
console.log("set media_source = 'youtube',")
console.log("    youtube_id = substring(media_path from 'vi/([A-Za-z0-9_-]{11})')")
console.log("where media_path like '%i.ytimg.com/vi/%' and (media_source = 'r2' or media_source is null);")
console.log('')
console.log('Langkah uji:')
console.log('1. Edit logbook berisi video YouTube, centang tampilkan di galeri, lalu simpan.')
console.log('2. Media tidak hilang lagi di logbook dan thumbnail beserta link terlihat di form edit.')
console.log('3. Buka tab Galeri: video muncul sebagai kartu dengan pemutar kustom, bukan media rusak.')
console.log('4. Edit lagi tanpa mengubah apa pun dan simpan: tidak ada permintaan upload ulang.')