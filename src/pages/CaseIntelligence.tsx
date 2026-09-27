import { useState, useMemo } from 'react'
import {
  AlertTriangle, CheckCircle2, XCircle, ChevronUp, ArrowRight, Shield,
  MapPin, Clock, DollarSign, Brain, Zap, BarChart2, User, FileText,
  ChevronDown, Activity, GitBranch, Lock, Info, TrendingUp, Eye, Bell,
  ZoomIn, ZoomOut, RotateCcw, Smartphone, Radio, AtSign, Layers,
  Crosshair, Check, RefreshCw, Send, AlertOctagon, HelpCircle
} from 'lucide-react'
import { CASES, type FraudCase, type GraphNode, type GraphEdge, type Transaction, type LocationPrediction, type ShapFactor } from '../data/mockData'

interface Props {
  caseId: string | null
  navigate: (page: string, id?: string) => void
  demoStep: number
  demoRunning: boolean
}

// ----------------------------------------------------------------------
// Horizontal Intelligence Flow Header Component (Section 9)
// ----------------------------------------------------------------------
const FLOW_STEPS = [
  { id: 'complaint', label: 'COMPLAINT', sub: '₹4.85L UPI' },
  { id: 'money_flow', label: 'MONEY FLOW', sub: 'TX-98231' },
  { id: 'mule_net', label: 'MULE NETWORK', sub: '4 Hops' },
  { id: 'trace', label: 'TRACE', sub: '87% High' },
  { id: 'prediction', label: 'PREDICTION', sub: 'TGN + Geo' },
  { id: 'location', label: 'LOCATION', sub: 'CSP-042' },
  { id: 'time', label: 'TIME', sub: '18–27 min' },
  { id: 'amount', label: 'AMOUNT', sub: '₹3.8L–₹4.2L' },
  { id: 'why', label: 'WHY', sub: 'SHAP (6)' },
  { id: 'recovery', label: 'RECOVERY', sub: '₹2.9L Exp' },
  { id: 'alert', label: 'ALERT', sub: 'RED Alert' },
  { id: 'action', label: 'ACTION', sub: 'Human-in-Loop' },
  { id: 'outcome', label: 'OUTCOME', sub: 'Simulated HIT' },
]

function HorizontalFlow({ demoStep, demoRunning, isActioned, hasOutcome }: { demoStep: number; demoRunning: boolean; isActioned: boolean; hasOutcome: boolean }) {
  // Map demoStep to flow step index
  let activeIdx = 0
  if (demoRunning) {
    if (demoStep >= 10) activeIdx = 12
    else if (demoStep >= 9) activeIdx = 11
    else if (demoStep >= 8) activeIdx = 10
    else if (demoStep >= 7) activeIdx = 8
    else if (demoStep >= 6) activeIdx = 5
    else if (demoStep >= 5) activeIdx = 4
    else if (demoStep >= 4) activeIdx = 3
    else if (demoStep >= 2) activeIdx = 2
    else if (demoStep >= 1) activeIdx = 1
    else activeIdx = 0
  } else {
    activeIdx = hasOutcome ? 12 : isActioned ? 11 : 10
  }

  return (
    <div className="bg-zinc-950 border-b border-zinc-800/80 px-4 py-2 overflow-x-auto select-none">
      <div className="flex items-center min-w-max gap-1">
        {FLOW_STEPS.map((step, idx) => {
          const isDone = idx < activeIdx
          const isCurrent = idx === activeIdx
          return (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex flex-col px-2.5 py-1 rounded transition-all duration-300 ${
                  isCurrent
                    ? 'bg-zinc-100 text-zinc-950 shadow-md scale-105'
                    : isDone
                    ? 'bg-zinc-900 border border-zinc-700/60 text-zinc-200'
                    : 'bg-zinc-950 border border-zinc-800/40 text-zinc-600'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`text-[8px] font-mono-data font-700 ${isCurrent ? 'text-zinc-950' : isDone ? 'text-emerald-400' : 'text-zinc-600'}`}>
                    {idx + 1}.
                  </span>
                  <span className={`text-[9px] font-mono-data font-700 tracking-wider ${isCurrent ? 'text-zinc-950' : isDone ? 'text-zinc-200' : 'text-zinc-500'}`}>
                    {step.label}
                  </span>
                </div>
                <span className={`text-[8px] font-mono-data ${isCurrent ? 'text-zinc-800' : isDone ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {step.sub}
                </span>
              </div>
              {idx < FLOW_STEPS.length - 1 && (
                <div className={`w-3 h-px mx-0.5 ${idx < activeIdx ? 'bg-zinc-500' : 'bg-zinc-800'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------
// Centerpiece Transaction Graph Component (Section 4)
// ----------------------------------------------------------------------
function TransactionGraphCenterpiece({
  nodes,
  transactions,
  edges,
  demoStep,
  onSelectNode,
}: {
  nodes: GraphNode[]
  transactions: Transaction[]
  edges?: GraphEdge[]
  demoStep: number
  onSelectNode: (node: GraphNode) => void
}) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const mainTxs = transactions.filter(t => !t.isNoise)
  const isDemo = transactions.some(t => t.id === 'TX-98231')

  // Explicit layout coordinates for centerpiece visualization
  const nodePositions: Record<string, { x: number; y: number }> = useMemo(() => {
    if (isDemo) {
      return {
        // Main transfer pipeline (horizontal spine)
        'VICT-MUM-8492': { x: 70, y: 150 },
        'MULE-01-4491': { x: 210, y: 150 },
        'MULE-02-7812': { x: 350, y: 150 },
        'MULE-03-3190': { x: 490, y: 150 },
        'TERM-04-9912': { x: 620, y: 150 },
        'CSP-042': { x: 740, y: 100 },
        'SBI-ATM-01': { x: 740, y: 200 },

        // Associated infrastructure layers (devices, phones, UPI)
        'DEV-REDMI-12': { x: 350, y: 60 },
        'DEV-SAMSUNG-M14': { x: 210, y: 60 },
        'PHONE-98201': { x: 210, y: 240 },
        'PHONE-97110': { x: 350, y: 240 },
        'UPI-MULE01': { x: 130, y: 220 },
        'UPI-FASTPAY': { x: 490, y: 240 },
      }
    } else {
      const pos: Record<string, { x: number; y: number }> = {}
      const maxHop = Math.max(...mainTxs.map(t => t.hop), 1)
      const xStep = 600 / Math.max(maxHop, 1)
      mainTxs.forEach((tx, i) => {
        const jitter = (i % 2 === 0 ? -1 : 1) * 35
        if (!pos[tx.fromAccount]) pos[tx.fromAccount] = { x: 80 + tx.hop * xStep, y: 150 + jitter }
        if (!pos[tx.toAccount]) pos[tx.toAccount] = { x: 80 + (tx.hop + 1) * xStep, y: 150 - jitter }
      })
      return pos
    }
  }, [isDemo, mainTxs])

  // Determine which transactions & nodes are visible based on demoStep
  const visibleTxCount = demoStep < 0 ? mainTxs.length : Math.min(demoStep + 1, mainTxs.length)
  const currentVisibleTxs = mainTxs.slice(0, visibleTxCount)

  // Color mappings
  function getNodeStyle(node: GraphNode) {
    switch (node.type) {
      case 'VICTIM':
        return { fill: '#64748b', stroke: '#cbd5e1', label: 'VICTIM', icon: 'V' }
      case 'MULE':
        return { fill: '#d97706', stroke: '#fcd34d', label: node.label, icon: 'M' }
      case 'TERMINAL':
        return { fill: '#dc2626', stroke: '#fca5a5', label: 'TERMINAL', icon: 'T' }
      case 'CSP':
        return { fill: '#ea580c', stroke: '#ffedd5', label: 'CSP-042', icon: '★' }
      case 'ATM':
        return { fill: '#0284c7', stroke: '#bae6fd', label: 'ATM', icon: 'A' }
      case 'DEVICE':
        return { fill: '#0891b2', stroke: '#a5f3fc', label: node.label, icon: '📱' }
      case 'PHONE':
        return { fill: '#16a34a', stroke: '#bbf7d0', label: node.label, icon: '📞' }
      case 'UPI':
        return { fill: '#7c3aed', stroke: '#ddd6fe', label: node.label, icon: '@' }
      default:
        return { fill: '#52525b', stroke: '#a1a1aa', label: node.label, icon: '•' }
    }
  }

  // Drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }
  const handleMouseUp = () => setIsDragging(false)

  return (
    <div className="relative border border-zinc-800 rounded bg-zinc-950 overflow-hidden select-none">
      {/* Top Banner: Stage Progression */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/60 border-b border-zinc-800/60 text-[9px] font-mono-data">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <span className="text-zinc-200 font-600">COMPLAINT</span>
          <span className="text-zinc-600">→</span>
          <span className="text-amber-400 font-600">MULE CHAIN (4 HOPS)</span>
          <span className="text-zinc-600">→</span>
          <span className="text-rose-400 font-600">TERMINAL</span>
          <span className="text-zinc-600">→</span>
          <span className="text-emerald-400 font-700 animate-pulse">PREDICTED CASH-OUT [CSP-042]</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(z => Math.min(z + 0.15, 2.2))}
            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200"
            title="Zoom In"
          >
            <ZoomIn size={12} />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(z - 0.15, 0.6))}
            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200"
            title="Zoom Out"
          >
            <ZoomOut size={12} />
          </button>
          <button
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}
            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200"
            title="Reset View"
          >
            <RotateCcw size={12} />
          </button>
          <span className="text-[8px] text-zinc-500 ml-1">{(zoom * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <div
        className="w-full h-[320px] cursor-grab active:cursor-grabbing relative overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 820 300"
          className="w-full h-full"
          style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`, transformOrigin: 'center center' }}
        >
          <defs>
            <marker id="arrow-transfer" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M 0 0 L 8 4 L 0 8 z" fill="#f59e0b" />
            </marker>
            <marker id="arrow-cashout" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
            </marker>
            <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid Background Pattern */}
          <g stroke="#18181b" strokeWidth="0.5">
            {[...Array(17)].map((_, i) => (
              <line key={`vg-${i}`} x1={i * 50} y1={0} x2={i * 50} y2={300} />
            ))}
            {[...Array(7)].map((_, i) => (
              <line key={`hg-${i}`} x1={0} y1={i * 50} x2={820} y2={i * 50} />
            ))}
          </g>

          {/* Render Association Edges: USED_DEVICE, LOGGED_IN */}
          {edges && edges.filter(e => e.label !== 'TRANSFER' && e.label !== 'CASH_OUT').map(edge => {
            const from = nodePositions[edge.source]
            const to = nodePositions[edge.target]
            if (!from || !to) return null
            const isDevice = edge.label === 'USED_DEVICE'
            return (
              <g key={edge.id} opacity="0.6">
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={isDevice ? '#06b6d4' : '#8b5cf6'}
                  strokeWidth="1"
                  strokeDasharray={isDevice ? '4,3' : '2,2'}
                />
                <text
                  x={(from.x + to.x) / 2}
                  y={(from.y + to.y) / 2 - 3}
                  fill={isDevice ? '#06b6d4' : '#a78bfa'}
                  fontSize="6.5"
                  fontFamily="JetBrains Mono"
                  textAnchor="middle"
                >
                  {edge.label}
                </text>
              </g>
            )
          })}

          {/* Render Primary TRANSFER Edges */}
          {currentVisibleTxs.map((tx, idx) => {
            const from = nodePositions[tx.fromAccount]
            const to = nodePositions[tx.toAccount]
            if (!from || !to) return null

            // Amount-proportional edge thickness (prompt: "transaction amounts represented by edge thickness")
            const strokeWidth = Math.max(1.8, Math.min(6, (tx.amount / 100000) * 1.5))
            const isLatest = idx === currentVisibleTxs.length - 1
            const midX = (from.x + to.x) / 2
            const midY = (from.y + to.y) / 2 - 14

            return (
              <g key={tx.id}>
                {/* Arc line */}
                <path
                  d={`M ${from.x} ${from.y} Q ${midX} ${midY - 10} ${to.x} ${to.y}`}
                  fill="none"
                  stroke={isLatest ? '#f59e0b' : '#71717a'}
                  strokeWidth={strokeWidth}
                  markerEnd="url(#arrow-transfer)"
                  className={isLatest ? 'animate-pulse' : ''}
                />
                {/* Transaction Amount Badge */}
                <rect
                  x={midX - 26}
                  y={midY - 20}
                  width="52"
                  height="14"
                  rx="3"
                  fill="#09090b"
                  stroke={isLatest ? '#f59e0b' : '#3f3f46'}
                  strokeWidth="0.8"
                />
                <text
                  x={midX}
                  y={midY - 10}
                  fill={isLatest ? '#fbbf24' : '#e4e4e7'}
                  fontSize="7.5"
                  fontFamily="JetBrains Mono"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {tx.id.startsWith('TX-') ? tx.id : `TX-${idx + 1}`}: ₹{(tx.amount / 100000).toFixed(1)}L
                </text>
              </g>
            )
          })}

          {/* Render CASH_OUT Predicted Link */}
          {nodePositions['TERM-04-9912'] && nodePositions['CSP-042'] && (
            <g filter="url(#glow-red)">
              <line
                x1={nodePositions['TERM-04-9912'].x}
                y1={nodePositions['TERM-04-9912'].y}
                x2={nodePositions['CSP-042'].x}
                y2={nodePositions['CSP-042'].y}
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeDasharray="5,4"
                markerEnd="url(#arrow-cashout)"
                className="animate-pulse"
              />
              <rect
                x={(nodePositions['TERM-04-9912'].x + nodePositions['CSP-042'].x) / 2 - 32}
                y={(nodePositions['TERM-04-9912'].y + nodePositions['CSP-042'].y) / 2 - 16}
                width="64"
                height="13"
                rx="2"
                fill="#450a0a"
                stroke="#ef4444"
                strokeWidth="0.8"
              />
              <text
                x={(nodePositions['TERM-04-9912'].x + nodePositions['CSP-042'].x) / 2}
                y={(nodePositions['TERM-04-9912'].y + nodePositions['CSP-042'].y) / 2 - 7}
                fill="#fecaca"
                fontSize="6.5"
                fontFamily="JetBrains Mono"
                fontWeight="700"
                textAnchor="middle"
              >
                CASH_OUT (87.4%)
              </text>
            </g>
          )}

          {/* Render Nodes */}
          {nodes.map(node => {
            const pos = nodePositions[node.id]
            if (!pos) return null
            const style = getNodeStyle(node)
            const isTerminalOrCSP = node.type === 'TERMINAL' || node.type === 'CSP'
            const radius = node.type === 'CSP' ? 18 : isTerminalOrCSP ? 15 : node.type === 'DEVICE' || node.type === 'PHONE' || node.type === 'UPI' ? 11 : 13

            return (
              <g
                key={node.id}
                className="cursor-pointer group"
                onClick={() => onSelectNode(node)}
              >
                {/* Ping animation for predicted cash-out outlet */}
                {node.type === 'CSP' && (
                  <circle cx={pos.x} cy={pos.y} r={radius + 8} fill="#ef4444" opacity="0.25" className="animate-ping" />
                )}
                {/* Outer halo */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius + 3}
                  fill="none"
                  stroke={style.stroke}
                  strokeWidth="0.8"
                  opacity="0.4"
                  className="group-hover:opacity-100 transition-opacity"
                />
                {/* Node core */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius}
                  fill={style.fill}
                  stroke="#09090b"
                  strokeWidth="2"
                />
                {/* Center Glyph */}
                <text
                  x={pos.x}
                  y={pos.y + 3.5}
                  fill="#ffffff"
                  fontSize={node.type === 'CSP' ? '11' : '8.5'}
                  fontFamily="JetBrains Mono"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {style.icon}
                </text>
                {/* Node Label Below */}
                <text
                  x={pos.x}
                  y={pos.y + radius + 11}
                  fill={node.type === 'CSP' ? '#f87171' : '#d4d4d8'}
                  fontSize="7.5"
                  fontFamily="JetBrains Mono"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {node.label}
                </text>
                {/* Type Sublabel */}
                <text
                  x={pos.x}
                  y={pos.y + radius + 19}
                  fill="#71717a"
                  fontSize="6"
                  fontFamily="JetBrains Mono"
                  textAnchor="middle"
                >
                  {node.type}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Graph Legend Overlay */}
        <div className="absolute bottom-2 left-2 bg-zinc-900/90 border border-zinc-800/80 rounded px-2.5 py-1.5 flex items-center gap-3 text-[8px] font-mono-data pointer-events-none backdrop-blur">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" /> Victim</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Mule Account</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" /> Terminal</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-600 inline-block" /> Predicted CSP Outlet</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-600 inline-block" /> Device</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> Phone / SIM</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" /> UPI VPA</div>
        </div>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------
// Entity Intelligence Inspector Drawer (Section 4)
// ----------------------------------------------------------------------
function EntityIntelligenceModal({ node, onClose }: { node: GraphNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg max-w-md w-full shadow-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-zinc-200" />
            <span className="font-mono-data text-xs font-700 text-zinc-100 uppercase">ENTITY INTELLIGENCE DOSSIER</span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <XCircle size={16} />
          </button>
        </div>

        <div className="p-4 space-y-3 font-mono-data text-[10px]">
          <div className="flex items-center justify-between bg-zinc-950/70 p-2.5 rounded border border-zinc-800">
            <div>
              <div className="text-[9px] text-zinc-500">ENTITY IDENTIFIER</div>
              <div className="text-sm font-700 text-zinc-100">{node.id}</div>
              <div className="text-[9px] text-zinc-400">{node.label}</div>
            </div>
            <div className="text-right">
              <span className={`px-2 py-0.5 rounded text-[9px] font-700 ${
                node.type === 'CSP' ? 'bg-orange-950 text-orange-400 border border-orange-700' :
                node.type === 'TERMINAL' ? 'bg-rose-950 text-rose-400 border border-rose-700' :
                node.type === 'MULE' ? 'bg-amber-950 text-amber-400 border border-amber-700' :
                'bg-zinc-800 text-zinc-300 border border-zinc-700'
              }`}>
                {node.type}
              </span>
              <div className="text-[9px] text-zinc-500 mt-1">RISK: {(node.riskScore * 100).toFixed(0)}/100</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-zinc-950/50 p-2 rounded border border-zinc-800/80">
              <span className="text-[8px] text-zinc-600 block">INSTITUTION / VENDOR</span>
              <span className="text-zinc-200 font-600">{node.bank || 'N/A'}</span>
            </div>
            <div className="bg-zinc-950/50 p-2 rounded border border-zinc-800/80">
              <span className="text-[8px] text-zinc-600 block">JURISDICTION STATE</span>
              <span className="text-zinc-200 font-600">{node.state || 'Maharashtra'}</span>
            </div>
            <div className="bg-zinc-950/50 p-2 rounded border border-zinc-800/80">
              <span className="text-[8px] text-zinc-600 block">CUMULATIVE AMOUNT</span>
              <span className="text-emerald-400 font-600">₹{(node.amount / 100000).toFixed(2)}L</span>
            </div>
            <div className="bg-zinc-950/50 p-2 rounded border border-zinc-800/80">
              <span className="text-[8px] text-zinc-600 block">RECORDED TRANSACTIONS</span>
              <span className="text-zinc-200 font-600">{node.txCount} events</span>
            </div>
          </div>

          {node.metadata && (
            <div className="bg-zinc-950/60 p-2.5 rounded border border-zinc-800/80 space-y-1">
              <div className="text-[8px] text-zinc-500 font-700 tracking-wider">HARDWARE / TELECOM / NETWORK METADATA</div>
              {node.metadata.model && <div><span className="text-zinc-500">Device Model:</span> <span className="text-zinc-300">{node.metadata.model}</span></div>}
              {node.metadata.imei && <div><span className="text-zinc-500">IMEI Number:</span> <span className="text-zinc-300">{node.metadata.imei}</span></div>}
              {node.metadata.isRooted !== undefined && (
                <div>
                  <span className="text-zinc-500">Integrity:</span>{' '}
                  <span className={node.metadata.isRooted ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                    {node.metadata.isRooted ? 'ROOTED / COMPROMISED ROM' : 'SECURE'}
                  </span>
                </div>
              )}
              {node.metadata.ip && <div><span className="text-zinc-500">Observed IP:</span> <span className="text-zinc-300">{node.metadata.ip}</span></div>}
              {node.metadata.phone && <div><span className="text-zinc-500">MSISDN:</span> <span className="text-zinc-300">{node.metadata.phone}</span></div>}
              {node.metadata.vpa && <div><span className="text-zinc-500">UPI VPA:</span> <span className="text-zinc-300">{node.metadata.vpa}</span></div>}
              {node.metadata.notes && <div className="text-zinc-400 italic mt-1 border-t border-zinc-800 pt-1">"{node.metadata.notes}"</div>}
            </div>
          )}

          <div className="text-[8px] text-zinc-600 text-center">
            PROTOTYPE RECORD — SYNTHETIC SIMULATION INTELLIGENCE
          </div>
        </div>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------
// Trace Confidence Router Component (Section 5)
// ----------------------------------------------------------------------
function TraceRouterCard({ caseData }: { caseData: FraudCase }) {
  const isHigh = caseData.traceConfidence === 'HIGH'
  const confidenceScore = isHigh ? 87.4 : caseData.traceConfidence === 'MEDIUM' ? 62.0 : 34.5

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Activity size={12} className="text-emerald-400" />
          <span className="text-[10px] font-mono-data font-700 text-zinc-200 tracking-wider">TRACE ROUTER</span>
        </div>
        <span className={`text-[9px] font-mono-data font-700 px-2 py-0.5 rounded border ${
          isHigh ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60' : 'bg-amber-950/60 text-amber-300 border-amber-700/60'
        }`}>
          {caseData.traceConfidence} CONFIDENCE
        </span>
      </div>

      <div className="grid grid-cols-5 gap-1.5 text-center font-mono-data">
        <div className="bg-zinc-950/80 p-1.5 rounded border border-zinc-800/60">
          <div className="text-xs font-700 text-zinc-200">{caseData.hops}</div>
          <div className="text-[7px] text-zinc-500">OBSERVED HOPS</div>
        </div>
        <div className="bg-zinc-950/80 p-1.5 rounded border border-zinc-800/60">
          <div className="text-xs font-700 text-zinc-200">&lt; 35m</div>
          <div className="text-[7px] text-zinc-500">TX RECENCY</div>
        </div>
        <div className="bg-zinc-950/80 p-1.5 rounded border border-zinc-800/60">
          <div className="text-xs font-700 text-emerald-400">HIGH</div>
          <div className="text-[7px] text-zinc-500">CONNECTIVITY</div>
        </div>
        <div className="bg-zinc-950/80 p-1.5 rounded border border-zinc-800/60">
          <div className="text-xs font-700 text-zinc-200">78%</div>
          <div className="text-[7px] text-zinc-500">NODE NOVELTY</div>
        </div>
        <div className="bg-zinc-950/80 p-1.5 rounded border border-zinc-800/60">
          <div className="text-xs font-700 text-zinc-200">0.14</div>
          <div className="text-[7px] text-zinc-500">UNCERTAINTY</div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-[9px] font-mono-data">
        <span className="text-zinc-400">ROUTING ENGINE DECISION:</span>
        <span className="text-zinc-200 font-700">
          TGN PRIMARY (68%) / GEO-TEMPORAL (32%)
        </span>
      </div>

      {/* Confidence gauge bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[8px] font-mono-data text-zinc-500">
          <span>AGGREGATE TRACE CONFIDENCE</span>
          <span className="text-emerald-400 font-bold">{confidenceScore}%</span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000"
            style={{ width: `${confidenceScore}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------
// Large Premium Prediction Card (Section 10)
// ----------------------------------------------------------------------
function LargePredictionCard({
  pred,
  onViewLocation,
  onViewExplanation,
}: {
  pred: NonNullable<FraudCase['prediction']>
  onViewLocation: () => void
  onViewExplanation: () => void
}) {
  const topLoc = pred.locations[0]

  return (
    <div className="bg-zinc-900 border border-zinc-700/80 rounded-lg p-4 space-y-3 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <AlertOctagon size={16} className="text-red-400 animate-pulse" />
          <span className="font-mono-data text-xs font-700 text-zinc-100 tracking-wider uppercase">
            PREDICTED CASH-OUT INTERVENTION
          </span>
        </div>
        <span className="text-[9px] font-mono-data px-2 py-0.5 rounded bg-red-950/60 border border-red-800/80 text-red-300 font-bold">
          TOP PRIORITY
        </span>
      </div>

      {/* Main Location Header */}
      <div>
        <div className="text-[9px] font-mono-data text-zinc-500 uppercase tracking-wider">TOP FORECASTED LOCATION</div>
        <div className="text-base font-bold text-zinc-100 mt-0.5 flex items-center gap-2">
          <span>{topLoc.name}</span>
          <span className="text-[10px] font-mono-data font-normal text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700">
            {topLoc.type}
          </span>
        </div>
        <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 mt-1">
          <MapPin size={10} className="text-zinc-500" />
          <span>{topLoc.address} ({topLoc.distanceKm.toFixed(1)} km)</span>
        </div>
      </div>

      {/* 4 Metric Columns */}
      <div className="grid grid-cols-4 gap-2 font-mono-data bg-zinc-950/60 p-2.5 rounded border border-zinc-800/70">
        <div>
          <span className="text-[8px] text-zinc-500 block">PROBABILITY</span>
          <span className="text-sm font-bold text-red-400">{(topLoc.probability * 100).toFixed(1)}%</span>
        </div>
        <div>
          <span className="text-[8px] text-zinc-500 block">TIME WINDOW</span>
          <span className="text-sm font-bold text-blue-400">{pred.timeWindowMin}–{pred.timeWindowMax} min</span>
        </div>
        <div>
          <span className="text-[8px] text-zinc-500 block">EST. AMOUNT</span>
          <span className="text-sm font-bold text-emerald-400">₹{(pred.amountMin / 100000).toFixed(1)}L–{(pred.amountMax / 100000).toFixed(1)}L</span>
        </div>
        <div>
          <span className="text-[8px] text-zinc-500 block">EXPECTED RECOVERY</span>
          <span className="text-sm font-bold text-amber-400">₹{(pred.expectedRecovery / 100000).toFixed(2)}L</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[9px] font-mono-data text-zinc-500 pt-1">
        <span>STATUS: <strong className="text-amber-400">PENDING HUMAN VERIFICATION</strong></span>
        <span>MODEL: <span className="text-zinc-300">TGN + ST-KDE/ST-GCN FUSION</span></span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={onViewLocation}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded text-[10px] font-mono-data text-zinc-200 font-600 transition-all"
        >
          <MapPin size={11} />
          VIEW LOCATION
        </button>
        <button
          onClick={onViewExplanation}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded text-[10px] font-mono-data text-zinc-200 font-600 transition-all"
        >
          <Brain size={11} />
          VIEW EXPLANATION
        </button>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------
// "Why This Location?" & Counterfactual Panel (Section 8)
// ----------------------------------------------------------------------
function WhyThisLocationPanel({ pred }: { pred: NonNullable<FraudCase['prediction']> }) {
  const maxImpact = Math.max(...pred.shapFactors.map(f => Math.abs(f.impact)))

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Brain size={12} className="text-purple-400" />
          <span className="text-[10px] font-mono-data font-700 text-zinc-200 tracking-wider">WHY THIS LOCATION?</span>
        </div>
        <span className="text-[8px] font-mono-data text-zinc-500">PROTOTYPE SHAP FACTORS</span>
      </div>

      <div className="space-y-2">
        {pred.shapFactors.map((f, i) => (
          <div key={f.feature} className="space-y-0.5">
            <div className="flex items-center justify-between text-[9px]">
              <span className="text-zinc-300 font-mono-data">{i + 1}. {f.feature}</span>
              <span className={`font-mono-data font-bold ${f.direction === 'positive' ? 'text-amber-400' : 'text-blue-400'}`}>
                {f.direction === 'positive' ? '+' : ''}{f.impact.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(Math.abs(f.impact) / maxImpact) * 100}%`,
                    backgroundColor: f.direction === 'positive' ? '#f59e0b' : '#38bdf8',
                  }}
                />
              </div>
              <span className="text-[8px] font-mono-data text-zinc-500 w-24 text-right truncate">
                {f.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Counterfactual Panel */}
      <div className="bg-zinc-950/80 border border-zinc-800 rounded p-2.5 space-y-1 font-mono-data">
        <div className="text-[8px] font-700 text-zinc-400 uppercase tracking-wider flex items-center gap-1">
          <HelpCircle size={10} className="text-purple-400" />
          COUNTERFACTUAL SENSITIVITY ANALYSIS
        </div>
        <p className="text-[9px] text-zinc-300 leading-relaxed font-sans">
          "{pred.counterfactual}"
        </p>
        <div className="text-[8px] text-zinc-500 italic pt-0.5">
          {pred.counterfactualEffect}
        </div>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------
// Intervention Optimizer Panel (Section 11)
// ----------------------------------------------------------------------
function InterventionOptimizer({ locations }: { locations: LocationPrediction[] }) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Zap size={12} className="text-amber-400" />
          <span className="text-[10px] font-mono-data font-700 text-zinc-200 tracking-wider">INTERVENTION OPTIMIZER</span>
        </div>
        <span className="text-[8px] font-mono-data text-zinc-500">MAXIMIZE RECOVERY</span>
      </div>

      <div className="space-y-2">
        {locations.slice(0, 3).map((loc, i) => {
          const successProb = i === 0 ? 0.81 : i === 1 ? 0.74 : 0.62
          return (
            <div
              key={loc.name}
              className={`p-2.5 rounded border transition-all ${
                i === 0 ? 'bg-amber-950/20 border-amber-800/60' : 'bg-zinc-950/50 border-zinc-800/60'
              }`}
            >
              <div className="flex items-center justify-between text-[9px] font-mono-data mb-1">
                <span className={`font-700 ${i === 0 ? 'text-amber-300' : 'text-zinc-400'}`}>
                  PRIORITY {i + 1} · {loc.type}
                </span>
                <span className="text-zinc-500">{loc.distanceKm.toFixed(1)} km away · {loc.etaMin} min ETA</span>
              </div>
              <div className="text-xs font-600 text-zinc-200 truncate">{loc.name}</div>
              <div className="grid grid-cols-3 gap-1 mt-1.5 pt-1.5 border-t border-zinc-800/50 text-[8px] font-mono-data">
                <div>
                  <span className="text-zinc-500 block">PROBABILITY</span>
                  <span className="text-zinc-200 font-bold">{(loc.probability * 100).toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">INTERCEPT PROB</span>
                  <span className="text-blue-400 font-bold">{(successProb * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">EXPECTED REC.</span>
                  <span className="text-emerald-400 font-bold">₹{(loc.expectedRecovery / 100000).toFixed(2)}L</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-zinc-950/70 border border-zinc-800 rounded p-2 text-[8px] font-mono-data text-amber-400/90 leading-relaxed">
        <strong>IMPORTANT POLICY:</strong> Recommendations only. Never automatically freeze an account or deploy physical intercept without human officer verification.
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------
// Human Verification Modal (Section 13)
// ----------------------------------------------------------------------
function HumanVerificationModal({
  alertData,
  onConfirm,
  onClose,
}: {
  alertData: NonNullable<FraudCase['alert']>
  onConfirm: (decision: string, reason: string) => void
  onClose: () => void
}) {
  const [decision, setDecision] = useState('CONFIRM')
  const [reason, setReason] = useState('Verified transaction velocity and proximity to active patrol unit. Dispatched team to Malad CSP.')
  const [officerName] = useState('Insp. R. Sharma [MH-CYB-0312]')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) return
    onConfirm(decision, reason)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg max-w-lg w-full shadow-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 bg-zinc-950 border-b border-zinc-800">
          <div>
            <div className="font-mono-data text-sm font-700 text-zinc-100 flex items-center gap-2">
              <Shield size={14} className="text-emerald-400" />
              HUMAN-IN-THE-LOOP VERIFICATION
            </div>
            <div className="text-[9px] font-mono-data text-zinc-500">Statutory officer authorization gate</div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <XCircle size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 font-mono-data text-[10px]">
          <div className="bg-zinc-950 p-3 rounded border border-zinc-800 space-y-1">
            <div className="flex justify-between">
              <span className="text-zinc-500">OFFICER:</span>
              <span className="text-zinc-200 font-bold">{officerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">TARGET:</span>
              <span className="text-red-400 font-bold">{alertData.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">TIME WINDOW:</span>
              <span className="text-blue-400">{alertData.timeWindow}</span>
            </div>
          </div>

          <div>
            <label className="text-zinc-400 font-bold block mb-1.5">OFFICER DECISION:</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'CONFIRM', label: 'CONFIRM & DISPATCH', col: 'border-emerald-600 text-emerald-300 bg-emerald-950/40' },
                { id: 'ESCALATE', label: 'ESCALATE TO SP', col: 'border-amber-600 text-amber-300 bg-amber-950/40' },
                { id: 'OVERRIDE', label: 'OVERRIDE / FALSE POSITIVE', col: 'border-blue-600 text-blue-300 bg-blue-950/40' },
                { id: 'IGNORE', label: 'IGNORE / MONITOR', col: 'border-zinc-700 text-zinc-400 bg-zinc-900' },
              ].map(opt => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setDecision(opt.id)}
                  className={`p-2 rounded border text-left font-600 transition-all ${opt.col} ${
                    decision === opt.id ? 'ring-2 ring-white scale-102' : 'opacity-70'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-zinc-400 font-bold block mb-1.5">
              REQUIRED VERIFICATION REASON / AUDIT JUSTIFICATION:
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-zinc-200 text-[10px] focus:outline-none focus:border-zinc-400"
              placeholder="Enter mandatory justification for audit ledger..."
            />
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
            <button
              type="submit"
              className="flex-1 py-2 bg-white text-zinc-950 rounded font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-1.5"
            >
              <Check size={12} />
              SUBMIT STATUTORY INTERVENTION
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-700 text-zinc-400 rounded hover:border-zinc-500"
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------
// Predicted vs Actual Outcome Panel (Sections 14 & 15)
// ----------------------------------------------------------------------
function OutcomeComparisonCard({
  outcome,
  pred,
  onSelectResult,
}: {
  outcome: NonNullable<FraudCase['outcome']> | undefined
  pred: NonNullable<FraudCase['prediction']>
  onSelectResult: (res: 'HIT' | 'PARTIAL' | 'MISS') => void
}) {
  const currentResult = outcome?.result || 'HIT'

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span className="font-mono-data text-xs font-700 text-zinc-100">SIMULATED INTERVENTION OUTCOME</span>
        </div>
        <div className="flex items-center gap-1">
          {(['HIT', 'PARTIAL', 'MISS'] as const).map(res => (
            <button
              key={res}
              onClick={() => onSelectResult(res)}
              className={`text-[8px] font-mono-data px-2 py-0.5 rounded font-bold transition-all ${
                currentResult === res
                  ? res === 'HIT' ? 'bg-emerald-600 text-white' : res === 'PARTIAL' ? 'bg-amber-600 text-white' : 'bg-rose-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {res}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Grid (Section 14) */}
      <div className="grid grid-cols-2 gap-2 text-[9px] font-mono-data">
        <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800 space-y-2">
          <div className="text-[8px] font-700 text-zinc-500 uppercase tracking-wider">PREDICTED VALUES</div>
          <div><span className="text-zinc-600">Location:</span> <span className="text-zinc-200">{pred.locations[0].name}</span></div>
          <div><span className="text-zinc-600">Time Window:</span> <span className="text-blue-400">{pred.timeWindowMin}–{pred.timeWindowMax} min</span></div>
          <div><span className="text-zinc-600">Est. Amount:</span> <span className="text-emerald-400">₹{(pred.amountMin / 100000).toFixed(1)}L–{(pred.amountMax / 100000).toFixed(1)}L</span></div>
          <div><span className="text-zinc-600">Probability:</span> <span className="text-zinc-200">{(pred.locations[0].probability * 100).toFixed(1)}%</span></div>
        </div>

        <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800 space-y-2">
          <div className="text-[8px] font-700 text-emerald-400 uppercase tracking-wider">ACTUAL SIMULATED RESULT</div>
          <div>
            <span className="text-zinc-600">Location:</span>{' '}
            <span className="text-emerald-300 font-bold">
              {currentResult === 'MISS' ? 'Axis ATM Malad East' : pred.locations[0].name}
            </span>
          </div>
          <div>
            <span className="text-zinc-600">Intercept Time:</span>{' '}
            <span className="text-blue-300 font-bold">22 min (+2 min)</span>
          </div>
          <div>
            <span className="text-zinc-600">Actual Amount:</span>{' '}
            <span className="text-emerald-300 font-bold">₹3,95,000</span>
          </div>
          <div>
            <span className="text-zinc-600">Cash Recovered:</span>{' '}
            <span className="text-emerald-400 font-bold text-sm">
              {currentResult === 'HIT' ? '₹3,85,000 (97.5%)' : currentResult === 'PARTIAL' ? '₹1,60,000 (40.5%)' : '₹0 (0%)'}
            </span>
          </div>
        </div>
      </div>

      {/* Feedback Loop Notice (Section 15) */}
      <div className="bg-zinc-950/70 border border-zinc-800/80 rounded p-2.5 text-[9px] font-mono-data space-y-1">
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
          <RefreshCw size={11} />
          FEEDBACK CAPTURED FOR FUTURE MODEL EVALUATION
        </div>
        <p className="text-zinc-400 font-sans text-[9px] leading-relaxed">
          Spatial Error: <span className="text-zinc-200 font-mono-data font-bold">0.0 km</span> · Time Error:{' '}
          <span className="text-zinc-200 font-mono-data font-bold">2.0 min</span> · Amount Error:{' '}
          <span className="text-zinc-200 font-mono-data font-bold">₹15,000</span> · Model comparison logs updated in Analytics Ledger.
        </p>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------
// Main Page Component
// ----------------------------------------------------------------------
export default function CaseIntelligence({ caseId, navigate, demoStep, demoRunning }: Props) {
  const [activeTab, setActiveTab] = useState<'graph' | 'transactions'>('graph')
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [simulatedResult, setSimulatedResult] = useState<'HIT' | 'PARTIAL' | 'MISS'>('HIT')
  const [officerDecision, setOfficerDecision] = useState<string | null>(null)

  const caseData = caseId ? CASES.find(c => c.id === caseId) || CASES[0] : CASES[0]
  const pred = caseData.prediction
  const alert = caseData.alert

  // Simulation progressive visibility
  const showPred = demoRunning ? demoStep >= 6 : true
  const showShap = demoRunning ? demoStep >= 7 : true
  const showAlert = demoRunning ? demoStep >= 8 : true
  const showAction = demoRunning ? demoStep >= 9 : true
  const showOutcome = demoRunning ? demoStep >= 10 : true

  const isActioned = officerDecision !== null || !!alert?.officerAction

  const handleVerifySubmit = (decision: string, reason: string) => {
    setOfficerDecision(decision)
    setShowVerificationModal(false)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-zinc-950">
      {/* 1. TOP CASE HEADER */}
      <div className="border-b border-zinc-800 bg-zinc-950 px-4 py-2.5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono-data font-700 text-zinc-100 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700">
              {caseData.caseNumber}
            </span>
            <span className="text-[10px] font-mono-data px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/80">
              ACTIVE — SIMULATION
            </span>
            <span className="text-xs text-zinc-300 font-500">{caseData.fraudType}</span>
            <span className="text-xs font-mono-data text-emerald-400 font-bold">
              ₹{(caseData.reportedAmount / 100000).toFixed(2)}L Reported
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('evidence', caseData.id)}
              className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-700 rounded text-[10px] font-mono-data text-zinc-300 hover:border-zinc-500 transition-colors"
            >
              <FileText size={11} />
              EVIDENCE PASSPORT
            </button>
            <button
              onClick={() => navigate('map')}
              className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-700 rounded text-[10px] font-mono-data text-zinc-300 hover:border-zinc-500 transition-colors"
            >
              <MapPin size={11} />
              THREAT MAP
            </button>
          </div>
        </div>
      </div>

      {/* 2. HORIZONTAL INTELLIGENCE FLOW (Section 9) */}
      <HorizontalFlow
        demoStep={demoStep}
        demoRunning={demoRunning}
        isActioned={isActioned}
        hasOutcome={showOutcome}
      />

      {/* 3. MAIN WORKSPACE (Split Left & Right) */}
      <div className="flex-1 grid grid-cols-[1fr_420px] min-h-0 overflow-hidden">
        {/* LEFT COLUMN: Graph Centerpiece + Live Tx Stream + Trace Router */}
        <div className="flex flex-col border-r border-zinc-800 overflow-y-auto p-4 space-y-4">
          {/* CENTERPIECE GRAPH */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch size={13} className="text-amber-400" />
                <span className="font-mono-data text-xs font-700 text-zinc-200 tracking-wider">
                  MONEY-FLOW RECONSTRUCTION GRAPH
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('graph')}
                  className={`text-[9px] font-mono-data px-2 py-0.5 rounded transition-all ${
                    activeTab === 'graph' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  GRAPH
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`text-[9px] font-mono-data px-2 py-0.5 rounded transition-all ${
                    activeTab === 'transactions' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  TRANSACTIONS ({caseData.transactions.length})
                </button>
              </div>
            </div>

            {activeTab === 'graph' ? (
              <TransactionGraphCenterpiece
                nodes={caseData.graphNodes}
                transactions={caseData.transactions}
                edges={caseData.graphEdges}
                demoStep={demoStep}
                onSelectNode={setSelectedNode}
              />
            ) : (
              <div className="border border-zinc-800 rounded bg-zinc-950 max-h-72 overflow-y-auto">
                <div className="grid grid-cols-6 gap-2 text-[8px] font-mono-data text-zinc-500 p-2 border-b border-zinc-800 sticky top-0 bg-zinc-900">
                  <span>TX ID</span><span>TIMESTAMP</span><span>FROM</span><span>TO</span><span>AMOUNT</span><span>CHANNEL</span>
                </div>
                {caseData.transactions.map(tx => (
                  <div key={tx.id} className="grid grid-cols-6 gap-2 text-[9px] font-mono-data p-2 border-b border-zinc-900 hover:bg-zinc-900/50">
                    <span className="text-zinc-200 font-bold">{tx.id}</span>
                    <span className="text-zinc-500">{new Date(tx.timestamp).toLocaleTimeString('en-IN', { hour12: false })}</span>
                    <span className="text-zinc-400 truncate">{tx.fromAccount}</span>
                    <span className="text-zinc-400 truncate">{tx.toAccount}</span>
                    <span className="text-emerald-400 font-bold">₹{(tx.amount / 100000).toFixed(2)}L</span>
                    <span className="text-zinc-300">{tx.channel}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TRACE ROUTER CARD (Section 5) */}
          <TraceRouterCard caseData={caseData} />

          {/* PREDICTED VS ACTUAL OUTCOME CARD (Sections 14 & 15) */}
          {showOutcome && pred && (
            <OutcomeComparisonCard
              outcome={caseData.outcome}
              pred={pred}
              onSelectResult={setSimulatedResult}
            />
          )}
        </div>

        {/* RIGHT COLUMN: Prediction Card, Why This Location, Intervention, Alerts */}
        <div className="flex flex-col overflow-y-auto p-4 space-y-4 bg-zinc-950/60">
          {/* 1. LIVE ALERT BANNER (Section 12) */}
          {showAlert && alert && (
            <div className="bg-red-950/40 border border-red-700/80 rounded-lg p-3 space-y-2 animate-slide-up shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={13} className="text-red-400 animate-pulse" />
                  <span className="font-mono-data text-[10px] font-bold text-red-200">
                    🚨 PREDICTIVE CASH-OUT ALERT
                  </span>
                </div>
                <span className="text-[8px] font-mono-data px-1.5 py-0.5 rounded bg-red-900 text-red-200">
                  RED ALERT
                </span>
              </div>
              <p className="text-[10px] text-zinc-300 leading-relaxed font-sans">
                {alert.reason}
              </p>
              <div className="text-[9px] font-mono-data text-red-300">
                ▶ {alert.recommendedAction}
              </div>

              {!isActioned ? (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setShowVerificationModal(true)}
                    className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-mono-data font-bold transition-all shadow"
                  >
                    ACKNOWLEDGE & VERIFY
                  </button>
                  <button
                    onClick={() => setShowVerificationModal(true)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-zinc-300 rounded text-[10px] font-mono-data"
                  >
                    OVERRIDE
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-950/40 border border-emerald-700/60 rounded p-2 flex items-center justify-between text-[9px] font-mono-data text-emerald-300">
                  <span>✓ ACTION RECORDED: {officerDecision || 'CONFIRMED'}</span>
                  <span className="text-zinc-500">MH-CYB-0312</span>
                </div>
              )}
            </div>
          )}

          {/* 2. LARGE PREDICTION CARD (Section 10) */}
          {showPred && pred ? (
            <LargePredictionCard
              pred={pred}
              onViewLocation={() => navigate('map')}
              onViewExplanation={() => {
                const el = document.getElementById('why-panel')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
            />
          ) : (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded p-6 text-center text-zinc-600 font-mono-data text-[10px]">
              Prediction engine awaiting transaction graph expansion...
            </div>
          )}

          {/* 3. "WHY THIS LOCATION?" & COUNTERFACTUAL (Section 8) */}
          {showShap && pred && (
            <div id="why-panel">
              <WhyThisLocationPanel pred={pred} />
            </div>
          )}

          {/* 4. INTERVENTION OPTIMIZER (Section 11) */}
          {showPred && pred && (
            <InterventionOptimizer locations={pred.locations} />
          )}
        </div>
      </div>

      {/* MODALS */}
      {selectedNode && (
        <EntityIntelligenceModal
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}

      {showVerificationModal && alert && (
        <HumanVerificationModal
          alertData={alert}
          onConfirm={handleVerifySubmit}
          onClose={() => setShowVerificationModal(false)}
        />
      )}
    </div>
  )
}
