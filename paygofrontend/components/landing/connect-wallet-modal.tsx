"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Wallet, Smartphone, CreditCard, User, Briefcase } from "lucide-react"
import { useRouter } from "next/navigation"

interface ConnectWalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ConnectWalletModal({ isOpen, onClose }: ConnectWalletModalProps) {
  const [userType, setUserType] = useState<"user" | "vendor">("user")
  const router = useRouter()

  const handleConnect = () => {
    localStorage.setItem("userType", userType)
    onClose()
    router.push("/onboarding")
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#696E71] p-6 text-white shadow-2xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Wallet className="h-6 w-6" />
                <h2 className="text-2xl font-semibold">ConnectWallet</h2>
              </div>
              <button onClick={onClose} className="rounded-full p-1 hover:bg-white/10 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            <p className="text-gray-300 mb-6">Choose your prefered wallet to get started with pay Go</p>

            {/* User Type Selection */}
            <div className="mb-6">
              <h3 className="text-white font-medium mb-3">I want to connect as:</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setUserType("user")}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    userType === "user"
                      ? "bg-white/10 border-white text-white"
                      : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">User</span>
                </button>
                <button
                  onClick={() => setUserType("vendor")}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    userType === "vendor"
                      ? "bg-white/10 border-white text-white"
                      : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <Briefcase className="h-5 w-5" />
                  <span className="font-medium">Vendor</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleConnect}
                className="w-full flex items-center gap-4 rounded-xl border border-white/20 bg-white/5 p-4 hover:bg-white/10 transition-all group"
              >
                <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  {/* <img src="/metamask-fox-logo.png" alt="MetaMask" className="h-8 w-8" /> */}
                  <Wallet className="h-6 w-6 text-orange-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Meta Mask</h3>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300">Connect with MetaMesk Wallet</p>
                </div>
              </button>

              <button
                onClick={handleConnect}
                className="w-full flex items-center gap-4 rounded-xl border border-white/20 bg-white/5 p-4 hover:bg-white/10 transition-all group"
              >
                <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-blue-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">WalletConnect</h3>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300">
                    Scan QR code with your mobile wallet
                  </p>
                </div>
              </button>

              <button
                onClick={handleConnect}
                className="w-full flex items-center gap-4 rounded-xl border border-white/20 bg-white/5 p-4 hover:bg-white/10 transition-all group"
              >
                <div className="h-10 w-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-blue-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Coinbase Wallet</h3>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300">Connect with coinbase Wallet</p>
                </div>
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-gray-400">
              By Connecting you agree to our terms of service and privacy policy
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
