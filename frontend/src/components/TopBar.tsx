import { useState, useEffect } from 'react'
import { Shield, Wifi, Bell, User, Clock, ChevronDown, Play, AlertTriangle } from 'lucide-react'
import { CASES } from '../data/mockData'

interface TopBarProps {
  userRole: string
  userName: string
  onRunDemo: () => void
  demoRunning: boolean
}

export default function TopBar({ userRole, userName, onRunDemo, demoRunning }: TopBarProps) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const activeCases = CASES.filter(c => c.status === 'ACTIVE').length
  const criticalAlerts = CASES.filter(c => c.alert?.status === 'PENDING' && c.severity === 'CRITICAL').length
  const pendingAlerts = CASES.filter(c => c.alert?.status === 'PENDING').length

  const timeStr = time.toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateStr = time.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <header className="h-11 flex-shrink-0 border-b border-zinc-800/70 bg-zinc-950/80 backdrop-blur flex items-center px-4 gap-4">
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
          <Shield size={11} className="text-zinc-950" />
        </div>
        <span className="font-rajdhani font-700 text-xs tracking-[0.2em] text-zinc-100 uppercase">
          SENTINEL-I4C
        </span>
        <span className="text-zinc-700 text-[10px] font-mono-data border border-zinc-800 px-1.5 py-0.5 rounded">
          SIMULATION
        </span>
      </div>

      <div className="flex items-center gap-1 ml-2">
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
        <span className="text-[10px] font-mono-data text-zinc-500">SYS ONLINE</span>
      </div>

      <div className="flex items-center gap-1">
        <Wifi size={10} className="text-zinc-600" />
        <span className="text-[10px] font-mono-data text-zinc-500">STREAM ACTIVE</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900/60 border border-zinc-800 rounded">
        <span className="text-[10px] text-zinc-500">CASES</span>
        <span className="text-xs font-mono-data text-zinc-200 font-500">{activeCases}</span>
      </div>

      {pendingAlerts > 0 && (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border ${
          criticalAlerts > 0
            ? 'bg-red-950/40 border-red-800/60 animate-glow-critical'
            : 'bg-amber-950/30 border-amber-800/50'
        }`}>
          <AlertTriangle size={11} className={criticalAlerts > 0 ? 'text-red-400 animate-pulse-critical' : 'text-amber-400'} />
          <span className={`text-xs font-mono-data font-500 ${criticalAlerts > 0 ? 'text-red-300' : 'text-amber-300'}`}>
            {pendingAlerts} ALERT{pendingAlerts > 1 ? 'S' : ''}
          </span>
        </div>
      )}

      <button
        onClick={onRunDemo}
        disabled={demoRunning}
        className={`flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-mono-data font-600 tracking-wider transition-all ${
          demoRunning
            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            : 'bg-white text-zinc-950 hover:bg-zinc-200 active:scale-95'
        }`}
      >
        <Play size={9} />
        {demoRunning ? 'DEMO RUNNING...' : 'RUN LIVE DEMO'}
      </button>

      <div className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900/60 border border-zinc-800 rounded">
        <Clock size={10} className="text-zinc-600" />
        <span className="text-[10px] font-mono-data text-zinc-300">{timeStr}</span>
        <span className="text-zinc-700 text-[10px] font-mono-data ml-1">{dateStr}</span>
      </div>

      <div className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-zinc-900 transition-colors cursor-pointer">
        <div className="w-5 h-5 rounded-sm bg-zinc-800 flex items-center justify-center">
          <User size={10} className="text-zinc-400" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-[10px] text-zinc-300">{userName}</span>
          <span className="text-[9px] font-mono-data text-zinc-600">{userRole}</span>
        </div>
        <ChevronDown size={9} className="text-zinc-600" />
      </div>
    </header>
  )
}
