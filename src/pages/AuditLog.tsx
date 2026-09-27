import { useState } from 'react'
import { Shield, Hash, Clock, User, Search, Info } from 'lucide-react'
import { AUDIT_LOG } from '../data/mockData'

const EVENT_COLORS: Record<string, string> = {
  LOGIN: 'text-blue-400',
  CASE_CREATED: 'text-emerald-400',
  TRANSACTION_RECEIVED: 'text-cyan-400',
  MODEL_EXECUTED: 'text-purple-400',
  PREDICTION_CREATED: 'text-amber-400',
  ALERT_SENT: 'text-red-400',
  ALERT_ACKNOWLEDGED: 'text-emerald-400',
  INTERVENTION: 'text-amber-400',
  OUTCOME: 'text-emerald-400',
  EXPORT: 'text-zinc-400',
  ACCESS: 'text-zinc-500',
}

export default function AuditLog() {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('ALL')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const eventTypes = ['ALL', ...Array.from(new Set(AUDIT_LOG.map(e => e.eventType)))]

  const filtered = AUDIT_LOG.filter(e => {
    if (search && !e.action.toLowerCase().includes(search.toLowerCase()) &&
        !e.userId.toLowerCase().includes(search.toLowerCase())) return false
    if (filterType !== 'ALL' && e.eventType !== filterType) return false
    return true
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <div className="flex flex-col h-full p-4 gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-rajdhani font-700 text-lg text-zinc-100 tracking-wider">AUDIT LOG</h2>
          <div className="text-[9px] font-mono-data text-zinc-600">
            SHA-256 chained event log · {AUDIT_LOG.length} entries · Tamper-evident prototype
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-950/20 border border-amber-800/30 rounded px-2 py-1">
          <Info size={9} className="text-amber-500" />
          <span className="text-[9px] font-mono-data text-amber-500">Prototype audit — not court-admissible</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search events, users..."
            className="bg-zinc-900 border border-zinc-800 rounded pl-7 pr-3 py-1.5 text-[10px] font-mono-data text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 w-52"
          />
        </div>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-[10px] font-mono-data text-zinc-400 focus:outline-none"
        >
          {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="flex-1 bg-zinc-900/30 border border-zinc-800 rounded-lg overflow-hidden flex flex-col">
        <div className="grid grid-cols-[auto_100px_120px_80px_1fr_80px] gap-2 text-[8px] font-mono-data text-zinc-600 border-b border-zinc-800 px-3 py-2">
          <span className="w-6">#</span>
          <span>EVENT TYPE</span>
          <span>TIMESTAMP</span>
          <span>USER</span>
          <span>ACTION</span>
          <span>HASH (6)</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.map((entry, i) => {
            const isExpanded = expandedId === entry.id
            const typeColor = EVENT_COLORS[entry.eventType] ?? 'text-zinc-400'

            return (
              <div
                key={entry.id}
                className={`border-b border-zinc-800/40 transition-colors ${isExpanded ? 'bg-zinc-800/20' : 'hover:bg-zinc-900/50'}`}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  className="w-full grid grid-cols-[auto_100px_120px_80px_1fr_80px] gap-2 px-3 py-2 text-left"
                >
                  <span className="w-6 text-[8px] font-mono-data text-zinc-700">{i + 1}</span>
                  <span className={`text-[9px] font-mono-data font-500 ${typeColor}`}>{entry.eventType}</span>
                  <span className="text-[9px] font-mono-data text-zinc-500">
                    {new Date(entry.timestamp).toLocaleString('en-IN', {
                      month: 'short', day: '2-digit',
                      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
                    })}
                  </span>
                  <span className="text-[9px] font-mono-data text-zinc-400 truncate">{entry.userId}</span>
                  <span className="text-[9px] text-zinc-300 truncate">{entry.action}</span>
                  <span className="text-[9px] font-mono-data text-zinc-600 truncate">{entry.hash.slice(0, 6)}…</span>
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 space-y-2 animate-slide-up">
                    <div className="bg-zinc-950/60 rounded border border-zinc-800 p-3 space-y-1.5">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {[
                          { label: 'EVENT ID', value: entry.id },
                          { label: 'USER', value: entry.userId },
                          { label: 'CASE', value: entry.caseId ?? '—' },
                          { label: 'IP ADDRESS', value: entry.ipAddress },
                        ].map(row => (
                          <div key={row.label} className="flex gap-2">
                            <span className="text-[8px] font-mono-data text-zinc-600 w-20 flex-shrink-0">{row.label}</span>
                            <span className="text-[9px] font-mono-data text-zinc-300">{row.value}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-zinc-800 pt-2">
                        <div className="text-[8px] font-mono-data text-zinc-600 mb-0.5">DETAILS</div>
                        <p className="text-[9px] text-zinc-400">{entry.details}</p>
                      </div>

                      <div className="border-t border-zinc-800 pt-2 space-y-1">
                        <div>
                          <div className="text-[8px] font-mono-data text-zinc-600 mb-0.5">CURRENT HASH (SHA-256)</div>
                          <div className="text-[9px] font-mono-data text-emerald-400 break-all">{entry.hash}</div>
                        </div>
                        <div>
                          <div className="text-[8px] font-mono-data text-zinc-600 mb-0.5">PREVIOUS HASH</div>
                          <div className="text-[9px] font-mono-data text-zinc-600 break-all">{entry.previousHash}</div>
                        </div>
                        <div className="flex items-center gap-1.5 pt-1">
                          <Shield size={9} className="text-emerald-500" />
                          <span className="text-[9px] font-mono-data text-emerald-400">Chain integrity: VALID (prototype simulation)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
