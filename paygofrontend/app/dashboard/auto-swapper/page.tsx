import { AutoSwapperForm } from "@/components/dashboard/auto-swapper-form"
import { ActiveSwapsList } from "@/components/dashboard/active-swaps-list"

export default function AutoSwapperPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Auto Swapper</h1>
        <p className="text-gray-400">Set up automatic currency swaps based on your preferences.</p>
      </div>

      {/* fff */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Configuration Form */}
        <div className="space-y-6">
          <div className="rounded-xl bg-white/5 border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Create New Auto Swap</h2>
            <AutoSwapperForm />
          </div>
        </div>

        {/* Right Column - Active Swaps */}
        <div className="space-y-6">
          <div className="rounded-xl bg-white/5 border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Active Auto Swaps</h2>
            <ActiveSwapsList />
          </div>
        </div>
      </div>
    </div>
  )
}