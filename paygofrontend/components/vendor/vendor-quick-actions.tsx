import { PlusCircle, MessageSquare, BarChart3, Settings } from "lucide-react"

export function VendorQuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <button className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
        <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
          <PlusCircle className="h-5 w-5 text-blue-400" />
        </div>
        <span className="text-sm font-medium text-white">Add Service</span>
      </button>

      <button className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
        <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
          <MessageSquare className="h-5 w-5 text-green-400" />
        </div>
        <span className="text-sm font-medium text-white">Consultations</span>
      </button>

      <button className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
        <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
          <BarChart3 className="h-5 w-5 text-purple-400" />
        </div>
        <span className="text-sm font-medium text-white">Analytics</span>
      </button>

      <button className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
        <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
          <Settings className="h-5 w-5 text-orange-400" />
        </div>
        <span className="text-sm font-medium text-white">Settings</span>
      </button>
    </div>
  )
}