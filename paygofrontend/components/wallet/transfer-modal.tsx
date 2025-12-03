"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Building, CreditCard, Wallet, AlertCircle, CheckCircle, Loader2 } from "lucide-react"

interface TransferModalProps {
  isOpen: boolean
  onClose: () => void
  type: "send" | "withdraw"
}

export function TransferModal({ isOpen, onClose, type }: TransferModalProps) {
  const [step, setStep] = useState(1)
  const [asset, setAsset] = useState("ngn")
  const [amount, setAmount] = useState("")
  const [recipient, setRecipient] = useState("")
  const [withdrawalMethod, setWithdrawalMethod] = useState<"bank" | "card" | "crypto">("bank")
  const [selectedBank, setSelectedBank] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const calculateFee = (amount: number, method: string, asset: string) => {
    const numAmount = Number(amount)
    if (asset !== "ngn") return 0 // No fee for crypto transfers
    if (method === "bank") return Math.min(numAmount * 0.01, 100) // 1% or max ₦100
    if (method === "card") return numAmount * 0.02 // 2% for card withdrawals
    return numAmount * 0.005 // 0.5% for crypto withdrawals
  }

  const fee = calculateFee(Number(amount || "0"), type === "withdraw" ? withdrawalMethod : "send", asset)
  const total = type === "withdraw" ? Number(amount || "0") + fee : Number(amount || "0")

  const handleConfirm = async () => {
    setIsProcessing(true)
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsProcessing(false)
    setStep(3)
  }

  const resetModal = () => {
    setStep(1)
    setAsset("ngn")
    setAmount("")
    setRecipient("")
    setWithdrawalMethod("bank")
    setSelectedBank("")
    setAccountNumber("")
    setAccountName("")
    setIsProcessing(false)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#696E71] border-white/10 text-white sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {step === 1 ? (type === "send" ? "Send Money" : "Withdraw Funds") :
             step === 2 ? "Confirm Transaction" : "Transaction Successful"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Select Asset</label>
                <Select value={asset} onValueChange={setAsset}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select asset" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#696E71] border-white/10 text-white">
                    <SelectItem value="ngn">Nigerian Naira (NGN)</SelectItem>
                    <SelectItem value="usdt">Tether (USDT)</SelectItem>
                    <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {type === "withdraw" && asset === "ngn" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Withdrawal Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setWithdrawalMethod("bank")}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                        withdrawalMethod === "bank"
                          ? "bg-white/10 border-white text-white"
                          : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      <Building className="h-5 w-5" />
                      <span className="text-xs font-medium">Bank</span>
                    </button>
                    <button
                      onClick={() => setWithdrawalMethod("card")}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                        withdrawalMethod === "card"
                          ? "bg-white/10 border-white text-white"
                          : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      <CreditCard className="h-5 w-5" />
                      <span className="text-xs font-medium">Card</span>
                    </button>
                    <button
                      onClick={() => setWithdrawalMethod("crypto")}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                        withdrawalMethod === "crypto"
                          ? "bg-white/10 border-white text-white"
                          : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      <Wallet className="h-5 w-5" />
                      <span className="text-xs font-medium">Crypto</span>
                    </button>
                  </div>
                </div>
              )}

              {type === "withdraw" && withdrawalMethod === "bank" && asset === "ngn" && (
                <>
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Account Number</label>
                    <Input
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Enter account number"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                      maxLength={10}
                    />
                  </div>
                  {accountNumber.length === 10 && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <p className="text-sm text-blue-300">Account Name: John Doe</p>
                    </div>
                  )}
                </>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  {type === "send" ? "Recipient Address / Email" : "Recipient Details"}
                </label>
                <Input
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder={type === "send" ? "Enter address or email" : type === "withdraw" && withdrawalMethod === "crypto" ? "Enter wallet address" : "Enter recipient details"}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Amount</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    min="1"
                    max={asset === "ngn" ? "500000" : "100"}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-400 font-medium hover:text-blue-300"
                    onClick={() => setAmount(asset === "ngn" ? "245850" : "10")}
                  >
                    MAX
                  </button>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Available: {asset === "ngn" ? "₦245,850.00" : asset === "usdt" ? "50 USDT" : "0.45 BTC"}</span>
                  <span>Min: {asset === "ngn" ? "₦100" : "0.001"}</span>
                </div>
              </div>

              {type === "withdraw" && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-yellow-200">
                      <p className="font-medium mb-1">Withdrawal Limits</p>
                      <p>Daily: ₦500,000 | Monthly: ₦2,000,000</p>
                      <p>Processing: 1-3 business days</p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                className="w-full bg-white text-black hover:bg-gray-200"
                onClick={() => setStep(2)}
                disabled={!amount || !recipient || (type === "withdraw" && withdrawalMethod === "bank" && (!selectedBank || accountNumber.length !== 10))}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}

          {step === 2 && (
            <div className="text-center space-y-6">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <p className="text-gray-400 text-sm mb-1">You are {type === "send" ? "sending" : "withdrawing"}</p>
                <h3 className="text-3xl font-bold text-white mb-4">
                  {asset === "ngn" ? `₦${Number(amount).toLocaleString()}` : `${amount} ${asset.toUpperCase()}`}
                </h3>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                  <span>To:</span>
                  <span className="font-mono bg-black/20 px-2 py-1 rounded truncate max-w-48">
                    {type === "withdraw" && withdrawalMethod === "bank" ? `${selectedBank} - ${accountNumber}` : recipient}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount</span>
                  <span className="text-white">{asset === "ngn" ? `₦${Number(amount).toLocaleString()}` : `${amount} ${asset.toUpperCase()}`}</span>
                </div>
                {type === "withdraw" && asset === "ngn" && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Withdrawal Fee ({withdrawalMethod === "bank" ? "1%" : withdrawalMethod === "card" ? "2%" : "0.5%"})</span>
                    <span className="text-white">₦{fee.toFixed(2)}</span>
                  </div>
                )}
                {type === "withdraw" && (
                  <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                    <span className="text-white">Total Deducted</span>
                    <span className="text-white">
                      {asset === "ngn" ? `₦${total.toLocaleString()}` : `${amount} ${asset.toUpperCase()}`}
                    </span>
                  </div>
                )}
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
                    `Confirm ${type === "send" ? "Send" : "Withdraw"}`
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
                <h3 className="text-xl font-bold text-white mb-2">
                  {type === "send" ? "Money Sent!" : "Withdrawal Initiated!"}
                </h3>
                <p className="text-gray-400">
                  {type === "send"
                    ? `${asset === "ngn" ? `₦${Number(amount).toLocaleString()}` : `${amount} ${asset.toUpperCase()}`} has been sent successfully`
                    : "Your withdrawal request has been submitted and is being processed"
                  }
                </p>
              </div>
              <div className="bg-black/20 rounded-lg p-4">
                <p className="text-sm text-gray-400">Transaction ID</p>
                <p className="font-mono text-white">TXN_{Date.now()}</p>
                {type === "withdraw" && <p className="text-xs text-gray-400 mt-2">Expected completion: 1-3 business days</p>}
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
