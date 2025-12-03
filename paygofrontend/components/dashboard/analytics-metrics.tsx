"use client"

import { useEffect } from "react"
import { useBlockchain } from "@/lib/hooks/useBlockchain"

export function AnalyticsMetrics() {
  const { analytics, getAnalytics } = useBlockchain()

  useEffect(() => {
    getAnalytics()
  }, [getAnalytics])

  if (!analytics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <h4 className="text-sm font-medium text-gray-400">Total Spending</h4>
          <p className="text-2xl font-bold text-white">Loading...</p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <h4 className="text-sm font-medium text-gray-400">Services Used</h4>
          <p className="text-2xl font-bold text-white">Loading...</p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <h4 className="text-sm font-medium text-gray-400">Avg. Usage Time</h4>
          <p className="text-2xl font-bold text-white">Loading...</p>
        </div>
      </div>
    )
  }

  const monthSpend = Number(analytics.monthSpend) || 0
  const todaySpend = Number(analytics.todaySpend) || 0
  const spendingChange = monthSpend > 0 ?
    (((monthSpend - todaySpend) / monthSpend) * 100).toFixed(1) : "0"

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
        <h4 className="text-sm font-medium text-gray-400">Total Spending</h4>
        <p className="text-2xl font-bold text-white">₦{analytics.totalSpending.toLocaleString()}</p>
        <p className={`text-xs ${Number(spendingChange) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {Number(spendingChange) >= 0 ? '+' : ''}{spendingChange}% from last month
        </p>
      </div>
      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
        <h4 className="text-sm font-medium text-gray-400">Services Used</h4>
        <p className="text-2xl font-bold text-white">{analytics.servicesUsed}</p>
        <p className="text-xs text-blue-400">Active this month</p>
      </div>
      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
        <h4 className="text-sm font-medium text-gray-400">Avg. Usage Time</h4>
        <p className="text-2xl font-bold text-white">{analytics.avgUsageTime.toFixed(1)}h</p>
        <p className="text-xs text-purple-400">Per session</p>
      </div>
    </div>
  )
}