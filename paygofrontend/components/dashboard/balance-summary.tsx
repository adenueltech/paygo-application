"use client"

import { useState } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BalanceSummaryProps {
  totalBalance: number
  currency: string
}

export function BalanceSummary({ totalBalance, currency }: BalanceSummaryProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefreshAll = () => {
    setIsRefreshing(true)
    // Simulate refresh
    setTimeout(() => setIsRefreshing(false), 3000)
  }

  return (
    <div className="rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-6 text-white shadow-xl border border-white/10 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Total Combined Balance</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="text-gray-400 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="ml-2">Refresh All</span>
          </Button>
        </div>

        <div className="mb-4">
          <p className="text-4xl font-bold tracking-tight">
            {currency}{totalBalance.toLocaleString()}
          </p>
        </div>

        <p className="text-sm text-gray-400">
          Across all accounts and services
        </p>
      </div>
    </div>
  )
}