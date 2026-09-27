import { useState, useEffect } from 'react'
import { Bell, CheckCircle2, ChevronUp, XCircle, Eye, AlertTriangle, Activity } from 'lucide-react'
import { CASES, type Alert } from '../data/mockData'

interface Props {
  navigate: (page: string, id?: string) => void
}

export default function Alerts({ navigate }: Props) {
  const [filter, setFilter] = useState<'ALL' | 'RED' | 'AMBER' | 'GREEN'>('ALL')
  const [actionedIds, setActionedIds] = useState<Set<string>>(new Set())
  const [newFeed, setNewFeed] = useState<Alert[]>([])

  const alerts: Alert[] = CASES.flatMap(c => c.alert ? [c.alert] : [])

  useEffect(() => {
    const interval = setInterval(() => {
      const randomCase = CASES[Math.floor(Math.random() * CASES.length)]
      if (randomCase.alert && Math.random() > 0.7) {
        const syntheticAlert: Alert = {
          ...randomCase.alert,
          id: `ALRT-SIM-${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: 'PENDING',
        }
        setNewFeed(f => [syntheticAlert, ...f].slice(0, 3))
      }
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const allAlerts = [...newFeed, ...alerts]
  const filtered = filter === 'ALL' ? allAlerts : allAlerts.filter(a => a.level === filter)

  const counts = {
    RED: allAlerts.filter(a => a.level === 'RED').length,
    AMBER: allAlerts.filter(a => a.level === 'AMBER').length,
    GREEN: allAlerts.filter(a => a.level === 'GREEN').length,
  }

  function handleAction(id: string, action: string) {
    setActionedIds(prev => new Set([...prev, `${id}-${action}`]))
  }

  return (
    <div className="flex flex-col h-full p-4 gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-rajdhani font-700 text-lg text-zinc-100 tracking-wider">LIVE ALERTS</h2>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-mono-data text-zinc-500">WebSocket simulation active</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[
            { label: `RED (${counts.RED})`, value: 'RED' as const, color: 'text-red-400 border-red-800/50 hover:bg-red-950/30' },
            { label: `AMBER (${counts.AMBER})`, value: 'AMBER' as const, color: 'text-amber-400 border-amber-800/40 hover:bg-amber-950/20' },
            { label: `GREEN (${counts.GREEN})`, value: 'GREEN' as const, color: 'text-emerald-400 border-emerald-800/40 hover:bg-emerald-950/20' },
            { label: `ALL (${allAlerts.length})`, value: 'ALL' as const, color: 'text-zinc-400 border-zinc-700 hover:bg-zinc-800/30' },
          ].map(btn => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`text-[9px] font-mono-data px-3 py-1.5 border rounded transition-all ${btn.color} ${filter === btn.value ? 'bg-zinc-800' : ''}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {newFeed.length > 0 && (
        <div className="bg-blue-950/20 border border-blue-800/40 rounded-lg px-3 py-2 flex items-center gap-2">
          <Activity size={11} className="text-blue-400 animate-pulse" />
          <span className="text-[10px] font-mono-data text-blue-300">{newFeed.length} simulated real-time alert(s) received</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-zinc-700 text-[10px] font-mono-data">
            No alerts in this category
          </div>
        ) : (
          filtered.map(alert => {
            const isActioned = actionedIds.has(`${alert.id}-ACK`) || actionedIds.has(`${alert.id}-RES`) || alert.status === 'ACKNOWLEDGED' || alert.status === 'RESOLVED'
            return (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 transition-all animate-slide-up ${
                  alert.level === 'RED' ? 'border-red-800/60 bg-red-950/10' :
                  alert.level === 'AMBER' ? 'border-amber-800/40 bg-amber-950/8' :
                  'border-zinc-800 bg-zinc-900/30'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0 ${
                      alert.level === 'RED' ? 'bg-red-900/50' :
                      alert.level === 'AMBER' ? 'bg-amber-900/30' :
                      'bg-zinc-800'
                    }`}>
                      <Bell size={14} className={
                        alert.level === 'RED' ? 'text-red-400' :
                        alert.level === 'AMBER' ? 'text-amber-400' :
                        'text-emerald-400'
                      } />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[8px] font-mono-data font-700 px-1.5 py-0.5 rounded-sm border ${
                          alert.level === 'RED' ? 'border-red-700/50 text-red-400 bg-red-950/40' :
                          alert.level === 'AMBER' ? 'border-amber-700/40 text-amber-400 bg-amber-950/30' :
                          'border-emerald-700/40 text-emerald-400 bg-emerald-950/20'
                        }`}>
                          ● {alert.level}
                        </span>
                        <span className="font-mono-data text-[10px] text-zinc-300 font-500">{alert.id}</span>
                        <span className="text-[9px] text-zinc-600">{alert.caseNumber}</span>
                        <span className="text-[9px] text-zinc-600">{alert.fraudType}</span>
                        <span className="text-[9px] font-mono-data text-zinc-500">
                          {new Date(alert.timestamp).toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-3 mt-2">
                        {[
                          { label: 'LOCATION', value: alert.location },
                          { label: 'TIME WINDOW', value: alert.timeWindow },
                          { label: 'AMOUNT', value: `₹${(alert.amount / 100000).toFixed(1)}L` },
                          { label: 'PROBABILITY', value: `${(alert.probability * 100).toFixed(1)}%` },
                        ].map(f => (
                          <div key={f.label}>
                            <div className="text-[8px] font-mono-data text-zinc-600">{f.label}</div>
                            <div className="text-[10px] text-zinc-300 font-500">{f.value}</div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-2 p-2 bg-zinc-950/50 rounded border border-zinc-800/40">
                        <div className="text-[8px] font-mono-data text-zinc-600 mb-0.5">REASON</div>
                        <p className="text-[9px] text-zinc-400 leading-relaxed">{alert.reason}</p>
                      </div>

                      <div className="mt-1.5 p-2 bg-zinc-950/50 rounded border border-zinc-800/40">
                        <div className="text-[8px] font-mono-data text-zinc-600 mb-0.5">RECOMMENDED ACTION</div>
                        <p className="text-[9px] text-zinc-300">{alert.recommendedAction}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0 w-28">
                    {isActioned ? (
                      <div className="flex items-center gap-1 text-[9px] font-mono-data text-emerald-400">
                        <CheckCircle2 size={10} />
                        {alert.status}
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => { handleAction(alert.id, 'ACK'); navigate('cases', CASES.find(c => c.alert?.id === alert.id)?.id) }}
                          className="flex items-center gap-1 px-2 py-1.5 bg-emerald-900/30 border border-emerald-700/50 text-emerald-300 rounded text-[9px] font-mono-data hover:bg-emerald-900/50 transition-colors"
                        >
                          <CheckCircle2 size={9} /> ACKNOWLEDGE
                        </button>
                        <button
                          onClick={() => handleAction(alert.id, 'ESC')}
                          className="flex items-center gap-1 px-2 py-1.5 bg-amber-900/20 border border-amber-700/40 text-amber-300 rounded text-[9px] font-mono-data hover:bg-amber-900/40 transition-colors"
                        >
                          <ChevronUp size={9} /> ESCALATE
                        </button>
                        <button
                          onClick={() => handleAction(alert.id, 'OVR')}
                          className="flex items-center gap-1 px-2 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-400 rounded text-[9px] font-mono-data hover:bg-zinc-800 transition-colors"
                        >
                          <XCircle size={9} /> OVERRIDE
                        </button>
                        <button
                          onClick={() => navigate('cases', CASES.find(c => c.alert?.id === alert.id)?.id)}
                          className="flex items-center gap-1 px-2 py-1.5 border border-zinc-800 text-zinc-500 rounded text-[9px] font-mono-data hover:border-zinc-700 transition-colors"
                        >
                          <Eye size={9} /> VIEW CASE
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
