"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTA() {
  return (
    <section className="bg-paygo-dark py-24 border-t border-white/10">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-4xl font-bold leading-tight text-white md:text-6xl">
            Ready to take control of your spending?
          </h2>

          <p className="mt-6 text-xl text-gray-300">
            Join thousands who are saving money with pay as you go services. Start today and pause anytime.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button className="h-14 rounded-full border border-black bg-transparent px-8 text-lg text-black hover:bg-black hover:text-white transition-all bg-white/90 hover:bg-white">
              Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              className="h-14 rounded-full border-white/30 bg-transparent px-8 text-lg text-white hover:bg-white/10"
            >
              Schedule Demo
            </Button>
          </div>

          <p className="mt-8 text-sm text-gray-400">
            No credit card required . Start in minutes . Bank- level security
          </p>
        </motion.div>
      </div>
    </section>
  )
}
