const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Memperbaiki LogbookDetail untuk mendukung video Google Drive...')
console.log('')

const FILE_CARDS = 'src/components/cards.jsx'
let c = baca(FILE_CARDS)
let berubah = false

// Pastikan import drivePreviewUrl ada
if (c.indexOf('drivePreviewUrl') === -1) {
  const anchor = "from '../lib/format.js'"
  const hasil = c.replace(anchor, anchor + "\nimport { drivePreviewUrl } from '../lib/drive.js'")
  if (hasil !== c) {
    c = hasil
    berubah = true
    console.log('[BERHASIL] Import drivePreviewUrl ditambahkan')
  } else {
    console.log('[TIDAK KETEMU] Anchor import format.js')
  }
} else {
  console.log('[SUDAH ADA] Import drivePreviewUrl')
}

// Cari dan ganti pola LogbookDetail dengan pendekatan yang lebih fleksibel
// Kita cari blok yang menangani media di LogbookDetail
const polaLama1 = "{it.media_path ? (\n                      it.media_source === 'youtube' ? (\n                        <PemutarVideo key={it.youtube_id} youtubeId={it.youtube_id} title={it.judul} className=\"aspect-video w-full rounded-2xl mb-3\" />\n                      ) : (\n                        <ZoomableMedia src={it.media_thumb || it.media_path} full={it.media_path} type={it.media_type} title={it.judul} className=\"rounded-2xl overflow-hidden aspect-video bg-slate-900 mb-3\" />\n                      )\n                    ) : null}"

const polaLama2 = "{it.media_path ? (\n                  it.media_source === 'youtube' ? (\n                    <PemutarVideo key={it.youtube_id} youtubeId={it.youtube_id} title={it.judul} className=\"aspect-video w-full rounded-2xl mb-3\" />\n                  ) : (\n                    <ZoomableMedia src={it.media_thumb || it.media_path} full={it.media_path} type={it.media_type} title={it.judul} className=\"rounded-2xl overflow-hidden aspect-video bg-slate-900 mb-3\" />\n                  )\n                ) : null}"

const polaLama3 = "{it.media_path ? (\n                      it.media_source === 'youtube' ? (\n                        <PemutarVideo key={it.youtube_id} youtubeId={it.youtube_id} title={it.judul} className=\"aspect-video w-full rounded-2xl mb-3\" />\n                      ) : (\n                        <ZoomableMedia src={it.media_thumb || it.media_path} full={it.media_path} type={it.media_type} title={it.judul} className=\"rounded-2xl overflow-hidden aspect-video bg-slate-900 mb-3\" />\n                      )\n                    ) : null}"

const polaBaru = "{it.media_path ? (\n                      it.media_source === 'youtube' ? (\n                        <PemutarVideo key={it.youtube_id} youtubeId={it.youtube_id} title={it.judul} className=\"aspect-video w-full rounded-2xl mb-3\" />\n                      ) : it.media_source === 'drive' ? (\n                        <iframe key={it.media_path} src={drivePreviewUrl(it.media_path)} title={it.judul} allow=\"autoplay; encrypted-media; fullscreen\" allowFullScreen className=\"aspect-video w-full rounded-2xl border-0 bg-black mb-3\" />\n                      ) : (\n                        <ZoomableMedia src={it.media_thumb || it.media_path} full={it.media_path} type={it.media_type} title={it.judul} className=\"rounded-2xl overflow-hidden aspect-video bg-slate-900 mb-3\" />\n                      )\n                    ) : null}"

if (c.indexOf('drivePreviewUrl(it.media_path)') !== -1) {
  console.log('[SUDAH ADA] LogbookDetail sudah mendukung Drive')
} else if (c.includes(polaLama1)) {
  c = c.replace(polaLama1, polaBaru)
  berubah = true
  console.log('[BERHASIL] LogbookDetail diperbarui (pola 1)')
} else if (c.includes(polaLama2)) {
  c = c.replace(polaLama2, polaBaru)
  berubah = true
  console.log('[BERHASIL] LogbookDetail diperbarui (pola 2)')
} else if (c.includes(polaLama3)) {
  c = c.replace(polaLama3, polaBaru)
  berubah = true
  console.log('[BERHASIL] LogbookDetail diperbarui (pola 3)')
} else {
  // Pendekatan lebih agresif: cari berdasarkan pattern yang lebih longgar
  const idxStart = c.indexOf('export function LogbookDetail(props) {')
  if (idxStart !== -1) {
    const idxEnd = c.indexOf('export function GalleryCard(props) {', idxStart)
    if (idxEnd !== -1) {
      const blokLogbookDetail = c.slice(idxStart, idxEnd)
      
      // Cari pola media_path dengan youtube
      const reMedia = /\{it\.media_path\s*\?\s*\(\s*it\.media_source\s*===\s*'youtube'\s*\?\s*\(\s*<PemutarVideo[^>]*\/>\s*\)\s*:\s*\(\s*<ZoomableMedia[^>]*\/>\s*\)\s*\)\s*:\s*null\}/s
      
      if (reMedia.test(blokLogbookDetail)) {
        const blokBaru = blokLogbookDetail.replace(reMedia, polaBaru)
        c = c.slice(0, idxStart) + blokBaru + c.slice(idxEnd)
        berubah = true
        console.log('[BERHASIL] LogbookDetail diperbarui (regex fleksibel)')
      } else {
        console.log('[TIDAK KETEMU] Pola media di LogbookDetail dengan regex')
        console.log('[INFO] Mencoba pendekatan manual...')
        
        // Cari dan ganti manual
        const cariYoutube = "it.media_source === 'youtube' ? ("
        const cariZoom = "<ZoomableMedia src={it.media_thumb || it.media_path}"
        
        const idxYT = blokLogbookDetail.indexOf(cariYoutube)
        const idxZoom = blokLogbookDetail.indexOf(cariZoom, idxYT)
        
        if (idxYT !== -1 && idxZoom !== -1) {
          // Sisipkan branch drive sebelum ZoomableMedia
          const beforeZoom = blokLogbookDetail.slice(0, idxZoom)
          const afterZoom = blokLogbookDetail.slice(idxZoom)
          
          const sisipan = "it.media_source === 'drive' ? (\n                        <iframe key={it.media_path} src={drivePreviewUrl(it.media_path)} title={it.judul} allow=\"autoplay; encrypted-media; fullscreen\" allowFullScreen className=\"aspect-video w-full rounded-2xl border-0 bg-black mb-3\" />\n                      ) : (\n                        "
          
          const blokBaru = beforeZoom + sisipan + afterZoom
          c = c.slice(0, idxStart) + blokBaru + c.slice(idxEnd)
          berubah = true
          console.log('[BERHASIL] LogbookDetail diperbarui (manual insert)')
        } else {
          console.log('[GAGAL] Tidak dapat menemukan pola media di LogbookDetail')
        }
      }
    } else {
      console.log('[TIDAK KETEMU] Batas akhir LogbookDetail')
    }
  } else {
    console.log('[TIDAK KETEMU] Fungsi LogbookDetail')
  }
}

if (berubah) {
  simpan(FILE_CARDS, c)
  console.log('')
  console.log('Verifikasi:')
  const v = baca(FILE_CARDS)
  console.log((v.indexOf('drivePreviewUrl(it.media_path)') !== -1 ? '[OK] ' : '[BELUM] ') + 'LogbookDetail mendukung iframe Drive')
  console.log((v.indexOf("from '../lib/drive.js'") !== -1 ? '[OK] ' : '[BELUM] ') + 'Import drive.js tersedia')
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Yang diperbaiki:')
console.log('1. LogbookDetail kini menampilkan iframe preview Google Drive untuk video bersumber drive.')
console.log('2. Import drivePreviewUrl ditambahkan ke cards.jsx.')
console.log('3. Fallback tetap ke ZoomableMedia untuk media R2 biasa.')