"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react"

interface AutoSwapperModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AutoSwapperModal({ isOpen, onClose }: AutoSwapperModalProps) {
  const [step, setStep] = useState(1)
  const [fromAsset, setFromAsset] = useState("usdt")
  const [toAsset, setToAsset] = useState("ngn")
  const [amount, setAmount] = useState("")
  const [threshold, setThreshold] = useState("1000")
  const [isProcessing, setIsProcessing] = useState(false)

  const exchangeRate = fromAsset === "usdt" ? 1500 : fromAsset === "btc" ? 85000000 : 300000 // Mock rates

  const estimatedReceive = amount ? (Number(amount) * exchangeRate).toFixed(2) : "0"

  const handleConfirm = async () => {
    setIsProcessing(true)
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsProcessing(false)
    setStep(2)
  }

  const resetModal = () => {
    setStep(1)
    setFromAsset("usdt")
    setToAsset("ngn")
    setAmount("")
    setThreshold("1000")
    setIsProcessing(false)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#696E71] border-white/10 text-white sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {step === 1 ? "Auto Swap Setup" : "Auto Swap Active"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 1 && (
            <>
              {/* Asset Selection */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">From Asset</label>
                  <Select value={fromAsset} onValueChange={setFromAsset}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#696E71] border-white/10 text-white">
                      <SelectItem value="usdt">USDT (Tether)</SelectItem>
                      <SelectItem value="btc">BTC (Bitcoin)</SelectItem>
                      <SelectItem value="eth">ETH (Ethereum)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-gray-400" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">To Asset</label>
                  <Select value={toAsset} onValueChange={setToAsset}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#696E71] border-white/10 text-white">
                      <SelectItem value="ngn">NGN (Naira)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Swap Amount ({fromAsset.toUpperCase()})</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-white/5 border-white/10 text-white"
                  min="0.001"
                  step="0.001"
                />
                <p className="text-xs text-gray-400">
                  Available: {fromAsset === "usdt" ? "50 USDT" : fromAsset === "btc" ? "0.45 BTC" : "10 ETH"}
                </p>
              </div>

              {/* Threshold */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Auto Swap Threshold (NGN)</label>
                <Input
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  placeholder="1000"
                  className="bg-white/5 border-white/10 text-white"
                  min="100"
                />
                <p className="text-xs text-gray-400">
                  Swap will trigger when your {fromAsset.toUpperCase()} balance reaches this NGN equivalent
                </p>
              </div>

              {/* Exchange Rate */}
              <div className="bg-black/20 rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Exchange Rate</span>
                  <span className="text-white">1 {fromAsset.toUpperCase()} = ₦{exchangeRate.toLocaleString()}</span>
                </div>
                {amount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">You will receive</span>
                    <span className="text-white font-medium">₦{Number(estimatedReceive).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Warning */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-yellow-200">
                    <p className="font-medium mb-1">Auto Swap Notice</p>
                    <p>Swaps will execute automatically when conditions are met. Market rates may vary.</p>
                  </div>
                </div>
              </div>

              <Button
                className="w-full bg-white text-black hover:bg-gray-200 h-12 text-lg"
                onClick={handleConfirm}
                disabled={!amount || !threshold || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Enable Auto Swap
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </>
          )}

          {step === 2 && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Auto Swap Enabled!</h3>
                <p className="text-gray-400">
                  Your {fromAsset.toUpperCase()} will automatically swap to NGN when your balance reaches ₦{Number(threshold).toLocaleString()}
                </p>
              </div>
              <div className="bg-black/20 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">From</span>
                  <span className="text-white">{fromAsset.toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">To</span>
                  <span className="text-white">NGN</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Threshold</span>
                  <span className="text-white">₦{Number(threshold).toLocaleString()}</span>
                </div>
              </div>
              <Button className="w-full bg-white text-black hover:bg-gray-200" onClick={handleClose}>
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}