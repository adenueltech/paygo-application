"use client"

import { motion } from "framer-motion"
import { ArrowUpRight, ArrowDownLeft, Plus } from "lucide-react"

export function WalletPreview() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <h2 className="text-5xl font-bold leading-tight text-black">Your digital Wallet, Simplified</h2>

          <p className="text-xl text-gray-600">
            Manager all your assets in one place. Track balance s, View transaction history, and make instant transfers
            with just a few laps.
          </p>

          <ul className="space-y-6">
            {[
              "Multi Curreancy support (USD, EUR, BTC, ETH, USDT, USDC)",
              "Bank level security wit 2FA and biometric authentication",
              "Real time exchange and automatic conversion",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-1.5 h-2 w-2 rounded-full bg-black" />
                <span className="text-lg text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl border border-gray-200 bg-white p-8 shadow-2xl"
        >
          <div className="mb-8">
            <p className="text-sm text-gray-500">Total Balance</p>
            <h3 className="text-4xl font-bold text-black">$24,582.50</h3>
            <p className="text-sm text-green-500">+12.5% this month</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-700">
                  $
                </div>
                <div>
                  <p className="font-bold text-black">USD</p>
                  <p className="text-xs text-gray-500">US Dollar</p>
                </div>
              </div>
              <p className="font-bold text-black">$15,420.00</p>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">
                  B
                </div>
                <div>
                  <p className="font-bold text-black">BTC</p>
                  <p className="text-xs text-gray-500">Bitcoin</p>
                </div>
              </div>
              <p className="font-bold text-black">$6,850.30</p>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                  E
                </div>
                <div>
                  <p className="font-bold text-black">ETH</p>
                  <p className="text-xs text-gray-500">Ethereum</p>
                </div>
              </div>
              <p className="font-bold text-black">$2,312.20</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <button className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 py-4 hover:bg-gray-50">
              <Plus className="h-5 w-5" />
              <span className="text-sm font-medium">Top UP</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 py-4 hover:bg-gray-50">
              <ArrowUpRight className="h-5 w-5" />
              <span className="text-sm font-medium">Send</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 py-4 hover:bg-gray-50">
              <ArrowDownLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Recieve</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
