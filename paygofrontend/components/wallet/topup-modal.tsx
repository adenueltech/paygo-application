"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Building, Wallet, ArrowRight, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface TopUpModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TopUpModal({ isOpen, onClose }: TopUpModalProps) {
  const [step, setStep] = useState(1)
  const [method, setMethod] = useState<"card" | "bank" | "crypto">("card")
  const [amount, setAmount] = useState("1000")
  const [selectedBank, setSelectedBank] = useState("")
  const [selectedCrypto, setSelectedCrypto] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const calculateFee = (amount: number, method: string) => {
    const numAmount = Number(amount)
    if (method === "card") return numAmount * 0.015 // 1.5% for cards
    if (method === "bank") return Math.min(numAmount * 0.005, 100) // 0.5% or max ₦100
    if (method === "crypto") return numAmount * 0.001 // 0.1% for crypto
    return 0
  }

  const fee = calculateFee(Number(amount || "0"), method)
  const total = Number(amount || "0") + fee

  const handleConfirm = async () => {
    setIsProcessing(true)
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsProcessing(false)
    setStep(3)
  }

  const resetModal = () => {
    setStep(1)
    setMethod("card")
    setAmount("1000")
    setSelectedBank("")
    setSelectedCrypto("")
    setIsProcessing(false)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#696E71] border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {step === 1 ? "Top Up Wallet" : step === 2 ? "Confirm Payment" : "Payment Successful"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 1 && (
            <>
              {/* Amount Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Amount (NGN)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₦</span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8 bg-white/5 border-white/10 text-white text-lg font-bold"
                    min="100"
                    max="1000000"
                  />
                </div>
                <div className="flex gap-2">
                  {["1000", "5000", "10000", "50000"].map((val) => (
                    <button
                      key={val}
                      onClick={() => setAmount(val)}
                      className={`flex-1 py-1 text-xs rounded border transition-colors ${
                        amount === val
                          ? "bg-white text-black border-white"
                          : "bg-transparent border-white/10 text-gray-400 hover:border-white/30"
                      }`}
                    >
                      ₦{Number.parseInt(val).toLocaleString()}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400">Min: ₦100 | Max: ₦1,000,000</p>
              </div>

              {/* Method Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setMethod("card")}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                      method === "card"
                        ? "bg-white/10 border-white text-white"
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    <CreditCard className="h-5 w-5" />
                    <span className="text-xs font-medium">Card</span>
                  </button>
                  <button
                    onClick={() => setMethod("bank")}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                      method === "bank"
                        ? "bg-white/10 border-white text-white"
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    <Building className="h-5 w-5" />
                    <span className="text-xs font-medium">Bank Transfer</span>
                  </button>
                  <button
                    onClick={() => setMethod("crypto")}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                      method === "crypto"
                        ? "bg-white/10 border-white text-white"
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    <Wallet className="h-5 w-5" />
                    <span className="text-xs font-medium">Crypto</span>
                  </button>
                </div>
              </div>

              {/* Additional Options based on method */}
              {method === "bank" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Select Bank</label>
                  <Select value={selectedBank} onValueChange={setSelectedBank}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Choose your bank" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#696E71] border-white/10 text-white">
                      <SelectItem value="gtb">Guaranty Trust Bank</SelectItem>
                      <SelectItem value="zenith">Zenith Bank</SelectItem>
                      <SelectItem value="access">Access Bank</SelectItem>
                      <SelectItem value="uba">United Bank for Africa</SelectItem>
                      <SelectItem value="firstbank">First Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {method === "crypto" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Select Cryptocurrency</label>
                  <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Choose cryptocurrency" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#696E71] border-white/10 text-white">
                      <SelectItem value="usdt">Tether (USDT)</SelectItem>
                      <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                      <SelectItem value="bnb">Binance Coin (BNB)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Summary */}
              <div className="bg-black/20 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Amount</span>
                  <span className="text-white">₦{Number(amount || "0").toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Fee ({method === "card" ? "1.5%" : method === "bank" ? "0.5%" : "0.1%"})</span>
                  <span className="text-white">₦{fee.toFixed(2)}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-white">₦{total.toLocaleString()}</span>
                </div>
              </div>

              <Button
                className="w-full bg-white text-black hover:bg-gray-200 h-12 text-lg"
                onClick={() => setStep(2)}
                disabled={!amount || Number(amount) < 100 || (method === "bank" && !selectedBank) || (method === "crypto" && !selectedCrypto)}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}

          {step === 2 && (
            <div className="text-center space-y-6">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <p className="text-gray-400 text-sm mb-1">You are topping up</p>
                <h3 className="text-3xl font-bold text-white mb-4">₦{Number(amount).toLocaleString()}</h3>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                  <span>Via:</span>
                  <span className="font-medium capitalize">{method === "bank" ? `${selectedBank} Transfer` : method === "crypto" ? selectedCrypto.toUpperCase() : "Card Payment"}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount</span>
                  <span className="text-white">₦{Number(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Processing Fee</span>
                  <span className="text-white">₦{fee.toFixed(2)}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-white">₦{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10 bg-transparent"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 bg-white text-black hover:bg-gray-200"
                  onClick={handleConfirm}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Payment"
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Payment Successful!</h3>
                <p className="text-gray-400">₦{Number(amount).toLocaleString()} has been added to your wallet</p>
              </div>
              <div className="bg-black/20 rounded-lg p-4">
                <p className="text-sm text-gray-400">Transaction ID</p>
                <p className="font-mono text-white">TXN_{Date.now()}</p>
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
