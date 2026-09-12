const fs = require('fs')
const path = require('path')

const root = process.cwd()
const targets = []

function kumpul(dir) {
  const entries = fs.readdirSync(path.join(root, dir), { withFileTypes: true })
  for (const e of entries) {
    const rel = dir + '/' + e.name
    if (e.isDirectory()) kumpul(rel)
    else if (e.name.endsWith('.js') || e.name.endsWith('.jsx')) targets.push(rel)
  }
}

if (fs.existsSync(path.join(root, 'src'))) kumpul('src')
if (fs.existsSync(path.join(root, 'api'))) kumpul('api')
for (const extra of ['supabase/schema.sql', 'README.md']) {
  if (fs.existsSync(path.join(root, extra))) targets.push(extra)
}

let total = 0
for (const rel of targets) {
  const full = path.join(root, rel)
  const asli = fs.readFileSync(full, 'utf8')
  const jumlah = (asli.match(/peserta/g) || []).length + (asli.match(/Peserta/g) || []).length
  if (jumlah > 0) {
    const baru = asli.split('peserta').join('mahasiswa').split('Peserta').join('Mahasiswa')
    fs.writeFileSync(full, baru, 'utf8')
    total += jumlah
    console.log('[DIGANTI] ' + rel + ' (' + jumlah + ' kata)')
  } else {
    console.log('[TETAP] ' + rel)
  }
}

console.log('')
console.log('Selesai. Total kata yang diganti: ' + total)
console.log('Pastikan langkah SQL di Supabase sudah dijalankan sebelum menguji aplikasi.')