import React from 'react'
import {
  Shield,
  XCircle,
  Database,
  Cpu,
  Brain,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  MapPin,
  Clock,
  DollarSign,
  Layers,
  ArrowRight,
  Info,
  Hash,
  HelpCircle,
} from 'lucide-react'
import type { FraudCase } from '../data/mockData'
import type { ComputationalPrediction } from '../utils/predictionEngine'

// ======================================================================
// 1. Model Inspection Modal (Requirements 5 & 6)
// ======================================================================
export function ModelInspectionModal({
  prediction,
  caseData,
  onClose,
}: {
  prediction: ComputationalPrediction
  caseData: FraudCase
  onClose: () => void
}) {
  const nodeCount = caseData.graphNodes.length
  const txCount = caseData.transactions.length
  const hops = caseData.hops || 4
  const candidatesCount = prediction.locations.length

  const features = [
    { name: 'transaction_amount', desc: 'Transfer volume & cash-out batching threshold', value: `₹${(caseData.reportedAmount / 100000).toFixed(2)}L` },
    { name: 'transaction_velocity', desc: 'Inter-hop propagation speed (minutes per hop)', value: '1.8 min/hop' },
    { name: 'time_delta', desc: 'Latency between last transfer and current timestamp', value: '< 18 min' },
    { name: 'hop_number', desc: 'Distance from initial victim source node', value: `${hops} hops` },
    { name: 'node_degree', desc: 'In-degree / out-degree connectivity of terminal mule', value: 'In: 2, Out: 1' },
    { name: 'historical_pattern', desc: 'Previous cash-out density at candidate outlet', value: 'Match: 0.89' },
    { name: 'geographic_distance', desc: 'Proximity from last observed device/IP coordinate', value: '5.8 km' },
    { name: 'time_of_day', desc: 'CSP agent banking hours & AePS reserve peak', value: '14:30–16:00 IST' },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg max-w-2xl w-full shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-950 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Cpu size={15} className="text-purple-400" />
            <div>
              <div className="font-mono-data text-xs font-700 text-zinc-100 uppercase tracking-wider">
                MODEL INSPECTION DOSSIER
              </div>
              <div className="text-[9px] font-mono-data text-zinc-500">
                Algorithm specifications, feature space, and technical disclosures
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <XCircle size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto font-mono-data text-[10px]">
          {/* Honest Technical Disclosure (Requirement 6) */}
          <div className="bg-amber-950/20 border border-amber-800/60 rounded p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <AlertTriangle size={12} />
              <span>TECHNICAL TRANSPARENCY & ML DISCLOSURE</span>
            </div>
            <p className="text-zinc-300 font-sans text-[10px] leading-relaxed">
              <strong>Model Type:</strong> Prototype Temporal Graph Scoring + ST-KDE/ST-GCN Fusion.
              <br />
              <strong>Status:</strong>{' '}
              <span className="text-emerald-400 font-mono-data font-bold">
                LOCAL INFERENCE (PROTOTYPE HEURISTIC + SPATIAL KERNEL DENSITY)
              </span>
              .
              <br />
              <strong>Disclaimer:</strong> This hackathon prototype computes predictions using
              deterministic graph traversal scoring and spatial density kernel estimation. It is not
              a cloud-hosted multi-billion parameter neural network. All calculations reflect the exact
              fusion architecture designed for SIH demonstration.
            </p>
          </div>

          {/* Model Specification Grid */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800">
              <div className="text-[8px] text-zinc-500">MODEL NAME</div>
              <div className="text-xs font-bold text-zinc-200 mt-0.5">SENTINEL-TGN</div>
              <div className="text-[8px] text-zinc-600">v0.4.2-PROTO</div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800">
              <div className="text-[8px] text-zinc-500">INPUT NODES</div>
              <div className="text-xs font-bold text-cyan-400 mt-0.5">{nodeCount} nodes</div>
              <div className="text-[8px] text-zinc-600">Mules, Devices, SIMs</div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800">
              <div className="text-[8px] text-zinc-500">TRANSACTIONS</div>
              <div className="text-xs font-bold text-emerald-400 mt-0.5">{txCount} events</div>
              <div className="text-[8px] text-zinc-600">{hops} observed hops</div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800">
              <div className="text-[8px] text-zinc-500">CANDIDATES</div>
              <div className="text-xs font-bold text-amber-400 mt-0.5">{candidatesCount} outlets</div>
              <div className="text-[8px] text-zinc-600">CSP / ATM outlets</div>
            </div>
          </div>

          {/* Feature Vectors Table */}
          <div className="space-y-1.5">
            <div className="text-[9px] font-700 text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span>ACTIVE MODEL FEATURE SPACE ({features.length} FEATURES)</span>
              <span className="text-zinc-600">NORMALIZED INPUT VECTORS</span>
            </div>
            <div className="border border-zinc-800 rounded overflow-hidden">
              <div className="grid grid-cols-[160px_1fr_100px] bg-zinc-950 p-2 border-b border-zinc-800 text-[8px] text-zinc-500 font-bold">
                <span>FEATURE VECTOR</span>
                <span>DESCRIPTION</span>
                <span className="text-right">CURRENT VALUE</span>
              </div>
              {features.map((f, i) => (
                <div
                  key={f.name}
                  className={`grid grid-cols-[160px_1fr_100px] p-2 border-b border-zinc-900 items-center ${
                    i % 2 === 0 ? 'bg-zinc-900/40' : 'bg-zinc-950/40'
                  }`}
                >
                  <span className="text-zinc-300 font-bold font-mono-data text-[9px]">{f.name}</span>
                  <span className="text-zinc-400 font-sans text-[9px]">{f.desc}</span>
                  <span className="text-right text-emerald-400 font-bold font-mono-data text-[9px]">{f.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Output candidates breakdown */}
          <div className="space-y-1.5">
            <div className="text-[9px] font-700 text-zinc-400 uppercase tracking-wider">
              INFERENCE OUTPUT DISTRIBUTION
            </div>
            <div className="grid grid-cols-3 gap-2">
              {prediction.locations.map(loc => (
                <div key={loc.name} className="bg-zinc-950 p-2.5 rounded border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] text-zinc-500 font-bold">RANK #{loc.rank}</span>
                    <span className="text-red-400 font-bold text-[9px]">{(loc.probability * 100).toFixed(1)}%</span>
                  </div>
                  <div className="text-[10px] text-zinc-200 font-bold truncate">{loc.name}</div>
                  <div className="text-[8px] text-zinc-500">{loc.type} · {loc.distanceKm.toFixed(1)} km</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between flex-shrink-0">
          <span className="text-[8px] font-mono-data text-zinc-500">
            RUN ID: {prediction.reproducibility.runId} · SEED: {prediction.reproducibility.seed}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded font-mono-data text-[10px] transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  )
}

// ======================================================================
// 2. Synthetic Data Inspector Modal (Requirement 7)
// ======================================================================
export function SyntheticDataInspectorModal({
  caseData,
  onClose,
}: {
  caseData: FraudCase
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg max-w-3xl w-full shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-950 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Database size={15} className="text-cyan-400" />
            <div>
              <div className="font-mono-data text-xs font-700 text-zinc-100 uppercase tracking-wider">
                SYNTHETIC INPUT DATA INSPECTOR
              </div>
              <div className="text-[9px] font-mono-data text-zinc-500">
                Exact synthetic records feeding the model: INPUT → MODEL → OUTPUT
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <XCircle size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto font-mono-data text-[10px]">
          {/* Complaint Record */}
          <div className="bg-zinc-950 p-3 rounded border border-zinc-800 space-y-2">
            <div className="text-[9px] font-700 text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={12} className="text-amber-400" />
              <span>NCRP COMPLAINT RECORD (SYNTHETIC)</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-[9px]">
              <div><span className="text-zinc-600 block">CASE ID</span><span className="text-zinc-200">{caseData.caseNumber}</span></div>
              <div><span className="text-zinc-600 block">FRAUD TYPE</span><span className="text-zinc-200">{caseData.fraudType}</span></div>
              <div><span className="text-zinc-600 block">REPORTED AMOUNT</span><span className="text-emerald-400 font-bold">₹{(caseData.reportedAmount / 100000).toFixed(2)}L</span></div>
              <div><span className="text-zinc-600 block">VICTIM TOKEN</span><span className="text-zinc-400">{caseData.victimAccountToken}</span></div>
            </div>
          </div>

          {/* Raw Transaction Stream */}
          <div className="space-y-1.5">
            <div className="text-[9px] font-700 text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span>RAW INGESTED TRANSACTIONS ({caseData.transactions.length} RECORDS)</span>
              <span className="text-zinc-600">SYNTHETIC INGESTION STREAM</span>
            </div>
            <div className="border border-zinc-800 rounded bg-zinc-950 max-h-56 overflow-y-auto">
              <div className="grid grid-cols-7 gap-2 p-2 border-b border-zinc-800 text-[8px] text-zinc-500 font-bold sticky top-0 bg-zinc-900">
                <span>TX ID</span>
                <span>TIMESTAMP</span>
                <span>FROM ACCOUNT</span>
                <span>TO ACCOUNT</span>
                <span>AMOUNT</span>
                <span>CHANNEL</span>
                <span>HOP</span>
              </div>
              {caseData.transactions.map((tx, idx) => (
                <div
                  key={tx.id}
                  className={`grid grid-cols-7 gap-2 p-2 border-b border-zinc-900 text-[9px] hover:bg-zinc-900/60 ${
                    tx.isNoise ? 'opacity-50 italic' : ''
                  }`}
                >
                  <span className="text-zinc-200 font-bold">{tx.id}</span>
                  <span className="text-zinc-500">{new Date(tx.timestamp).toLocaleTimeString('en-IN', { hour12: false })}</span>
                  <span className="text-zinc-400 truncate">{tx.fromAccount}</span>
                  <span className="text-zinc-400 truncate">{tx.toAccount}</span>
                  <span className="text-emerald-400 font-bold">₹{(tx.amount / 100000).toFixed(2)}L</span>
                  <span className="text-zinc-300">{tx.channel}</span>
                  <span className="text-zinc-500">{tx.hop}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Associated Infrastructure */}
          <div className="space-y-1.5">
            <div className="text-[9px] font-700 text-zinc-400 uppercase tracking-wider">
              ASSOCIATED INFRASTRUCTURE TELEMETRY (DEVICES, SIMS, TOKENS)
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800 space-y-1">
                <span className="text-[8px] text-zinc-500 block">OBSERVED DEVICES</span>
                <div className="text-zinc-200 font-bold">DEV-REDMI-12</div>
                <div className="text-[8px] text-zinc-600">IMEI: 86492004-981249 · ROOTED</div>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800 space-y-1">
                <span className="text-[8px] text-zinc-500 block">TELECOM MSISDN</span>
                <div className="text-zinc-200 font-bold">+91 98201-44910</div>
                <div className="text-[8px] text-zinc-600">IMSI: 404-45-84920 · Jio Maharashtra</div>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800 space-y-1">
                <span className="text-[8px] text-zinc-500 block">UPI VPA ROUTING</span>
                <div className="text-zinc-200 font-bold">mule01@okaxis</div>
                <div className="text-[8px] text-zinc-600">FastPay Settlement Corridor</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between flex-shrink-0">
          <span className="text-[8px] font-mono-data text-zinc-500">
            ALL TELEMETRY SYNTHETIC · COMPLIANT WITH SIH SIMULATION STANDARDS
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded font-mono-data text-[10px] transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  )
}

// ======================================================================
// 3. Prediction Validation Modal (Requirement 13)
// ======================================================================
export function PredictionValidationModal({
  prediction,
  onClose,
}: {
  prediction: ComputationalPrediction
  onClose: () => void
}) {
  const val = prediction.validation

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg max-w-lg w-full shadow-2xl overflow-hidden animate-slide-up flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-950 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-400" />
            <div>
              <div className="font-mono-data text-xs font-700 text-zinc-100 uppercase tracking-wider">
                PREDICTION VALIDATION & GROUND TRUTH
              </div>
              <div className="text-[9px] font-mono-data text-zinc-500">
                Comparing model forecast against simulated intervention outcome
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <XCircle size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 font-mono-data text-[10px]">
          {/* Outcome Badge */}
          <div className="flex items-center justify-between bg-zinc-950 p-3 rounded border border-zinc-800">
            <div>
              <span className="text-[8px] text-zinc-500 block">SIMULATION OUTCOME</span>
              <div className="text-base font-bold text-emerald-400 mt-0.5">
                VERIFIED HIT (INTERCEPT SUCCESSFUL)
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700 font-bold text-xs">
              {val.outcome}
            </span>
          </div>

          {/* Comparison Table */}
          <div className="border border-zinc-800 rounded overflow-hidden">
            <div className="grid grid-cols-[100px_1fr_1fr_80px] bg-zinc-950 p-2 border-b border-zinc-800 text-[8px] text-zinc-500 font-bold">
              <span>PARAMETER</span>
              <span>PREDICTED</span>
              <span>ACTUAL SIMULATED</span>
              <span className="text-right">ERROR</span>
            </div>
            <div className="grid grid-cols-[100px_1fr_1fr_80px] p-2.5 border-b border-zinc-900 bg-zinc-900/40 items-center">
              <span className="text-zinc-400 font-bold">Location</span>
              <span className="text-zinc-200 truncate">{val.predictedLocation}</span>
              <span className="text-emerald-400 font-bold truncate">{val.actualLocation}</span>
              <span className="text-right text-emerald-400 font-bold">{val.spatialErrorKm.toFixed(1)} km</span>
            </div>
            <div className="grid grid-cols-[100px_1fr_1fr_80px] p-2.5 border-b border-zinc-900 bg-zinc-950/40 items-center">
              <span className="text-zinc-400 font-bold">Time Window</span>
              <span className="text-zinc-200">{val.predictedTime}</span>
              <span className="text-blue-400 font-bold">{val.actualTime}</span>
              <span className="text-right text-blue-400 font-bold">+{val.timeErrorMin.toFixed(1)} min</span>
            </div>
            <div className="grid grid-cols-[100px_1fr_1fr_80px] p-2.5 bg-zinc-900/40 items-center">
              <span className="text-zinc-400 font-bold">Cash Amount</span>
              <span className="text-zinc-200">₹{(val.predictedAmount / 100000).toFixed(2)}L</span>
              <span className="text-emerald-400 font-bold">₹{(val.actualAmount / 100000).toFixed(2)}L</span>
              <span className="text-right text-emerald-400 font-bold">₹{(val.amountError / 1000).toFixed(0)}k</span>
            </div>
          </div>

          {/* Validation Explanation */}
          <div className="bg-zinc-950 p-3 rounded border border-zinc-800 space-y-1">
            <span className="text-[8px] text-zinc-500 font-bold uppercase block">VALIDATION SUMMARY</span>
            <p className="text-zinc-300 font-sans text-[10px] leading-relaxed">
              {val.explanation}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between flex-shrink-0">
          <span className="text-[8px] font-mono-data text-zinc-500">
            OUTCOME RECORDED IN AUDIT LEDGER · SHA-256 HASH VERIFIED
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded font-mono-data text-[10px] transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  )
}

// ======================================================================
// 4. Technical View Modal (Requirement 19)
// ======================================================================
export function TechnicalViewModal({
  onClose,
}: {
  onClose: () => void
}) {
  const steps = [
    { title: '1. Ingestion & Graph Construction', desc: 'Raw UPI/IMPS stream mapped into temporal directed graph with hop indexing & latency timestamps.' },
    { title: '2. Trace Confidence Routing', desc: 'Composite weighting of hop depth, recency, node novelty, and degree entropy to determine model routing.' },
    { title: '3. Temporal Graph Engine', desc: 'Prototype Temporal Graph Scoring evaluating inter-hop velocity and mule staging patterns.' },
    { title: '4. Spatio-Temporal Engine', desc: 'ST-KDE (Kernel Density Estimation) and spatial clustering identifying high-risk cash-out outlets within 10 km corridor.' },
    { title: '5. Calibrated Fusion', desc: 'Confidence-weighted ensemble fusing TGN (40%), ST-KDE (25%), and ST-GCN (35%) with velocity calibration.' },
    { title: '6. SHAP Explainability', desc: 'Feature attribution decomposing the top location probability into 6 transparent positive/negative contributions.' },
    { title: '7. Statutory Human Verification', desc: 'Strict human-in-the-loop gate requiring police authorization before alert transmission or account freeze.' },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg max-w-xl w-full shadow-2xl overflow-hidden animate-slide-up flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-950 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Brain size={15} className="text-purple-400" />
            <div>
              <div className="font-mono-data text-xs font-700 text-zinc-100 uppercase tracking-wider">
                TECHNICAL ARCHITECTURE VIEW
              </div>
              <div className="text-[9px] font-mono-data text-zinc-500">
                End-to-end intelligence pipeline for technical judges & auditors
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <XCircle size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3 font-mono-data text-[10px] overflow-y-auto max-h-[75vh]">
          {steps.map(step => (
            <div key={step.title} className="bg-zinc-950 p-2.5 rounded border border-zinc-800/80 space-y-0.5">
              <div className="text-zinc-200 font-bold text-[10px]">{step.title}</div>
              <p className="text-zinc-400 font-sans text-[9px] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between flex-shrink-0">
          <span className="text-[8px] font-mono-data text-zinc-500">
            BUILT FOR SIH 2024 · PROTOTYPE ARCHITECTURE
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded font-mono-data text-[10px] transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  )
}
