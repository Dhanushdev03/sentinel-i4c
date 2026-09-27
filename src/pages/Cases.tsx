import { useState } from 'react'
import { Search, Filter, ChevronRight, AlertTriangle, CheckCircle2, Clock, ArrowUpDown } from 'lucide-react'
import { CASES, type CaseSeverity, type CaseStatus, type FraudType } from '../data/mockData'

interface Props {
  navigate: (page: string, id?: string) => void
  selectedId?: string | null
}

const FRAUD_TYPES: FraudType[] = ['UPI Fraud', 'Phishing', 'Investment Scam', 'Job Scam', 'Loan Scam', 'Social Engineering', 'Other']
const SEVERITIES: CaseSeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
const STATUSES: CaseStatus[] = ['ACTIVE', 'RESOLVED', 'CLOSED', 'PENDING']

export default function Cases({ navigate, selectedId }: Props) {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('ALL')
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [sortField, setSortField] = useState<'amount' | 'time' | 'severity'>('time')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 8

  const filtered = CASES.filter(c => {
    if (search && !c.caseNumber.toLowerCase().includes(search.toLowerCase()) &&
        !c.district.toLowerCase().includes(search.toLowerCase()) &&
        !c.fraudType.toLowerCase().includes(search.toLowerCase())) return false
    if (filterType !== 'ALL' && c.fraudType !== filterType) return false
    if (filterSeverity !== 'ALL' && c.severity !== filterSeverity) return false
    if (filterStatus !== 'ALL' && c.status !== filterStatus) return false
    return true
  }).sort((a, b) => {
    if (sortField === 'amount') return b.reportedAmount - a.reportedAmount
    if (sortField === 'severity') {
      const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
      return order[a.severity] - order[b.severity]
    }
    return new Date(b.complaintTime).getTime() - new Date(a.complaintTime).getTime()
  })

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  function severityColor(s: CaseSeverity) {
    if (s === 'CRITICAL') return 'text-red-400'
    if (s === 'HIGH') return 'text-amber-400'
    if (s === 'MEDIUM') return 'text-blue-400'
    return 'text-zinc-500'
  }

  function statusIcon(s: CaseStatus) {
    if (s === 'ACTIVE') return <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
    if (s === 'RESOLVED') return <CheckCircle2 size={10} className="text-zinc-400" />
    if (s === 'PENDING') return <Clock size={10} className="text-amber-400" />
    return <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full" />
  }

  function alertBadge(level?: string) {
    if (!level) return null
    const cls = level === 'RED' ? 'bg-red-950/50 text-red-400' :
                level === 'AMBER' ? 'bg-amber-950/40 text-amber-400' :
                'bg-emerald-950/30 text-emerald-400'
    return <span className={`text-[8px] font-mono-data px-1.5 py-0.5 rounded-sm ${cls}`}>● {level}</span>
  }

  return (
    <div className="flex flex-col h-full p-4 gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-rajdhani font-700 text-lg text-zinc-100 tracking-wider">ACTIVE CASES</h2>
          <div className="text-[9px] font-mono-data text-zinc-600">
            {filtered.length} cases matching filter · {CASES.filter(c => c.status === 'ACTIVE').length} active total
          </div>
        </div>
        <button
          onClick={() => navigate('new-case')}
          className="flex items-center gap-1.5 bg-white text-zinc-950 px-3 py-1.5 rounded text-[10px] font-mono-data font-600 tracking-wider hover:bg-zinc-200 active:scale-95 transition-all"
        >
          + NEW CASE
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search case, district, type..."
            className="bg-zinc-900 border border-zinc-800 rounded pl-7 pr-3 py-1.5 text-[10px] font-mono-data text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 w-52"
          />
        </div>

        {[
          { label: 'Type', value: filterType, setter: setFilterType, options: ['ALL', ...FRAUD_TYPES] },
          { label: 'Severity', value: filterSeverity, setter: setFilterSeverity, options: ['ALL', ...SEVERITIES] },
          { label: 'Status', value: filterStatus, setter: setFilterStatus, options: ['ALL', ...STATUSES] },
        ].map(f => (
          <div key={f.label} className="flex items-center gap-1">
            <span className="text-[9px] font-mono-data text-zinc-600">{f.label}:</span>
            <select
              value={f.value}
              onChange={e => { f.setter(e.target.value); setPage(0) }}
              className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[10px] font-mono-data text-zinc-400 focus:outline-none focus:border-zinc-600"
            >
              {f.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}

        <div className="flex items-center gap-1 ml-auto">
          <span className="text-[9px] font-mono-data text-zinc-600">Sort:</span>
          {['time', 'amount', 'severity'].map(s => (
            <button
              key={s}
              onClick={() => setSortField(s as typeof sortField)}
              className={`text-[9px] font-mono-data px-2 py-1 rounded transition-colors ${sortField === s ? 'text-zinc-100 bg-zinc-800' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-zinc-900/30 border border-zinc-800 rounded-lg overflow-hidden flex flex-col">
        <div className="grid grid-cols-[auto_1fr_140px_100px_80px_80px_90px_80px_36px] gap-0 text-[8px] font-mono-data text-zinc-600 border-b border-zinc-800 px-3 py-2">
          <span className="w-4 mr-2">#</span>
          <span>CASE / TYPE</span>
          <span>LOCATION</span>
          <span>AMOUNT</span>
          <span>SEVERITY</span>
          <span>STATUS</span>
          <span>ALERT</span>
          <span>CONFIDENCE</span>
          <span />
        </div>

        <div className="flex-1 overflow-y-auto">
          {paginated.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-zinc-700 text-[10px] font-mono-data">
              No cases match the current filters
            </div>
          ) : (
            paginated.map((c, i) => (
              <button
                key={c.id}
                onClick={() => navigate('cases', c.id)}
                className={`w-full grid grid-cols-[auto_1fr_140px_100px_80px_80px_90px_80px_36px] gap-0 px-3 py-2.5 border-b border-zinc-800/50 hover:bg-zinc-800/30 text-left transition-colors ${
                  c.id === selectedId ? 'bg-zinc-800/40' : ''
                }`}
              >
                <span className="w-4 mr-2 text-[8px] font-mono-data text-zinc-700">{page * PAGE_SIZE + i + 1}</span>
                <div className="min-w-0 pr-2">
                  <div className="text-[10px] font-mono-data text-zinc-300 font-500">{c.caseNumber}</div>
                  <div className="text-[9px] text-zinc-600 mt-0.5">{c.fraudType}</div>
                  {c.severity === 'CRITICAL' && c.status === 'ACTIVE' && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <AlertTriangle size={8} className="text-red-400" />
                      <span className="text-[8px] text-red-400">CRITICAL — Immediate action required</span>
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-[10px] text-zinc-400">{c.district}</div>
                  <div className="text-[9px] text-zinc-600">{c.state}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono-data text-zinc-300">₹{(c.reportedAmount / 100000).toFixed(2)}L</div>
                  <div className="text-[9px] text-zinc-600">{c.hops} hops</div>
                </div>
                <div className={`text-[9px] font-mono-data font-600 ${severityColor(c.severity)}`}>
                  {c.severity}
                </div>
                <div className="flex items-center gap-1">
                  {statusIcon(c.status)}
                  <span className="text-[9px] font-mono-data text-zinc-500">{c.status}</span>
                </div>
                <div>
                  {alertBadge(c.alert?.level)}
                  {c.alert && (
                    <div className="text-[8px] font-mono-data text-zinc-700 mt-0.5">{c.alert.status}</div>
                  )}
                </div>
                <div>
                  <span className={`text-[9px] font-mono-data font-600 ${
                    c.traceConfidence === 'HIGH' ? 'text-emerald-400' :
                    c.traceConfidence === 'MEDIUM' ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {c.traceConfidence}
                  </span>
                  {c.prediction && (
                    <div className="text-[8px] text-zinc-700 font-mono-data mt-0.5">
                      {(c.prediction.locations[0].probability * 100).toFixed(0)}% top-1
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center">
                  <ChevronRight size={12} className="text-zinc-700" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="border-t border-zinc-800 px-3 py-2 flex items-center justify-between">
          <span className="text-[9px] font-mono-data text-zinc-600">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-2 py-1 text-[9px] font-mono-data text-zinc-500 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              PREV
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`px-2 py-1 text-[9px] font-mono-data rounded ${page === i ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-600 hover:text-zinc-300'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-2 py-1 text-[9px] font-mono-data text-zinc-500 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
