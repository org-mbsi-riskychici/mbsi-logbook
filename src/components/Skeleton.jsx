export function SkeletonLogbookCard() {
  return (
    <div className="card-hover flex h-full flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Media / carousel */}
      <div className="skeleton aspect-video w-full rounded-2xl"></div>

      {/* Badge kategori, unit, dan status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <div className="skeleton h-6 w-24 rounded-full"></div>
          <div className="skeleton h-6 w-20 rounded-full"></div>
        </div>
        <div className="skeleton h-6 w-20 rounded-full"></div>
      </div>

      {/* Tanggal, judul, dan daftar kegiatan */}
      <div>
        <div className="skeleton h-4 w-36 rounded-full"></div>
        <div className="skeleton mt-2 h-6 w-4/5 rounded-full"></div>
        <div className="skeleton mt-3 h-3 w-28 rounded-full"></div>
        <div className="mt-2 space-y-1">
          <div className="skeleton h-3 w-full rounded-full"></div>
          <div className="skeleton h-3 w-2/3 rounded-full"></div>
        </div>
      </div>

      {/* Footer: profil + tombol detail */}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-3">
          <div className="skeleton h-11 w-11 shrink-0" style={{ borderRadius: '28%' }}></div>
          <div className="space-y-1.5">
            <div className="skeleton h-3.5 w-28 rounded-full"></div>
            <div className="skeleton h-3 w-20 rounded-full"></div>
          </div>
        </div>
        <div className="skeleton h-8 w-16 rounded-xl"></div>
      </div>
    </div>
  )
}

export function SkeletonGalleryCard() {
  return (
    <div className="card-hover flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* Media menempel tepi atas sesuai GalleryCard asli */}
      <div className="skeleton aspect-video w-full"></div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Badge kegiatan dan tanggal */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <div className="skeleton h-6 w-24 rounded-full"></div>
            <div className="skeleton h-5 w-20 rounded-full"></div>
          </div>
          <div className="skeleton h-3 w-16 rounded-full"></div>
        </div>

        {/* Judul dan deskripsi */}
        <div className="skeleton h-5 w-3/4 rounded-full"></div>
        <div className="space-y-1.5">
          <div className="skeleton h-3.5 w-full rounded-full"></div>
          <div className="skeleton h-3.5 w-2/3 rounded-full"></div>
        </div>

        {/* Footer: profil + keterangan */}
        <div className="mt-auto space-y-3 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-3">
            <div className="skeleton h-11 w-11 shrink-0" style={{ borderRadius: '28%' }}></div>
            <div className="space-y-1.5">
              <div className="skeleton h-3.5 w-28 rounded-full"></div>
              <div className="skeleton h-3 w-20 rounded-full"></div>
            </div>
          </div>
          <div className="skeleton h-3 w-40 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonAttendanceCard() {
  return (
    <div className="card-hover flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Tanggal + profil + badge status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="skeleton h-4 w-40 rounded-full"></div>
          <div className="mt-4 flex items-center gap-3">
            <div className="skeleton h-11 w-11 shrink-0" style={{ borderRadius: '28%' }}></div>
            <div className="space-y-1.5">
              <div className="skeleton h-4 w-28 rounded-full"></div>
              <div className="skeleton h-3 w-20 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="skeleton h-6 w-16 rounded-full"></div>
      </div>

      {/* Box alasan / keterangan */}
      <div className="mt-4 flex-1 rounded-2xl bg-slate-50 p-4">
        <div className="skeleton h-3 w-32 rounded-full"></div>
        <div className="skeleton mt-2 h-3.5 w-3/4 rounded-full"></div>
      </div>

      {/* Tombol aksi */}
      <div className="mt-4 flex gap-2">
        <div className="skeleton h-8 w-16 rounded-xl"></div>
      </div>
    </div>
  )
}

export function SkeletonPersonCard() {
  return (
    <div className="card-hover flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Profil mahasiswa */}
      <div className="flex items-center gap-4">
        <div className="skeleton h-14 w-14 shrink-0" style={{ borderRadius: '28%' }}></div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="skeleton h-5 w-36 rounded-full"></div>
          <div className="skeleton h-3 w-24 rounded-full"></div>
          <div className="skeleton h-5 w-20 rounded-full"></div>
        </div>
      </div>

      {/* Statistik logbook dan media */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-50 p-3">
          <div className="skeleton h-3 w-16 rounded-full"></div>
          <div className="skeleton mt-1.5 h-5 w-8 rounded-full"></div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <div className="skeleton h-3 w-16 rounded-full"></div>
          <div className="skeleton mt-1.5 h-5 w-8 rounded-full"></div>
        </div>
      </div>

      {/* Rekap kehadiran */}
      <div className="mt-3 border-t border-slate-100 pt-3">
        <div className="skeleton h-3 w-24 rounded-full"></div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-slate-50 p-2">
            <div className="skeleton h-3 w-full rounded-full"></div>
            <div className="skeleton mx-auto mt-1.5 h-4 w-6 rounded-full"></div>
          </div>
          <div className="rounded-xl bg-slate-50 p-2">
            <div className="skeleton h-3 w-full rounded-full"></div>
            <div className="skeleton mx-auto mt-1.5 h-4 w-6 rounded-full"></div>
          </div>
          <div className="rounded-xl bg-slate-50 p-2">
            <div className="skeleton h-3 w-full rounded-full"></div>
            <div className="skeleton mx-auto mt-1.5 h-4 w-6 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Header profil + tab */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="skeleton h-14 w-14 shrink-0 sm:h-24 sm:w-24" style={{ borderRadius: '28%' }}></div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="skeleton h-5 w-48 rounded-full sm:h-6"></div>
            <div className="skeleton h-3.5 w-28 rounded-full"></div>
            <div className="skeleton h-3.5 w-32 rounded-full"></div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2 sm:mt-8">
          <div className="skeleton h-9 w-24 rounded-2xl"></div>
          <div className="skeleton h-9 w-20 rounded-2xl"></div>
          <div className="skeleton h-9 w-28 rounded-2xl"></div>
          <div className="skeleton h-9 w-20 rounded-2xl"></div>
        </div>
      </div>

      {/* Form logbook + daftar logbook */}
      <div className="grid items-start gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="skeleton h-6 w-48 rounded-full"></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="skeleton h-11 w-full rounded-2xl"></div>
            <div className="skeleton h-11 w-full rounded-2xl"></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="skeleton h-11 w-full rounded-2xl"></div>
            <div className="skeleton h-11 w-full rounded-2xl"></div>
          </div>
          <div className="skeleton h-11 w-full rounded-2xl"></div>
          <div className="skeleton h-40 w-full rounded-2xl"></div>
          <div className="skeleton h-11 w-full rounded-2xl"></div>
        </div>
        <div className="space-y-5">
          <div className="skeleton h-6 w-32 rounded-full"></div>
          <div className="skeleton h-12 w-full rounded-3xl"></div>
          <div className="skeleton h-4 w-28 rounded-full"></div>
          <div className="grid gap-5 md:grid-cols-2 kartu-grid">
            <SkeletonLogbookCard />
            <SkeletonLogbookCard />
            <SkeletonLogbookCard />
            <SkeletonLogbookCard />
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonStatCard() {
  return (
    <div className="card-hover rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-6">
      <div className="skeleton h-3 w-3/4 rounded-full sm:h-4 sm:w-28"></div>
      <div className="skeleton mt-1 h-6 w-1/2 rounded-full sm:mt-3 sm:h-9 sm:w-16"></div>
      <div className="skeleton mt-2 h-3 w-36 rounded-full hidden sm:block"></div>
    </div>
  )
}

export function SkeletonChartRow() {
  return (
    <div className="card-hover rounded-[1.5rem] border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1.5">
          <div className="skeleton h-4 w-32 rounded-full"></div>
          <div className="skeleton h-3 w-20 rounded-full"></div>
        </div>
        <div className="skeleton h-3 w-36 rounded-full"></div>
      </div>
      <div className="skeleton mt-4 h-4 w-full rounded-full"></div>
    </div>
  )
}
