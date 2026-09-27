import { useState, useEffect } from 'react'
import {
  FolderOpen, AlertTriangle, MapPin, Bell, CheckCircle2, TrendingUp,
  ArrowRight, Circle, Activity, Clock, ChevronRight
} from 'lucide-react'
import { CASES, CASH_WITHDRAWAL_POINTS, type FraudCase, type Transaction } from '../data/mockData'

interface DashboardProps {
  navigate: (page: string, id?: string) => void
  demoStep: number
  demoRunning: boolean
}

const SUMMARY_CARDS = (cases: FraudCase[]) => {
  const active = cases.filter(c => c.status === 'ACTIVE')
  const critical = active.filter(c => c.severity === 'CRITICAL')
  const predicted = active.filter(c => c.prediction)
  const alerts = cases.filter(c => c.alert?.status === 'PENDING')
  const resolved = cases.filter(c => c.status === 'RESOLVED')
  const hits = cases.filter(c => c.outcome?.result === 'HIT').length
  const evaluated = cases.filter(c => c.outcome).length
  return [
    { label: 'Total Active Cases', value: active.length, sub: `${cases.length} total`, icon: FolderOpen, color: 'text-zinc-300' },
    { label: 'High / Critical', value: critical.length, sub: `${active.filter(c => c.severity === 'HIGH').length} high severity`, icon: AlertTriangle, color: 'text-red-400', alert: true },
    { label: 'Predicted Cash-outs', value: predicted.length, sub: 'predictions generated', icon: MapPin, color: 'text-blue-400' },
    { label: 'Pending Alerts', value: alerts.length, sub: 'require response', icon: Bell, color: alerts.length > 0 ? 'text-amber-400' : 'text-zinc-400' },
    { label: 'Resolved', value: resolved.length, sub: 'cases closed', icon: CheckCircle2, color: 'text-emerald-400' },
    { label: 'Hit Rate', value: evaluated > 0 ? `${Math.round((hits / evaluated) * 100)}%` : 'N/A', sub: `${hits}/${evaluated} evaluated`, icon: TrendingUp, color: 'text-cyan-400' },
  ]
}

function ThreatMap({ navigate }: { navigate: (p: string, id?: string) => void }) {
  const [hovered, setHovered] = useState<string | null>(null)

  const INDIA_BOUNDS = { minLat: 8, maxLat: 37, minLng: 68, maxLng: 98 }
  const W = 420, H = 320

  function toXY(lat: number, lng: number) {
    const x = ((lng - INDIA_BOUNDS.minLng) / (INDIA_BOUNDS.maxLng - INDIA_BOUNDS.minLng)) * W
    const y = ((INDIA_BOUNDS.maxLat - lat) / (INDIA_BOUNDS.maxLat - INDIA_BOUNDS.minLat)) * H
    return { x, y }
  }

  const CITIES = [
    { name: 'Mumbai', lat: 19.08, lng: 72.88 }, { name: 'Delhi', lat: 28.63, lng: 77.22 },
    { name: 'Bangalore', lat: 12.97, lng: 77.59 }, { name: 'Chennai', lat: 13.08, lng: 80.27 },
    { name: 'Hyderabad', lat: 17.38, lng: 78.49 }, { name: 'Kolkata', lat: 22.57, lng: 88.36 },
    { name: 'Jaipur', lat: 26.91, lng: 75.79 }, { name: 'Ahmedabad', lat: 23.03, lng: 72.59 },
    { name: 'Lucknow', lat: 26.85, lng: 80.95 }, { name: 'Chandigarh', lat: 30.74, lng: 76.79 },
    { name: 'Bhopal', lat: 23.26, lng: 77.40 }, { name: 'Patna', lat: 25.59, lng: 85.14 },
  ]

  const predLocations = CASES.filter(c => c.prediction && c.status === 'ACTIVE').flatMap(c =>
    c.prediction!.locations.slice(0, 1).map(l => ({
      ...l,
      caseId: c.id,
      caseNumber: c.caseNumber,
      severity: c.severity,
    }))
  )

  const INDIA_OUTLINE = `M120,10 L160,8 L200,15 L230,10 L260,20 L280,12 L310,25 L330,35 L340,60
    L360,70 L370,90 L355,110 L370,130 L360,155 L350,170 L340,195 L325,210
    L310,230 L295,250 L285,270 L270,285 L255,295 L240,310 L225,320 L210,310
    L200,295 L185,285 L175,270 L160,260 L145,255 L130,260 L115,270 L100,260
    L88,248 L80,235 L72,220 L65,205 L55,190 L45,175 L38,160 L35,145
    L30,130 L25,115 L20,100 L22,85 L28,70 L35,55 L45,42 L58,32 L75,22 L100,14 Z`

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs font-500 text-zinc-200">Live Threat Map</div>
          <div className="text-[9px] font-mono-data text-zinc-600 mt-0.5">SYNTHETIC · SIMULATION DATA</div>
        </div>
        <div className="flex items-center gap-3 text-[9px] font-mono-data text-zinc-600">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500/60" />Predicted</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500/60" />ATM/CSP</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-zinc-500/60" />City</div>
        </div>
      </div>
      <div className="relative">
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="bg-zinc-950/50 rounded border border-zinc-800/40">
          <defs>
            <radialGradient id="heatGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Grid lines */}
          {[...Array(7)].map((_, i) => (
            <line key={`v${i}`} x1={i * 60} y1={0} x2={i * 60} y2={H} stroke="#1e1e2a" strokeWidth="0.5" />
          ))}
          {[...Array(6)].map((_, i) => (
            <line key={`h${i}`} x1={0} y1={i * 54} x2={W} y2={i * 54} stroke="#1e1e2a" strokeWidth="0.5" />
          ))}

          {/* India outline */}
          <path d={INDIA_OUTLINE} fill="none" stroke="#2e2e3e" strokeWidth="1.2" />

          {/* Heat zones for high-risk areas */}
          {predLocations.filter(l => l.severity === 'CRITICAL' || l.severity === 'HIGH').map((l, i) => {
            const { x, y } = toXY(l.lat, l.lng)
            return (
              <circle key={`heat-${i}`} cx={x} cy={y} r={28} fill="url(#heatGrad)" />
            )
          })}

          {/* City dots */}
          {CITIES.map(c => {
            const { x, y } = toXY(c.lat, c.lng)
            return (
              <g key={c.name}>
                <circle cx={x} cy={y} r={2} fill="#3f3f46" />
                <text x={x + 3} y={y + 3} fill="#52525b" fontSize="5.5" fontFamily="JetBrains Mono">{c.name}</text>
              </g>
            )
          })}

          {/* Cash withdrawal points */}
          {CASH_WITHDRAWAL_POINTS.map(cwp => {
            const { x, y } = toXY(cwp.lat, cwp.lng)
            return (
              <circle
                key={cwp.id}
                cx={x} cy={y} r={3}
                fill={cwp.riskScore > 0.7 ? '#3b82f6' : '#1d4ed8'}
                stroke="#1e3a8a"
                strokeWidth="0.5"
                opacity="0.7"
              />
            )
          })}

          {/* Predicted cash-out locations */}
          {predLocations.map((l, i) => {
            const { x, y } = toXY(l.lat, l.lng)
            const isCritical = l.severity === 'CRITICAL'
            return (
              <g
                key={i}
                className="cursor-pointer"
                onClick={() => navigate('cases', l.caseId)}
                onMouseEnter={() => setHovered(l.caseId)}
                onMouseLeave={() => setHovered(null)}
              >
                {isCritical && (
                  <circle cx={x} cy={y} r={10} fill="#ef4444" opacity="0.15" className="animate-ping-slow" />
                )}
                <circle
                  cx={x} cy={y} r={5}
                  fill={isCritical ? '#ef4444' : '#f59e0b'}
                  stroke={isCritical ? '#fca5a5' : '#fcd34d'}
                  strokeWidth="1"
                />
                <text x={x + 6} y={y + 3} fill={isCritical ? '#fca5a5' : '#fcd34d'} fontSize="5.5" fontFamily="JetBrains Mono" fontWeight="600">
                  {(l.probability * 100).toFixed(0)}%
                </text>
              </g>
            )
          })}
        </svg>

        {hovered && (
          <div className="absolute top-2 right-2 bg-zinc-900 border border-zinc-700 rounded p-2 text-[9px] font-mono-data text-zinc-400">
            {CASES.find(c => c.id === hovered)?.caseNumber}
          </div>
        )}
      </div>
    </div>
  )
}

function LiveFeed({ transactions }: { transactions: Transaction[] }) {
  const [visible, setVisible] = useState<Transaction[]>([])

  useEffect(() => {
    const sorted = [...transactions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 20)
    setVisible(sorted.slice(0, 5))
    let i = 5
    const id = setInterval(() => {
      if (i < sorted.length) {
        setVisible(v => [sorted[i], ...v].slice(0, 8))
        i++
      }
    }, 2800)
    return () => clearInterval(id)
  }, [transactions])

  function riskColor(score: number) {
    if (score > 0.7) return 'text-red-400'
    if (score > 0.4) return 'text-amber-400'
    return 'text-emerald-400'
  }

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-500 text-zinc-200">Live Transaction Feed</div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-mono-data text-zinc-500">STREAMING</span>
        </div>
      </div>

      <div className="space-y-1 overflow-hidden">
        <div className="grid grid-cols-7 gap-1 text-[8px] font-mono-data text-zinc-600 pb-1 border-b border-zinc-800">
          <span>TX ID</span>
          <span>TIME</span>
          <span className="col-span-2">SOURCE → DEST</span>
          <span>AMOUNT</span>
          <span>CHANNEL</span>
          <span>RISK</span>
        </div>
        {visible.map((tx, i) => (
          <div
            key={tx.id + i}
            className={`grid grid-cols-7 gap-1 text-[9px] font-mono-data py-1 border-b border-zinc-800/40 ${i === 0 ? 'animate-slide-up' : ''}`}
          >
            <span className="text-zinc-500 truncate">{tx.id.slice(-8)}</span>
            <span className="text-zinc-600">{new Date(tx.timestamp).toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' })}</span>
            <span className="text-zinc-400 truncate col-span-2">{tx.fromAccount.slice(0, 8)}→{tx.toAccount.slice(0, 8)}</span>
            <span className={tx.isNoise ? 'text-zinc-600' : 'text-zinc-300'}>
              ₹{tx.amount >= 100000 ? `${(tx.amount / 100000).toFixed(1)}L` : `${(tx.amount / 1000).toFixed(0)}K`}
            </span>
            <span className={tx.channel === 'ATM' ? 'text-amber-500' : 'text-zinc-500'}>{tx.channel}</span>
            <span className={riskColor(tx.riskScore)}>{(tx.riskScore * 100).toFixed(0)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard({ navigate, demoStep, demoRunning }: DashboardProps) {
  const cards = SUMMARY_CARDS(CASES)
  const allTxs = CASES.flatMap(c => c.transactions)

  const topPredictions = CASES
    .filter(c => c.prediction && c.status === 'ACTIVE')
    .sort((a, b) => (b.prediction!.locations[0].probability) - (a.prediction!.locations[0].probability))
    .slice(0, 5)

  function severityBadge(s: string) {
    const base = 'text-[8px] font-mono-data px-1.5 py-0.5 rounded-sm'
    if (s === 'CRITICAL') return `${base} bg-red-950/60 text-red-400`
    if (s === 'HIGH') return `${base} bg-amber-950/60 text-amber-400`
    if (s === 'MEDIUM') return `${base} bg-blue-950/60 text-blue-400`
    return `${base} bg-zinc-900 text-zinc-500`
  }

  function statusDot(status: string) {
    if (status === 'ACKNOWLEDGED') return 'bg-amber-400'
    if (status === 'RESOLVED') return 'bg-emerald-400'
    if (status === 'PENDING') return 'bg-red-400 animate-pulse-critical'
    return 'bg-zinc-600'
  }

  const TIMELINE_CASES = CASES.slice(0, 4)

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      {demoRunning && (
        <div className="bg-blue-950/30 border border-blue-800/50 rounded-lg px-4 py-2.5 flex items-center gap-3 animate-fade-in">
          <Activity size={14} className="text-blue-400 animate-pulse" />
          <span className="text-xs text-blue-300 font-mono-data">
            DEMO MODE ACTIVE — Step {demoStep + 1}/11 —&nbsp;
            {['Complaint received', 'Case created', 'Transaction stream started', 'Graph building...', 'Trace confidence calculated', 'TGN engine running...', 'Prediction generated', 'SHAP explanation ready', 'Alert triggered', 'Officer action required', 'Outcome recorded'][demoStep] ?? 'Running...'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-6 gap-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className={`bg-zinc-900/40 border rounded-lg p-3 ${card.alert && typeof card.value === 'number' && card.value > 0 ? 'border-red-800/50' : 'border-zinc-800'}`}
            >
              <div className="flex items-start justify-between mb-2">
                <Icon size={13} className={card.color} />
                {card.alert && typeof card.value === 'number' && card.value > 0 && (
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse-critical" />
                )}
              </div>
              <div className={`font-mono-data text-xl font-600 ${card.color}`}>{card.value}</div>
              <div className="text-[9px] text-zinc-500 mt-0.5">{card.label}</div>
              <div className="text-[8px] font-mono-data text-zinc-700 mt-0.5">{card.sub}</div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <ThreatMap navigate={navigate} />
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4 flex flex-col">
          <div className="text-xs font-500 text-zinc-200 mb-3">Case Timeline</div>
          <div className="flex-1 space-y-0 overflow-y-auto">
            {TIMELINE_CASES.map((c) => (
              <div key={c.id} className="relative pl-5 pb-4 last:pb-0">
                <div className="absolute left-1.5 top-1 bottom-0 w-px bg-zinc-800" />
                <div className={`absolute left-0.5 top-1 w-2 h-2 rounded-full border-2 border-zinc-900 ${
                  c.severity === 'CRITICAL' ? 'bg-red-500' : c.severity === 'HIGH' ? 'bg-amber-400' : 'bg-zinc-500'
                }`} />
                <button
                  onClick={() => navigate('cases', c.id)}
                  className="text-left w-full"
                >
                  <div className="text-[10px] font-mono-data text-zinc-400 font-500 hover:text-zinc-200 transition-colors">{c.caseNumber}</div>
                  <div className="text-[9px] text-zinc-600">{c.fraudType}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-mono-data text-zinc-500">
                      ₹{(c.reportedAmount / 100000).toFixed(1)}L
                    </span>
                    <span className={severityBadge(c.severity)}>{c.severity}</span>
                    {c.alert && (
                      <div className={`w-1.5 h-1.5 rounded-full ${statusDot(c.alert.status)}`} />
                    )}
                  </div>
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('cases')}
            className="mt-3 text-[9px] font-mono-data text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
          >
            VIEW ALL CASES <ArrowRight size={9} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <LiveFeed transactions={allTxs} />

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-500 text-zinc-200">Top Predictions</div>
            <span className="text-[9px] font-mono-data text-zinc-600">SIMULATION</span>
          </div>
          <div className="space-y-1">
            <div className="grid grid-cols-6 gap-1 text-[8px] font-mono-data text-zinc-600 pb-1 border-b border-zinc-800">
              <span>#</span>
              <span className="col-span-2">Location</span>
              <span>Prob</span>
              <span>Window</span>
              <span>Exp.Rec</span>
            </div>
            {topPredictions.map((c, i) => {
              const loc = c.prediction!.locations[0]
              return (
                <div
                  key={c.id}
                  className="grid grid-cols-6 gap-1 text-[9px] font-mono-data py-1.5 border-b border-zinc-800/40 cursor-pointer hover:bg-zinc-800/30 transition-colors rounded px-1"
                  onClick={() => navigate('cases', c.id)}
                >
                  <span className="text-zinc-600">{i + 1}</span>
                  <span className="col-span-2 text-zinc-300 truncate">{loc.name.slice(0, 18)}</span>
                  <span className={loc.probability > 0.65 ? 'text-emerald-400 font-600' : 'text-amber-400'}>
                    {(loc.probability * 100).toFixed(1)}%
                  </span>
                  <span className="text-zinc-500">{c.prediction!.timeWindowMin}–{c.prediction!.timeWindowMax}m</span>
                  <span className="text-zinc-400">
                    ₹{(loc.expectedRecovery / 100000).toFixed(1)}L
                  </span>
                </div>
              )
            })}
          </div>
          <button
            onClick={() => navigate('predictions')}
            className="mt-3 text-[9px] font-mono-data text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
          >
            ALL PREDICTIONS <ArrowRight size={9} />
          </button>
        </div>
      </div>
    </div>
  )
}
