const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_D = 'src/pages/DashboardPage.jsx'

if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[GAGAL] DashboardPage.jsx tidak ditemukan')
  process.exit(1)
}
let d = fs.readFileSync(path.join(root, FILE_D), 'utf8').replace(/\r\n/g, '\n')

if (d.includes('const [ytQuotaLoading, setYtQuotaLoading]')) {
  console.log('[SUDAH ADA] State ytQuotaLoading, tidak ada yang perlu ditambah')
} else {
  const regex = /([ \t]*)const \[ytQuota, setYtQuota\] = useState\([^\n]*\)\n/
  if (regex.test(d)) {
    d = d.replace(regex, function (m, indent) {
      return m + indent + 'const [ytQuotaLoading, setYtQuotaLoading] = useState(true)\n'
    })
    fs.writeFileSync(path.join(root, FILE_D), d, 'utf8')
    console.log('[BERHASIL] State ytQuotaLoading ditambahkan tepat di bawah state ytQuota')
  } else {
    console.log('[TIDAK KETEMU] Baris state ytQuota. Tambahkan manual baris berikut tepat di bawahnya:')
    console.log('  const [ytQuotaLoading, setYtQuotaLoading] = useState(true)')
  }
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('Error ytQuotaLoading is not defined akan hilang setelah perbaikan ini.')