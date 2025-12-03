"use client"

import { useState } from "react"
import { WalletOverview } from "@/components/wallet/wallet-overview"
import { TransactionHistory } from "@/components/wallet/transaction-history"
import { PaymentMethods } from "@/components/wallet/payment-methods"
import { TopUpModal } from "@/components/wallet/topup-modal"
import { TransferModal } from "@/components/wallet/transfer-modal"
import { AutoSwapperModal } from "@/components/dashboard/auto-swapper-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, TrendingUp, TrendingDown, Clock, ArrowRight, RefreshCw, Copy } from "lucide-react"

export default function WalletPage() {
  const [isTopUpOpen, setIsTopUpOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [isReceiveOpen, setIsReceiveOpen] = useState(false)
  const [isAutoSwapOpen, setIsAutoSwapOpen] = useState(false)
  const [transferType, setTransferType] = useState<"send" | "withdraw">("send")

  const handleTransfer = (type: "send" | "withdraw") => {
    setTransferType(type)
    setIsTransferOpen(true)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Wallet</h1>
        <p className="text-gray-400">Manage your digital assets and transactions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Wallet Info */}
        <div className="lg:col-span-2 space-y-8">
          <WalletOverview
            onTopUp={() => setIsTopUpOpen(true)}
            onSend={() => handleTransfer("send")}
            onReceive={() => setIsReceiveOpen(true)}
            onWithdraw={() => handleTransfer("withdraw")}
            onSwap={() => setIsAutoSwapOpen(true)}
          />

          {/* Transaction Limits */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Transaction Limits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Deposit Limits</h4>
                    <p className="text-sm text-gray-400">Daily & Monthly limits</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Daily Limit</span>
                    <span className="text-white font-medium">₦2,000,000</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Used: ₦300,000</span>
                    <span>Remaining: ₦1,700,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Monthly Limit</span>
                    <span className="text-white font-medium">₦10,000,000</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Used: ₦3,500,000</span>
                    <span>Remaining: ₦6,500,000</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Withdrawal Limits</h4>
                    <p className="text-sm text-gray-400">Daily & Monthly limits</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Daily Limit</span>
                    <span className="text-white font-medium">₦500,000</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Used: ₦100,000</span>
                    <span>Remaining: ₦400,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Monthly Limit</span>
                    <span className="text-white font-medium">₦2,000,000</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Used: ₦900,000</span>
                    <span>Remaining: ₦1,100,000</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-yellow-200">
                  <p className="font-medium mb-1">Limit Reset Information</p>
                  <p>Daily limits reset at 12:00 AM WAT. Monthly limits reset on the 1st of each month.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Transaction History</h3>
            <TransactionHistory />
          </div>
        </div>

        {/* Right Column - Payment Methods & Quick Actions */}
        <div className="space-y-8">
          <PaymentMethods />

          {/* Quick Deposit/Withdrawal Shortcuts */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Quick Actions</h3>
            <div className="space-y-4">
              <button
                onClick={() => setIsTopUpOpen(true)}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl p-4 flex items-center justify-between transition-all duration-200 hover:scale-105"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Quick Deposit</p>
                    <p className="text-xs text-green-100">Instant top-up</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => handleTransfer("withdraw")}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl p-4 flex items-center justify-between transition-all duration-200 hover:scale-105"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                    <TrendingDown className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Quick Withdraw</p>
                    <p className="text-xs text-red-100">To bank account</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setIsTopUpOpen(true)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-3 flex flex-col items-center gap-2 transition-colors"
                >
                  <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-xs text-blue-400">₦</span>
                  </div>
                  <span className="text-xs text-gray-300">₦5k</span>
                </button>
                <button
                  onClick={() => setIsTopUpOpen(true)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-3 flex flex-col items-center gap-2 transition-colors"
                >
                  <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-xs text-blue-400">₦</span>
                  </div>
                  <span className="text-xs text-gray-300">₦10k</span>
                </button>
                <button
                  onClick={() => setIsAutoSwapOpen(true)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-3 flex flex-col items-center gap-2 transition-colors"
                >
                  <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <RefreshCw className="h-3 w-3 text-purple-400" />
                  </div>
                  <span className="text-xs text-gray-300">Swap</span>
                </button>
                <button
                  onClick={() => handleTransfer("withdraw")}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-3 flex flex-col items-center gap-2 transition-colors"
                >
                  <div className="h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center">
                    <span className="text-xs text-red-400">₦</span>
                  </div>
                  <span className="text-xs text-gray-300">₦2k</span>
                </button>
                <button
                  onClick={() => handleTransfer("withdraw")}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-3 flex flex-col items-center gap-2 transition-colors"
                >
                  <div className="h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center">
                    <span className="text-xs text-red-400">₦</span>
                  </div>
                  <span className="text-xs text-gray-300">₦5k</span>
                </button>
              </div>
            </div>
          </div>

          <div
            onClick={() => setIsAutoSwapOpen(true)}
            className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white hover:from-blue-700 hover:to-purple-700 transition-all cursor-pointer"
          >
            <h3 className="text-lg font-semibold mb-2">Auto-Swap Settings</h3>
            <p className="text-blue-100 text-sm mb-4">
              Configure automatic conversion of crypto to fiat for seamless payments.
            </p>
            <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
              <span className="text-sm font-medium">Configure Auto Swap</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Receive Modal */}
      <Dialog open={isReceiveOpen} onOpenChange={setIsReceiveOpen}>
        <DialogContent className="bg-[#696E71] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Receive Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="text-center">
              <div className="bg-white/10 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-400 mb-2">Your Wallet Address</p>
                <div className="flex items-center gap-2 bg-black/20 rounded p-3">
                  <code className="text-sm font-mono flex-1">0x71C...39A2</code>
                  <button className="text-gray-400 hover:text-white">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">QR Code</p>
                <div className="bg-white rounded p-4 w-32 h-32 mx-auto flex items-center justify-center">
                  <span className="text-black text-xs">QR Code</span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setIsReceiveOpen(false)}
              className="w-full bg-white text-black hover:bg-gray-200"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />
      <TransferModal isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} type={transferType} />
      <AutoSwapperModal isOpen={isAutoSwapOpen} onClose={() => setIsAutoSwapOpen(false)} />
    </div>
  )
}
