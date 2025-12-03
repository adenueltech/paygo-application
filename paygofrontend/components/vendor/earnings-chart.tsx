"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  { name: "Mon", earnings: 8500 },
  { name: "Tue", earnings: 6200 },
  { name: "Wed", earnings: 12400 },
  { name: "Thu", earnings: 9800 },
  { name: "Fri", earnings: 15600 },
  { name: "Sat", earnings: 4200 },
  { name: "Sun", earnings: 3100 },
]

export function EarningsChart() {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Earnings Overview</h3>
          <p className="text-sm text-gray-400">Your weekly earnings</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">₦58,500</p>
          <p className="text-xs text-gray-400">Total this week</p>
        </div>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }}
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              formatter={(value) => [`₦${value.toLocaleString()}`, "Earnings"]}
            />
            <Bar dataKey="earnings" fill="#10b981" radius={[4, 4, 0, 0]} className="fill-green-500" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}