"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  { name: "Mon", total: 1200 },
  { name: "Tue", total: 900 },
  { name: "Wed", total: 1600 },
  { name: "Thu", total: 1100 },
  { name: "Fri", total: 2400 },
  { name: "Sat", total: 800 },
  { name: "Sun", total: 600 },
]

export function SpendingOverview() {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Spending Overview</h3>
          <p className="text-sm text-gray-400">Your daily usage this week</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">₦8,600</p>
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
              tickFormatter={(value) => `₦${value}`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }}
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
            />
            <Bar dataKey="total" fill="#fff" radius={[4, 4, 0, 0]} className="fill-white" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
