"use client"

import { useState } from "react"
import { Eye, EyeOff, TrendingUp, Users, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export function VendorOverview() {
  const [showEarnings, setShowEarnings] = useState(true)

  return (
    <div className="rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-6 text-white shadow-xl border border-white/10 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
            <button className="px-3 py-1 rounded-md text-sm font-medium bg-white text-black shadow-sm">
              Earnings
            </button>
          </div>
          <button
            onClick={() => setShowEarnings(!showEarnings)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {showEarnings ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
          </button>
        </div>

        <div className="mb-8">
          <p className="text-sm text-gray-400 mb-1">Total Earnings</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-bold tracking-tight">
              {showEarnings ? "₦1,245,850.00" : "••••••••"}
            </h2>
            {showEarnings && (
              <span className="text-sm font-medium text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                +18.2%
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-400">Clients</span>
            </div>
            <p className="text-lg font-semibold">247</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-gray-400">Rating</span>
            </div>
            <p className="text-lg font-semibold">4.8</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-400">This Month</span>
            </div>
            <p className="text-lg font-semibold">₦45,200</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button className="bg-white text-black hover:bg-gray-200 flex flex-col h-auto py-3 gap-1">
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs">View Analytics</span>
          </Button>
          <Button
            variant="outline"
            className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white flex flex-col h-auto py-3 gap-1"
          >
            <Users className="h-5 w-5" />
            <span className="text-xs">Manage Clients</span>
          </Button>
        </div>
      </div>
    </div>
  )
}