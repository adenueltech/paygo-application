"use client"

import { motion } from "framer-motion"
import { Wallet, RefreshCw, CreditCard, Building2, Coins, ArrowLeftRight } from "lucide-react"

const features = [
  {
    icon: Wallet,
    title: "Wallet Balance Summary",
    description: "Real time overview of the actual balance across all currencies with instant conversion rate",
  },
  {
    icon: RefreshCw,
    title: "Auto Swapper",
    description: "Aitomatically convert between fiat and crypto at optimal rates with intelligent routing.",
  },
  {
    icon: CreditCard,
    title: "Off & Ramp",
    description: "Seamlessly bridge between traditional banking and crypto ecosystem with minimal fees.",
  },
  {
    icon: Building2,
    title: "Bank Transfer",
    description: "Direct local bank transfer for easy Top ups and withdrawals in local currency.",
  },
  {
    icon: Coins,
    title: "USDT & USDC Support",
    description: "Native support for leading stablecoins ensuring price stability and fast transactions.",
  },
  {
    icon: ArrowLeftRight,
    title: "Instant Deposit and Withdrawal",
    description: "Lighting fast processing for desposit and withdrawals with industry leading security",
  },
]

export function FeaturesGrid() {
  return (
    <section className="bg-paygo-dark py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold text-white md:text-5xl">Powerful Features of Modern payments</h2>
          <p className="mt-4 text-lg text-gray-300">
            Everything you need to manage your digital assets and make seamless transactions
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/5 p-8 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/30 hover:shadow-2xl"
            >
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white">
                <feature.icon className="h-6 w-6" />
              </div>

              <h3 className="mb-3 text-xl font-bold text-white">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>

              {/* Glow effect on hover */}
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5 blur-3xl transition-all group-hover:bg-white/10" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
