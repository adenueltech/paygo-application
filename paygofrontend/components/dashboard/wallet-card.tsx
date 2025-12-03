"use client"

import { useState } from "react"
import { Eye, EyeOff, Plus, ArrowUpRight, ArrowDownLeft, RefreshCw, Copy, X, Wallet, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TopUpModal } from "@/components/wallet/topup-modal"
import { TransferModal } from "@/components/wallet/transfer-modal"
import { AutoSwapperModal } from "@/components/dashboard/auto-swapper-modal"
import { useBlockchain } from "@/lib/hooks/useBlockchain"
import { useAuth } from "@/lib/auth"

export function WalletCard() {
  const [showBalance, setShowBalance] = useState(true)
  const [currency, setCurrency] = useState<"fiat" | "crypto">("fiat")
  const [isTopUpOpen, setIsTopUpOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [isReceiveOpen, setIsReceiveOpen] = useState(false)
  const [isAutoSwapOpen, setIsAutoSwapOpen] = useState(false)
  const [transferType, setTransferType] = useState<"send" | "withdraw">("send")

  const { wallet, connectWallet, formatAddress } = useBlockchain()
  const { user } = useAuth()

  const handleTransfer = (type: "send" | "withdraw") => {
    setTransferType(type)
    setIsTransferOpen(true)
  }

  const handleConnectWallet = async () => {
    try {
      await connectWallet()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  return (
    <div className="rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-6 text-white shadow-xl border border-white/10 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setCurrency("fiat")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                currency === "fiat" ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-white"
              }`}
            >
              Fiat
            </button>
            <button
              onClick={() => setCurrency("crypto")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                currency === "crypto" ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-white"
              }`}
            >
              Crypto
            </button>
          </div>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {showBalance ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
          </button>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Total Balance</p>
            {wallet.isConnected && wallet.address && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                {formatAddress(wallet.address)}
              </div>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-bold tracking-tight">
              {wallet.isConnected ? (
                showBalance ? `${wallet.balance} ETH` : "••••••••"
              ) : (
                showBalance ? "Connect Wallet" : "••••••••"
              )}
            </h2>
            {showBalance && wallet.isConnected && (
              <span className="text-sm font-medium text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                On-chain
              </span>
            )}
          </div>
          {wallet.error && (
            <div className="flex items-center gap-2 mt-2 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" />
              {wallet.error}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
          {!wallet.isConnected ? (
            <Button
              onClick={handleConnectWallet}
              disabled={wallet.isConnecting}
              className="bg-blue-600 text-white hover:bg-blue-700 flex flex-col h-auto py-3 gap-1 col-span-full"
            >
              <Wallet className="h-4 w-4" />
              <span className="text-xs">
                {wallet.isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </span>
            </Button>
          ) : (
            <>
              <Button
                onClick={() => setIsTopUpOpen(true)}
                className="bg-white text-black hover:bg-gray-200 flex flex-col h-auto py-3 gap-1"
              >
                <Plus className="h-4 w-4" />
                <span className="text-xs">Top Up</span>
              </Button>
              <Button
                onClick={() => handleTransfer("send")}
                variant="outline"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white flex flex-col h-auto py-3 gap-1"
              >
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-xs">Send</span>
              </Button>
              <Button
                onClick={() => setIsReceiveOpen(true)}
                variant="outline"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white flex flex-col h-auto py-3 gap-1"
              >
                <ArrowDownLeft className="h-4 w-4" />
                <span className="text-xs">Receive</span>
              </Button>
              <Button
                onClick={() => handleTransfer("withdraw")}
                variant="outline"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white flex flex-col h-auto py-3 gap-1"
              >
                <ArrowDownLeft className="h-4 w-4" />
                <span className="text-xs">Withdraw</span>
              </Button>
              <Button
                onClick={() => setIsAutoSwapOpen(true)}
                variant="outline"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white flex flex-col h-auto py-3 gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="text-xs">Swap</span>
              </Button>
            </>
          )}
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
                <p className="text-sm text-gray-400 mb-2">Your EVM Wallet Address</p>
                <div className="flex items-center gap-2 bg-black/20 rounded p-3">
                  <code className="text-sm font-mono flex-1">
                    {user?.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : 'No wallet address'}
                  </code>
                  <button
                    className="text-gray-400 hover:text-white"
                    onClick={() => {
                      if (user?.walletAddress) {
                        navigator.clipboard.writeText(user.walletAddress)
                      }
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {user?.zcashAddress && (
                <div className="bg-white/10 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-400 mb-2">Your Zcash Shielded Address</p>
                  <div className="flex items-center gap-2 bg-black/20 rounded p-3">
                    <code className="text-sm font-mono flex-1">
                      {`${user.zcashAddress.slice(0, 8)}...${user.zcashAddress.slice(-4)}`}
                    </code>
                    <button
                      className="text-gray-400 hover:text-white"
                      onClick={() => {
                        if (user?.zcashAddress) {
                          navigator.clipboard.writeText(user.zcashAddress)
                        }
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
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
