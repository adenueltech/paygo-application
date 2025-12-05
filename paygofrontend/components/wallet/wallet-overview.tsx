"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Plus, ArrowUpRight, ArrowDownLeft, RefreshCw, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"

interface WalletOverviewProps {
  onTopUp: () => void
  onSend: () => void
  onReceive: () => void
  onWithdraw: () => void
  onSwap: () => void
}

export function WalletOverview({ onTopUp, onSend, onReceive, onWithdraw, onSwap }: WalletOverviewProps) {
  const [showBalance, setShowBalance] = useState(true)
  const [currency, setCurrency] = useState<"fiat" | "crypto">("fiat")
  const [backendBalance, setBackendBalance] = useState<string>("0")
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)

  const { user, token } = useAuth()

  // Fetch balance from backend API
  const fetchBackendBalance = async () => {
    if (!user?.walletAddress) return

    setIsLoadingBalance(true)
    try {
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/wallet/balance`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setBackendBalance(data.balance?.toString() || "0")
      }
    } catch (error) {
      console.error('Failed to fetch backend balance:', error)
    } finally {
      setIsLoadingBalance(false)
    }
  }

  // Fetch balance on component mount if user has wallet
  useEffect(() => {
    if (user?.walletAddress) {
      fetchBackendBalance()
    }
  }, [user?.walletAddress])

  return (
    <div className="rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-8 text-white shadow-xl border border-white/10 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1 w-fit">
            <button
              onClick={() => setCurrency("fiat")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                currency === "fiat" ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-white"
              }`}
            >
              Fiat (NGN)
            </button>
            <button
              onClick={() => setCurrency("crypto")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                currency === "crypto" ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-white"
              }`}
            >
              Crypto
            </button>
          </div>

          <div className="flex items-center gap-4">
            {user?.walletAddress && (
              <div className="flex items-center gap-2 text-sm text-gray-400 bg-black/20 px-3 py-1.5 rounded-full">
                <span>Wallet ID: {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}</span>
                <button
                  className="hover:text-white transition-colors"
                  onClick={() => {
                    if (user?.walletAddress) {
                      navigator.clipboard.writeText(user.walletAddress)
                    }
                  }}
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            )}
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {showBalance ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="mb-10">
          <p className="text-sm text-gray-400 mb-2">Total Balance</p>
          <div className="flex items-baseline gap-3">
            <h2 className="text-5xl font-bold tracking-tight">
              {showBalance ? (
                user?.walletAddress ? (
                  currency === "fiat" ? `₦${backendBalance}` : `${backendBalance} ETH`
                ) : (
                  "Connect Wallet"
                )
              ) : "••••••••"}
            </h2>
            {showBalance && user?.walletAddress && (
              <span className="text-sm font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                Backend
              </span>
            )}
          </div>
          {currency === "crypto" && showBalance && user?.walletAddress && <p className="text-gray-400 mt-2">≈ ${(parseFloat(backendBalance) * 3000).toFixed(2)} USD</p>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {user?.walletAddress ? (
            <>
              <Button onClick={onTopUp} className="bg-white text-black hover:bg-gray-200 h-auto py-4 flex flex-col gap-2">
                <div className="h-8 w-8 rounded-full bg-black/10 flex items-center justify-center">
                  <Plus className="h-5 w-5" />
                </div>
                <span>Top Up</span>
              </Button>

              <Button
                onClick={onSend}
                variant="outline"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white h-auto py-4 flex flex-col gap-2"
              >
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <span>Send</span>
              </Button>

              <Button
                onClick={onReceive}
                variant="outline"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white h-auto py-4 flex flex-col gap-2"
              >
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                  <ArrowDownLeft className="h-5 w-5" />
                </div>
                <span>Receive</span>
              </Button>

              <Button
                onClick={onWithdraw}
                variant="outline"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white h-auto py-4 flex flex-col gap-2"
              >
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                  <ArrowDownLeft className="h-5 w-5" />
                </div>
                <span>Withdraw</span>
              </Button>

              <Button
                onClick={onSwap}
                variant="outline"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white h-auto py-4 flex flex-col gap-2"
              >
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <span>Swap</span>
              </Button>
            </>
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-400 mb-4">No wallet connected</p>
              <p className="text-sm text-gray-500">Register or connect a wallet to access features</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

