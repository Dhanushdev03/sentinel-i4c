import {
  LayoutDashboard,
  FolderOpen,
  Network,
  Brain,
  Bell,
  Zap,
  Shield,
  MessageSquare,
  BarChart2,
  ScrollText,
  Settings,
  ChevronRight,
  AlertTriangle,
  MapPin,
  Cpu,
  Info,
} from 'lucide-react'
import { CASES } from '../data/mockData'

export type Page =
  | 'dashboard'
  | 'case'
  | 'cases'
  | 'map'
  | 'graph'
  | 'predictions'
  | 'alerts'
  | 'intervention'
  | 'evidence'
  | 'feedback'
  | 'analytics'
  | 'audit'
  | 'admin'
  | 'landing'

interface SidebarProps {
  page: Page
  navigate: (p: Page, id?: string) => void
}

const NAV_ITEMS: {
  id: Page
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  badge?: string
}[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'case', label: 'Case Intelligence', icon: Cpu, badge: 'demo' },
  { id: 'cases', label: 'All Cases', icon: FolderOpen, badge: 'cases' },
  { id: 'map', label: 'Threat Map', icon: MapPin },
  { id: 'graph', label: 'Transaction Graph', icon: Network },
  { id: 'predictions', label: 'Predictions', icon: Brain },
  { id: 'alerts', label: 'Live Alerts', icon: Bell, badge: 'alerts' },
  { id: 'intervention', label: 'Intervention', icon: Zap },
  { id: 'evidence', label: 'Evidence Passport', icon: Shield },
  { id: 'feedback', label: 'Feedback Loop', icon: MessageSquare },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'audit', label: 'Audit Log', icon: ScrollText },
  { id: 'admin', label: 'Admin Console', icon: Settings },
  { id: 'landing', label: 'Platform Overview', icon: Info },
]

export default function Sidebar({ page, navigate }: SidebarProps) {
  const activeCases = CASES.filter(c => c.status === 'ACTIVE').length
  const pendingAlerts = CASES.filter(c => c.alert?.status === 'PENDING').length
  const criticalCount = CASES.filter(c => c.severity === 'CRITICAL' && c.status === 'ACTIVE').length

  function getBadge(item: (typeof NAV_ITEMS)[0]) {
    if (item.badge === 'cases') return activeCases
    if (item.badge === 'alerts') return pendingAlerts
    if (item.badge === 'demo') return 'SNTL'
    return null
  }

  return (
    <aside className="w-52 flex-shrink-0 flex flex-col border-r border-zinc-800/70 bg-zinc-950/60 backdrop-blur select-none">
      <div className="px-4 py-4 border-b border-zinc-800/70">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center flex-shrink-0">
            <Shield size={13} className="text-zinc-950" />
          </div>
          <span className="font-rajdhani font-700 text-sm tracking-widest text-zinc-100 uppercase">
            SENTINEL-I4C
          </span>
        </div>
        <p className="text-zinc-500 text-[9px] font-mono-data tracking-wider pl-8">
          CYBER FRAUD INTEL PLATFORM
        </p>
      </div>

      {criticalCount > 0 && (
        <div className="mx-3 mt-3 px-2.5 py-2 bg-red-950/40 border border-red-800/50 rounded flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse-critical flex-shrink-0" />
          <span className="text-red-400 text-[10px] font-mono-data">
            {criticalCount} CRITICAL ACTIVE
          </span>
        </div>
      )}

      <nav className="flex-1 py-3 overflow-y-auto space-y-0.5">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const badge = getBadge(item)
          const isActive = page === item.id

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`w-full flex items-center gap-2.5 px-4 py-2 text-left transition-all group relative ${
                isActive
                  ? 'text-zinc-100 bg-zinc-800/80 shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 font-normal'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white rounded-r" />
              )}
              <Icon
                size={13}
                className={isActive ? 'text-zinc-100' : 'text-zinc-500 group-hover:text-zinc-300'}
              />
              <span className="text-xs flex-1 tracking-wide truncate">
                {item.label}
              </span>
              {badge !== null && (
                <span
                  className={`text-[8px] font-mono-data px-1.5 py-0.5 rounded-sm font-bold ${
                    item.badge === 'demo'
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                      : item.id === 'alerts'
                      ? 'bg-red-900/60 text-red-400 border border-red-800/60'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {badge}
                </span>
              )}
              {isActive && <ChevronRight size={10} className="text-zinc-400 ml-1 flex-shrink-0" />}
            </button>
          )
        })}
      </nav>

      <div className="px-4 py-3 border-t border-zinc-800/70">
        <div className="text-[9px] font-mono-data text-zinc-600 space-y-1">
          <div className="flex justify-between">
            <span>SIMULATION MODE</span>
            <span className="text-amber-500 font-bold">ACTIVE</span>
          </div>
          <div className="flex justify-between">
            <span>DATA</span>
            <span className="text-zinc-400">SYNTHETIC</span>
          </div>
          <div className="flex justify-between">
            <span>MODEL</span>
            <span className="text-zinc-400">v0.4.2-PROTO</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
