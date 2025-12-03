"use client"

import { useEffect } from "react"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { useBlockchain } from "@/lib/hooks/useBlockchain"

export function UsageOverTimeChart() {
  const { analytics, getAnalytics } = useBlockchain()

  useEffect(() => {
    getAnalytics()
  }, [getAnalytics])

  const data = analytics?.chartData?.usageOverTime || []
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Usage Over Time</h3>
          <p className="text-sm text-gray-400">Weekly usage statistics</p>
        </div>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}h`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }}
              formatter={(value) => [`${value} hours`, "Usage"]}
            />
            <Area
              type="monotone"
              dataKey="usage"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}