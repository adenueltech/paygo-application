import { Play, Pause, StopCircle, PlusCircle } from "lucide-react"

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <button className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
        <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
          <Play className="h-5 w-5 text-green-400" />
        </div>
        <span className="text-sm font-medium text-white">Start Session</span>
      </button>

      <button className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
        <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center group-hover:bg-yellow-500/30 transition-colors">
          <Pause className="h-5 w-5 text-yellow-400" />
        </div>
        <span className="text-sm font-medium text-white">Pause All</span>
      </button>

      <button className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
        <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
          <StopCircle className="h-5 w-5 text-red-400" />
        </div>
        <span className="text-sm font-medium text-white">Stop Service</span>
      </button>

      <button className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
        <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
          <PlusCircle className="h-5 w-5 text-blue-400" />
        </div>
        <span className="text-sm font-medium text-white">New Service</span>
      </button>
    </div>
  )
}
