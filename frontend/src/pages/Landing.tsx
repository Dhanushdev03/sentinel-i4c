import { useState, useEffect } from 'react'
import {
  Shield,
  Play,
  LayoutDashboard,
  Network,
  ArrowRight,
  Lock,
  Cpu,
  GitBranch,
  MapPin,
  Zap,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import { CASES } from '../data/mockData'

interface LandingProps {
  onStartDemo: () => void
  onOpenDashboard: () => void
}

const STATS = [
  { label: 'SYNTHETIC CASES', value: '20', unit: 'loaded' },
  { label: 'AVG TRACE HOPS', value: '3.2', unit: 'simulated' },
  { label: 'TOP-3 ACCURACY', value: '82%', unit: 'simulation' },
  { label: 'DEMO DURATION', value: '45s', unit: 'approx' },
]

const WORKFLOW = [
  { icon: AlertTriangle, label: 'Complaint Received', color: 'text-zinc-400' },
  { icon: GitBranch, label: 'Transaction Stream', color: 'text-zinc-400' },
  { icon: Network, label: 'Graph Construction', color: 'text-zinc-400' },
  { icon: Cpu, label: 'TGN + Geo Engine', color: 'text-zinc-400' },
  { icon: MapPin, label: 'Cash-out Prediction', color: 'text-blue-400' },
  { icon: Zap, label: 'Intervention Alert', color: 'text-amber-400' },
  { icon: CheckCircle2, label: 'Officer Action', color: 'text-emerald-400' },
]

const ARCH_NODES = [
  { x: 80, y: 60, label: 'Complaint', sub: 'NCRP Mock', color: '#71717a' },
  { x: 240, y: 60, label: 'Kafka', sub: 'Stream', color: '#71717a' },
  { x: 400, y: 60, label: 'Neo4j', sub: 'Graph DB', color: '#71717a' },
  { x: 80, y: 160, label: 'FastAPI', sub: 'Backend', color: '#3b82f6' },
  { x: 240, y: 160, label: 'TGN Engine', sub: 'PyTorch Geo', color: '#8b5cf6' },
  { x: 400, y: 160, label: 'ST-KDE/GCN', sub: 'Geo Engine', color: '#8b5cf6' },
  { x: 240, y: 260, label: 'Fusion', sub: 'Calibration', color: '#f59e0b' },
  { x: 400, y: 260, label: 'SHAP', sub: 'XAI', color: '#f59e0b' },
  { x: 160, y: 330, label: 'Alert', sub: 'WebSocket', color: '#ef4444' },
  { x: 320, y: 330, label: 'Officer UI', sub: 'React', color: '#22d3ee' },
]

const ARCH_EDGES = [
  [0, 1], [1, 2], [0, 3], [1, 4], [2, 4], [2, 5],
  [3, 4], [4, 6], [5, 6], [6, 7], [6, 8], [8, 9], [7, 9],
]

export default function Landing({ onStartDemo, onOpenDashboard }: LandingProps) {
  const [typedIndex, setTypedIndex] = useState(0)
  const [showArch, setShowArch] = useState(false)
  const TITLE = 'SENTINEL-I4C'

  useEffect(() => {
    if (typedIndex < TITLE.length) {
      const id = setTimeout(() => setTypedIndex(i => i + 1), 80)
      return () => clearTimeout(id)
    }
  }, [typedIndex])

  const activeCases = CASES.filter(c => c.status === 'ACTIVE').length

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.06) 0%, transparent 70%)',
        }}
      />

      <header className="border-b border-zinc-800/60 px-8 py-4 flex items-center gap-3">
        <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
          <Shield size={14} className="text-zinc-950" />
        </div>
        <span className="font-rajdhani font-700 text-sm tracking-[0.25em] text-zinc-100 uppercase">
          SENTINEL-I4C
        </span>
        <span className="ml-2 text-[9px] font-mono-data text-zinc-600 border border-zinc-800 px-1.5 py-0.5 rounded">
          DEMO / SIMULATION
        </span>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          <span className="text-[10px] font-mono-data text-zinc-500">{activeCases} ACTIVE CASES</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 py-12 gap-8">
        <div className="text-center space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-[9px] font-mono-data text-zinc-500 border border-zinc-800 px-3 py-1.5 rounded mb-2">
            <Lock size={9} />
            SMART INDIA HACKATHON — PROTOTYPE DEMONSTRATION
          </div>

          <h1
            className="font-rajdhani font-700 text-6xl md:text-7xl tracking-[0.15em] text-zinc-100"
            style={{ textShadow: '0 0 60px rgba(255,255,255,0.08)' }}
          >
            {TITLE.slice(0, typedIndex)}
            <span className="animate-pulse text-zinc-500">_</span>
          </h1>

          <p className="font-rajdhani font-600 text-xl text-zinc-400 tracking-widest uppercase">
            From Complaint to Intervention
          </p>

          <p className="text-sm text-zinc-500 leading-relaxed max-w-lg mx-auto">
            Predictive Intelligence Platform for Cyber-Fraud Response. Reconstructs money-flow
            graphs, predicts cash-out locations using TGN + Geo-temporal engines, and enables
            law enforcement intervention — all in under 30 minutes.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onStartDemo}
              className="flex items-center gap-2 bg-white text-zinc-950 px-6 py-2.5 rounded font-mono-data text-xs font-600 tracking-wider hover:bg-zinc-100 active:scale-95 transition-all"
            >
              <Play size={12} />
              START DEMO
            </button>
            <button
              onClick={onOpenDashboard}
              className="flex items-center gap-2 border border-zinc-700 text-zinc-300 px-6 py-2.5 rounded font-mono-data text-xs font-500 tracking-wider hover:border-zinc-500 hover:text-zinc-100 transition-all"
            >
              <LayoutDashboard size={12} />
              OPEN DASHBOARD
            </button>
            <button
              onClick={() => setShowArch(a => !a)}
              className="flex items-center gap-2 border border-zinc-800 text-zinc-500 px-6 py-2.5 rounded font-mono-data text-xs font-500 tracking-wider hover:border-zinc-700 hover:text-zinc-400 transition-all"
            >
              <Network size={12} />
              VIEW ARCHITECTURE
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 w-full max-w-2xl">
          {STATS.map(s => (
            <div
              key={s.label}
              className="bg-zinc-900/50 border border-zinc-800/60 rounded p-3 text-center"
            >
              <div className="font-mono-data text-xl font-600 text-zinc-100">{s.value}</div>
              <div className="text-[9px] font-mono-data text-zinc-500 mt-0.5">{s.label}</div>
              <div className="text-[8px] text-zinc-700 mt-0.5">{s.unit}</div>
            </div>
          ))}
        </div>

        <div className="w-full max-w-2xl">
          <div className="text-[10px] font-mono-data text-zinc-600 mb-3 tracking-wider">
            PREDICTION WORKFLOW
          </div>
          <div className="flex items-center gap-0 overflow-x-auto">
            {WORKFLOW.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={step.label} className="flex items-center gap-0 flex-shrink-0">
                  <div className="flex flex-col items-center gap-1 px-3">
                    <div className="w-7 h-7 rounded-sm bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <Icon size={12} className={step.color} />
                    </div>
                    <span className="text-[9px] font-mono-data text-zinc-600 whitespace-nowrap">{step.label}</span>
                  </div>
                  {i < WORKFLOW.length - 1 && (
                    <ArrowRight size={10} className="text-zinc-700 flex-shrink-0 -mx-1" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {showArch && (
          <div className="w-full max-w-2xl bg-zinc-900/60 border border-zinc-800 rounded-lg p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono-data text-zinc-400 tracking-wider">SYSTEM ARCHITECTURE</span>
              <button
                onClick={() => setShowArch(false)}
                className="text-[9px] font-mono-data text-zinc-600 hover:text-zinc-400"
              >
                CLOSE
              </button>
            </div>
            <svg width="100%" viewBox="0 0 500 380" className="overflow-visible">
              {ARCH_EDGES.map(([a, b], i) => {
                const na = ARCH_NODES[a]
                const nb = ARCH_NODES[b]
                return (
                  <line
                    key={i}
                    x1={na.x + 35}
                    y1={na.y + 16}
                    x2={nb.x + 35}
                    y2={nb.y + 16}
                    stroke="#27272a"
                    strokeWidth="1"
                  />
                )
              })}
              {ARCH_NODES.map((n, i) => (
                <g key={i} transform={`translate(${n.x},${n.y})`}>
                  <rect
                    width="70"
                    height="32"
                    rx="3"
                    fill="#0d0d12"
                    stroke={n.color}
                    strokeWidth="0.8"
                    strokeOpacity="0.6"
                  />
                  <text x="35" y="13" fill={n.color} fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono" fontWeight="600">
                    {n.label}
                  </text>
                  <text x="35" y="24" fill="#52525b" fontSize="6.5" textAnchor="middle" fontFamily="JetBrains Mono">
                    {n.sub}
                  </text>
                </g>
              ))}
            </svg>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[
                { label: 'Frontend', items: 'React · TypeScript · Vite · Tailwind' },
                { label: 'Backend', items: 'FastAPI · PostgreSQL · Neo4j · Redis' },
                { label: 'ML', items: 'PyTorch Geo · XGBoost · SHAP · scikit-learn' },
              ].map(t => (
                <div key={t.label} className="bg-zinc-950/60 rounded p-2">
                  <div className="text-[9px] font-mono-data text-zinc-400 mb-1">{t.label}</div>
                  <div className="text-[8px] text-zinc-600 leading-relaxed">{t.items}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-800/60 px-8 py-3 flex items-center justify-between">
        <div className="text-[9px] font-mono-data text-zinc-700">
          ⚠ PROTOTYPE — SYNTHETIC DATA — NOT FOR OPERATIONAL USE
        </div>
        <div className="text-[9px] font-mono-data text-zinc-700">
          SENTINEL-I4C v0.4.2-DEMO · SIH HACKATHON
        </div>
      </footer>
    </div>
  )
}
