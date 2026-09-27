import { useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { ANALYTICS, CASES } from '../data/mockData'
import { Info, TrendingUp, AlertTriangle } from 'lucide-react'

const MODELS = ['FUSION', 'TGN ONLY', 'GEO ONLY'] as const
type ModelType = typeof MODELS[number]

const MODEL_DATA: Record<ModelType, { top1: number; top3: number; hitRate: number; fpRate: number }> = {
  'FUSION': { top1: 0.61, top3: 0.82, hitRate: 0.64, fpRate: 0.12 },
  'TGN ONLY': { top1: 0.55, top3: 0.74, hitRate: 0.58, fpRate: 0.14 },
  'GEO ONLY': { top1: 0.42, top3: 0.68, hitRate: 0.47, fpRate: 0.21 },
}

const FRAUD_TYPE_ACC = [
  { type: 'UPI Fraud', top1: 0.64, top3: 0.85 },
  { type: 'Investment Scam', top1: 0.52, top3: 0.78 },
  { type: 'Phishing', top1: 0.68, top3: 0.88 },
  { type: 'Job Scam', top1: 0.44, top3: 0.71 },
  { type: 'Loan Scam', top1: 0.58, top3: 0.80 },
  { type: 'Social Eng.', top1: 0.48, top3: 0.74 },
]

const OUTCOME_DATA = [
  { name: 'HIT', value: CASES.filter(c => c.outcome?.result === 'HIT').length, color: '#22c55e' },
  { name: 'PARTIAL', value: CASES.filter(c => c.outcome?.result === 'PARTIAL').length, color: '#f59e0b' },
  { name: 'MISS', value: CASES.filter(c => c.outcome?.result === 'MISS').length, color: '#ef4444' },
  { name: 'PENDING', value: CASES.filter(c => !c.outcome && c.status === 'ACTIVE').length, color: '#3f3f46' },
]

function MetricCard({ label, value, unit, delta, sim = true }: { label: string; value: string; unit?: string; delta?: string; sim?: boolean }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-mono-data text-zinc-500">{label}</span>
        {sim && <span className="text-[7px] font-mono-data text-zinc-700 border border-zinc-800 px-1 py-0.5 rounded">SIM</span>}
      </div>
      <div className="font-mono-data text-xl font-700 text-zinc-100">{value}</div>
      {unit && <div className="text-[8px] text-zinc-600 mt-0.5">{unit}</div>}
      {delta && (
        <div className={`text-[9px] font-mono-data mt-1 flex items-center gap-1 ${delta.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
          <TrendingUp size={9} />
          {delta} vs prev period
        </div>
      )}
    </div>
  )
}

const CHART_TOOLTIP_STYLE = {
  contentStyle: { background: '#0d0d12', border: '1px solid #1e1e2a', borderRadius: '4px', padding: '8px' },
  labelStyle: { color: '#6b7280', fontSize: '9px', fontFamily: 'JetBrains Mono' },
  itemStyle: { color: '#f0f0f2', fontSize: '9px', fontFamily: 'JetBrains Mono' },
}

export default function Analytics() {
  const [activeModel, setActiveModel] = useState<ModelType>('FUSION')
  const model = MODEL_DATA[activeModel]

  const evaluated = CASES.filter(c => c.outcome).length
  const hit = CASES.filter(c => c.outcome?.result === 'HIT').length
  const partial = CASES.filter(c => c.outcome?.result === 'PARTIAL').length
  const totalRecovered = CASES.reduce((s, c) => s + (c.outcome?.cashRecovered ?? 0), 0)

  return (
    <div className="flex flex-col h-full p-4 gap-4 overflow-y-auto">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-rajdhani font-700 text-lg text-zinc-100 tracking-wider">ANALYTICS</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1.5 bg-amber-950/30 border border-amber-800/40 rounded px-2 py-1">
              <AlertTriangle size={9} className="text-amber-400" />
              <span className="text-[9px] font-mono-data text-amber-300">SIMULATION METRICS — Not validated against real-world data</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded p-1">
          {MODELS.map(m => (
            <button
              key={m}
              onClick={() => setActiveModel(m)}
              className={`px-3 py-1 rounded text-[9px] font-mono-data transition-all ${activeModel === m ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-6 gap-3">
        <MetricCard label="TOP-1 ACCURACY" value={`${(model.top1 * 100).toFixed(0)}%`} delta="+3.2%" />
        <MetricCard label="TOP-3 ACCURACY" value={`${(model.top3 * 100).toFixed(0)}%`} delta="+1.8%" />
        <MetricCard label="HIT RATE" value={evaluated > 0 ? `${((hit / evaluated) * 100).toFixed(0)}%` : 'N/A'} unit={`${hit}/${evaluated} evaluated`} />
        <MetricCard label="FALSE POSITIVE RATE" value={`${(model.fpRate * 100).toFixed(0)}%`} delta="-2.1%" />
        <MetricCard label="MEDIAN SPATIAL ERROR" value="2.8" unit="km" delta="-0.4km" />
        <MetricCard label="MEDIAN TIME ERROR" value="5.6" unit="min" delta="-0.8min" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="BRIER SCORE" value="0.16" unit="lower is better (0 = perfect)" sim={false} />
        <MetricCard label="TOTAL RECOVERED" value={`₹${(totalRecovered / 100000).toFixed(1)}L`} unit="across evaluated cases" sim={false} />
        <MetricCard label="CASES EVALUATED" value={`${evaluated}`} unit={`${CASES.length} total cases`} sim={false} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-500 text-zinc-200">Accuracy Over Time</span>
            <span className="text-[8px] font-mono-data text-zinc-700">SIMULATION</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={ANALYTICS} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="#1e1e2a" strokeDasharray="3,3" />
              <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 8, fontFamily: 'JetBrains Mono' }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fill: '#52525b', fontSize: 8, fontFamily: 'JetBrains Mono' }} tickFormatter={v => `${(v * 100).toFixed(0)}%`} domain={[0.3, 0.9]} />
              <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v: unknown) => [`${(Number(v) * 100).toFixed(1)}%`]} />
              <Line type="monotone" dataKey="top1Accuracy" stroke="#8b5cf6" strokeWidth={1.5} dot={false} name="Top-1" />
              <Line type="monotone" dataKey="top3Accuracy" stroke="#22d3ee" strokeWidth={1.5} dot={false} name="Top-3" />
              <Line type="monotone" dataKey="hitRate" stroke="#22c55e" strokeWidth={1.5} dot={false} name="Hit Rate" strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2">
            {[{c:'#8b5cf6',l:'Top-1'},{c:'#22d3ee',l:'Top-3'},{c:'#22c55e',l:'Hit Rate'}].map(x=>(
              <div key={x.l} className="flex items-center gap-1">
                <div className="w-3 h-0.5" style={{background:x.c}} />
                <span className="text-[8px] font-mono-data text-zinc-600">{x.l}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-500 text-zinc-200">Accuracy by Fraud Type</span>
            <span className="text-[8px] font-mono-data text-zinc-700">SIMULATION</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={FRAUD_TYPE_ACC} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="#1e1e2a" strokeDasharray="3,3" vertical={false} />
              <XAxis dataKey="type" tick={{ fill: '#52525b', fontSize: 7, fontFamily: 'JetBrains Mono' }} />
              <YAxis tick={{ fill: '#52525b', fontSize: 8, fontFamily: 'JetBrains Mono' }} tickFormatter={v => `${(v * 100).toFixed(0)}%`} domain={[0, 1]} />
              <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v: unknown) => [`${(Number(v) * 100).toFixed(1)}%`]} />
              <Bar dataKey="top1" fill="#3b82f6" radius={[2, 2, 0, 0]} name="Top-1" />
              <Bar dataKey="top3" fill="#6366f1" radius={[2, 2, 0, 0]} name="Top-3" opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-500 text-zinc-200">Outcome Distribution</span>
            <span className="text-[8px] font-mono-data text-zinc-700">SIMULATION</span>
          </div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={150} height={150}>
              <PieChart>
                <Pie data={OUTCOME_DATA} cx={70} cy={70} innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                  {OUTCOME_DATA.map((d, i) => <Cell key={i} fill={d.color} opacity={0.85} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {OUTCOME_DATA.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-[10px] font-mono-data text-zinc-400">{d.name}</span>
                  <span className="text-[10px] font-mono-data text-zinc-200 ml-auto">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-500 text-zinc-200">Model Comparison</span>
            <span className="text-[8px] font-mono-data text-zinc-700">SIMULATION</span>
          </div>
          <div className="space-y-3">
            {MODELS.map(m => {
              const md = MODEL_DATA[m]
              return (
                <div key={m} className={`p-2.5 rounded border ${m === activeModel ? 'border-zinc-600 bg-zinc-800/40' : 'border-zinc-800 bg-zinc-900/30'}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono-data font-600 text-zinc-300">{m}</span>
                    {m === activeModel && <span className="text-[8px] font-mono-data text-zinc-500">SELECTED</span>}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'TOP-1', value: `${(md.top1 * 100).toFixed(0)}%` },
                      { label: 'TOP-3', value: `${(md.top3 * 100).toFixed(0)}%` },
                      { label: 'HIT', value: `${(md.hitRate * 100).toFixed(0)}%` },
                      { label: 'FPR', value: `${(md.fpRate * 100).toFixed(0)}%` },
                    ].map(s => (
                      <div key={s.label}>
                        <div className="text-[7px] font-mono-data text-zinc-700">{s.label}</div>
                        <div className="text-[9px] font-mono-data text-zinc-300 font-600">{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/30 border border-zinc-800/60 rounded p-3 flex items-start gap-2">
        <Info size={11} className="text-zinc-600 flex-shrink-0 mt-0.5" />
        <p className="text-[9px] text-zinc-600 leading-relaxed">
          All metrics shown are from synthetic simulation data generated by the SENTINEL-I4C prototype engine.
          These figures do not represent validated real-world performance. Metrics will update as real evaluation data
          becomes available. Do not use these numbers to claim system performance in operational contexts.
          Model version: SENTINEL-TGN-v0.4.2-PROTOTYPE
        </p>
      </div>
    </div>
  )
}
