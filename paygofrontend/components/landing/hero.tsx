"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Image from "next/image"


export function Hero() {
  return (
    <section className="relative min-h-screen w-full bg-paygo-dark overflow-hidden pt-32 flex items-center">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 md:grid-cols-2 md:items-center">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-8 z-10"
        >
          <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl">
            Pay only for what you use across all your services
          </h1>

          <p className="text-lg text-gray-300 md:text-xl max-w-xl">
            From streaming and consultations to SaaS tools and utilities pay per use, pause anytime, and keep full
            control of your spending with our hybrid fiat and crypto wallet.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button className="h-12 rounded-full border border-white bg-transparent px-8 text-base text-white hover:bg-white hover:text-black transition-all">
              Explore Marketplace
            </Button>
            <Button className="h-12 rounded-full border border-white/30 bg-white/10 px-8 text-base text-white hover:bg-white/20 backdrop-blur-sm transition-all">
              Join as a Professional
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-8 border-t border-white/10 pt-8">
            <div>
              <h3 className="text-2xl font-bold text-white">$2.5B+</h3>
              <p className="text-sm text-gray-400">Transaction Volume</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">500K+</h3>
              <p className="text-sm text-gray-400">Active Users</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">99.9%</h3>
              <p className="text-sm text-gray-400">Uptime</p>
            </div>
          </div>
        </motion.div>

        {/* Image Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative h-full min-h-[400px] w-full flex items-center justify-center"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 blur-[100px] rounded-full" />

          <Image
            src="/heroimg.png"
            alt="Future of Payments"
            width={400}
            height={400}
            className="relative z-10 h-auto w-full max-w-md object-contain drop-shadow-2xl"
            priority
          />
        </motion.div>
      </div>
    </section>
  )
}
