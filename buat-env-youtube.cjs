const fs = require('fs')
const path = require('path')
const root = process.cwd()
for (let n = 1; n <= 6; n++) {
  const file = path.join(root, '.env.youtube-' + n)
  if (fs.existsSync(file)) { console.log('[SUDAH ADA] .env.youtube-' + n); continue }
  const isi = '# Kredensial Google Cloud project nomor ' + n + '\n' +
    '# Isi YOUTUBE_CLIENT_ID dan YOUTUBE_CLIENT_SECRET setelah membuat OAuth Client ID\n' +
    '# YOUTUBE_REFRESH_TOKEN terisi otomatis oleh setup-youtube-token-multi.cjs ' + n + '\n' +
    'YOUTUBE_CLIENT_ID=\nYOUTUBE_CLIENT_SECRET=\nYOUTUBE_REFRESH_TOKEN=\n'
  fs.writeFileSync(file, isi, 'utf8')
  console.log('[BERHASIL] .env.youtube-' + n + ' dibuat')
}
const giPath = path.join(root, '.gitignore')
if (fs.existsSync(giPath)) {
  let gi = fs.readFileSync(giPath, 'utf8')
  if (!gi.includes('.env.youtube-')) {
    gi = gi.trimEnd() + '\n.env.youtube-*\n'
    fs.writeFileSync(giPath, gi, 'utf8')
    console.log('[BERHASIL] Pola .env.youtube-* ditambahkan ke .gitignore')
  }
}
console.log('')
console.log('Isi Client ID dan Client Secret tiap project ke file masing-masing, lalu lanjut Bagian 3.')