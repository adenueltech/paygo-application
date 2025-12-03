"use client"

import { motion } from "framer-motion"
import { Tv, Video, Briefcase, Zap, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const services = [
  {
    icon: Tv,
    title: "Streaming & Services",
    description: "Netflix, GoTv, DSTV- Pay only for the time you watch",
    price: "From NGN5/hour",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Video,
    title: "Live Consultations",
    description: "Connect with lawyers, doctors, tutors in real-time",
    price: "From NGN200/min",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    icon: Briefcase,
    title: "SaaS Tools",
    description: "Access premuim software on a pay-per use basis",
    price: "From NGN50/hour",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Zap,
    title: "Data & Utilities",
    description: "GLO, MTN, Airtel - Top Up instatly has you need",
    price: "From 2NGN/MB",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
]

export function Services() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold text-black md:text-5xl">Services Available on PayGo</h2>
          <p className="mt-4 text-lg text-gray-600">
            Choose from hundreds of services. Per Pay use pause anytime cancel instantly
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 transition-all hover:shadow-xl"
            >
              <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl ${service.bgColor}`}>
                <service.icon className={`h-6 w-6 ${service.color}`} />
              </div>

              <h3 className="mb-3 text-2xl font-bold text-black">{service.title}</h3>
              <p className="mb-8 text-gray-600">{service.description}</p>

              <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                <span className="font-medium text-black">{service.price}</span>
                <button className="flex items-center gap-2 font-medium text-black transition-colors group-hover:text-gray-600">
                  Explore <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            variant="outline"
            className="h-12 rounded-none border-black px-8 text-black hover:bg-black hover:text-white bg-transparent"
          >
            View All
          </Button>
        </div>
      </div>
    </section>
  )
}
