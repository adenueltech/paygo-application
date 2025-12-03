"use client"

import { useState } from "react"
import { RefreshCw, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BalanceCardProps {
  type: string
  balance: number
  currency: string
  lastUpdated: string
  status: "success" | "warning" | "error"
}

export function BalanceCard({ type, balance, currency, lastUpdated, status }: BalanceCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simulate refresh
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  const statusIcon = {
    success: <CheckCircle className="h-4 w-4 text-green-400" />,
    warning: <AlertTriangle className="h-4 w-4 text-yellow-400" />,
    error: <XCircle className="h-4 w-4 text-red-400" />,
  }

  const statusColor = {
    success: "border-green-400/20 bg-green-400/5",
    warning: "border-yellow-400/20 bg-yellow-400/5",
    error: "border-red-400/20 bg-red-400/5",
  }

  return (
    <div className={`rounded-xl border p-6 ${statusColor[status]} relative overflow-hidden`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-white">{type}</h3>
          {statusIcon[status]}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-gray-400 hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="mb-2">
        <p className="text-2xl font-bold text-white">
          {currency}{balance.toLocaleString()}
        </p>
      </div>

      <p className="text-sm text-gray-400">
        Last updated: {lastUpdated}
      </p>
    </div>
  )
}