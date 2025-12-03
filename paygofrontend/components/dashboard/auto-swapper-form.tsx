"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, AlertCircle } from "lucide-react"

export function AutoSwapperForm() {
  const [fromAsset, setFromAsset] = useState("usdt")
  const [toAsset, setToAsset] = useState("ngn")
  const [threshold, setThreshold] = useState("")
  const [isActive, setIsActive] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    setIsActive(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configure Auto Swap</CardTitle>
        <CardDescription>
          Set up automatic currency conversion when your balance reaches a threshold.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromAsset">From Asset</Label>
              <Select value={fromAsset} onValueChange={setFromAsset}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usdt">USDT</SelectItem>
                  <SelectItem value="btc">BTC</SelectItem>
                  <SelectItem value="eth">ETH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="toAsset">To Asset</Label>
              <Select value={toAsset} onValueChange={setToAsset}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ngn">NGN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="threshold">Trigger Threshold (NGN)</Label>
            <Input
              id="threshold"
              type="number"
              placeholder="e.g., 1000"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              Auto swap will trigger when your {fromAsset.toUpperCase()} balance can be converted to NGN above this amount.
            </p>
          </div>

          <div className="flex items-center gap-2 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-yellow-700">Exchange Rate</p>
              <p className="text-yellow-600">1 {fromAsset.toUpperCase()} ≈ ₦1,500 NGN (estimated)</p>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={!threshold}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {isActive ? "Update Auto Swap" : "Create Auto Swap"}
          </Button>
        </form>

        {isActive && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-700">Auto Swap Active</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Monitoring {fromAsset.toUpperCase()} balance for conversion to NGN above ₦{threshold}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}