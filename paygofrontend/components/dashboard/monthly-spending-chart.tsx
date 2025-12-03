"use client"

import { useEffect } from "react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { useBlockchain } from "@/lib/hooks/useBlockchain"

export function MonthlySpendingChart() {
  const { analytics, getAnalytics } = useBlockchain()

  useEffect(() => {
    getAnalytics()
  }, [getAnalytics])

  const data = analytics?.chartData?.monthlySpending || []
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Monthly Spending</h3>
          <p className="text-sm text-gray-400">Spending trends over the year</p>
        </div>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }}
              formatter={(value) => [`₦${value.toLocaleString()}`, "Spending"]}
              labelFormatter={(label) => `${label}`}
            />
            <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}