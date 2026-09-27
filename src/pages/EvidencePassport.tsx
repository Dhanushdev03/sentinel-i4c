import { useState } from 'react'
import { Shield, Download, Hash, AlertCircle, FileText, CheckCircle2 } from 'lucide-react'
import { CASES } from '../data/mockData'

interface Props {
  caseId: string | null
  navigate: (page: string, id?: string) => void
}

export default function EvidencePassport({ caseId, navigate }: Props) {
  const [generated, setGenerated] = useState(false)
  const caseData = caseId ? CASES.find(c => c.id === caseId) : CASES[0]

  if (!caseData?.prediction) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full gap-3">
        <Shield size={32} className="text-zinc-700" />
        <p className="text-zinc-600 font-mono-data text-sm">No prediction available for evidence passport</p>
        <button onClick={() => navigate('cases')} className="text-[10px] font-mono-data text-zinc-500 border border-zinc-800 px-3 py-1.5 rounded hover:border-zinc-600 transition-colors">
          ← BACK TO CASES
        </button>
      </div>
    )
  }

  const pred = caseData.prediction
  const passportHash = `sha256-${Array.from(
    { length: 64 },
    (_, i) => '0123456789abcdef'[(parseInt(caseData.id.slice(-3)) * 7 + i * 13 + 97) % 16]
  ).join('')}`

  const ts = new Date().toISOString()

  return (
    <div className="flex flex-col h-full p-4 gap-3 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-rajdhani font-700 text-lg text-zinc-100 tracking-wider">EVIDENCE PASSPORT</h2>
          <div className="text-[9px] font-mono-data text-zinc-600">Tamper-evident prediction record — Prototype only · Not court-admissible</div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={caseData.id}
            onChange={e => navigate('evidence', e.target.value)}
            className="bg-zinc-900 border border-zinc-700 hover:border-zinc-500 rounded px-2.5 py-1 text-xs font-mono-data text-zinc-100 font-bold focus:outline-none cursor-pointer"
          >
            {CASES.map(c => (
              <option key={c.id} value={c.id}>
                {c.caseNumber} — {c.fraudType} (₹{(c.reportedAmount / 100000).toFixed(1)}L)
              </option>
            ))}
          </select>
          <button
            onClick={() => navigate('cases', caseData.id)}
            className="text-[9px] font-mono-data text-zinc-400 border border-zinc-700 px-3 py-1.5 rounded hover:border-zinc-500 hover:text-zinc-200 transition-colors"
          >
            VIEW CASE
          </button>
          <button
            onClick={() => setGenerated(true)}
            className="flex items-center gap-1.5 bg-white text-zinc-950 px-3 py-1.5 rounded text-[10px] font-mono-data font-600 hover:bg-zinc-200 transition-all"
          >
            <Download size={11} />
            EXPORT PDF
          </button>
        </div>
      </div>

      {generated && (
        <div className="flex items-center gap-2 bg-emerald-950/30 border border-emerald-800/50 rounded px-3 py-2 animate-slide-up">
          <CheckCircle2 size={11} className="text-emerald-400" />
          <span className="text-[10px] font-mono-data text-emerald-300">Evidence passport export simulated. SHA-256 hash logged in audit trail.</span>
        </div>
      )}

      <div className="bg-amber-950/20 border border-amber-800/30 rounded p-3 flex items-start gap-2">
        <AlertCircle size={11} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-[9px] font-mono-data text-amber-500 leading-relaxed">
          PROTOTYPE DISCLAIMER: This evidence passport is generated from synthetic simulation data.
          It is NOT suitable for legal proceedings, court submissions, or official investigations.
          It is designed to demonstrate the concept of tamper-evident prediction logging for the SIH hackathon.
        </p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="bg-zinc-950 border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
          <Shield size={16} className="text-zinc-400" />
          <div>
            <div className="font-rajdhani font-700 text-sm text-zinc-100 tracking-wider">SENTINEL-I4C PREDICTION PASSPORT</div>
            <div className="text-[9px] font-mono-data text-zinc-600">PROTOTYPE — SIMULATION DATA — SIH HACKATHON DEMO</div>
          </div>
          <div className="ml-auto text-[9px] font-mono-data text-zinc-600">v0.4.2-DEMO</div>
        </div>

        <div className="p-4 space-y-4">
          <Section title="CASE IDENTIFIERS">
            <Field label="CASE ID" value={caseData.id} mono />
            <Field label="CASE NUMBER" value={caseData.caseNumber} mono />
            <Field label="PREDICTION ID" value={pred.id} mono />
            <Field label="PREDICTION TIMESTAMP" value={pred.timestamp} mono />
            <Field label="EXPORT TIMESTAMP" value={ts} mono />
            <Field label="MODEL VERSION" value={pred.modelVersion} mono />
          </Section>

          <Section title="INPUT SNAPSHOT">
            <Field label="FRAUD TYPE" value={caseData.fraudType} />
            <Field label="REPORTED AMOUNT" value={`₹${(caseData.reportedAmount / 100000).toFixed(2)}L`} mono />
            <Field label="VICTIM TOKEN" value={caseData.victimAccountToken} mono />
            <Field label="MULE HOPS" value={`${caseData.hops}`} mono />
            <Field label="TRACE CONFIDENCE" value={caseData.traceConfidence} mono />
            <Field label="TGN WEIGHT" value={caseData.tgnWeight.toString()} mono />
            <Field label="GEO WEIGHT" value={caseData.geoWeight.toString()} mono />
            <Field label="INPUT HASH" value={pred.inputHash} mono />
          </Section>

          <Section title="PREDICTION OUTPUT">
            {pred.locations.map(loc => (
              <div key={loc.rank} className="bg-zinc-950/60 rounded border border-zinc-800 p-2.5 mb-2">
                <div className="text-[9px] font-mono-data text-zinc-500 mb-1.5">LOCATION #{loc.rank}</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <Field label="NAME" value={loc.name} />
                  <Field label="TYPE" value={loc.type} mono />
                  <Field label="BANK" value={loc.bank} />
                  <Field label="PROBABILITY" value={`${(loc.probability * 100).toFixed(2)}%`} mono />
                  <Field label="CONFIDENCE" value={`${(loc.confidence * 100).toFixed(2)}%`} mono />
                  <Field label="EXPECTED RECOVERY" value={`₹${(loc.expectedRecovery / 100000).toFixed(2)}L`} mono />
                </div>
              </div>
            ))}
            <Field label="TIME WINDOW" value={`${pred.timeWindowMin}–${pred.timeWindowMax} minutes`} mono />
            <Field label="AMOUNT RANGE" value={`₹${(pred.amountMin / 100000).toFixed(2)}L – ₹${(pred.amountMax / 100000).toFixed(2)}L`} mono />
          </Section>

          <Section title="EXPLAINABILITY (SHAP SIMULATION)">
            {pred.shapFactors.map((f, i) => (
              <div key={i} className="flex justify-between items-start py-0.5">
                <span className="text-[9px] text-zinc-400">{f.feature}</span>
                <div className="text-right">
                  <span className={`text-[9px] font-mono-data ${f.direction === 'positive' ? 'text-amber-400' : 'text-blue-400'}`}>
                    {f.direction === 'positive' ? '+' : ''}{f.impact.toFixed(3)}
                  </span>
                  <div className="text-[8px] font-mono-data text-zinc-600">{f.value}</div>
                </div>
              </div>
            ))}
            <div className="mt-2 pt-2 border-t border-zinc-800">
              <div className="text-[8px] font-mono-data text-zinc-600 mb-0.5">COUNTERFACTUAL</div>
              <p className="text-[9px] text-zinc-400">{pred.counterfactual}</p>
            </div>
          </Section>

          {caseData.alert && (
            <Section title="ALERT RECORD">
              <Field label="ALERT ID" value={caseData.alert.id} mono />
              <Field label="ALERT LEVEL" value={caseData.alert.level} mono />
              <Field label="ALERT STATUS" value={caseData.alert.status} mono />
              <Field label="OFFICER" value={caseData.officerBadge} mono />
              <Field label="OFFICER ACTION" value={caseData.alert.officerAction ?? 'PENDING'} mono />
            </Section>
          )}

          {caseData.outcome && (
            <Section title="OUTCOME">
              <Field label="RESULT" value={caseData.outcome.result} mono />
              <Field label="ACTUAL LOCATION" value={caseData.outcome.actualLocation} />
              <Field label="CASH RECOVERED" value={`₹${(caseData.outcome.cashRecovered / 100000).toFixed(2)}L`} mono />
              <Field label="OFFICER COMMENTS" value={caseData.outcome.officerComments} />
              <Field label="RECORDED BY" value={caseData.outcome.recordedBy} mono />
              <Field label="RECORDED AT" value={caseData.outcome.recordedAt} mono />
            </Section>
          )}

          <Section title="INTEGRITY HASH">
            <div className="space-y-2">
              <div>
                <div className="text-[8px] font-mono-data text-zinc-600 mb-0.5">PASSPORT HASH (SHA-256 · SIMULATION)</div>
                <div className="text-[9px] font-mono-data text-emerald-400 break-all bg-zinc-950 p-2 rounded border border-zinc-800">{passportHash}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield size={10} className="text-emerald-500" />
                <span className="text-[9px] font-mono-data text-emerald-400">Prototype tamper-evident record. Hash would cover all fields above in production.</span>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[9px] font-mono-data text-zinc-500 tracking-wider mb-2 pb-1 border-b border-zinc-800">
        {title}
      </div>
      <div className="space-y-0.5 pl-2">{children}</div>
    </div>
  )
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-4 py-0.5">
      <span className="text-[8px] font-mono-data text-zinc-600 flex-shrink-0">{label}</span>
      <span className={`text-right truncate max-w-xs ${mono ? 'text-[9px] font-mono-data text-zinc-300' : 'text-[9px] text-zinc-400'}`}>
        {value}
      </span>
    </div>
  )
}
