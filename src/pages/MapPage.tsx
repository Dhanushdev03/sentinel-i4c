import { useState } from 'react'
import { MapPin, Cpu, Building2, Info, AlertTriangle } from 'lucide-react'
import { CASES, CASH_WITHDRAWAL_POINTS } from '../data/mockData'

interface Props {
  navigate: (page: string, id?: string) => void
}

const INDIA_BOUNDS = { minLat: 8, maxLat: 37, minLng: 68, maxLng: 98 }
const W = 700, H = 520

function toXY(lat: number, lng: number) {
  const x = ((lng - INDIA_BOUNDS.minLng) / (INDIA_BOUNDS.maxLng - INDIA_BOUNDS.minLng)) * W
  const y = ((INDIA_BOUNDS.maxLat - lat) / (INDIA_BOUNDS.maxLat - INDIA_BOUNDS.minLat)) * H
  return { x, y }
}

const CITIES = [
  { name: 'Mumbai', lat: 19.08, lng: 72.88 }, { name: 'New Delhi', lat: 28.63, lng: 77.22 },
  { name: 'Bangalore', lat: 12.97, lng: 77.59 }, { name: 'Chennai', lat: 13.08, lng: 80.27 },
  { name: 'Hyderabad', lat: 17.38, lng: 78.49 }, { name: 'Kolkata', lat: 22.57, lng: 88.36 },
  { name: 'Jaipur', lat: 26.91, lng: 75.79 }, { name: 'Ahmedabad', lat: 23.03, lng: 72.59 },
  { name: 'Lucknow', lat: 26.85, lng: 80.95 }, { name: 'Chandigarh', lat: 30.74, lng: 76.79 },
  { name: 'Bhopal', lat: 23.26, lng: 77.40 }, { name: 'Patna', lat: 25.59, lng: 85.14 },
  { name: 'Pune', lat: 18.52, lng: 73.86 }, { name: 'Surat', lat: 21.17, lng: 72.83 },
  { name: 'Nagpur', lat: 21.15, lng: 79.09 }, { name: 'Kochi', lat: 9.93, lng: 76.26 },
]

const INDIA_OUTLINE = [
  { lat: 34, lng: 74 }, { lat: 36, lng: 77 }, { lat: 35, lng: 79 }, { lat: 33, lng: 79 },
  { lat: 32, lng: 77 }, { lat: 31, lng: 79 }, { lat: 29, lng: 79 }, { lat: 28, lng: 81 },
  { lat: 27, lng: 84 }, { lat: 26, lng: 87 }, { lat: 25, lng: 89 }, { lat: 24, lng: 90 },
  { lat: 23, lng: 91 }, { lat: 23, lng: 92 }, { lat: 22, lng: 93 }, { lat: 21, lng: 92 },
  { lat: 21, lng: 90 }, { lat: 22, lng: 88 }, { lat: 21, lng: 87 }, { lat: 19, lng: 85 },
  { lat: 17, lng: 82 }, { lat: 15, lng: 81 }, { lat: 13, lng: 80 }, { lat: 11, lng: 80 },
  { lat: 9, lng: 79 }, { lat: 8, lng: 78 }, { lat: 9, lng: 77 }, { lat: 10, lng: 76 },
  { lat: 11, lng: 75 }, { lat: 12, lng: 74 }, { lat: 14, lng: 74 }, { lat: 15, lng: 73 },
  { lat: 16, lng: 73 }, { lat: 17, lng: 72 }, { lat: 19, lng: 72 }, { lat: 20, lng: 72 },
  { lat: 21, lng: 69 }, { lat: 22, lng: 68 }, { lat: 23, lng: 68 }, { lat: 24, lng: 69 },
  { lat: 25, lng: 70 }, { lat: 26, lng: 70 }, { lat: 27, lng: 71 }, { lat: 28, lng: 70 },
  { lat: 29, lng: 70 }, { lat: 30, lng: 71 }, { lat: 31, lng: 73 }, { lat: 32, lng: 74 },
  { lat: 33, lng: 74 }, { lat: 34, lng: 74 },
]

export default function MapPage({ navigate }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [showLayer, setShowLayer] = useState({ predictions: true, atms: true, heat: true })

  const predLocations = CASES.filter(c => c.prediction && c.status === 'ACTIVE').map(c => ({
    caseId: c.id,
    caseNumber: c.caseNumber,
    severity: c.severity,
    fraudType: c.fraudType,
    loc: c.prediction!.locations[0],
  }))

  const outlinePath = INDIA_OUTLINE.map((p, i) => {
    const { x, y } = toXY(p.lat, p.lng)
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ') + ' Z'

  const hoveredCase = hoveredId ? CASES.find(c => c.id === hoveredId) : null
  const hoveredPred = hoveredCase?.prediction?.locations[0]

  return (
    <div className="flex flex-col h-full p-4 gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-rajdhani font-700 text-lg text-zinc-100 tracking-wider">LIVE THREAT MAP</h2>
          <div className="text-[9px] font-mono-data text-zinc-600">India · Synthetic simulation · Not real location data</div>
        </div>
        <div className="flex items-center gap-2">
          {[
            { key: 'predictions', label: 'Predictions' },
            { key: 'atms', label: 'ATM/CSP' },
            { key: 'heat', label: 'Heat Zones' },
          ].map(l => (
            <button
              key={l.key}
              onClick={() => setShowLayer(s => ({ ...s, [l.key]: !s[l.key as keyof typeof s] }))}
              className={`text-[9px] font-mono-data px-2 py-1 border rounded transition-all ${
                showLayer[l.key as keyof typeof showLayer]
                  ? 'bg-zinc-800 border-zinc-600 text-zinc-200'
                  : 'border-zinc-800 text-zinc-600'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden">
            <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} className="bg-zinc-950">
              {/* Grid */}
              {[...Array(8)].map((_, i) => (
                <line key={`v${i}`} x1={i * (W / 7)} y1={0} x2={i * (W / 7)} y2={H} stroke="#0d0d12" strokeWidth="1" />
              ))}
              {[...Array(7)].map((_, i) => (
                <line key={`h${i}`} x1={0} y1={i * (H / 6)} x2={W} y2={i * (H / 6)} stroke="#0d0d12" strokeWidth="1" />
              ))}

              {/* India outline */}
              <path d={outlinePath} fill="#0f0f14" stroke="#2a2a3a" strokeWidth="1.2" />

              {/* Heat zones */}
              {showLayer.heat && predLocations.filter(p => p.severity === 'CRITICAL' || p.severity === 'HIGH').map((p, i) => {
                const { x, y } = toXY(p.loc.lat, p.loc.lng)
                return (
                  <g key={`heat-${i}`}>
                    <circle cx={x} cy={y} r={35} fill="#ef4444" opacity="0.06" />
                    <circle cx={x} cy={y} r={20} fill="#ef4444" opacity="0.1" />
                  </g>
                )
              })}

              {/* ATM/CSP locations */}
              {showLayer.atms && CASH_WITHDRAWAL_POINTS.map(cwp => {
                const { x, y } = toXY(cwp.lat, cwp.lng)
                return (
                  <g key={cwp.id}>
                    <circle cx={x} cy={y} r={3} fill={cwp.riskScore > 0.7 ? '#3b82f6' : '#1e3a8a'} stroke="#0d0d12" strokeWidth="0.5" opacity="0.8" />
                  </g>
                )
              })}

              {/* City labels */}
              {CITIES.map(c => {
                const { x, y } = toXY(c.lat, c.lng)
                return (
                  <g key={c.name}>
                    <circle cx={x} cy={y} r={1.5} fill="#3f3f46" />
                    <text x={x + 4} y={y + 4} fill="#3f3f46" fontSize="7" fontFamily="JetBrains Mono">{c.name}</text>
                  </g>
                )
              })}

              {/* Predicted cash-out locations */}
              {showLayer.predictions && predLocations.map((p, i) => {
                const { x, y } = toXY(p.loc.lat, p.loc.lng)
                const isCrit = p.severity === 'CRITICAL'
                const isHov = hoveredId === p.caseId
                return (
                  <g
                    key={i}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredId(p.caseId)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => navigate('cases', p.caseId)}
                  >
                    {isCrit && (
                      <circle cx={x} cy={y} r={14} fill="#ef4444" opacity={isHov ? 0.25 : 0.12} />
                    )}
                    <circle
                      cx={x} cy={y} r={isCrit ? 7 : 5}
                      fill={isCrit ? '#ef4444' : '#f59e0b'}
                      stroke={isCrit ? '#fca5a5' : '#fcd34d'}
                      strokeWidth={isHov ? 1.5 : 0.8}
                      opacity={isHov ? 1 : 0.9}
                    />
                    <text
                      x={x + 9} y={y + 3}
                      fill={isCrit ? '#fca5a5' : '#fcd34d'}
                      fontSize="7" fontFamily="JetBrains Mono" fontWeight="700"
                    >
                      {(p.loc.probability * 100).toFixed(0)}%
                    </text>
                    {isHov && (
                      <text x={x + 9} y={y + 12} fill="#a1a1aa" fontSize="6" fontFamily="JetBrains Mono">
                        {p.caseNumber}
                      </text>
                    )}
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        <div className="w-56 flex flex-col gap-3">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 space-y-2">
            <div className="text-[9px] font-mono-data text-zinc-500 tracking-wider">MAP LEGEND</div>
            {[
              { color: '#ef4444', label: 'Critical prediction', size: 7 },
              { color: '#f59e0b', label: 'High prediction', size: 5 },
              { color: '#3b82f6', label: 'High-risk ATM/CSP', size: 3 },
              { color: '#1e3a8a', label: 'ATM/CSP/Branch', size: 3 },
              { color: '#3f3f46', label: 'City reference', size: 1.5 },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2">
                <svg width="16" height="16">
                  <circle cx="8" cy="8" r={l.size} fill={l.color} />
                </svg>
                <span className="text-[9px] font-mono-data text-zinc-500">{l.label}</span>
              </div>
            ))}
          </div>

          {hoveredCase && hoveredPred ? (
            <div className="bg-zinc-900/70 border border-zinc-700 rounded-lg p-3 space-y-2 animate-fade-in">
              <div className="text-[9px] font-mono-data text-zinc-400 font-600">{hoveredCase.caseNumber}</div>
              <div className="text-[9px] text-zinc-500">{hoveredCase.fraudType}</div>
              <div className="border-t border-zinc-800 pt-2 space-y-1">
                <div className="text-[8px] font-mono-data text-zinc-600">PREDICTED LOCATION</div>
                <div className="text-[10px] text-zinc-200">{hoveredPred.name}</div>
                <div className="flex justify-between text-[9px] font-mono-data">
                  <span className="text-zinc-600">Prob:</span>
                  <span className="text-amber-400">{(hoveredPred.probability * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-[9px] font-mono-data">
                  <span className="text-zinc-600">Exp. Rec:</span>
                  <span className="text-emerald-400">₹{(hoveredPred.expectedRecovery / 100000).toFixed(1)}L</span>
                </div>
                <div className="flex justify-between text-[9px] font-mono-data">
                  <span className="text-zinc-600">Window:</span>
                  <span className="text-blue-400">{hoveredCase.prediction!.timeWindowMin}–{hoveredCase.prediction!.timeWindowMax}min</span>
                </div>
              </div>
              <button
                onClick={() => navigate('cases', hoveredCase.id)}
                className="w-full text-[9px] font-mono-data text-zinc-400 border border-zinc-700 rounded py-1 hover:border-zinc-500 hover:text-zinc-200 transition-colors mt-1"
              >
                VIEW CASE →
              </button>
            </div>
          ) : (
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-3 space-y-2">
              <div className="text-[9px] font-mono-data text-zinc-500">ACTIVE PREDICTIONS</div>
              <div className="space-y-1.5">
                {predLocations.slice(0, 6).map(p => (
                  <button
                    key={p.caseId}
                    onClick={() => navigate('cases', p.caseId)}
                    className="w-full flex items-center gap-2 text-left hover:bg-zinc-800/30 rounded p-1 transition-colors"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      p.severity === 'CRITICAL' ? 'bg-red-500 animate-pulse-critical' : 'bg-amber-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] font-mono-data text-zinc-400 truncate">{p.caseNumber}</div>
                      <div className="text-[8px] text-zinc-600 truncate">{p.loc.name.slice(0, 18)}</div>
                    </div>
                    <span className="text-[9px] font-mono-data text-zinc-500 flex-shrink-0">
                      {(p.loc.probability * 100).toFixed(0)}%
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-zinc-900/30 border border-zinc-800/60 rounded p-2">
            <div className="flex items-start gap-1.5">
              <Info size={9} className="text-zinc-700 flex-shrink-0 mt-0.5" />
              <p className="text-[8px] text-zinc-700 leading-relaxed">
                Synthetic map data. Coordinates are approximate and do not represent actual ATM/CSP locations. For demonstration only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
