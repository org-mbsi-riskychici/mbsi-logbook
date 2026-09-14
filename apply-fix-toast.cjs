const fs = require('fs')
 const path = require('path')
 const root = process.cwd()
 function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
 function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

 console.log('Mulai memperbaiki pemasangan toast yang belum selesai...')
 console.log('')

 /* ===== 1. App.jsx: bungkus ToastProvider di dalam ThemeProvider ===== */
 let a = baca('src/App.jsx')
 let aBerubah = false
 if (!a.includes('<ToastProvider>')) {
   const baru = a.replace(/(<ThemeProvider>\n)([ \t]*)(<BrowserRouter)/, '$1$2<ToastProvider>\n$2$3')
   if (baru !== a) { a = baru; aBerubah = true; console.log('[BERHASIL] Pembukaan <ToastProvider> di App.jsx') }
   else console.log('[TIDAK KETEMU] Pola pembukaan ToastProvider di App.jsx')
 } else console.log('[SUDAH ADA] Pembukaan <ToastProvider>')
 if (!a.includes('</ToastProvider>')) {
   const baru = a.replace(/([ \t]*)<\/BrowserRouter>/, '$1</BrowserRouter>\n$1</ToastProvider>')
   if (baru !== a) { a = baru; aBerubah = true; console.log('[BERHASIL] Penutup </ToastProvider> di App.jsx') }
   else console.log('[TIDAK KETEMU] Pola penutup ToastProvider di App.jsx')
 } else console.log('[SUDAH ADA] Penutup </ToastProvider>')
 if (aBerubah) simpan('src/App.jsx', a)

 /* ===== 2. DashboardPage: inisialisasi useToast ===== */
 let d = baca('src/pages/DashboardPage.jsx')
 let dBerubah = false
 if (!d.includes('const toast = useToast()')) {
   const baru = d.replace(/const \{ mahasiswa, loading \} = useAuth\(\)\n([ \t]*)const \[tab, setTab\]/, 'const { mahasiswa, loading } = useAuth()\n$1const toast = useToast()\n$1const [tab, setTab]')
   if (baru !== d) { d = baru; dBerubah = true; console.log('[BERHASIL] Inisialisasi const toast = useToast()') }
   else console.log('[TIDAK KETEMU] Pola inisialisasi useToast')
 } else console.log('[SUDAH ADA] Inisialisasi useToast')

 /* ===== 3. Toast sukses untuk setiap operasi CRUD ===== */
 const daftarSukses = [
   {
     nama: 'toast sukses logbook',
     cek: 'toast.sukses(menambahLog',
     pola: /([ \t]*)if \(menambahLog\) setLogPage\(1\)/,
     ganti: '$1if (menambahLog) setLogPage(1)\n$1toast.sukses(menambahLog ? \'Logbook berhasil disimpan\' : \'Logbook berhasil diperbarui\')'
   },
   {
     nama: 'toast sukses galeri',
     cek: 'toast.sukses(menambahGal',
     pola: /([ \t]*)if \(menambahGal\) setGalPage\(1\)/,
     ganti: '$1if (menambahGal) setGalPage(1)\n$1toast.sukses(menambahGal ? \'Media galeri berhasil disimpan\' : \'Media galeri berhasil diperbarui\')'
   },
   {
     nama: 'toast sukses daftar hadir',
     cek: 'toast.sukses(menambahHadir',
     pola: /([ \t]*)if \(menambahHadir\) setHadirPage\(1\)/,
     ganti: '$1if (menambahHadir) setHadirPage(1)\n$1toast.sukses(menambahHadir ? \'Daftar hadir berhasil disimpan\' : \'Daftar hadir berhasil diperbarui\')'
   },
   {
     nama: 'toast sukses simpan foto profil',
     cek: "toast.sukses('Foto profil berhasil disimpan')",
     pola: /([ \t]*)setFotoFile\(null\)\n([ \t]*)\} catch \(err\) \{\n([ \t]*)toast\.gagal\('Gagal upload foto profil: ' \+ err\.message\)/,
     ganti: '$1setFotoFile(null)\n$1toast.sukses(\'Foto profil berhasil disimpan\')\n$2} catch (err) {\n$3toast.gagal(\'Gagal upload foto profil: \' + err.message)'
   },
   {
     nama: 'toast sukses hapus foto profil',
     cek: "toast.sukses('Foto profil berhasil dihapus')",
     pola: /([ \t]*)setVersiFoto\(function \(v\) \{ return v \+ 1 \}\)\n([ \t]*)\} catch \(err\) \{\n([ \t]*)toast\.gagal\('Gagal menghapus foto profil: ' \+ err\.message\)/,
     ganti: '$1setVersiFoto(function (v) { return v + 1 })\n$1toast.sukses(\'Foto profil berhasil dihapus\')\n$2} catch (err) {\n$3toast.gagal(\'Gagal menghapus foto profil: \' + err.message)'
   },
   {
     nama: 'toast sukses hapus data',
     cek: "toast.sukses('Data berhasil dihapus')",
     pola: /([ \t]*)await refresh\(\)\n([ \t]*)\}\n([ \t]*)function confirmInfo/,
     ganti: '$1await refresh()\n$1toast.sukses(\'Data berhasil dihapus\')\n$2}\n$3function confirmInfo'
   }
 ]
 daftarSukses.forEach(function (s) {
   if (d.includes(s.cek)) { console.log('[SUDAH ADA] ' + s.nama); return }
   if (s.pola.test(d)) {
     d = d.replace(s.pola, s.ganti)
     dBerubah = true
     console.log('[BERHASIL] ' + s.nama)
   } else {
     console.log('[TIDAK KETEMU] ' + s.nama)
   }
 })
 if (dBerubah) simpan('src/pages/DashboardPage.jsx', d)

 /* ===== 4. Verifikasi akhir ===== */
 a = baca('src/App.jsx')
 d = baca('src/pages/DashboardPage.jsx')
 console.log('')
 console.log('Verifikasi akhir:')
 console.log((a.includes('<ToastProvider>') ? '[OK] ' : '[BELUM] ') + 'ToastProvider terpasang di App.jsx')
 console.log((d.includes('const toast = useToast()') ? '[OK] ' : '[BELUM] ') + 'useToast terinisialisasi di DashboardPage')
 console.log((d.includes('toast.sukses(menambahLog') ? '[OK] ' : '[BELUM] ') + 'Toast sukses logbook')
 console.log((d.includes('toast.sukses(menambahGal') ? '[OK] ' : '[BELUM] ') + 'Toast sukses galeri')
 console.log((d.includes('toast.sukses(menambahHadir') ? '[OK] ' : '[BELUM] ') + 'Toast sukses daftar hadir')
 console.log((d.includes("toast.sukses('Foto profil berhasil disimpan')") ? '[OK] ' : '[BELUM] ') + 'Toast sukses simpan foto profil')
 console.log((d.includes("toast.sukses('Foto profil berhasil dihapus')") ? '[OK] ' : '[BELUM] ') + 'Toast sukses hapus foto profil')
 console.log((d.includes("toast.sukses('Data berhasil dihapus')") ? '[OK] ' : '[BELUM] ') + 'Toast sukses hapus data')
 console.log('')
 console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')