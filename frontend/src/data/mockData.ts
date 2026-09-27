export type FraudType =
  | 'UPI Fraud'
  | 'Phishing'
  | 'Investment Scam'
  | 'Job Scam'
  | 'Loan Scam'
  | 'Social Engineering'
  | 'Other'

export type CaseSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
export type CaseStatus = 'ACTIVE' | 'RESOLVED' | 'CLOSED' | 'PENDING'
export type TraceConfidence = 'HIGH' | 'MEDIUM' | 'LOW'
export type AlertLevel = 'RED' | 'AMBER' | 'GREEN'
export type AlertStatus = 'PENDING' | 'ACKNOWLEDGED' | 'ESCALATED' | 'RESOLVED' | 'OVERRIDDEN'

export interface LocationPrediction {
  rank: number
  name: string
  address: string
  type: 'ATM' | 'CSP' | 'Branch'
  bank: string
  probability: number
  confidence: number
  lat: number
  lng: number
  expectedRecovery: number
  tgnScore: number
  geoScore: number
  fusionScore: number
  district: string
  state: string
  distanceKm: number
  etaMin: number
}

export interface ShapFactor {
  feature: string
  impact: number
  value: string
  description: string
  direction: 'positive' | 'negative'
}

export interface Prediction {
  id: string
  caseId: string
  timestamp: string
  locations: LocationPrediction[]
  timeWindowMin: number
  timeWindowMax: number
  amountMin: number
  amountMax: number
  shapFactors: ShapFactor[]
  counterfactual: string
  counterfactualEffect: string
  expectedRecovery: number
  traceConfidence: TraceConfidence
  tgnWeight: number
  geoWeight: number
  modelVersion: string
  inputHash: string
}

export interface Transaction {
  id: string
  caseId: string
  timestamp: string
  fromAccount: string
  toAccount: string
  amount: number
  channel: 'UPI' | 'IMPS' | 'NEFT' | 'ATM' | 'CSP' | 'RTGS'
  riskScore: number
  hop: number
  isNoise: boolean
  state: string
  district: string
  fromBank: string
  toBank: string
  deviceId?: string
}

export interface GraphNode {
  id: string
  label: string
  type: 'VICTIM' | 'MULE' | 'TERMINAL' | 'ATM' | 'CSP' | 'BRANCH'
  amount: number
  riskScore: number
  txCount: number
  firstSeen: string
  lastSeen: string
  bank: string
  state: string
}

export interface Alert {
  id: string
  caseId: string
  level: AlertLevel
  location: string
  locationAddress: string
  timeWindow: string
  amount: number
  probability: number
  confidence: number
  reason: string
  recommendedAction: string
  status: AlertStatus
  timestamp: string
  officerId?: string
  officerAction?: string
  officerNote?: string
  responseTimeMin?: number
  caseNumber: string
  fraudType: FraudType
}

export interface CaseOutcome {
  result: 'HIT' | 'MISS' | 'PARTIAL'
  actualLocation: string
  actualTime: string
  actualAmount: number
  cashRecovered: number
  officerComments: string
  recordedBy: string
  recordedAt: string
}

export interface FraudCase {
  id: string
  caseNumber: string
  fraudType: FraudType
  reportedAmount: number
  complaintTime: string
  state: string
  district: string
  status: CaseStatus
  severity: CaseSeverity
  victimAccountToken: string
  initialTxId: string
  officerName: string
  officerBadge: string
  hops: number
  traceConfidence: TraceConfidence
  tgnWeight: number
  geoWeight: number
  transactions: Transaction[]
  graphNodes: GraphNode[]
  prediction?: Prediction
  alert?: Alert
  outcome?: CaseOutcome
  tags: string[]
  bankIds: string[]
  notes: string
}

export interface AuditEntry {
  id: string
  eventType:
    | 'LOGIN'
    | 'CASE_CREATED'
    | 'TRANSACTION_RECEIVED'
    | 'MODEL_EXECUTED'
    | 'PREDICTION_CREATED'
    | 'ALERT_SENT'
    | 'ALERT_ACKNOWLEDGED'
    | 'INTERVENTION'
    | 'OUTCOME'
    | 'EXPORT'
    | 'ACCESS'
  userId: string
  caseId?: string
  action: string
  timestamp: string
  details: string
  hash: string
  previousHash: string
  ipAddress: string
}

export interface AnalyticsMetric {
  date: string
  top1Accuracy: number
  top3Accuracy: number
  hitRate: number
  falsePositiveRate: number
  medianSpatialErrorKm: number
  medianTimeErrorMin: number
  brierScore: number
  casesEvaluated: number
}

export interface CashWithdrawalPoint {
  id: string
  name: string
  type: 'ATM' | 'CSP' | 'Branch'
  bank: string
  address: string
  district: string
  state: string
  lat: number
  lng: number
  recentFraudActivity: number
  riskScore: number
}

function makeHash(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(64, '0').slice(0, 64)
}

function makeToken(prefix: string, id: number): string {
  return `${prefix}-${Math.floor(1000 + id * 137).toString().padStart(4, '0')}-${(id * 7919 % 9999).toString().padStart(4, '0')}`
}

function genTxId(n: number): string {
  return `TXN${Date.now().toString(36).toUpperCase()}${n.toString().padStart(4, '0')}`
}

const BANKS = ['SBI', 'HDFC', 'ICICI', 'PNB', 'BOB', 'Kotak', 'Axis', 'Union', 'Canara', 'IOB']

function makePrediction(caseId: string, idx: number, amount: number, conf: TraceConfidence, state: string): Prediction {
  const tgnW = conf === 'HIGH' ? 0.68 : conf === 'MEDIUM' ? 0.5 : 0.28
  const geoW = 1 - tgnW
  const locs: LocationPrediction[] = [
    {
      rank: 1,
      name: `${BANKS[idx % BANKS.length]} ATM - ${['Andheri', 'Koramangala', 'Connaught Place', 'T Nagar', 'Gomti Nagar', 'Vastrapur', 'New Town', 'Hitech City', 'Civil Lines', 'Model Town'][idx % 10]}`,
      address: `${['Plot 14, SV Road', '112, 80ft Road', 'Block A, Outer Ring Rd', '24, Anna Salai', 'Hazratganj Crossing', 'CG Road', 'AA Block, Sector III', 'Madhapur Jn', '4 Civil Lines', '22 MG Road'][idx % 10]}`,
      type: 'ATM',
      bank: BANKS[idx % BANKS.length],
      probability: 0.68 + (idx % 5) * 0.02,
      confidence: 0.81,
      lat: 18.9 + (idx % 10) * 1.8,
      lng: 72.8 + (idx % 10) * 1.6,
      expectedRecovery: amount * 0.72,
      tgnScore: 0.74,
      geoScore: 0.61,
      fusionScore: 0.68,
      district: ['Andheri W', 'Bangalore Urban', 'New Delhi', 'Chennai', 'Lucknow', 'Ahmedabad', 'North 24 Parganas', 'Hyderabad', 'Jaipur', 'Chandigarh'][idx % 10],
      state,
      distanceKm: 5.8 + (idx % 5),
      etaMin: 16 + (idx % 8),
    },
    {
      rank: 2,
      name: `${BANKS[(idx + 2) % BANKS.length]} CSP - ${['Malad', 'Whitefield', 'Rohini', 'Tambaram', 'Hazratganj', 'Satellite', 'Dum Dum', 'Secunderabad', 'Mansarovar', 'Panchkula'][idx % 10]}`,
      address: `CSP Outlet, ${['Shop 3, Link Road', '45 EPIP Zone', 'Sector 22 Market', 'Grand Trunk Rd', 'Vibhuti Khand', 'Satellite Rd', 'BT Road', 'SP Road', 'New Sanganer Rd', 'Sec 5 Chowk'][idx % 10]}`,
      type: 'CSP',
      bank: BANKS[(idx + 2) % BANKS.length],
      probability: 0.19 + (idx % 3) * 0.02,
      confidence: 0.64,
      lat: 19.1 + (idx % 10) * 1.7,
      lng: 73.1 + (idx % 10) * 1.4,
      expectedRecovery: amount * 0.41,
      tgnScore: 0.52,
      geoScore: 0.44,
      fusionScore: 0.48,
      district: ['Malad W', 'Bangalore Urban', 'North West Delhi', 'Kancheepuram', 'Lucknow', 'Ahmedabad', 'South 24 Parganas', 'Secunderabad', 'Jaipur', 'Panchkula'][idx % 10],
      state,
      distanceKm: 9.2 + (idx % 4),
      etaMin: 24 + (idx % 6),
    },
    {
      rank: 3,
      name: `${BANKS[(idx + 4) % BANKS.length]} Branch - ${['Borivali', 'Electronic City', 'Karol Bagh', 'Velachery', 'Alambagh', 'Navrangpura', 'Behala', 'KPHB', 'Vaishali Nagar', 'Sector 17'][idx % 10]}`,
      address: `${['123 LT Road', 'EC Phase I', '45 Ajmal Khan Rd', '32 200ft Road', 'Alambagh Crossing', '23 CG Road', '12 Diamond Park', 'KPHB Colony', 'Vaishali Nagar', 'Sector 17-C'][idx % 10]}`,
      type: 'Branch',
      bank: BANKS[(idx + 4) % BANKS.length],
      probability: 0.08 + (idx % 3) * 0.01,
      confidence: 0.52,
      lat: 19.3 + (idx % 10) * 1.5,
      lng: 73.4 + (idx % 10) * 1.2,
      expectedRecovery: amount * 0.22,
      tgnScore: 0.38,
      geoScore: 0.31,
      fusionScore: 0.34,
      district: ['Borivali', 'Bangalore Urban', 'Central Delhi', 'Chennai', 'Lucknow', 'Ahmedabad', 'Kolkata', 'Hyderabad', 'Jaipur', 'Chandigarh'][idx % 10],
      state,
      distanceKm: 13.5 + (idx % 5),
      etaMin: 31 + (idx % 7),
    },
  ]

  const shapFactors: ShapFactor[] = [
    { feature: 'Recent mule transfer (T-12min)', impact: 0.31, value: `₹${(amount * 0.94 / 100000).toFixed(1)}L`, description: 'Large transfer to known mule pattern', direction: 'positive' },
    { feature: 'Transaction velocity', impact: 0.24, value: '4 hops / 38min', description: 'High velocity matching cash-out pattern', direction: 'positive' },
    { feature: 'Historical cash-out pattern', impact: 0.19, value: 'Match: 0.83', description: 'Similar chain resolved at ATM (n=14)', direction: 'positive' },
    { feature: 'Geographic proximity', impact: 0.15, value: '5.8 km cluster', description: 'ATM within historical fraud zone', direction: 'positive' },
    { feature: 'Time-of-day pattern', impact: 0.11, value: '14:00–17:00', description: 'Peak cash-out window for fraud type', direction: 'positive' },
    { feature: 'Account age', impact: -0.08, value: '< 30 days', description: 'New account reduces trace certainty', direction: 'negative' },
  ]

  return {
    id: `PRED-${caseId.slice(-6)}-${idx.toString().padStart(3, '0')}`,
    caseId,
    timestamp: new Date(Date.now() - 1800000 + idx * 300000).toISOString(),
    locations: locs,
    timeWindowMin: 15 + (idx % 6) * 2,
    timeWindowMax: 28 + (idx % 6) * 2,
    amountMin: amount * 0.78,
    amountMax: amount * 0.95,
    shapFactors,
    counterfactual: `If the last transfer amount decreases by 20%, predicted ATM probability changes from ${(locs[0].probability * 100).toFixed(1)}% to ${((locs[0].probability - 0.14) * 100).toFixed(1)}%`,
    counterfactualEffect: `Reduction in transaction velocity would shift primary prediction from ATM to CSP outlet (rank swap 1↔2)`,
    expectedRecovery: amount * 0.62,
    traceConfidence: conf,
    tgnWeight: tgnW,
    geoWeight: geoW,
    modelVersion: 'SENTINEL-TGN-v0.4.2-PROTOTYPE',
    inputHash: makeHash(`pred-${caseId}-${idx}`),
  }
}

function makeTxChain(caseId: string, amount: number, hops: number, fraudType: FraudType, baseTime: Date): Transaction[] {
  const txs: Transaction[] = []
  let currentAmount = amount
  const baseMs = baseTime.getTime()

  for (let h = 0; h <= hops; h++) {
    const from = h === 0 ? makeToken('VICT', parseInt(caseId.slice(-3))) : makeToken('MUL', h * 100 + parseInt(caseId.slice(-2)))
    const to = h === hops ? makeToken('TERM', h * 50 + parseInt(caseId.slice(-2))) : makeToken('MUL', (h + 1) * 100 + parseInt(caseId.slice(-2)))
    const channel: Transaction['channel'] = h === 0 ? 'UPI' : h === hops ? 'ATM' : ['IMPS', 'UPI', 'NEFT'][h % 3] as Transaction['channel']
    const hopAmount = h === 0 ? amount : currentAmount * (0.92 + Math.random() * 0.05)
    currentAmount = hopAmount

    txs.push({
      id: genTxId(h + parseInt(caseId.slice(-2)) * 10),
      caseId,
      timestamp: new Date(baseMs + h * (8 + (h % 3)) * 60000).toISOString(),
      fromAccount: from,
      toAccount: to,
      amount: Math.round(hopAmount),
      channel,
      riskScore: 0.3 + h * 0.15 + (Math.random() * 0.1),
      hop: h,
      isNoise: false,
      state: ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'UP', 'Gujarat', 'West Bengal', 'Telangana', 'Rajasthan', 'Punjab'][parseInt(caseId.slice(-1))],
      district: ['Mumbai', 'New Delhi', 'Bangalore', 'Chennai', 'Lucknow', 'Ahmedabad', 'Kolkata', 'Hyderabad', 'Jaipur', 'Chandigarh'][parseInt(caseId.slice(-1))],
      fromBank: BANKS[(h * 2) % BANKS.length],
      toBank: BANKS[(h * 3 + 1) % BANKS.length],
      deviceId: `DEV-${(h * 9871 + parseInt(caseId.slice(-3))).toString(16).slice(0, 8).toUpperCase()}`,
    })
  }

  for (let n = 0; n < 3; n++) {
    txs.push({
      id: genTxId(100 + n + parseInt(caseId.slice(-2)) * 10),
      caseId,
      timestamp: new Date(baseMs + (n + 1) * 25 * 60000).toISOString(),
      fromAccount: makeToken('NORM', n * 100 + parseInt(caseId.slice(-2))),
      toAccount: makeToken('NORM', (n + 1) * 100 + parseInt(caseId.slice(-2))),
      amount: Math.round(5000 + Math.random() * 45000),
      channel: 'UPI',
      riskScore: 0.05 + Math.random() * 0.15,
      hop: -1,
      isNoise: true,
      state: 'Maharashtra',
      district: 'Mumbai',
      fromBank: BANKS[n % BANKS.length],
      toBank: BANKS[(n + 1) % BANKS.length],
    })
  }

  return txs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}

function makeGraphNodes(txs: Transaction[]): GraphNode[] {
  const nodes: GraphNode[] = []
  const seen = new Set<string>()

  txs.filter(t => !t.isNoise).forEach(tx => {
    if (!seen.has(tx.fromAccount)) {
      seen.add(tx.fromAccount)
      const isVictim = tx.fromAccount.startsWith('VICT')
      const isTerm = tx.toAccount.startsWith('TERM') && tx.hop > 0
      nodes.push({
        id: tx.fromAccount,
        label: tx.fromAccount,
        type: isVictim ? 'VICTIM' : 'MULE',
        amount: tx.amount,
        riskScore: tx.riskScore,
        txCount: 1,
        firstSeen: tx.timestamp,
        lastSeen: tx.timestamp,
        bank: tx.fromBank,
        state: tx.state,
      })
    }
    if (!seen.has(tx.toAccount)) {
      seen.add(tx.toAccount)
      const isTerm = tx.toAccount.startsWith('TERM')
      nodes.push({
        id: tx.toAccount,
        label: tx.toAccount,
        type: isTerm ? 'TERMINAL' : tx.channel === 'ATM' ? 'ATM' : 'MULE',
        amount: tx.amount,
        riskScore: tx.riskScore,
        txCount: 1,
        firstSeen: tx.timestamp,
        lastSeen: tx.timestamp,
        bank: tx.toBank,
        state: tx.state,
      })
    }
  })

  return nodes
}

const RAW_CASES: Array<{
  fraudType: FraudType
  amount: number
  state: string
  district: string
  severity: CaseSeverity
  status: CaseStatus
  hops: number
  conf: TraceConfidence
  officer: string
  badge: string
  notes: string
}> = [
  { fraudType: 'UPI Fraud', amount: 450000, state: 'Maharashtra', district: 'Mumbai', severity: 'CRITICAL', status: 'ACTIVE', hops: 4, conf: 'HIGH', officer: 'Insp. R. Sharma', badge: 'MH-CYB-0312', notes: 'Victim reported unauthorized UPI debits. Suspect posed as KYC agent.' },
  { fraudType: 'Investment Scam', amount: 1200000, state: 'Delhi', district: 'New Delhi', severity: 'CRITICAL', status: 'ACTIVE', hops: 5, conf: 'MEDIUM', officer: 'SI Kavita Nair', badge: 'DL-CYB-0147', notes: 'Fake trading app promised 40% returns. 12 victims identified.' },
  { fraudType: 'Phishing', amount: 230000, state: 'Karnataka', district: 'Bangalore Urban', severity: 'HIGH', status: 'RESOLVED', hops: 3, conf: 'HIGH', officer: 'Insp. A. Rao', badge: 'KA-CYB-0089', notes: 'Bank SMS phishing. Funds traced to ATM withdrawal.' },
  { fraudType: 'Job Scam', amount: 180000, state: 'Tamil Nadu', district: 'Chennai', severity: 'HIGH', status: 'ACTIVE', hops: 2, conf: 'LOW', officer: 'SI P. Kumar', badge: 'TN-CYB-0231', notes: 'Fake job offer required registration fee. Multiple victims.' },
  { fraudType: 'Loan Scam', amount: 320000, state: 'Uttar Pradesh', district: 'Lucknow', severity: 'HIGH', status: 'ACTIVE', hops: 3, conf: 'MEDIUM', officer: 'Insp. S. Verma', badge: 'UP-CYB-0178', notes: 'Pre-approved loan scam. Processing fee collected via UPI.' },
  { fraudType: 'UPI Fraud', amount: 78000, state: 'Rajasthan', district: 'Jaipur', severity: 'LOW', status: 'CLOSED', hops: 2, conf: 'HIGH', officer: 'HC Deepa Singh', badge: 'RJ-CYB-0044', notes: 'Small UPI fraud. Amount recovered via reversal.' },
  { fraudType: 'Investment Scam', amount: 850000, state: 'Gujarat', district: 'Ahmedabad', severity: 'HIGH', status: 'ACTIVE', hops: 4, conf: 'MEDIUM', officer: 'Insp. M. Patel', badge: 'GJ-CYB-0201', notes: 'Crypto investment fraud. Funds dispersed across 4 mule accounts.' },
  { fraudType: 'Social Engineering', amount: 210000, state: 'West Bengal', district: 'Kolkata', severity: 'MEDIUM', status: 'ACTIVE', hops: 3, conf: 'LOW', officer: 'SI B. Roy', badge: 'WB-CYB-0112', notes: 'Caller posed as bank executive. OTP obtained via social engineering.' },
  { fraudType: 'UPI Fraud', amount: 150000, state: 'Telangana', district: 'Hyderabad', severity: 'HIGH', status: 'ACTIVE', hops: 3, conf: 'HIGH', officer: 'Insp. V. Reddy', badge: 'TS-CYB-0166', notes: 'Fraudulent QR code placed over legitimate merchant QR.' },
  { fraudType: 'Phishing', amount: 380000, state: 'Punjab', district: 'Chandigarh', severity: 'HIGH', status: 'RESOLVED', hops: 3, conf: 'HIGH', officer: 'SI H. Kaur', badge: 'PB-CYB-0098', notes: 'Email phishing targeting e-commerce users. ATM withdrawal identified.' },
  { fraudType: 'Job Scam', amount: 95000, state: 'Bihar', district: 'Patna', severity: 'LOW', status: 'ACTIVE', hops: 2, conf: 'LOW', officer: 'HC N. Singh', badge: 'BR-CYB-0057', notes: 'Government job scam. Candidate paid fee for fake appointment letter.' },
  { fraudType: 'UPI Fraud', amount: 270000, state: 'Kerala', district: 'Thiruvananthapuram', severity: 'MEDIUM', status: 'ACTIVE', hops: 3, conf: 'MEDIUM', officer: 'SI T. Menon', badge: 'KL-CYB-0134', notes: 'Duplicate merchant UPI ID used to collect payments.' },
  { fraudType: 'Investment Scam', amount: 1500000, state: 'Madhya Pradesh', district: 'Bhopal', severity: 'CRITICAL', status: 'ACTIVE', hops: 5, conf: 'MEDIUM', officer: 'Insp. A. Mishra', badge: 'MP-CYB-0245', notes: 'Multi-level investment scheme. 28 victims. Funds laundered across 5 accounts.' },
  { fraudType: 'Loan Scam', amount: 410000, state: 'Haryana', district: 'Gurugram', severity: 'HIGH', status: 'ACTIVE', hops: 4, conf: 'HIGH', officer: 'SI P. Yadav', badge: 'HR-CYB-0189', notes: 'Instant loan app with unauthorized access to contacts.' },
  { fraudType: 'Social Engineering', amount: 120000, state: 'Odisha', district: 'Bhubaneswar', severity: 'MEDIUM', status: 'CLOSED', hops: 2, conf: 'MEDIUM', officer: 'HC S. Mishra', badge: 'OD-CYB-0072', notes: 'Vishing attack targeting elderly victim. Case closed—amount recovered.' },
  { fraudType: 'UPI Fraud', amount: 88000, state: 'Jharkhand', district: 'Ranchi', severity: 'LOW', status: 'RESOLVED', hops: 2, conf: 'HIGH', officer: 'SI R. Minz', badge: 'JH-CYB-0041', notes: 'UPI refund scam. Victim asked to scan collect request.' },
  { fraudType: 'Phishing', amount: 160000, state: 'Assam', district: 'Guwahati', severity: 'MEDIUM', status: 'ACTIVE', hops: 3, conf: 'LOW', officer: 'Insp. B. Kalita', badge: 'AS-CYB-0093', notes: 'Fake income tax refund portal phishing campaign.' },
  { fraudType: 'Investment Scam', amount: 550000, state: 'Himachal Pradesh', district: 'Shimla', severity: 'HIGH', status: 'ACTIVE', hops: 4, conf: 'MEDIUM', officer: 'SI G. Thakur', badge: 'HP-CYB-0065', notes: 'Fake mutual fund portal. Funds transferred via IMPS.' },
  { fraudType: 'Job Scam', amount: 110000, state: 'Chhattisgarh', district: 'Raipur', severity: 'LOW', status: 'ACTIVE', hops: 2, conf: 'LOW', officer: 'HC D. Sahu', badge: 'CG-CYB-0038', notes: 'Overseas job scam. Visa processing fee collected.' },
  { fraudType: 'UPI Fraud', amount: 330000, state: 'Goa', district: 'Panaji', severity: 'HIGH', status: 'ACTIVE', hops: 3, conf: 'HIGH', officer: 'Insp. F. Sequeira', badge: 'GA-CYB-0029', notes: 'Tourism service fraud. Advance payment via UPI not refunded.' },
]

const BASE_TIME = new Date('2024-03-15T09:00:00+05:30')

export const CASES: FraudCase[] = RAW_CASES.map((raw, idx) => {
  const id = `CASE-${(idx + 1).toString().padStart(4, '0')}`
  const caseNumber = `CYB-2024-${raw.state.slice(0, 2).toUpperCase()}-${(142 + idx).toString().padStart(5, '0')}`
  const complaintTime = new Date(BASE_TIME.getTime() - (20 - idx) * 3600000 * 6).toISOString()
  const txs = makeTxChain(id, raw.amount, raw.hops, raw.fraudType, new Date(complaintTime))
  const nodes = makeGraphNodes(txs)
  const pred = raw.status !== 'CLOSED' ? makePrediction(id, idx, raw.amount, raw.conf, raw.state) : undefined
  const bankIds = Array.from(new Set(txs.map(t => t.fromBank).concat(txs.map(t => t.toBank)))).slice(0, 3)

  const alert: Alert | undefined = pred && raw.severity !== 'LOW' ? {
    id: `ALRT-${id.slice(-4)}-${idx.toString().padStart(3, '0')}`,
    caseId: id,
    level: raw.severity === 'CRITICAL' ? 'RED' : raw.severity === 'HIGH' ? 'AMBER' : 'GREEN',
    location: pred.locations[0].name,
    locationAddress: pred.locations[0].address,
    timeWindow: `${pred.timeWindowMin}–${pred.timeWindowMax} min`,
    amount: raw.amount,
    probability: pred.locations[0].probability,
    confidence: pred.locations[0].confidence,
    reason: `${raw.hops}-hop chain traced with ${raw.conf.toLowerCase()} confidence. Pattern matches historical ${raw.fraudType} cash-outs.`,
    recommendedAction: `Dispatch nearest patrol unit to ${pred.locations[0].name}. Alert ${pred.locations[0].bank} branch manager for account freeze authorization.`,
    status: raw.status === 'RESOLVED' ? 'RESOLVED' : idx < 5 ? 'PENDING' : idx < 10 ? 'ACKNOWLEDGED' : 'PENDING',
    timestamp: new Date(new Date(complaintTime).getTime() + raw.hops * 8 * 60000 + 120000).toISOString(),
    officerId: raw.badge,
    officerAction: raw.status === 'RESOLVED' ? 'CONFIRM' : undefined,
    caseNumber,
    fraudType: raw.fraudType,
  } : undefined

  const outcome: CaseOutcome | undefined = raw.status === 'RESOLVED' || raw.status === 'CLOSED' ? {
    result: idx % 3 === 0 ? 'HIT' : idx % 3 === 1 ? 'PARTIAL' : 'MISS',
    actualLocation: pred?.locations[0].name ?? 'Unknown',
    actualTime: new Date(new Date(complaintTime).getTime() + raw.hops * 10 * 60000).toISOString(),
    actualAmount: Math.round(raw.amount * 0.88),
    cashRecovered: idx % 3 === 0 ? Math.round(raw.amount * 0.76) : idx % 3 === 1 ? Math.round(raw.amount * 0.41) : 0,
    officerComments: idx % 3 === 0 ? 'ATM withdrawal intercepted. Suspect apprehended.' : idx % 3 === 1 ? 'Partial recovery. Suspect fled before full withdrawal.' : 'Withdrawal completed before patrol arrived.',
    recordedBy: raw.badge,
    recordedAt: new Date(new Date(complaintTime).getTime() + raw.hops * 12 * 60000 + 3600000).toISOString(),
  } : undefined

  return {
    id,
    caseNumber,
    fraudType: raw.fraudType,
    reportedAmount: raw.amount,
    complaintTime,
    state: raw.state,
    district: raw.district,
    status: raw.status,
    severity: raw.severity,
    victimAccountToken: makeToken('VICT', idx * 7 + 1),
    initialTxId: txs[0]?.id ?? '',
    officerName: raw.officer,
    officerBadge: raw.badge,
    hops: raw.hops,
    traceConfidence: raw.conf,
    tgnWeight: raw.conf === 'HIGH' ? 0.68 : raw.conf === 'MEDIUM' ? 0.5 : 0.28,
    geoWeight: raw.conf === 'HIGH' ? 0.32 : raw.conf === 'MEDIUM' ? 0.5 : 0.72,
    transactions: txs,
    graphNodes: nodes,
    prediction: pred,
    alert,
    outcome,
    tags: [raw.fraudType.toLowerCase().replace(/ /g, '-'), raw.state.toLowerCase().replace(/ /g, '-'), `conf-${raw.conf.toLowerCase()}`],
    bankIds,
    notes: raw.notes,
  }
})

export const CASH_WITHDRAWAL_POINTS: CashWithdrawalPoint[] = [
  { id: 'CWP-001', name: 'SBI ATM Andheri W', type: 'ATM', bank: 'SBI', address: 'Plot 14, SV Road, Andheri W', district: 'Mumbai', state: 'Maharashtra', lat: 19.116, lng: 72.834, recentFraudActivity: 4, riskScore: 0.82 },
  { id: 'CWP-002', name: 'PNB CSP Malad', type: 'CSP', bank: 'PNB', address: 'Shop 3, Link Road, Malad W', district: 'Mumbai', state: 'Maharashtra', lat: 19.186, lng: 72.848, recentFraudActivity: 2, riskScore: 0.61 },
  { id: 'CWP-003', name: 'HDFC ATM Koramangala', type: 'ATM', bank: 'HDFC', address: '112, 80ft Road, Koramangala', district: 'Bangalore Urban', state: 'Karnataka', lat: 12.934, lng: 77.626, recentFraudActivity: 3, riskScore: 0.74 },
  { id: 'CWP-004', name: 'ICICI ATM Connaught Pl', type: 'ATM', bank: 'ICICI', address: 'Block A, Outer Circle, CP', district: 'New Delhi', state: 'Delhi', lat: 28.632, lng: 77.219, recentFraudActivity: 5, riskScore: 0.88 },
  { id: 'CWP-005', name: 'Axis ATM T Nagar', type: 'ATM', bank: 'Axis', address: '24, Anna Salai, T Nagar', district: 'Chennai', state: 'Tamil Nadu', lat: 13.042, lng: 80.234, recentFraudActivity: 2, riskScore: 0.58 },
  { id: 'CWP-006', name: 'BOB ATM Gomti Nagar', type: 'ATM', bank: 'BOB', address: 'Vibhuti Khand, Gomti Nagar', district: 'Lucknow', state: 'Uttar Pradesh', lat: 26.857, lng: 81.012, recentFraudActivity: 3, riskScore: 0.67 },
  { id: 'CWP-007', name: 'Kotak ATM Vastrapur', type: 'ATM', bank: 'Kotak', address: 'CG Road, Vastrapur', district: 'Ahmedabad', state: 'Gujarat', lat: 23.038, lng: 72.531, recentFraudActivity: 1, riskScore: 0.44 },
  { id: 'CWP-008', name: 'Union CSP New Town', type: 'CSP', bank: 'Union', address: 'AA Block, Sector III, New Town', district: 'North 24 Parganas', state: 'West Bengal', lat: 22.578, lng: 88.472, recentFraudActivity: 2, riskScore: 0.55 },
  { id: 'CWP-009', name: 'SBI ATM Hitech City', type: 'ATM', bank: 'SBI', address: 'Madhapur Junction', district: 'Hyderabad', state: 'Telangana', lat: 17.448, lng: 78.376, recentFraudActivity: 4, riskScore: 0.79 },
  { id: 'CWP-010', name: 'PNB ATM Civil Lines', type: 'ATM', bank: 'PNB', address: '4 Civil Lines, Jaipur', district: 'Jaipur', state: 'Rajasthan', lat: 26.924, lng: 75.812, recentFraudActivity: 1, riskScore: 0.42 },
]

function buildAudit(): AuditEntry[] {
  const entries: AuditEntry[] = []
  const events = [
    { type: 'LOGIN' as const, userId: 'USR-0001', action: 'User login', details: 'Insp. R. Sharma authenticated via OTP' },
    { type: 'CASE_CREATED' as const, userId: 'USR-0001', caseId: 'CASE-0001', action: 'Case CYB-2024-MH-00142 created', details: 'New complaint logged. Fraud type: UPI Fraud. Amount: ₹4,50,000' },
    { type: 'TRANSACTION_RECEIVED' as const, userId: 'SYS', caseId: 'CASE-0001', action: 'Transaction stream initiated', details: '7 transactions ingested. 4 flagged as suspicious.' },
    { type: 'MODEL_EXECUTED' as const, userId: 'SYS', caseId: 'CASE-0001', action: 'TGN model executed', details: 'Trace confidence: HIGH. TGN weight: 0.68. Entropy: 0.12' },
    { type: 'PREDICTION_CREATED' as const, userId: 'SYS', caseId: 'CASE-0001', action: 'Prediction PRED-000142-000 generated', details: 'Top location: SBI ATM Andheri (72.3%). Time window: 18–25 min' },
    { type: 'ALERT_SENT' as const, userId: 'SYS', caseId: 'CASE-0001', action: 'RED alert dispatched', details: 'Police unit MH-CP-07 and SBI Branch Mgr notified via secure channel' },
    { type: 'LOGIN' as const, userId: 'USR-0002', action: 'User login', details: 'SI Kavita Nair authenticated via OTP' },
    { type: 'CASE_CREATED' as const, userId: 'USR-0002', caseId: 'CASE-0002', action: 'Case CYB-2024-DL-00143 created', details: 'New complaint logged. Fraud type: Investment Scam. Amount: ₹12,00,000' },
    { type: 'ALERT_ACKNOWLEDGED' as const, userId: 'USR-0001', caseId: 'CASE-0001', action: 'Alert ALRT-0001-000 acknowledged', details: 'Officer confirmed dispatch. ETA: 12 min' },
    { type: 'INTERVENTION' as const, userId: 'USR-0001', caseId: 'CASE-0001', action: 'Intervention recorded', details: 'Patrol unit dispatched to SBI ATM Andheri W' },
    { type: 'OUTCOME' as const, userId: 'USR-0001', caseId: 'CASE-0003', action: 'Outcome recorded: HIT', details: 'ATM withdrawal intercepted. ₹1,74,000 recovered. Suspect apprehended.' },
    { type: 'EXPORT' as const, userId: 'USR-0001', caseId: 'CASE-0001', action: 'Evidence Passport exported', details: 'PDF evidence report generated. SHA-256 hash logged.' },
    { type: 'ACCESS' as const, userId: 'USR-0003', action: 'Analytics dashboard accessed', details: 'Supervisor accessed simulation metrics report' },
    { type: 'MODEL_EXECUTED' as const, userId: 'SYS', caseId: 'CASE-0002', action: 'Geo-temporal fallback executed', details: 'Trace confidence: MEDIUM. ST-KDE and ST-GCN scores fused.' },
    { type: 'ALERT_SENT' as const, userId: 'SYS', caseId: 'CASE-0005', action: 'AMBER alert dispatched', details: 'Bank fraud analyst and UP police cyber cell notified.' },
  ]

  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000'
  const now = Date.now()

  events.forEach((ev, i) => {
    const ts = new Date(now - (events.length - i) * 18 * 60000).toISOString()
    const hash = makeHash(`${ev.type}|${ev.userId}|${ts}|${prevHash}`)
    entries.push({
      id: `AUD-${(i + 1).toString().padStart(6, '0')}`,
      eventType: ev.type,
      userId: ev.userId,
      caseId: ev.caseId,
      action: ev.action,
      timestamp: ts,
      details: ev.details,
      hash,
      previousHash: prevHash,
      ipAddress: `10.0.${Math.floor(i / 5)}.${(i % 254) + 1}`,
    })
    prevHash = hash
  })

  return entries
}

export const AUDIT_LOG: AuditEntry[] = buildAudit()

export const ANALYTICS: AnalyticsMetric[] = [
  { date: '2024-03-01', top1Accuracy: 0.48, top3Accuracy: 0.72, hitRate: 0.52, falsePositiveRate: 0.18, medianSpatialErrorKm: 4.2, medianTimeErrorMin: 8.4, brierScore: 0.22, casesEvaluated: 12 },
  { date: '2024-03-03', top1Accuracy: 0.51, top3Accuracy: 0.74, hitRate: 0.54, falsePositiveRate: 0.17, medianSpatialErrorKm: 3.9, medianTimeErrorMin: 7.8, brierScore: 0.21, casesEvaluated: 15 },
  { date: '2024-03-05', top1Accuracy: 0.53, top3Accuracy: 0.76, hitRate: 0.56, falsePositiveRate: 0.16, medianSpatialErrorKm: 3.7, medianTimeErrorMin: 7.1, brierScore: 0.20, casesEvaluated: 18 },
  { date: '2024-03-07', top1Accuracy: 0.55, top3Accuracy: 0.77, hitRate: 0.58, falsePositiveRate: 0.15, medianSpatialErrorKm: 3.5, medianTimeErrorMin: 6.8, brierScore: 0.19, casesEvaluated: 22 },
  { date: '2024-03-09', top1Accuracy: 0.54, top3Accuracy: 0.76, hitRate: 0.57, falsePositiveRate: 0.16, medianSpatialErrorKm: 3.6, medianTimeErrorMin: 7.0, brierScore: 0.20, casesEvaluated: 19 },
  { date: '2024-03-11', top1Accuracy: 0.57, top3Accuracy: 0.79, hitRate: 0.60, falsePositiveRate: 0.14, medianSpatialErrorKm: 3.2, medianTimeErrorMin: 6.2, brierScore: 0.18, casesEvaluated: 24 },
  { date: '2024-03-13', top1Accuracy: 0.59, top3Accuracy: 0.81, hitRate: 0.62, falsePositiveRate: 0.13, medianSpatialErrorKm: 3.0, medianTimeErrorMin: 5.9, brierScore: 0.17, casesEvaluated: 28 },
  { date: '2024-03-15', top1Accuracy: 0.61, top3Accuracy: 0.82, hitRate: 0.64, falsePositiveRate: 0.12, medianSpatialErrorKm: 2.8, medianTimeErrorMin: 5.6, brierScore: 0.16, casesEvaluated: 31 },
]

export const DEMO_CASE = CASES[0]

export const USERS = [
  { id: 'USR-0001', name: 'Insp. R. Sharma', role: 'LEA Officer', badge: 'MH-CYB-0312', clearanceLevel: 'L2' },
  { id: 'USR-0002', name: 'SI Kavita Nair', role: 'Bank Fraud Analyst', badge: 'DL-CYB-0147', clearanceLevel: 'L2' },
  { id: 'USR-0003', name: 'DCP Anand Mehta', role: 'Supervisor', badge: 'MH-SUP-0041', clearanceLevel: 'L3' },
  { id: 'USR-0004', name: 'Admin Console', role: 'System Administrator', badge: 'SYS-ADM-0001', clearanceLevel: 'L4' },
]
