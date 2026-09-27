/**
 * SENTINEL-I4C Frontend API Client
 * Seamlessly interfaces with the FastAPI backend running on :8000,
 * with resilient fallback to local data when operating in standalone preview mode.
 */

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api'
const WS_BASE = (import.meta as any).env?.VITE_WS_URL || 'ws://localhost:8000/ws'

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET', signal: AbortSignal.timeout(2000) })
    return res.ok
  } catch {
    return false
  }
}

export async function apiGetCases(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/cases`)
  if (!res.ok) throw new Error('Failed to fetch cases')
  return res.json()
}

export async function apiGetCase(caseId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/cases/${caseId}`)
  if (!res.ok) throw new Error(`Failed to fetch case ${caseId}`)
  return res.json()
}

export async function apiCreateCase(data: {
  fraud_type: string
  reported_amount: number
  state: string
  district: string
  notes?: string
}): Promise<any> {
  const res = await fetch(`${API_BASE}/cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create case')
  return res.json()
}

export async function apiGetAlerts(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/alerts`)
  if (!res.ok) throw new Error('Failed to fetch alerts')
  return res.json()
}

export async function apiUpdateAlertAction(
  alertId: string,
  action: 'ACKNOWLEDGE' | 'ESCALATE' | 'OVERRIDE' | 'RESOLVE',
  officerNote?: string
): Promise<any> {
  const res = await fetch(`${API_BASE}/alerts/${alertId}/action`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, officer_note: officerNote }),
  })
  if (!res.ok) throw new Error('Failed to update alert action')
  return res.json()
}

export async function apiRecordOutcome(data: {
  case_id: string
  result: 'HIT' | 'MISS' | 'PARTIAL'
  actual_location: string
  actual_amount: number
  cash_recovered: number
  officer_comments: string
}): Promise<any> {
  const res = await fetch(`${API_BASE}/outcomes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to record outcome')
  return res.json()
}

export async function apiGetAnalytics(): Promise<any> {
  const res = await fetch(`${API_BASE}/analytics`)
  if (!res.ok) throw new Error('Failed to fetch analytics')
  return res.json()
}

export async function apiGetAuditLogs(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/audit`)
  if (!res.ok) throw new Error('Failed to fetch audit logs')
  return res.json()
}

export async function apiVerifyAuditChain(): Promise<{
  is_valid: boolean
  total_entries: number
  verification_message: string
}> {
  const res = await fetch(`${API_BASE}/audit/verify`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to verify audit chain')
  return res.json()
}

export async function apiGetEvidencePassport(caseId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/evidence/${caseId}`)
  if (!res.ok) throw new Error('Failed to fetch evidence passport')
  return res.json()
}

export function connectCaseWebSocket(
  caseId: string,
  onMessage: (event: any) => void,
  onError?: (err: any) => void
): WebSocket | null {
  try {
    const ws = new WebSocket(`${WS_BASE}/cases/${caseId}`)
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        onMessage(data)
      } catch (err) {
        console.error('WebSocket parse error', err)
      }
    }
    if (onError) ws.onerror = onError
    return ws
  } catch {
    return null
  }
}
