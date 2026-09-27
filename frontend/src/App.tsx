import { useState, useEffect, useRef } from 'react'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Cases from './pages/Cases'
import CaseIntelligence from './pages/CaseIntelligence'
import Alerts from './pages/Alerts'
import Analytics from './pages/Analytics'
import AuditLog from './pages/AuditLog'
import MapPage from './pages/MapPage'
import EvidencePassport from './pages/EvidencePassport'
import { DEMO_CASE, USERS, CASES } from './data/mockData'
import { Shield, Play, X, CheckCircle2, Sliders, RotateCcw, AlertTriangle } from 'lucide-react'

type Page =
  | 'landing'
  | 'dashboard'
  | 'cases'
  | 'case'
  | 'graph'
  | 'predictions'
  | 'alerts'
  | 'intervention'
  | 'evidence'
  | 'feedback'
  | 'analytics'
  | 'audit'
  | 'admin'
  | 'map'

// Exact 60-second demo sequence as mandated in Section 21 of prompt
const DEMO_STEPS = [
  { label: '0–5s: Cyber-fraud complaint received — UPI Fraud ₹4,85,000 (Case SNTL-2026-0042)', duration: 5000, targetPage: 'case' },
  { label: '5–12s: Live transaction stream active — TX-98231 (₹1.20L) arriving Mule-01 → Mule-02', duration: 7000, targetPage: 'case' },
  { label: '12–20s: Dynamic graph expands — TX-98232 (₹95K) & TX-98233 (₹1.80L) to Terminal', duration: 8000, targetPage: 'case' },
  { label: '20–27s: Trace Router: 87.4% High Confidence → Routing TGN (68%) / Geo-Temporal (32%)', duration: 7000, targetPage: 'case' },
  { label: '27–35s: Prediction Pipeline executed: Top 3 Locations (#1 CSP-042 Malad West 87.4%)', duration: 8000, targetPage: 'case' },
  { label: '35–42s: Threat Map: Visualizing Malad West cash-out corridor and jurisdiction', duration: 7000, targetPage: 'map' },
  { label: '42–48s: Why This Location?: 6 SHAP factors + Counterfactual sensitivity displayed', duration: 6000, targetPage: 'case' },
  { label: '48–53s: 🚨 Predictive Cash-Out Alert dispatched for CSP-042 to police response unit', duration: 5000, targetPage: 'case' },
  { label: '53–57s: Human Verification: Officer acknowledges and authorizes statutory dispatch', duration: 4000, targetPage: 'case' },
  { label: '57–60s: Simulated HIT outcome verified · ₹3.85L recovered · Feedback captured', duration: 5000, targetPage: 'case' },
]

function DemoOverlay({ step, total, label, onClose }: { step: number; total: number; label: string; onClose: () => void }) {
  const pct = ((step + 1) / total) * 100

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[540px] animate-slide-up">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl overflow-hidden">
        <div className="h-1 bg-zinc-800">
          <div
            className="h-full bg-emerald-400 transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="px-4 py-2.5 flex items-center gap-3">
          <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center flex-shrink-0">
            <Play size={10} className="text-zinc-950" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[9px] font-mono-data text-emerald-400 mb-0.5 font-bold">
              SIH LIVE DEMO — STAGE {step + 1}/{total}
            </div>
            <div className="text-[11px] text-zinc-100 font-500 truncate">{label}</div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

// Demo Controls Modal (Section 20 & 22)
function DemoControlsModal({
  onClose,
  onStartCustomDemo,
  onResetDemo,
}: {
  onClose: () => void
  onStartCustomDemo: (config: any) => void
  onResetDemo: () => void
}) {
  const [scenario, setScenario] = useState<'NORMAL' | 'SUSPICIOUS' | 'ADVERSARIAL'>('SUSPICIOUS')
  const [fraudType, setFraudType] = useState<'UPI' | 'PHISHING' | 'INVESTMENT' | 'JOB' | 'LOAN'>('UPI')
  const [complexity, setComplexity] = useState<'2 HOPS' | '3 HOPS' | '5 HOPS'>('3 HOPS')
  const [outcome, setOutcome] = useState<'HIT' | 'PARTIAL' | 'MISS'>('HIT')

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg max-w-md w-full shadow-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-950 border-b border-zinc-800">
          <div>
            <div className="font-mono-data text-xs font-700 text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Sliders size={13} className="text-amber-400" />
              DEMO CONTROLS — SIMULATION
            </div>
            <div className="text-[9px] font-mono-data text-zinc-500">
              Presenter overrides & scenario injection
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4 font-mono-data text-[10px]">
          <div>
            <label className="text-zinc-400 font-bold block mb-1">SCENARIO BEHAVIOR:</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['NORMAL', 'SUSPICIOUS', 'ADVERSARIAL'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setScenario(s)}
                  className={`py-1.5 px-2 rounded border text-center font-bold transition-all ${
                    scenario === s ? 'bg-zinc-100 text-zinc-950 border-white' : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-zinc-400 font-bold block mb-1">FRAUD TYPE:</label>
            <div className="grid grid-cols-5 gap-1 text-[9px]">
              {(['UPI', 'PHISHING', 'INVESTMENT', 'JOB', 'LOAN'] as const).map(ft => (
                <button
                  key={ft}
                  onClick={() => setFraudType(ft)}
                  className={`py-1.5 rounded border text-center font-bold transition-all ${
                    fraudType === ft ? 'bg-zinc-100 text-zinc-950 border-white' : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {ft}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-zinc-400 font-bold block mb-1">NETWORK COMPLEXITY (HOPS):</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['2 HOPS', '3 HOPS', '5 HOPS'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setComplexity(c)}
                  className={`py-1.5 rounded border text-center font-bold transition-all ${
                    complexity === c ? 'bg-zinc-100 text-zinc-950 border-white' : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-zinc-400 font-bold block mb-1">SIMULATED OUTCOME:</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['HIT', 'PARTIAL', 'MISS'] as const).map(o => (
                <button
                  key={o}
                  onClick={() => setOutcome(o)}
                  className={`py-1.5 rounded border text-center font-bold transition-all ${
                    outcome === o
                      ? o === 'HIT' ? 'bg-emerald-600 text-white border-emerald-500' : o === 'PARTIAL' ? 'bg-amber-600 text-white border-amber-500' : 'bg-rose-600 text-white border-rose-500'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center gap-2">
            <button
              onClick={() => {
                onStartCustomDemo({ scenario, fraudType, complexity, outcome })
                onClose()
              }}
              className="flex-1 py-2 bg-white text-zinc-950 rounded font-bold hover:bg-zinc-200 transition-all text-center"
            >
              RUN CONFIGURED DEMO
            </button>
            <button
              onClick={() => {
                onResetDemo()
                onClose()
              }}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded font-semibold transition-all flex items-center gap-1"
            >
              <RotateCcw size={11} />
              RESET DEMO
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function NewCaseModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
  const [form, setForm] = useState({
    fraudType: 'UPI Fraud',
    amount: '485000',
    state: 'Maharashtra',
    district: 'Mumbai',
    victimAccount: 'VICT-MUM-8492',
    category: 'UPI Fraud',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg w-[480px] animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div>
            <div className="font-rajdhani font-700 text-base text-zinc-100 tracking-wider">NEW CYBER FRAUD CASE</div>
            <div className="text-[9px] font-mono-data text-zinc-600">All data is synthetic — simulation only</div>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Fraud Category', name: 'fraudType', type: 'select', options: ['UPI Fraud', 'Phishing', 'Investment Scam', 'Job Scam', 'Loan Scam', 'Social Engineering', 'Other'] },
              { label: 'Reported Amount (₹)', name: 'amount', type: 'number', placeholder: 'e.g. 485000' },
              { label: 'State', name: 'state', type: 'text', placeholder: 'Maharashtra' },
              { label: 'District', name: 'district', type: 'text', placeholder: 'Mumbai' },
            ].map(field => (
              <div key={field.name}>
                <label className="block text-[9px] font-mono-data text-zinc-500 mb-1">{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-2 text-[11px] font-mono-data text-zinc-300 focus:outline-none focus:border-zinc-500"
                    value={form[field.name as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [field.name]: e.target.value }))}
                  >
                    {field.options!.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-2 text-[11px] font-mono-data text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-500"
                    value={form[field.name as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [field.name]: e.target.value }))}
                  />
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-[9px] font-mono-data text-zinc-500 mb-1">Victim Account Token (tokenized)</label>
            <input
              type="text"
              defaultValue="VICT-MUM-8492"
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-2 text-[11px] font-mono-data text-zinc-400 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-500"
              readOnly
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-white text-zinc-950 py-2 rounded text-[10px] font-mono-data font-700 tracking-wider hover:bg-zinc-200 active:scale-95 transition-all"
            >
              CREATE CASE & START SIMULATION
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-700 text-zinc-400 rounded text-[10px] font-mono-data hover:border-zinc-600 transition-colors"
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const CURRENT_USER = USERS[0]

export default function App() {
  const [page, setPage] = useState<Page>('landing')
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(DEMO_CASE.id)
  const [demoRunning, setDemoRunning] = useState(false)
  const [demoStep, setDemoStep] = useState(-1)
  const [showDemoOverlay, setShowDemoOverlay] = useState(false)
  const [showDemoControls, setShowDemoControls] = useState(false)
  const [showNewCase, setShowNewCase] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)
  const demoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function navigate(p: string, id?: string) {
    if (id) {
      setSelectedCaseId(id)
    } else if (!selectedCaseId) {
      setSelectedCaseId(DEMO_CASE.id)
    }

    if (p === 'cases' && id) {
      setPage('case')
    } else if (p === 'new-case') {
      setShowNewCase(true)
    } else {
      setPage(p as Page)
    }
  }

  function startDemo() {
    setDemoRunning(true)
    setDemoStep(0)
    setShowDemoOverlay(true)
    setSelectedCaseId(DEMO_CASE.id)
    setPage('case')
  }

  function resetDemo() {
    setDemoRunning(false)
    setDemoStep(-1)
    setShowDemoOverlay(false)
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current)
    setSelectedCaseId(DEMO_CASE.id)
    setPage('case')
    showNotification('Demo reset — Returned to initial SNTL-2026-0042 state')
  }

  useEffect(() => {
    if (!demoRunning || demoStep < 0) return

    if (demoStep >= DEMO_STEPS.length) {
      setDemoRunning(false)
      setDemoStep(-1)
      setShowDemoOverlay(false)
      setPage('case')
      showNotification('Demo complete — SNTL-2026-0042 fully demonstrated (Predicted vs Actual verified)')
      return
    }

    const currentStep = DEMO_STEPS[demoStep]
    if (currentStep.targetPage && page !== currentStep.targetPage) {
      setPage(currentStep.targetPage as Page)
    }

    demoTimerRef.current = setTimeout(() => {
      setDemoStep(s => s + 1)
    }, currentStep.duration)

    return () => {
      if (demoTimerRef.current) clearTimeout(demoTimerRef.current)
    }
  }, [demoRunning, demoStep, page])

  function stopDemo() {
    setDemoRunning(false)
    setDemoStep(-1)
    setShowDemoOverlay(false)
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current)
  }

  function showNotification(msg: string) {
    setNotification(msg)
    setTimeout(() => setNotification(null), 4000)
  }

  if (page === 'landing') {
    return (
      <Landing
        onStartDemo={() => { startDemo(); setPage('case') }}
        onOpenDashboard={() => setPage('dashboard')}
      />
    )
  }

  function renderPage() {
    switch (page) {
      case 'dashboard':
        return <Dashboard navigate={navigate} demoStep={demoStep} demoRunning={demoRunning} />
      case 'cases':
        return <Cases navigate={navigate} selectedId={selectedCaseId} />
      case 'case':
      case 'graph':
      case 'predictions':
      case 'intervention':
      case 'feedback':
        return (
          <CaseIntelligence
            caseId={selectedCaseId || DEMO_CASE.id}
            navigate={navigate}
            demoStep={demoStep}
            demoRunning={demoRunning}
            activeSection={page === 'case' ? 'overview' : page}
          />
        )
      case 'map':
        return <MapPage navigate={navigate} />
      case 'alerts':
        return <Alerts navigate={navigate} />
      case 'analytics':
        return <Analytics />
      case 'audit':
        return <AuditLog />
      case 'evidence':
        return <EvidencePassport caseId={selectedCaseId || DEMO_CASE.id} navigate={navigate} />
      case 'admin':
        return (
          <div className="p-6 space-y-4 overflow-y-auto">
            <div className="font-rajdhani font-700 text-lg text-zinc-100 tracking-wider">SYSTEM ADMINISTRATION</div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'System Status', value: 'ONLINE', color: 'text-emerald-400' },
                { label: 'Data Mode', value: 'SYNTHETIC', color: 'text-amber-400' },
                { label: 'Model Version', value: 'SENTINEL-TGN-v0.4.2-PROTOTYPE', color: 'text-zinc-300' },
                { label: 'DB Status', value: 'In-memory RLock Repository', color: 'text-emerald-400' },
                { label: 'ML Engine', value: 'TGN + Geo-Temporal Fusion', color: 'text-emerald-400' },
                { label: 'Stream', value: 'Simulated WebSocket Stream', color: 'text-emerald-400' },
              ].map(item => (
                <div key={item.label} className="bg-zinc-900/50 border border-zinc-800 rounded p-3">
                  <div className="text-[9px] font-mono-data text-zinc-600">{item.label}</div>
                  <div className={`font-mono-data text-sm font-600 mt-1 ${item.color}`}>{item.value}</div>
                </div>
              ))}
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800 rounded p-4 space-y-2">
              <div className="text-[10px] font-mono-data text-zinc-400">USER MANAGEMENT</div>
              {USERS.map(u => (
                <div key={u.badge} className="flex items-center gap-4 py-2 border-b border-zinc-800/40">
                  <div className="w-6 h-6 bg-zinc-800 rounded flex items-center justify-center text-[8px] font-mono-data text-zinc-400">
                    {u.name.split(' ')[1]?.[0] ?? u.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] text-zinc-300">{u.name}</div>
                    <div className="text-[9px] font-mono-data text-zinc-600">{u.role} · {u.badge}</div>
                  </div>
                  <div className="text-[9px] font-mono-data text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
                    CLEARANCE {u.clearanceLevel}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      default:
        return <Dashboard navigate={navigate} demoStep={demoStep} demoRunning={demoRunning} />
    }
  }

  const sidebarPage = (page === 'landing' ? 'dashboard' : page) as any

  return (
    <div className="h-screen flex flex-col bg-zinc-950 overflow-hidden">
      <TopBar
        userRole={CURRENT_USER.role}
        userName={CURRENT_USER.name}
        onRunDemo={startDemo}
        demoRunning={demoRunning}
        onToggleDemoControls={() => setShowDemoControls(true)}
        onResetDemo={resetDemo}
      />

      <div className="flex flex-1 min-h-0">
        <Sidebar page={sidebarPage} navigate={navigate as (p: any) => void} />
        <main className="flex-1 min-w-0 overflow-hidden bg-zinc-950">
          {renderPage()}
        </main>
      </div>

      {showDemoOverlay && demoStep >= 0 && demoStep < DEMO_STEPS.length && (
        <DemoOverlay
          step={demoStep}
          total={DEMO_STEPS.length}
          label={DEMO_STEPS[demoStep].label}
          onClose={stopDemo}
        />
      )}

      {showDemoControls && (
        <DemoControlsModal
          onClose={() => setShowDemoControls(false)}
          onStartCustomDemo={(cfg) => {
            showNotification(`Custom simulation started: ${cfg.scenario} · ${cfg.fraudType} · ${cfg.complexity}`)
            startDemo()
          }}
          onResetDemo={resetDemo}
        />
      )}

      {notification && (
        <div className="fixed top-14 right-4 z-50 animate-slide-up">
          <div className="bg-zinc-900 border border-emerald-700/60 rounded-lg px-4 py-3 flex items-center gap-2 shadow-xl">
            <CheckCircle2 size={12} className="text-emerald-400" />
            <span className="text-[11px] font-mono-data text-zinc-200">{notification}</span>
          </div>
        </div>
      )}

      {showNewCase && (
        <NewCaseModal
          onClose={() => setShowNewCase(false)}
          onSubmit={() => {
            showNotification('Case created — synthetic transaction stream started')
            navigate('cases', DEMO_CASE.id)
          }}
        />
      )}
    </div>
  )
}
