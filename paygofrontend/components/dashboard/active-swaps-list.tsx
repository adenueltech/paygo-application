"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Trash2, TrendingUp } from "lucide-react"

const activeSwaps = [
  {
    id: 1,
    fromAsset: "USDT",
    toAsset: "NGN",
    threshold: 1000,
    currentBalance: 50,
    status: "active",
    lastSwap: "2 hours ago",
    totalSwaps: 12
  },
  {
    id: 2,
    fromAsset: "BTC",
    toAsset: "NGN",
    threshold: 5000,
    currentBalance: 0.02,
    status: "waiting",
    lastSwap: "1 day ago",
    totalSwaps: 3
  }
]

export function ActiveSwapsList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Auto Swaps</CardTitle>
        <CardDescription>
          Monitor your automatic currency conversion rules.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activeSwaps.length === 0 ? (
          <div className="text-center py-8">
            <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No active auto swaps</p>
            <p className="text-sm text-gray-400">Create your first auto swap above</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeSwaps.map((swap) => (
              <div
                key={swap.id}
                className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">
                      {swap.fromAsset} → {swap.toAsset}
                    </h4>
                    <p className="text-sm text-gray-400">
                      Threshold: ₦{swap.threshold.toLocaleString()} |
                      Balance: {swap.currentBalance} {swap.fromAsset}
                    </p>
                    <p className="text-xs text-gray-500">
                      Last swap: {swap.lastSwap} | Total swaps: {swap.totalSwaps}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={swap.status === "active" ? "default" : "secondary"}
                    className={
                      swap.status === "active"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }
                  >
                    {swap.status === "active" ? (
                      <>
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Active
                      </>
                    ) : (
                      "Waiting"
                    )}
                  </Badge>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}