#!/usr/bin/env node
const fs = require('fs')
const p = 'src/components/controls.jsx'
let c = fs.readFileSync(p, 'utf8')

// Menghapus duplikasi setOpen dan kurung kurawal penutup yang bocor ke luar fungsi
c = c.replace(
  /(\s*setOpen\(function \(o\) \{ return !o \}\)\s*\})\s*setOpen\(function \(o\) \{ return !o \}\)\s*\}/, 
  '$1'
)

fs.writeFileSync(p, c)
console.log('Duplikasi dihapus, syntax error teratasi. Silakan jalankan npm run dev lagi.')