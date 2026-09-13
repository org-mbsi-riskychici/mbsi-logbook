const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memperbaiki scope OAuth dan jalur pemulihan...')
console.log('')

/* ===== 1. setup-youtube-token.cjs: tambah scope baca ===== */
const FILE_S = 'setup-youtube-token.cjs'
if (!fs.existsSync(path.join(root, FILE_S))) {
  console.log('[TIDAK KETEMU] ' + FILE_S)
} else {
  let s = baca(FILE_S)
  const cariS = `const scope = 'https://www.googleapis.com/auth/youtube.upload'`
  const gantiS = `const scope = 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly'`
  if (s.includes('youtube.readonly')) {
    console.log('[SUDAH ADA] Scope baca di setup-youtube-token.cjs')
  } else if (s.includes(cariS)) {
    s = s.replace(cariS, gantiS)
    simpan(FILE_S, s)
    console.log('[BERHASIL] Scope baca ditambahkan di setup-youtube-token.cjs')
  } else {
    console.log('[TIDAK KETEMU] Baris scope di setup-youtube-token.cjs')
  }
}

/* ===== 2. api/youtube/latest.js: sertakan alasan asli dari YouTube ===== */
const FILE_L = 'api/youtube/latest.js'
if (!fs.existsSync(path.join(root, FILE_L))) {
  console.log('[TIDAK KETEMU] ' + FILE_L)
} else {
  let l = baca(FILE_L)
  const cariL = `if (!r.ok) return res.status(502).json({ error: 'Gagal memeriksa video terbaru' })`
  const gantiL = `if (!r.ok) { const t = await r.text(); return res.status(502).json({ error: 'Gagal memeriksa video terbaru: ' + r.status + ' ' + t }) }`
  if (l.includes('Gagal memeriksa video terbaru: ')) {
    console.log('[SUDAH ADA] Detail error di api/youtube/latest.js')
  } else if (l.includes(cariL)) {
    l = l.replace(cariL, gantiL)
    simpan(FILE_L, l)
    console.log('[BERHASIL] Detail error ditambahkan di api/youtube/latest.js')
  } else {
    console.log('[TIDAK KETEMU] Baris 502 di api/youtube/latest.js')
  }
}

/* ===== 3. vite.config.js: detail error middleware latest ===== */
const FILE_V = 'vite.config.js'
let v = baca(FILE_V)
const cariV = `if (!r.ok) { res.statusCode = 502; res.end(JSON.stringify({ error: 'Gagal memeriksa video terbaru' })); return }`
const gantiV = `if (!r.ok) { const t = await r.text(); res.statusCode = 502; res.end(JSON.stringify({ error: 'Gagal memeriksa video terbaru: ' + r.status + ' ' + t })); return }`
if (v.includes('Gagal memeriksa video terbaru: ')) {
  console.log('[SUDAH ADA] Detail error middleware latest')
} else if (v.includes(cariV)) {
  v = v.replace(cariV, gantiV)
  simpan(FILE_V, v)
  console.log('[BERHASIL] Detail error middleware latest ditambahkan')
} else {
  console.log('[TIDAK KETEMU] Baris 502 middleware latest di vite.config.js')
}

/* ===== 4. youtube.js: ulangi pemulihan hingga 3 kali ===== */
const FILE_Y = 'src/lib/youtube.js'
let y = baca(FILE_Y)
if (y.includes('for (let percobaan = 0')) {
  console.log('[SUDAH ADA] Pengulangan pemulihan di youtube.js')
} else {
  const regexY = /const v = await fetch\('\/api\/youtube\/latest', \{[\s\S]*?secara manual\.'\)/
  const gantiY = `for (let percobaan = 0; percobaan < 3; percobaan++) {
    if (percobaan > 0) await new Promise(function (tunggu) { setTimeout(tunggu, 4000) })
    const v = await fetch('/api/youtube/latest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({})
    })
    if (v.ok) {
      try {
        const j = await v.json()
        if (j && j.videoId) return { videoId: j.videoId }
      } catch (e) {
        console.warn('Respons pemulihan bukan JSON, dilewati.')
      }
    } else {
      const teks = await v.text().catch(function () { return '' })
      console.warn('Pemulihan percobaan ' + (percobaan + 1) + ' gagal: ' + teks)
    }
  }
  throw new Error('Upload selesai tetapi id video tidak terbaca. Video kemungkinan sudah masuk channel; tempel link YouTube secara manual.')`
  if (regexY.test(y)) {
    y = y.replace(regexY, gantiY)
    simpan(FILE_Y, y)
    console.log('[BERHASIL] Pengulangan pemulihan dipasang di youtube.js')
  } else {
    console.log('[TIDAK KETEMU] Blok pemulihan di youtube.js')
  }
}

console.log('')
console.log('Selesai. Lanjutkan dengan langkah manual berikut:')
console.log('1. Jalankan: node setup-youtube-token.cjs')
console.log('2. Browser terbuka dan kini meminta dua izin: kelola upload dan lihat video YouTube kamu.')
console.log('3. Setujui, lalu salin refresh token BARU yang tercetak di terminal.')
console.log('4. Ganti nilai YOUTUBE_REFRESH_TOKEN di .env.local dengan token baru itu.')
console.log('5. Restart dev server: Ctrl+C lalu npm run dev -- --host')
console.log('6. Uji upload video kecil lagi dari dashboard.')
console.log('7. Sebelum deploy, perbarui juga YOUTUBE_REFRESH_TOKEN di Environment Variables Vercel.')