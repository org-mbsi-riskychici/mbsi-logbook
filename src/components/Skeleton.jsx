export function SkeletonLogbookCard() {
  return (
    <div className="card-hover flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="skeleton aspect-video w-full rounded-2xl"></div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="skeleton h-6 w-24 rounded-full"></div>
        <div className="skeleton h-6 w-20 rounded-full"></div>
        <div className="skeleton ml-auto h-6 w-20 rounded-full"></div>
      </div>
      <div className="skeleton h-4 w-36 rounded-full"></div>
      <div className="skeleton h-6 w-40 rounded-full"></div>
      <div className="skeleton h-4 w-32 rounded-full"></div>
      <div className="skeleton h-3 w-24 rounded-full"></div>
      <div className="mt-auto flex items-center gap-3 border-t border-slate-100 pt-4">
        <div className="skeleton h-10 w-10" style={{ borderRadius: 'radius' }}></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-36 rounded-full"></div>
          <div className="skeleton h-3 w-24 rounded-full"></div>
        </div>
        <div className="skeleton h-9 w-20 rounded-2xl"></div>
      </div>
    </div>
  )
}

export function SkeletonGalleryCard() {
  return (
    <div className="card-hover flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="skeleton aspect-video w-full rounded-2xl"></div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="skeleton h-6 w-24 rounded-full"></div>
        <div className="skeleton ml-auto h-6 w-20 rounded-full"></div>
      </div>
      <div className="skeleton h-4 w-36 rounded-full"></div>
      <div className="skeleton h-6 w-44 rounded-full"></div>
      <div className="mt-auto flex items-center gap-3 border-t border-slate-100 pt-4">
        <div className="skeleton h-10 w-10" style={{ borderRadius: 'radius' }}></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-36 rounded-full"></div>
          <div className="skeleton h-3 w-24 rounded-full"></div>
        </div>
        <div className="skeleton h-9 w-20 rounded-2xl"></div>
      </div>
    </div>
  )
}

export function SkeletonAttendanceCard() {
  return (
    <div className="card-hover flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="skeleton h-6 w-20 rounded-full"></div>
        <div className="skeleton h-4 w-32 rounded-full"></div>
      </div>
      <div className="skeleton h-5 w-28 rounded-full"></div>
      <div className="skeleton h-4 w-full rounded-full"></div>
      <div className="mt-auto flex items-center gap-3 border-t border-slate-100 pt-4">
        <div className="skeleton h-10 w-10" style={{ borderRadius: 'radius' }}></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-36 rounded-full"></div>
          <div className="skeleton h-3 w-24 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonPersonCard() {
  return (
    <div className="card-hover flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="skeleton h-14 w-14" style={{ borderRadius: 'radius' }}></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton h-5 w-40 rounded-full"></div>
          <div className="skeleton h-3 w-24 rounded-full"></div>
          <div className="skeleton h-5 w-28 rounded-full"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="skeleton h-16 rounded-2xl"></div>
        <div className="skeleton h-16 rounded-2xl"></div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="skeleton h-12 rounded-xl"></div>
        <div className="skeleton h-12 rounded-xl"></div>
        <div className="skeleton h-12 rounded-xl"></div>
      </div>
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="skeleton h-14 w-14" style={{ borderRadius: 'radius' }}></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-44 rounded-full"></div>
          <div className="skeleton h-3 w-28 rounded-full"></div>
        </div>
        <div className="skeleton h-10 w-28 rounded-2xl"></div>
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="skeleton h-5 w-36 rounded-full"></div>
          <div className="skeleton h-10 w-full rounded-2xl"></div>
          <div className="skeleton h-10 w-full rounded-2xl"></div>
          <div className="skeleton h-20 w-full rounded-2xl"></div>
          <div className="skeleton h-11 w-44 rounded-2xl"></div>
        </div>
        <div className="space-y-5">
          <div className="skeleton h-6 w-32 rounded-full"></div>
          <div className="grid gap-5 md:grid-cols-2">
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
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-3 sm:p-6">
      <div className="skeleton h-3 w-3/4 sm:h-4 sm:w-28"></div>
      <div className="skeleton h-6 w-1/2 mt-1 sm:h-9 sm:w-16 sm:mt-3"></div>
      <div className="skeleton h-3 w-36 mt-2 hidden sm:block"></div>
    </div>
  )
}
export function SkeletonChartRow() {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton h-4 w-32"></div>
          <div className="skeleton h-3 w-24"></div>
        </div>
        <div className="skeleton h-4 w-40"></div>
      </div>
      <div className="skeleton h-4 w-full rounded-full mt-4"></div>
    </div>
  )
}
