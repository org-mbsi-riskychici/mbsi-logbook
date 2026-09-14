const fs = require('fs')
const path = require('path')

const filePath = path.join(process.cwd(), 'src/components/ui.jsx')
let code = fs.readFileSync(filePath, 'utf8')

const startIdx = code.indexOf('export function Avatar(props) {')
if (startIdx === -1) {
  console.log('Fungsi Avatar tidak ditemukan di ui.jsx. File mungkin sudah benar.')
  process.exit(0)
}

let braceCount = 0
let endIdx = -1
let inString = false
let stringChar = ''
let inComment = false
let inLineComment = false

for (let i = startIdx; i < code.length; i++) {
  const char = code[i]
  const nextChar = i < code.length - 1 ? code[i+1] : ''
  const prevChar = i > 0 ? code[i-1] : ''
  
  if (inLineComment) {
    if (char === '\n') inLineComment = false
    continue
  }
  if (inComment) {
    if (char === '*' && nextChar === '/') {
      inComment = false
      i++
    }
    continue
  }
  if (inString) {
    if (char === stringChar && prevChar !== '\\') {
      inString = false
    }
    continue
  }
  
  if (char === '/' && nextChar === '/') {
    inLineComment = true
    continue
  }
  if (char === '/' && nextChar === '*') {
    inComment = true
    i++
    continue
  }
  if (char === '"' || char === "'" || char === '`') {
    inString = true
    stringChar = char
    continue
  }
  
  if (char === '{') braceCount++
  if (char === '}') {
    braceCount--
    if (braceCount === 0) {
      endIdx = i + 1
      break
    }
  }
}

if (endIdx === -1) {
  console.log('Gagal menemukan batas akhir fungsi Avatar.')
  process.exit(1)
}

const avatarBlock = code.substring(startIdx, endIdx)
code = code.substring(0, startIdx) + code.substring(endIdx)

if (code.includes('export function Avatar(props) {')) {
  console.log('Avatar sudah ada di tempat lain yang valid.')
} else {
  code = code.trimEnd() + '\n\n' + avatarBlock + '\n'
  console.log('Avatar berhasil dipindahkan ke akhir file (top-level).')
}

fs.writeFileSync(filePath, code, 'utf8')
console.log('')
console.log('Selesai. Vite akan otomatis reload. Jika masih error, restart dev server dengan Ctrl+C lalu npm run dev.')