import { useState } from 'react'
import {
  AlertTriangle, CheckCircle2, XCircle, ChevronUp, ArrowRight, Shield,
  MapPin, Clock, DollarSign, Brain, Zap, BarChart2, User, FileText,
  ChevronDown, Activity, GitBranch, Lock, Info, TrendingUp, Eye, Bell
} from 'lucide-react'
import { CASES, type FraudCase, type GraphNode, type Transaction } from '../data/mockData'

interface Props {
  caseId: string | null
  navigate: (page: string, id?: string) => void
  demoStep: number
  demoRunning: boolean
}

function confidenceBar(weight: number, label: string, color: string) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-mono-data text-zinc-500 w-14">{label}</span>
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${weight * 100}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[9px] font-mono-data text-zinc-400 w-8 text-right">{(weight * 100).toFixed(0)}%</span>
    </div>
  )
}

function TransactionGraph({ nodes, transactions, demoStep }: { nodes: GraphNode[]; transactions: Transaction[]; demoStep: number }) {
  const [selected, setSelected] = useState<GraphNode | null>(null)
  const mainTxs = transactions.filter(t => !t.isNoise)
  const noiseTxs = transactions.filter(t => t.isNoise)
  const maxHop = Math.max(...mainTxs.map(t => t.hop))

  const W = 560, H = 180
  const PAD = 50

  const nodePositions: Record<string, { x: number; y: number }> = {}
  mainTxs.forEach((tx, i) => {
    const xStep = (W - PAD * 2) / Math.max(maxHop, 1)
    const jitter = (i % 2 === 0 ? -1 : 1) * 20
    if (!nodePositions[tx.fromAccount]) {
      nodePositions[tx.fromAccount] = {
        x: PAD + tx.hop * xStep,
        y: H / 2 + jitter,
      }
    }
    if (!nodePositions[tx.toAccount]) {
      nodePositions[tx.toAccount] = {
        x: PAD + (tx.hop + 1) * xStep,
        y: H / 2 - jitter,
      }
    }
  })

  function nodeColor(n: GraphNode) {
    if (n.type === 'VICTIM') return '#94a3b8'
    if (n.type === 'TERMINAL' || n.type === 'ATM') return '#ef4444'
    if (n.type === 'MULE') {
      const hop = mainTxs.find(t => t.fromAccount === n.id)?.hop ?? 0
      return hop >= 2 ? '#f59e0b' : '#d97706'
    }
    return '#6b7280'
  }

  function nodeRadius(n: GraphNode) {
    if (n.type === 'VICTIM') return 10
    if (n.type === 'TERMINAL' || n.type === 'ATM') return 12
    return 8
  }

  function nodeLabel(id: string) {
    if (id.startsWith('VICT')) return 'VICTIM'
    if (id.startsWith('TERM')) return 'TERMINAL'
    if (id.startsWith('MUL')) return `MULE-${id.slice(-2)}`
    return id.slice(-6)
  }

  const visibleSteps = demoStep >= 3 ? mainTxs.length : Math.min(demoStep, mainTxs.length)

  return (
    <div className="relative">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="bg-zinc-950/60 rounded border border-zinc-800/50">
        {/* Noise transactions */}
        {noiseTxs.slice(0, 2).map((tx, i) => {
          const fx = 80 + i * 120, fy = 30
          const tx2 = 120 + i * 110, ty = 50
          return (
            <line key={`noise-${i}`} x1={fx} y1={fy} x2={tx2} y2={ty}
              stroke="#1e1e2a" strokeWidth="0.8" strokeDasharray="3,3" />
          )
        })}

        {/* Edges */}
        {mainTxs.slice(0, visibleSteps).map((tx, i) => {
          const from = nodePositions[tx.fromAccount]
          const to = nodePositions[tx.toAccount]
          if (!from || !to) return null
          const strokeW = Math.max(1, Math.min(4, tx.amount / 150000))
          const isLast = i === mainTxs.length - 1

          const midX = (from.x + to.x) / 2
          const midY = Math.min(from.y, to.y) - 22

          return (
            <g key={tx.id}>
              <path
                d={`M${from.x},${from.y} Q${midX},${midY} ${to.x},${to.y}`}
                fill="none"
                stroke={isLast ? '#f59e0b' : '#3f3f46'}
                strokeWidth={strokeW}
                className="graph-edge"
                style={{ strokeDasharray: 1000, animationDelay: `${i * 0.15}s` }}
              />
              <text x={midX} y={midY - 3} fill="#52525b" fontSize="7" textAnchor="middle" fontFamily="JetBrains Mono">
                ₹{tx.amount >= 100000 ? `${(tx.amount / 100000).toFixed(1)}L` : `${(tx.amount / 1000).toFixed(0)}K`}
              </text>
            </g>
          )
        })}

        {/* Nodes */}
        {nodes
          .filter(n => nodePositions[n.id])
          .map(n => {
            const pos = nodePositions[n.id]
            const r = nodeRadius(n)
            const col = nodeColor(n)
            const isSelected = selected?.id === n.id
            const isTerminal = n.type === 'TERMINAL' || n.type === 'ATM'

            return (
              <g key={n.id} className="graph-node" onClick={() => setSelected(s => s?.id === n.id ? null : n)}>
                {isTerminal && (
                  <circle cx={pos.x} cy={pos.y} r={r + 6} fill={col} opacity="0.15" className="animate-ping-slow" />
                )}
                {isSelected && (
                  <circle cx={pos.x} cy={pos.y} r={r + 4} fill="none" stroke="white" strokeWidth="0.8" strokeDasharray="3,2" />
                )}
                <circle cx={pos.x} cy={pos.y} r={r} fill={col} opacity={0.9} stroke="#0d0d12" strokeWidth="1.5" />
                <text x={pos.x} y={pos.y + r + 11} fill={col} fontSize="6.5" textAnchor="middle" fontFamily="JetBrains Mono" fontWeight="600">
                  {nodeLabel(n.id)}
                </text>
                {n.type === 'VICTIM' && (
                  <text x={pos.x} y={pos.y + 3} fill="#0d0d12" fontSize="7" textAnchor="middle" fontFamily="JetBrains Mono" fontWeight="bold">V</text>
                )}
                {isTerminal && (
                  <text x={pos.x} y={pos.y + 3} fill="#0d0d12" fontSize="7" textAnchor="middle" fontFamily="JetBrains Mono" fontWeight="bold">T</text>
                )}
              </g>
            )
          })}

        {/* Legend */}
        <g transform="translate(8,8)">
          {[
            { col: '#94a3b8', label: 'Victim' },
            { col: '#d97706', label: 'Mule' },
            { col: '#ef4444', label: 'Terminal (predicted)' },
          ].map((item, i) => (
            <g key={item.label} transform={`translate(0,${i * 13})`}>
              <circle cx={5} cy={5} r={4} fill={item.col} opacity="0.8" />
              <text x={13} y={9} fill="#6b7280" fontSize="6.5" fontFamily="JetBrains Mono">{item.label}</text>
            </g>
          ))}
        </g>
      </svg>

      {selected && (
        <div className="absolute top-2 right-2 bg-zinc-900 border border-zinc-700 rounded p-2.5 text-[9px] font-mono-data space-y-1 min-w-36 animate-fade-in z-10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-zinc-300 font-600">{nodeLabel(selected.id)}</span>
            <button onClick={() => setSelected(null)} className="text-zinc-600 hover:text-zinc-400">×</button>
          </div>
          <div className="text-zinc-600">TYPE: <span className="text-zinc-400">{selected.type}</span></div>
          <div className="text-zinc-600">BANK: <span className="text-zinc-400">{selected.bank}</span></div>
          <div className="text-zinc-600">RISK: <span className={selected.riskScore > 0.7 ? 'text-red-400' : 'text-amber-400'}>{(selected.riskScore * 100).toFixed(0)}/100</span></div>
          <div className="text-zinc-600">AMOUNT: <span className="text-zinc-400">₹{(selected.amount / 1000).toFixed(0)}K</span></div>
        </div>
      )}
    </div>
  )
}

function ShapChart({ factors }: { factors: FraudCase['prediction'] extends undefined ? never : NonNullable<FraudCase['prediction']>['shapFactors'] }) {
  const maxImpact = Math.max(...factors.map(f => Math.abs(f.impact)))
  return (
    <div className="space-y-2">
      {factors.map(f => (
        <div key={f.feature} className="space-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-zinc-400 leading-none">{f.feature}</span>
            <span className={`text-[9px] font-mono-data font-600 ${f.direction === 'positive' ? 'text-amber-400' : 'text-blue-400'}`}>
              {f.direction === 'positive' ? '+' : ''}{f.impact.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(Math.abs(f.impact) / maxImpact) * 100}%`,
                  backgroundColor: f.direction === 'positive' ? '#f59e0b' : '#60a5fa',
                }}
              />
            </div>
            <span className="text-[8px] font-mono-data text-zinc-600 w-16 text-right truncate">{f.value}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function OfficerActions({ caseData, demoStep }: { caseData: FraudCase; demoStep: number }) {
  const [action, setAction] = useState<string | null>(caseData.alert?.officerAction ?? null)
  const [note, setNote] = useState('')
  const [showNote, setShowNote] = useState(false)
  const [outcome, setOutcome] = useState<string | null>(caseData.outcome?.result ?? null)

  const isActioned = action !== null

  return (
    <div className="space-y-3">
      <div className="text-[10px] font-mono-data text-zinc-400 tracking-wider mb-2">OFFICER ACTION REQUIRED</div>
      {!isActioned ? (
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'CONFIRM', label: 'CONFIRM & DISPATCH', color: 'bg-emerald-900/50 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/70', icon: CheckCircle2 },
            { id: 'ESCALATE', label: 'ESCALATE', color: 'bg-amber-900/30 border-amber-700/50 text-amber-300 hover:bg-amber-900/50', icon: ChevronUp },
            { id: 'OVERRIDE', label: 'OVERRIDE', color: 'bg-blue-900/30 border-blue-700/50 text-blue-300 hover:bg-blue-900/50', icon: XCircle },
            { id: 'IGNORE', label: 'IGNORE', color: 'bg-zinc-900/50 border-zinc-700 text-zinc-400 hover:bg-zinc-800/50', icon: XCircle },
          ].map(btn => {
            const Icon = btn.icon
            return (
              <button
                key={btn.id}
                onClick={() => { setAction(btn.id); setShowNote(true) }}
                className={`flex items-center gap-2 px-3 py-2 border rounded text-[10px] font-mono-data font-600 tracking-wider transition-all ${btn.color}`}
              >
                <Icon size={11} />
                {btn.label}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="bg-emerald-950/30 border border-emerald-800/50 rounded p-2.5 flex items-center gap-2">
          <CheckCircle2 size={12} className="text-emerald-400" />
          <div>
            <div className="text-[10px] font-mono-data text-emerald-300">Action: {action}</div>
            {note && <div className="text-[9px] text-zinc-500 mt-0.5">"{note}"</div>}
          </div>
          <button onClick={() => { setAction(null); setNote(''); setShowNote(false) }} className="ml-auto text-[9px] text-zinc-600 hover:text-zinc-400 font-mono-data">REVISE</button>
        </div>
      )}

      {showNote && !isActioned && (
        <div className="space-y-2 animate-slide-up">
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Officer notes (optional)..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-[10px] font-mono-data text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-500 resize-none h-14"
          />
        </div>
      )}

      {action && !outcome && (
        <div className="mt-3">
          <div className="text-[10px] font-mono-data text-zinc-500 mb-2">RECORD OUTCOME</div>
          <div className="grid grid-cols-3 gap-2">
            {['HIT', 'PARTIAL', 'MISS'].map(r => (
              <button
                key={r}
                onClick={() => setOutcome(r)}
                className={`py-1.5 border rounded text-[10px] font-mono-data font-600 tracking-wider transition-all ${
                  r === 'HIT' ? 'border-emerald-700/50 text-emerald-400 hover:bg-emerald-950/40' :
                  r === 'PARTIAL' ? 'border-amber-700/50 text-amber-400 hover:bg-amber-950/30' :
                  'border-zinc-700 text-zinc-500 hover:bg-zinc-900/50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {outcome && (
        <div className={`rounded border p-2.5 animate-fade-in ${
          outcome === 'HIT' ? 'bg-emerald-950/30 border-emerald-800/50' :
          outcome === 'PARTIAL' ? 'bg-amber-950/20 border-amber-800/40' :
          'bg-zinc-900/50 border-zinc-700'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={12} className={outcome === 'HIT' ? 'text-emerald-400' : outcome === 'PARTIAL' ? 'text-amber-400' : 'text-zinc-500'} />
            <span className={`text-[10px] font-mono-data font-600 ${outcome === 'HIT' ? 'text-emerald-300' : outcome === 'PARTIAL' ? 'text-amber-300' : 'text-zinc-400'}`}>
              OUTCOME: {outcome} — Feedback loop updated
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CaseIntelligence({ caseId, navigate, demoStep, demoRunning }: Props) {
  const [activeTab, setActiveTab] = useState<'graph' | 'transactions'>('graph')

  const caseData = caseId ? CASES.find(c => c.id === caseId) : CASES[0]

  if (!caseData) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-zinc-600 font-mono-data text-sm">Case not found</div>
      </div>
    )
  }

  const pred = caseData.prediction
  const alert = caseData.alert
  const showPred = demoRunning ? demoStep >= 6 : true
  const showShap = demoRunning ? demoStep >= 7 : true
  const showAlert = demoRunning ? demoStep >= 8 : true
  const showAction = demoRunning ? demoStep >= 9 : true

  function severityBadge(s: string) {
    if (s === 'CRITICAL') return 'bg-red-950/60 border border-red-800/50 text-red-400'
    if (s === 'HIGH') return 'bg-amber-950/40 border border-amber-800/40 text-amber-400'
    if (s === 'MEDIUM') return 'bg-blue-950/40 border border-blue-800/40 text-blue-400'
    return 'bg-zinc-900 border border-zinc-700 text-zinc-400'
  }

  function statusBadge(s: string) {
    if (s === 'ACTIVE') return 'bg-emerald-950/40 border border-emerald-800/40 text-emerald-400'
    if (s === 'RESOLVED') return 'bg-zinc-900 border border-zinc-700 text-zinc-300'
    return 'bg-zinc-900 border border-zinc-800 text-zinc-500'
  }

  const confColor = caseData.traceConfidence === 'HIGH' ? 'text-emerald-400' :
    caseData.traceConfidence === 'MEDIUM' ? 'text-amber-400' : 'text-red-400'

  const TIMELINE_STEPS = [
    { label: 'Complaint Received', done: true, time: caseData.complaintTime },
    { label: 'Case Created', done: true, time: caseData.complaintTime },
    { label: 'Transaction Stream', done: demoRunning ? demoStep >= 2 : true, time: caseData.transactions[0]?.timestamp },
    { label: 'Graph Built', done: demoRunning ? demoStep >= 3 : true },
    { label: `Trace: ${caseData.traceConfidence}`, done: demoRunning ? demoStep >= 4 : true },
    { label: 'Prediction Generated', done: showPred },
    { label: 'Alert Triggered', done: showAlert },
    { label: 'Officer Action', done: showAction && !!caseData.alert?.officerAction },
    { label: 'Outcome', done: !!caseData.outcome },
  ]

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* CASE HEADER */}
      <div className="border-b border-zinc-800 px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-2 text-[9px] font-mono-data text-zinc-600 mb-1">
          <button onClick={() => navigate('dashboard')} className="hover:text-zinc-400">Dashboard</button>
          <ChevronDown size={8} className="rotate-[-90deg]" />
          <button onClick={() => navigate('cases')} className="hover:text-zinc-400">Cases</button>
          <ChevronDown size={8} className="rotate-[-90deg]" />
          <span className="text-zinc-400">{caseData.caseNumber}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <div className={`text-[8px] font-mono-data px-1.5 py-0.5 rounded-sm ${caseData.severity === 'CRITICAL' ? 'animate-pulse-critical' : ''} ${severityBadge(caseData.severity)}`}>
                ● {caseData.severity}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono-data text-base font-600 text-zinc-100">{caseData.caseNumber}</span>
                <span className={`text-[8px] font-mono-data px-1.5 py-0.5 rounded-sm ${statusBadge(caseData.status)}`}>{caseData.status}</span>
                <span className="text-[10px] text-zinc-500">{caseData.fraudType}</span>
              </div>
              <div className="flex items-center gap-4 mt-0.5">
                <span className="text-xs font-mono-data text-zinc-300">₹{(caseData.reportedAmount / 100000).toFixed(2)}L reported</span>
                <span className="text-[10px] text-zinc-600">{caseData.district}, {caseData.state}</span>
                <span className="text-[10px] text-zinc-600">VICTIM: {caseData.victimAccountToken}</span>
                <span className="text-[10px] text-zinc-600">OFFICER: {caseData.officerName} [{caseData.officerBadge}]</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={`px-2 py-1 rounded text-[9px] font-mono-data border ${
              caseData.traceConfidence === 'HIGH' ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-400' :
              caseData.traceConfidence === 'MEDIUM' ? 'bg-amber-950/30 border-amber-800/40 text-amber-400' :
              'bg-red-950/30 border-red-800/40 text-red-400'
            }`}>
              TRACE: {caseData.traceConfidence}
            </div>
            <button
              onClick={() => navigate('evidence', caseData.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[10px] font-mono-data text-zinc-300 hover:border-zinc-500 transition-colors"
            >
              <FileText size={10} />
              EVIDENCE PASSPORT
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT — 3-COLUMN LAYOUT */}
      <div className="flex-1 grid grid-cols-[220px_1fr_260px] min-h-0">

        {/* LEFT: Case Overview + Timeline */}
        <div className="border-r border-zinc-800 overflow-y-auto">
          <div className="p-3 border-b border-zinc-800">
            <div className="text-[9px] font-mono-data text-zinc-500 tracking-wider mb-2">CASE OVERVIEW</div>
            <div className="space-y-1.5">
              {[
                { label: 'FRAUD TYPE', value: caseData.fraudType },
                { label: 'REPORTED', value: `₹${(caseData.reportedAmount / 100000).toFixed(2)}L` },
                { label: 'VICTIM', value: caseData.victimAccountToken },
                { label: 'STATE', value: caseData.state },
                { label: 'DISTRICT', value: caseData.district },
                { label: 'MULE HOPS', value: `${caseData.hops} hops` },
                { label: 'BANKS', value: caseData.bankIds.join(', ') },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-start gap-2">
                  <span className="text-[8px] font-mono-data text-zinc-600 flex-shrink-0">{row.label}</span>
                  <span className="text-[9px] font-mono-data text-zinc-300 text-right truncate">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 border-b border-zinc-800">
            <div className="text-[9px] font-mono-data text-zinc-500 tracking-wider mb-2">CASE NOTES</div>
            <p className="text-[9px] text-zinc-500 leading-relaxed">{caseData.notes}</p>
          </div>

          <div className="p-3">
            <div className="text-[9px] font-mono-data text-zinc-500 tracking-wider mb-3">CASE TIMELINE</div>
            <div className="space-y-0">
              {TIMELINE_STEPS.map((step, i) => (
                <div key={step.label} className="relative pl-5 pb-3 last:pb-0">
                  <div className={`absolute left-1.5 top-0 bottom-0 w-px ${step.done ? 'bg-zinc-700' : 'bg-zinc-800'}`} />
                  <div className={`absolute left-0.5 top-1 w-2 h-2 rounded-full border-2 border-zinc-950 flex items-center justify-center ${
                    step.done ? 'bg-zinc-400' : 'bg-zinc-800'
                  }`} />
                  <div className={`text-[9px] font-mono-data ${step.done ? 'text-zinc-300' : 'text-zinc-700'}`}>{step.label}</div>
                  {step.time && step.done && (
                    <div className="text-[8px] font-mono-data text-zinc-700">
                      {new Date(step.time).toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER: Graph + Trace Confidence + Map */}
        <div className="overflow-y-auto border-r border-zinc-800">
          <div className="p-3 border-b border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('graph')}
                  className={`text-[9px] font-mono-data tracking-wider px-2 py-1 rounded ${activeTab === 'graph' ? 'text-zinc-100 bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  TRANSACTION GRAPH
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`text-[9px] font-mono-data tracking-wider px-2 py-1 rounded ${activeTab === 'transactions' ? 'text-zinc-100 bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  TX LIST ({caseData.transactions.length})
                </button>
              </div>
              <span className="text-[8px] font-mono-data text-zinc-700">Click nodes for details</span>
            </div>

            {activeTab === 'graph' ? (
              <TransactionGraph nodes={caseData.graphNodes} transactions={caseData.transactions} demoStep={demoStep} />
            ) : (
              <div className="space-y-0 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-6 gap-1 text-[8px] font-mono-data text-zinc-600 pb-1 border-b border-zinc-800 sticky top-0 bg-zinc-950">
                  <span>ID</span><span>TIME</span><span>FROM</span><span>AMOUNT</span><span>CH</span><span>RISK</span>
                </div>
                {caseData.transactions.map(tx => (
                  <div key={tx.id} className={`grid grid-cols-6 gap-1 text-[9px] font-mono-data py-1 border-b border-zinc-800/30 ${tx.isNoise ? 'opacity-40' : ''}`}>
                    <span className="text-zinc-600 truncate">{tx.id.slice(-6)}</span>
                    <span className="text-zinc-600">{new Date(tx.timestamp).toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-zinc-400 truncate">{tx.fromAccount.slice(0, 8)}</span>
                    <span className="text-zinc-300">₹{tx.amount >= 100000 ? `${(tx.amount / 100000).toFixed(1)}L` : `${(tx.amount / 1000).toFixed(0)}K`}</span>
                    <span className="text-zinc-500">{tx.channel}</span>
                    <span className={tx.riskScore > 0.7 ? 'text-red-400' : tx.riskScore > 0.4 ? 'text-amber-400' : 'text-emerald-400'}>{(tx.riskScore * 100).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trace Confidence */}
          <div className="p-3 border-b border-zinc-800">
            <div className="text-[9px] font-mono-data text-zinc-500 tracking-wider mb-2">TRACE CONFIDENCE ROUTER</div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {[
                { label: 'OBSERVED HOPS', value: `${caseData.hops}` },
                { label: 'TX RECENCY', value: '< 45min' },
                { label: 'NODE NOVELTY', value: '0.72' },
              ].map(m => (
                <div key={m.label} className="bg-zinc-950/60 rounded p-2 text-center">
                  <div className="font-mono-data text-sm font-600 text-zinc-200">{m.value}</div>
                  <div className="text-[8px] font-mono-data text-zinc-600">{m.label}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-mono-data text-zinc-600">ROUTING DECISION:</span>
              <span className={`text-[9px] font-mono-data font-600 border px-2 py-0.5 rounded-sm ${
                caseData.traceConfidence === 'HIGH' ? 'text-emerald-400 border-emerald-800/60' :
                caseData.traceConfidence === 'MEDIUM' ? 'text-amber-400 border-amber-800/50' :
                'text-red-400 border-red-800/50'
              }`}>
                {caseData.traceConfidence === 'HIGH' ? 'TGN ENGINE (primary)' :
                 caseData.traceConfidence === 'MEDIUM' ? 'FUSION MODE' : 'GEO-TEMPORAL (primary)'}
              </span>
            </div>

            <div className="space-y-1.5">
              {confidenceBar(caseData.tgnWeight, 'TGN', '#8b5cf6')}
              {confidenceBar(caseData.geoWeight, 'GEO', '#06b6d4')}
            </div>
          </div>

          {/* Predicted locations mini-map */}
          {showPred && pred && (
            <div className="p-3 animate-slide-up">
              <div className="text-[9px] font-mono-data text-zinc-500 tracking-wider mb-2">PREDICTED CASH-OUT LOCATIONS</div>
              <div className="space-y-2">
                {pred.locations.map(loc => (
                  <div
                    key={loc.rank}
                    className={`flex items-center gap-3 p-2 rounded border transition-all ${
                      loc.rank === 1 ? 'bg-red-950/20 border-red-800/40' : 'bg-zinc-900/40 border-zinc-800/60'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-sm flex items-center justify-center text-[9px] font-mono-data font-700 flex-shrink-0 ${
                      loc.rank === 1 ? 'bg-red-900/60 text-red-300' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {loc.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-500 text-zinc-200 truncate">{loc.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[8px] font-mono-data text-zinc-600">{loc.type}</span>
                        <span className="text-[8px] font-mono-data text-zinc-600">{loc.bank}</span>
                        <span className="text-[8px] font-mono-data text-zinc-600">{loc.distanceKm.toFixed(1)}km</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-sm font-mono-data font-700 ${loc.rank === 1 ? 'text-red-300' : 'text-zinc-300'}`}>
                        {(loc.probability * 100).toFixed(1)}%
                      </div>
                      <div className="text-[8px] font-mono-data text-zinc-600">prob</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Prediction + SHAP + Intervention + Officer Actions */}
        <div className="overflow-y-auto">

          {/* Prediction Panel */}
          {showPred && pred ? (
            <div className="p-3 border-b border-zinc-800 animate-fade-in">
              <div className="text-[9px] font-mono-data text-zinc-500 tracking-wider mb-3">PREDICTION ENGINE</div>

              <div className="bg-red-950/15 border border-red-900/30 rounded p-2.5 mb-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <MapPin size={11} className="text-red-400" />
                  <span className="text-[9px] font-mono-data text-zinc-500">PRIMARY LOCATION</span>
                </div>
                <div className="text-xs font-500 text-zinc-100">{pred.locations[0].name}</div>
                <div className="text-[9px] text-zinc-500 mt-0.5">{pred.locations[0].address}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-lg font-mono-data font-700 text-red-300">{(pred.locations[0].probability * 100).toFixed(1)}%</span>
                  <div>
                    <div className="text-[8px] font-mono-data text-zinc-500">probability</div>
                    <div className="text-[8px] font-mono-data text-zinc-600">conf: {(pred.locations[0].confidence * 100).toFixed(0)}%</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-zinc-900/50 rounded p-2 border border-zinc-800/50">
                  <div className="flex items-center gap-1 mb-1">
                    <Clock size={9} className="text-blue-400" />
                    <span className="text-[8px] font-mono-data text-zinc-600">TIME WINDOW</span>
                  </div>
                  <div className="font-mono-data text-sm font-600 text-blue-300">{pred.timeWindowMin}–{pred.timeWindowMax}<span className="text-[9px] font-400 text-zinc-500"> min</span></div>
                </div>
                <div className="bg-zinc-900/50 rounded p-2 border border-zinc-800/50">
                  <div className="flex items-center gap-1 mb-1">
                    <DollarSign size={9} className="text-emerald-400" />
                    <span className="text-[8px] font-mono-data text-zinc-600">AMOUNT RANGE</span>
                  </div>
                  <div className="font-mono-data text-xs font-600 text-emerald-300">
                    ₹{(pred.amountMin / 100000).toFixed(1)}L–{(pred.amountMax / 100000).toFixed(1)}L
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/40 rounded p-2 border border-zinc-800/50">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp size={9} className="text-amber-400" />
                  <span className="text-[8px] font-mono-data text-zinc-600">EXPECTED RECOVERY</span>
                </div>
                <div className="font-mono-data text-sm font-700 text-amber-300">
                  ₹{(pred.expectedRecovery / 100000).toFixed(2)}L
                </div>
                <div className="text-[8px] text-zinc-600 mt-0.5">
                  {((pred.expectedRecovery / caseData.reportedAmount) * 100).toFixed(0)}% of reported amount
                </div>
              </div>

              <div className="mt-2 text-[8px] font-mono-data text-zinc-700">
                MODEL: {pred.modelVersion}
              </div>
            </div>
          ) : (
            <div className="p-3 border-b border-zinc-800">
              <div className="text-[9px] font-mono-data text-zinc-700 text-center py-6">
                {demoRunning ? `Prediction in step ${demoStep + 1}...` : 'No prediction available'}
              </div>
            </div>
          )}

          {/* SHAP Explanation */}
          {showShap && pred && (
            <div className="p-3 border-b border-zinc-800 animate-fade-in">
              <div className="flex items-center gap-1.5 mb-2">
                <Brain size={10} className="text-purple-400" />
                <span className="text-[9px] font-mono-data text-zinc-500 tracking-wider">EXPLAINABILITY (SHAP)</span>
              </div>
              <ShapChart factors={pred.shapFactors} />

              <div className="mt-3 bg-zinc-900/50 rounded p-2 border border-zinc-800/40">
                <div className="text-[8px] font-mono-data text-zinc-600 mb-1">COUNTERFACTUAL</div>
                <p className="text-[9px] text-zinc-400 leading-relaxed">{pred.counterfactual}</p>
              </div>

              <div className="mt-2 text-[8px] font-mono-data text-zinc-700 flex items-center gap-1">
                <Info size={8} />
                SIMULATION — Prototype SHAP scoring on synthetic data
              </div>
            </div>
          )}

          {/* Intervention Optimizer */}
          {showPred && pred && (
            <div className="p-3 border-b border-zinc-800">
              <div className="flex items-center gap-1.5 mb-2">
                <Zap size={10} className="text-amber-400" />
                <span className="text-[9px] font-mono-data text-zinc-500 tracking-wider">INTERVENTION OPTIMIZER</span>
              </div>
              <div className="space-y-2">
                {pred.locations.map(loc => (
                  <div key={loc.rank} className={`rounded border p-2 ${
                    loc.rank === 1 ? 'border-amber-800/40 bg-amber-950/10' : 'border-zinc-800/40 bg-zinc-900/30'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[8px] font-mono-data font-700 ${loc.rank === 1 ? 'text-amber-400' : 'text-zinc-500'}`}>
                        P{loc.rank} · {loc.type}
                      </span>
                      <span className="text-[8px] font-mono-data text-zinc-600">{loc.etaMin}min ETA</span>
                    </div>
                    <div className="text-[9px] text-zinc-300 truncate">{loc.name}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[8px] font-mono-data text-zinc-600">{loc.distanceKm.toFixed(1)}km</span>
                      <span className={`text-[9px] font-mono-data font-600 ${loc.rank === 1 ? 'text-emerald-400' : 'text-zinc-400'}`}>
                        EXP: ₹{(loc.expectedRecovery / 100000).toFixed(1)}L
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alert Status */}
          {showAlert && alert && (
            <div className={`p-3 border-b border-zinc-800 animate-fade-in`}>
              <div className="flex items-center gap-1.5 mb-2">
                <Bell size={10} className={alert.level === 'RED' ? 'text-red-400 animate-pulse-critical' : 'text-amber-400'} />
                <span className="text-[9px] font-mono-data text-zinc-500 tracking-wider">
                  ALERT — <span className={alert.level === 'RED' ? 'text-red-400' : alert.level === 'AMBER' ? 'text-amber-400' : 'text-emerald-400'}>{alert.level}</span>
                </span>
              </div>
              <div className="bg-zinc-900/50 rounded p-2 border border-zinc-800/40 space-y-1">
                <div className="text-[8px] font-mono-data text-zinc-600">
                  STATUS: <span className={alert.status === 'PENDING' ? 'text-amber-400' : alert.status === 'RESOLVED' ? 'text-emerald-400' : 'text-zinc-400'}>{alert.status}</span>
                </div>
                <div className="text-[9px] text-zinc-400 leading-relaxed">{alert.reason}</div>
                <div className="text-[8px] font-mono-data text-zinc-600 mt-1">
                  ▶ {alert.recommendedAction}
                </div>
              </div>
            </div>
          )}

          {/* Officer Actions */}
          {showAction && (
            <div className="p-3 animate-fade-in">
              <OfficerActions caseData={caseData} demoStep={demoStep} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
