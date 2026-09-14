const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_C = 'src/components/cards.jsx'

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }

if (!fs.existsSync(path.join(root, FILE_C))) {
  console.log('[GAGAL] cards.jsx tidak ditemukan')
  process.exit(1)
}
let c = baca(FILE_C)

function potongFungsi(isi, nama) {
  const re = new RegExp('export function ' + nama + '\\s*\\(')
  const m = re.exec(isi)
  if (!m) return null
  let brace = 0, akhir = -1, inStr = false, strCh = ''
  for (let i = m.index; i < isi.length; i++) {
    const ch = isi[i]
    const prev = i > 0 ? isi[i - 1] : ''
    if (inStr) { if (ch === strCh && prev !== '\\') inStr = false; continue }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue }
    if (ch === '{') brace++
    if (ch === '}') { brace--; if (brace === 0) { akhir = i + 1; break } }
  }
  if (akhir === -1) return null
  return { mulai: m.index, akhir: akhir }
}

const TARGET = [
  { nama: 'AttendanceCard', size: 'md' },
  { nama: 'AttendanceDetail', size: 'lg' }
]

let berubahAny = false
TARGET.forEach(function (t) {
  const r = potongFungsi(c, t.nama)
  if (!r) { console.log('[TIDAK KETEMU] Fungsi ' + t.nama + ' di cards.jsx'); return }
  const body = c.slice(r.mulai, r.akhir)
  if (body.indexOf('<Avatar') !== -1) { console.log('[SUDAH ADA] Avatar di ' + t.nama); return }

  const AV = '<Avatar src={props.row && props.row.mahasiswa && props.row.mahasiswa.foto_profil ? props.row.mahasiswa.foto_profil : null} nama={props.row && props.row.mahasiswa ? props.row.mahasiswa.nama : \'Mahasiswa\'} size="' + t.size + '" />'
  let baru = body
  let pola = ''

  /* Pola 1: wadah flex yang langsung diikuti blok min-w-0 */
  const p1 = baru.replace(/(<div\s+className="flex\s+items-(?:start|center)[^"]*"\s*>)\s*(<div\s+className="min-w-0)/, function (m, a, b) {
    return a + '\n' + AV + '\n' + b
  })
  if (p1 !== baru) { baru = p1; pola = 'flex+min-w-0' }

  /* Pola 2: blok min-w-0 berdiri sendiri */
  if (!pola) {
    const p2 = baru.replace(/<div\s+className="min-w-0/, function (m) { return AV + '\n' + m })
    if (p2 !== baru) { baru = p2; pola = 'min-w-0' }
  }

  /* Pola 3: bungkus paragraf atau heading nama bersama Avatar dalam baris flex */
  if (!pola) {
    const p3 = baru.replace(/<(p|h2|h3|h4)\b[^>]*>\s*\{[^<>]*?\.nama[^<>]*?\}\s*<\/\1>(\s*<(?:p|h2|h3|h4)\b[^>]*>[\s\S]{0,220}?<\/(?:p|h2|h3|h4)>)?/, function (m) {
      return '<div className="flex items-center gap-3">' + AV + '<div className="min-w-0 flex-1">' + m + '</div></div>'
    })
    if (p3 !== baru) { baru = p3; pola = 'bungkus-nama' }
  }

  if (!pola) {
    console.log('[TIDAK KETEMU] Anchor di ' + t.nama + '. Cuplikan isi fungsi:')
    console.log(body.slice(0, 600))
    return
  }

  c = c.slice(0, r.mulai) + baru + c.slice(r.akhir)
  berubahAny = true
  console.log('[BERHASIL] Avatar dipasang di ' + t.nama + ' lewat pola ' + pola)
})

if (berubahAny) {
  fs.writeFileSync(path.join(root, FILE_C), c, 'utf8')
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Catatan:')
console.log('1. Avatar merujuk props.row sehingga aman apa pun nama variabel lokal di dalam fungsi.')
console.log('2. Pola bungkus-nama membuat foto berdampingan dengan nama dan baris identitas di bawahnya tanpa mengubah struktur lain.')
console.log('3. Bila masih ada fungsi yang melaporkan TIDAK KETEMU, cuplikan isi fungsinya tercetak otomatis; salin ke chat supaya aku kunci pola persisnya.')