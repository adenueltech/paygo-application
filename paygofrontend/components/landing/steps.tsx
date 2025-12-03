"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export function Steps() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-20 text-center">
          <h2 className="text-5xl font-bold text-black">Get Started in Minutes</h2>
          <p className="mt-4 text-xl text-gray-600">Three simple steps for you to start managing your digital assets</p>
        </div>

        <div className="relative grid gap-12 md:grid-cols-3">
          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <span className="text-8xl font-light text-black">01</span>
            <div className="mt-8">
              <h3 className="text-xl font-bold text-black">Sign Up & verify</h3>
              <p className="mt-2 text-gray-600">
                Create your account and complete quick identity verification for security
              </p>
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="relative md:mt-24"
          >
            <span className="text-8xl font-light text-black">02</span>
            <div className="mt-8">
              <ArrowRight className="absolute -top-20 left-0 h-8 w-8 text-black md:hidden" />
              <h3 className="text-xl font-bold text-black">Add Funds</h3>
              <p className="mt-2 text-gray-600">
                Top up your wallet Using bank transfer card or crypto deposit options.
              </p>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            className="relative md:mt-48"
          >
            <span className="text-8xl font-light text-black">03</span>
            <div className="mt-8">
              <h3 className="text-xl font-bold text-black">Start Transacting</h3>
              <p className="mt-2 text-gray-600">
                Send recieve, and swap between fiat and crypto instantly with low fees.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
