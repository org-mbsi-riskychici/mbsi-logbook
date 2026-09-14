const fs = require('fs')
 const path = require('path')
 const root = process.cwd()
 function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
 function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
 function ganti(rel, cari, gantiDengan, label) {
   if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan (' + label + ')'); return }
   let isi = baca(rel)
   if (isi.includes(gantiDengan)) { console.log('[SUDAH ADA] ' + label); return }
   if (!isi.includes(cari)) { console.log('[TIDAK KETEMU] ' + label + ' di ' + rel); return }
   isi = isi.replace(cari, gantiDengan)
   simpan(rel, isi)
   console.log('[BERHASIL] ' + label)
 }
 function gantiSemua(rel, cari, gantiDengan, label) {
   if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan (' + label + ')'); return }
   let isi = baca(rel)
   if (isi.includes(gantiDengan)) { console.log('[SUDAH ADA] ' + label); return }
   if (!isi.includes(cari)) { console.log('[TIDAK KETEMU] ' + label + ' di ' + rel); return }
   isi = isi.split(cari).join(gantiDengan)
   simpan(rel, isi)
   console.log('[BERHASIL] ' + label)
 }
 function sisipAkhir(rel, cari, teks, label) {
   if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan (' + label + ')'); return }
   let isi = baca(rel)
   if (isi.includes(label)) { console.log('[SUDAH ADA] ' + label); return }
   isi = isi.trimEnd() + '\n\n' + teks + '\n'
   simpan(rel, isi)
   console.log('[BERHASIL] ' + label)
 }
 console.log('Mulai memasang sistem notifikasi toast untuk CRUD...')
 console.log('')
 /* ===== 1. ui.jsx: tambahkan createContext dan useContext ke import ===== */
 ganti('src/components/ui.jsx',
   "import { useEffect, useRef, useState } from 'react'",
   "import { createContext, useContext, useEffect, useRef, useState } from 'react'",
   'import createContext dan useContext di ui.jsx')
 /* ===== 2. ui.jsx: tambahkan ToastProvider dan useToast ===== */
 sisipAkhir('src/components/ui.jsx',
   'ToastProvider',
   `const ToastContext = createContext(null)
 export function ToastProvider(props) {
   const [toasts, setToasts] = useState([])
   function tutupToast(id) {
     setToasts(function (prev) { return prev.filter(function (t) { return t.id !== id }) })
   }
   function tambahToast(tipe, pesan) {
     const id = Date.now() + Math.random()
     setToasts(function (prev) { return prev.concat([{ id: id, tipe: tipe, pesan: pesan }]) })
     setTimeout(function () {
       setToasts(function (prev) { return prev.filter(function (t) { return t.id !== id }) })
     }, 4000)
   }
   function toastSukses(pesan) { tambahToast('sukses', pesan) }
   function toastGagal(pesan) { tambahToast('gagal', pesan) }
   return (
     <ToastContext.Provider value={{ sukses: toastSukses, gagal: toastGagal }}>
       {props.children}
       <div className="fixed top-5 right-5 z-[100] flex w-full max-w-sm flex-col gap-3 pointer-events-none">
         {toasts.map(function (t) {
           const sukses = t.tipe === 'sukses'
           return (
             <div key={t.id} className={'anim-toast pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-lg ' + (sukses ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50')}>
               <span className={'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ' + (sukses ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white')}>
                 <SizedIcon name={sukses ? 'check' : 'close'} size={12} />
               </span>
               <p className={'flex-1 text-sm font-semibold ' + (sukses ? 'text-emerald-800' : 'text-red-700')}>{t.pesan}</p>
               <button type="button" onClick={function () { tutupToast(t.id) }} className="shrink-0 text-slate-400 hover:text-slate-600">
                 <SizedIcon name="close" size={14} />
               </button>
             </div>
           )
         })}
       </div>
     </ToastContext.Provider>
   )
 }
 export function useToast() {
   return useContext(ToastContext)
 }`,
   'ToastProvider dan useToast di ui.jsx')
 /* ===== 3. App.jsx: import ToastProvider ===== */
 ganti('src/App.jsx',
   "import { ThemeProvider } from './lib/theme.jsx'",
   "import { ThemeProvider } from './lib/theme.jsx'\n import { ToastProvider } from './components/ui.jsx'",
   'import ToastProvider di App.jsx')
 /* ===== 4. App.jsx: wrap dengan ToastProvider ===== */
 ganti('src/App.jsx',
   `<ThemeProvider>
       <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
         <ScrollToTop />`,
   `<ThemeProvider>
       <ToastProvider>
       <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
         <ScrollToTop />`,
   'wrap buka ToastProvider')
 ganti('src/App.jsx',
   `</BrowserRouter>
     </ThemeProvider>`,
   `</BrowserRouter>
       </ToastProvider>
     </ThemeProvider>`,
   'wrap tutup ToastProvider')
 /* ===== 5. DashboardPage.jsx: import useToast ===== */
 ganti('src/pages/DashboardPage.jsx',
   "import { EmptyState, Modal, ConfirmModal, inputCls, labelCls, btnPrimary, btnSmall, AutoTextArea, Pagination } from '../components/ui.jsx'",
   "import { EmptyState, Modal, ConfirmModal, inputCls, labelCls, btnPrimary, btnSmall, AutoTextArea, Pagination, useToast } from '../components/ui.jsx'",
   'import useToast di DashboardPage')
 /* ===== 6. DashboardPage.jsx: inisialisasi useToast ===== */
 ganti('src/pages/DashboardPage.jsx',
   'const { mahasiswa, loading } = useAuth()\n    const [tab, setTab]',
   'const { mahasiswa, loading } = useAuth()\n    const toast = useToast()\n    const [tab, setTab]',
   'inisialisasi useToast di DashboardPage')
 /* ===== 7. DashboardPage.jsx: ganti alert error jadi toast gagal ===== */
 ganti('src/pages/DashboardPage.jsx',
   "if (!id) { alert('Link video tidak valid pada kegiatan ' + (i + 1) + '.'); setBusy(false); return }",
   "if (!id) { toast.gagal('Link video tidak valid pada kegiatan ' + (i + 1) + '.'); setBusy(false); return }",
   'toast link video tidak valid logbook')
 gantiSemua('src/pages/DashboardPage.jsx',
   "if (ytQuota.remaining <= 0) { alert('Kuota upload video hari ini sudah habis. Gunakan link video.'); setBusy(false); return }",
   "if (ytQuota.remaining <= 0) { toast.gagal('Kuota upload video hari ini sudah habis. Gunakan link video.'); setBusy(false); return }",
   'toast kuota habis')
 ganti('src/pages/DashboardPage.jsx',
   "alert('Tambahkan minimal satu kegiatan dengan judul.'); setBusy(false); return",
   "toast.gagal('Tambahkan minimal satu kegiatan dengan judul.'); setBusy(false); return",
   'toast minimal satu kegiatan')
 ganti('src/pages/DashboardPage.jsx',
   "alert('Gagal menyimpan logbook: ' + err.message)",
   "toast.gagal('Gagal menyimpan logbook: ' + err.message)",
   'toast gagal simpan logbook')
 ganti('src/pages/DashboardPage.jsx',
   "if (!id) { alert('Link video tidak valid.'); setBusy(false); return }",
   "if (!id) { toast.gagal('Link video tidak valid.'); setBusy(false); return }",
   'toast link video tidak valid galeri')
 ganti('src/pages/DashboardPage.jsx',
   "alert('Galeri wajib memiliki media. Pilih file foto atau video terlebih dahulu.'); setBusy(false); return",
   "toast.gagal('Galeri wajib memiliki media. Pilih file foto atau video terlebih dahulu.'); setBusy(false); return",
   'toast galeri wajib media')
 ganti('src/pages/DashboardPage.jsx',
   "alert('Gagal menyimpan galeri: ' + err.message)",
   "toast.gagal('Gagal menyimpan galeri: ' + err.message)",
   'toast gagal simpan galeri')
 ganti('src/pages/DashboardPage.jsx',
   "if (f.size > 5 * 1024 * 1024) { alert('Ukuran foto maksimal 5 MB.'); e.target.value = ''; return }",
   "if (f.size > 5 * 1024 * 1024) { toast.gagal('Ukuran foto maksimal 5 MB.'); e.target.value = ''; return }",
   'toast ukuran foto maksimal')
 ganti('src/pages/DashboardPage.jsx',
   "if (!fotoFile) { alert('Pilih file foto terlebih dahulu.'); return }",
   "if (!fotoFile) { toast.gagal('Pilih file foto terlebih dahulu.'); return }",
   'toast pilih foto dulu')
 ganti('src/pages/DashboardPage.jsx',
   "alert('Gagal upload foto profil: ' + err.message)",
   "toast.gagal('Gagal upload foto profil: ' + err.message)",
   'toast gagal upload foto')
 ganti('src/pages/DashboardPage.jsx',
   "alert('Gagal menghapus foto profil: ' + err.message)",
   "toast.gagal('Gagal menghapus foto profil: ' + err.message)",
   'toast gagal hapus foto')
 ganti('src/pages/DashboardPage.jsx',
   "if (res.error) { alert('Kamu sudah punya catatan hadir di tanggal tersebut.'); setBusy(false); return }",
   "if (res.error) { toast.gagal('Kamu sudah punya catatan hadir di tanggal tersebut.'); setBusy(false); return }",
   'toast sudah punya catatan hadir')
 /* ===== 8. DashboardPage.jsx: tambahkan toast sukses setelah CRUD berhasil ===== */
 ganti('src/pages/DashboardPage.jsx',
   'await refresh()\n        if (menambahLog) setLogPage(1)\n      } catch (err) {\n        toast.gagal(\'Gagal menyimpan logbook: \' + err.message)',
   'await refresh()\n        if (menambahLog) setLogPage(1)\n        toast.sukses(menambahLog ? \'Logbook berhasil disimpan\' : \'Logbook berhasil diperbarui\')\n      } catch (err) {\n        toast.gagal(\'Gagal menyimpan logbook: \' + err.message)',
   'toast sukses logbook')
 ganti('src/pages/DashboardPage.jsx',
   'await refresh()\n         if (menambahGal) setGalPage(1)\n      } catch (err) {\n        toast.gagal(\'Gagal menyimpan galeri: \' + err.message)',
   'await refresh()\n         if (menambahGal) setGalPage(1)\n        toast.sukses(menambahGal ? \'Media galeri berhasil disimpan\' : \'Media galeri berhasil diperbarui\')\n      } catch (err) {\n        toast.gagal(\'Gagal menyimpan galeri: \' + err.message)',
   'toast sukses galeri')
 ganti('src/pages/DashboardPage.jsx',
   'await refresh()\n       if (menambahHadir) setHadirPage(1)\n      setInfoProses(\'\')',
   'await refresh()\n       if (menambahHadir) setHadirPage(1)\n      toast.sukses(menambahHadir ? \'Daftar hadir berhasil disimpan\' : \'Daftar hadir berhasil diperbarui\')\n      setInfoProses(\'\')',
   'toast sukses daftar hadir')
 ganti('src/pages/DashboardPage.jsx',
   'await refresh()\n    }\n    async function executeDelete()',
   'await refresh()\n       toast.sukses(\'Foto profil berhasil disimpan\')\n    }\n    async function executeDelete()',
   'toast sukses foto profil')
 ganti('src/pages/DashboardPage.jsx',
   'setVersiFoto(function (v) { return v + 1 })\n      } catch (err) {\n        toast.gagal(\'Gagal menghapus foto profil: \' + err.message)',
   'setVersiFoto(function (v) { return v + 1 })\n        toast.sukses(\'Foto profil berhasil dihapus\')\n      } catch (err) {\n        toast.gagal(\'Gagal menghapus foto profil: \' + err.message)',
   'toast sukses hapus foto profil')
 ganti('src/pages/DashboardPage.jsx',
   'await refresh()\n    }\n    function confirmInfo()',
   'await refresh()\n       toast.sukses(\'Data berhasil dihapus\')\n    }\n    function confirmInfo()',
   'toast sukses hapus data')
 console.log('')
 console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
 console.log('')
 console.log('Fitur toast yang terpasang:')
 console.log('1. Notifikasi muncul di pojok kanan atas dengan tema BSI (hijau untuk sukses, merah untuk gagal).')
 console.log('2. Otomatis hilang setelah 4 detik, atau bisa ditutup manual dengan tombol X.')
 console.log('3. Semua alert() sudah diganti dengan toast agar tidak memblokir interaksi user.')
 console.log('4. Toast sukses muncul setelah: simpan/edit logbook, simpan/edit galeri, simpan/edit daftar hadir, simpan/hapus foto profil, hapus data.')
 console.log('5. Toast gagal muncul untuk: link video tidak valid, kuota habis, validasi form, dan error dari server.')