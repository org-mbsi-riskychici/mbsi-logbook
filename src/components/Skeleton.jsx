export function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      <div className="skeleton h-4 w-28"></div>
      <div className="skeleton h-9 w-16 mt-3"></div>
      <div className="skeleton h-3 w-36 mt-2"></div>
    </div>
  )
}

export function SkeletonLogbookCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
      <div className="skeleton h-40 w-full rounded-2xl"></div>
      <div className="flex gap-2">
        <div className="skeleton h-6 w-24 rounded-full"></div>
        <div className="skeleton h-6 w-20 rounded-full"></div>
      </div>
      <div className="skeleton h-4 w-32"></div>
      <div className="skeleton h-6 w-3/4"></div>
      <div className="skeleton h-4 w-full"></div>
      <div className="skeleton h-4 w-2/3"></div>
      <div className="flex items-center gap-3 pt-2">
        <div className="skeleton h-11 w-11 rounded-2xl"></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-32"></div>
          <div className="skeleton h-3 w-24"></div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonGalleryCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="skeleton aspect-video w-full rounded-none"></div>
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="skeleton h-6 w-24 rounded-full"></div>
          <div className="skeleton h-4 w-16"></div>
        </div>
        <div className="skeleton h-5 w-3/4"></div>
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-1/2"></div>
      </div>
    </div>
  )
}

export function SkeletonAttendanceCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton h-4 w-40"></div>
          <div className="skeleton h-5 w-32"></div>
        </div>
        <div className="skeleton h-6 w-16 rounded-full"></div>
      </div>
      <div className="skeleton h-16 w-full rounded-2xl"></div>
    </div>
  )
}

export function SkeletonPersonCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-4">
        <div className="skeleton h-14 w-14 rounded-3xl"></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton h-5 w-32"></div>
          <div className="skeleton h-4 w-24"></div>
          <div className="skeleton h-4 w-28 rounded-full"></div>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="skeleton h-20 rounded-2xl"></div>
        <div className="skeleton h-20 rounded-2xl"></div>
      </div>
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