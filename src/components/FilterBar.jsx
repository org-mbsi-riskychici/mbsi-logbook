import { ICONS } from './icons.jsx'

export function FilterSelect(props) {
  return (
    <div className="filter-input-wrap">
      <span className="text-slate-400">{props.icon}</span>
      <select value={props.value} onChange={function (e) { props.onChange(e.target.value) }}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-bsi-500 min-w-[160px]">
        {props.options.map(function (o) {
          return <option key={o.value} value={o.value}>{o.label}</option>
        })}
      </select>
    </div>
  )
}

export function FilterDate(props) {
  return (
    <div className="filter-input-wrap">
      <span className="text-slate-400">{ICONS.calendar}</span>
      <input type={props.mode === 'month' ? 'month' : 'date'} value={props.value}
        onChange={function (e) { props.onChange(e.target.value) }}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-bsi-500 min-w-[150px]" />
    </div>
  )
}

export function TimeFilter(props) {
  const f = props.filter
  const set = props.set
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="time-toggle">
        <button type="button" className={f.timeMode === 'bulan' ? 'active' : ''}
          onClick={function () { set(Object.assign({}, f, { timeMode: 'bulan', bulan: '', dari: '', sampai: '' })) }}>Bulan</button>
        <button type="button" className={f.timeMode === 'rentang' ? 'active' : ''}
          onClick={function () { set(Object.assign({}, f, { timeMode: 'rentang', bulan: '', dari: '', sampai: '' })) }}>Rentang Waktu</button>
      </div>
      {f.timeMode === 'bulan'
        ? <FilterDate mode="month" value={f.bulan} onChange={function (v) { set(Object.assign({}, f, { bulan: v })) }} />
        : <div className="flex flex-wrap items-center gap-2">
            <FilterDate value={f.dari} onChange={function (v) { set(Object.assign({}, f, { dari: v })) }} />
            <span className="text-slate-400 text-sm">sampai</span>
            <FilterDate value={f.sampai} onChange={function (v) { set(Object.assign({}, f, { sampai: v })) }} />
          </div>}
    </div>
  )
}

export function FilterBar(props) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 lg:p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <button onClick={props.onToggle}
          className="xl:hidden flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 hover:bg-slate-100">
          <span className="text-bsi-700">{ICONS.funnel}</span>
          <span>Filter</span>
          {props.activeCount > 0 ? (
            <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full bg-bsi-800 text-white text-xs font-bold">{props.activeCount}</span>
          ) : null}
          <span className={'transition-transform duration-200 text-slate-400 ' + (props.open ? 'rotate-180' : '')}>{ICONS.chevron}</span>
        </button>
        <div className="hidden xl:block text-sm text-slate-500">
          {props.activeCount > 0
            ? <span className="inline-flex items-center gap-2"><span className="text-bsi-700">{ICONS.funnel}</span><span><strong className="text-slate-900">{props.activeCount}</strong> filter aktif</span></span>
            : <span className="inline-flex items-center gap-2"><span className="text-slate-400">{ICONS.funnel}</span><span>Belum ada filter aktif</span></span>}
        </div>
      </div>
      <div className={props.open ? 'anim-filter mt-4' : 'hidden xl:block xl:mt-4'}>
        <div className="flex flex-wrap items-center gap-3">
          {props.children}
          {props.activeCount > 0 ? (
            <button onClick={props.onReset}
              className="inline-flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100">
              {ICONS.close}<span>Reset</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function countActiveFilters(o) {
  let c = 0
  for (const k in o) {
    if (k === 'timeMode') continue
    if (o[k]) c++
  }
  return c
}
