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
import { DEMO_CASE, USERS } from './data/mockData'
import { Shield, Play, X, CheckCircle2 } from 'lucide-react'

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

const DEMO_STEPS = [
  { label: 'Complaint received — UPI Fraud ₹4.5L', duration: 2500 },
  { label: 'Case CYB-2024-MH-00142 created', duration: 2000 },
  { label: 'Transaction stream started — 7 transactions ingested', duration: 3000 },
  { label: 'Money-flow graph constructed — 4 mule hops detected', duration: 2500 },
  { label: 'Trace confidence: HIGH → Routing to TGN engine (68%)', duration: 2500 },
  { label: 'TGN Trace Engine running — Temporal graph scoring...', duration: 3000 },
  { label: 'Prediction generated — SBI ATM Andheri (72.3%) · 18–25 min', duration: 2500 },
  { label: 'SHAP explainability computed — 6 factors identified', duration: 2000 },
  { label: '🔴 RED ALERT triggered — Police & bank notified (simulated)', duration: 2500 },
  { label: 'Officer action required — Confirm / Override / Escalate', duration: 2500 },
  { label: 'Outcome recorded · Feedback loop updated · Analytics refreshed', duration: 2500 },
]

function DemoOverlay({ step, total, label, onClose }: { step: number; total: number; label: string; onClose: () => void }) {
  const pct = ((step + 1) / total) * 100

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[480px] animate-slide-up">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl overflow-hidden">
        <div className="h-0.5 bg-zinc-800">
          <div
            className="h-full bg-white transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center flex-shrink-0">
            <Play size={10} className="text-zinc-950" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[9px] font-mono-data text-zinc-500 mb-0.5">
              DEMO STEP {step + 1}/{total}
            </div>
            <div className="text-[11px] text-zinc-200 font-500 truncate">{label}</div>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400 transition-colors flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

function NewCaseModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
  const [form, setForm] = useState({
    fraudType: 'UPI Fraud',
    amount: '',
    state: 'Maharashtra',
    district: '',
    victimAccount: '',
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
              { label: 'Reported Amount (₹)', name: 'amount', type: 'number', placeholder: 'e.g. 450000' },
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
              placeholder="Auto-generated on submission"
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-2 text-[11px] font-mono-data text-zinc-500 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-500"
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
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)
  const [demoRunning, setDemoRunning] = useState(false)
  const [demoStep, setDemoStep] = useState(-1)
  const [showDemoOverlay, setShowDemoOverlay] = useState(false)
  const [showNewCase, setShowNewCase] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)
  const demoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function navigate(p: string, id?: string) {
    if (p === 'cases' && id) {
      setSelectedCaseId(id)
      setPage('case')
    } else if (p === 'evidence' && id) {
      setSelectedCaseId(id)
      setPage('evidence')
    } else if (p === 'graph' || p === 'predictions') {
      setPage('cases')
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

  useEffect(() => {
    if (!demoRunning || demoStep < 0) return

    if (demoStep >= DEMO_STEPS.length) {
      setDemoRunning(false)
      setDemoStep(-1)
      setShowDemoOverlay(false)
      showNotification('Demo complete — Case CYB-2024-MH-00142 fully demonstrated')
      return
    }

    const currentStep = DEMO_STEPS[demoStep]
    demoTimerRef.current = setTimeout(() => {
      setDemoStep(s => s + 1)
    }, currentStep.duration)

    return () => {
      if (demoTimerRef.current) clearTimeout(demoTimerRef.current)
    }
  }, [demoRunning, demoStep])

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
        return <CaseIntelligence caseId={selectedCaseId} navigate={navigate} demoStep={demoStep} demoRunning={demoRunning} />
      case 'map':
        return <MapPage navigate={navigate} />
      case 'alerts':
        return <Alerts navigate={navigate} />
      case 'analytics':
        return <Analytics />
      case 'audit':
        return <AuditLog />
      case 'evidence':
        return <EvidencePassport caseId={selectedCaseId} navigate={navigate} />
      case 'feedback':
        return (
          <div className="p-8 flex flex-col items-center justify-center h-full gap-4">
            <div className="font-rajdhani font-700 text-zinc-400 tracking-wider text-lg">FEEDBACK</div>
            <p className="text-[11px] text-zinc-600 text-center max-w-sm">
              Outcome feedback is collected via the Case Intelligence View → Officer Actions → Record Outcome panel.
              Navigate to an active case and use the "HIT / PARTIAL / MISS" buttons to log outcomes.
            </p>
            <button onClick={() => navigate('cases')} className="text-[10px] font-mono-data text-zinc-400 border border-zinc-700 px-3 py-1.5 rounded hover:border-zinc-500 transition-colors">
              GO TO CASES
            </button>
          </div>
        )
      case 'intervention':
        return (
          <div className="p-8 flex flex-col items-center justify-center h-full gap-4">
            <div className="font-rajdhani font-700 text-zinc-400 tracking-wider text-lg">INTERVENTION OPTIMIZER</div>
            <p className="text-[11px] text-zinc-600 text-center max-w-sm">
              Intervention recommendations are shown in the Case Intelligence View.
              Select a case to view ranked intervention priorities.
            </p>
            <button onClick={() => navigate('cases')} className="text-[10px] font-mono-data text-zinc-400 border border-zinc-700 px-3 py-1.5 rounded hover:border-zinc-500 transition-colors">
              VIEW CASES
            </button>
          </div>
        )
      case 'admin':
        return (
          <div className="p-6 space-y-4 overflow-y-auto">
            <div className="font-rajdhani font-700 text-lg text-zinc-100 tracking-wider">SYSTEM ADMINISTRATION</div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'System Status', value: 'ONLINE', color: 'text-emerald-400' },
                { label: 'Data Mode', value: 'SYNTHETIC', color: 'text-amber-400' },
                { label: 'Model Version', value: 'v0.4.2-PROTO', color: 'text-zinc-300' },
                { label: 'DB Status', value: 'Mock (In-memory)', color: 'text-zinc-400' },
                { label: 'ML Engine', value: 'Prototype scorer', color: 'text-zinc-400' },
                { label: 'Stream', value: 'Simulated Kafka', color: 'text-zinc-400' },
              ].map(item => (
                <div key={item.label} className="bg-zinc-900/50 border border-zinc-800 rounded p-3">
                  <div className="text-[9px] font-mono-data text-zinc-600">{item.label}</div>
                  <div className={`font-mono-data text-sm font-600 mt-1 ${item.color}`}>{item.value}</div>
                </div>
              ))}
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800 rounded p-4 space-y-2">
              <div className="text-[10px] font-mono-data text-zinc-400">USER MANAGEMENT</div>
              {[
                { name: 'Insp. R. Sharma', role: 'LEA Officer', badge: 'MH-CYB-0312', level: 'L2' },
                { name: 'SI Kavita Nair', role: 'Bank Fraud Analyst', badge: 'DL-CYB-0147', level: 'L2' },
                { name: 'DCP Anand Mehta', role: 'Supervisor', badge: 'MH-SUP-0041', level: 'L3' },
                { name: 'Admin Console', role: 'System Administrator', badge: 'SYS-ADM-0001', level: 'L4' },
              ].map(u => (
                <div key={u.badge} className="flex items-center gap-4 py-2 border-b border-zinc-800/40">
                  <div className="w-6 h-6 bg-zinc-800 rounded flex items-center justify-center text-[8px] font-mono-data text-zinc-400">
                    {u.name.split(' ')[1]?.[0] ?? u.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] text-zinc-300">{u.name}</div>
                    <div className="text-[9px] font-mono-data text-zinc-600">{u.role} · {u.badge}</div>
                  </div>
                  <div className="text-[9px] font-mono-data text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
                    CLEARANCE {u.level}
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

  const sidebarPage = page === 'case' || page === 'evidence' ? 'cases' : page as any

  return (
    <div className="h-screen flex flex-col bg-zinc-950 overflow-hidden">
      <TopBar
        userRole={CURRENT_USER.role}
        userName={CURRENT_USER.name}
        onRunDemo={startDemo}
        demoRunning={demoRunning}
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
