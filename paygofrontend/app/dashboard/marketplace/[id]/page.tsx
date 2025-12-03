"use client"

import { useState } from "react"
import { ArrowLeft, Star, Shield, Clock, Zap, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

// Mock data - in a real app this would come from an API based on the ID
const serviceData = {
  id: 1,
  name: "Netflix Premium",
  category: "Streaming",
  rating: 4.9,
  reviews: 1250,
  price: "₦50",
  unit: "hour",
  image: "N",
  color: "bg-red-600",
  description:
    "Watch TV shows, movies, and more. Pay only for the time you watch. No monthly subscription required. Pause anytime.",
  features: [
    "4K Ultra HD available",
    "Download for offline viewing",
    "No ads",
    "Watch on any device",
    "Pay per second billing",
    "Instant access",
  ],
  provider: {
    name: "Netflix Inc.",
    verified: true,
    joined: "2024",
  },
}

export default function ServiceDetailsPage({ params }: { params: { id: string } }) {
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const router = useRouter()

  const handleSubscribe = () => {
    setIsSubscribing(true)
    // Simulate API call/Balance check
    setTimeout(() => {
      setIsSubscribing(false)
      setShowPinModal(true)
    }, 1500)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/dashboard/marketplace"
        className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex items-start gap-6 mb-6">
              <div
                className={`h-20 w-20 rounded-2xl ${serviceData.color} flex items-center justify-center text-white text-4xl font-bold shadow-xl flex-shrink-0`}
              >
                {serviceData.image}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{serviceData.name}</h1>
                <div className="flex items-center gap-4 text-sm">
                  <span className="bg-white/10 text-white px-3 py-1 rounded-full">{serviceData.category}</span>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-medium">{serviceData.rating}</span>
                    <span className="text-gray-400">({serviceData.reviews} reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="prose prose-invert max-w-none">
              <h3 className="text-xl font-semibold text-white mb-4">About this service</h3>
              <p className="text-gray-300 leading-relaxed mb-6">{serviceData.description}</p>

              <h3 className="text-xl font-semibold text-white mb-4">Key Features</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {serviceData.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-300">
                    <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-green-400" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-white mb-6">How it works</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-blue-400" />
                </div>
                <h4 className="text-white font-medium mb-2">Subscribe</h4>
                <p className="text-sm text-gray-400">Get instant access with a unique PIN code</p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-purple-400" />
                </div>
                <h4 className="text-white font-medium mb-2">Use Service</h4>
                <p className="text-sm text-gray-400">Enter PIN on provider site to start session</p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-green-400" />
                </div>
                <h4 className="text-white font-medium mb-2">Pay as you go</h4>
                <p className="text-sm text-gray-400">Balance deducted only for time used</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24">
            <div className="mb-6">
              <p className="text-gray-400 text-sm mb-1">Pricing</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">{serviceData.price}</span>
                <span className="text-gray-400">/{serviceData.unit}</span>
              </div>
            </div>

            <Button
              className="w-full bg-white text-black hover:bg-gray-200 h-12 text-lg font-medium mb-4"
              onClick={handleSubscribe}
              disabled={isSubscribing}
            >
              {isSubscribing ? "Processing..." : "Subscribe Now"}
            </Button>

            <p className="text-xs text-center text-gray-500 mb-6">
              By subscribing you agree to our terms of service. Balance will be checked before activation.
            </p>

            <div className="border-t border-white/10 pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                  {serviceData.provider.name[0]}
                </div>
                <div>
                  <p className="text-sm text-gray-400">Provided by</p>
                  <div className="flex items-center gap-1">
                    <span className="text-white font-medium">{serviceData.provider.name}</span>
                    {serviceData.provider.verified && <Shield className="h-3 w-3 text-blue-400 fill-blue-400" />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PIN Modal */}
      <AnimatePresence>
        {showPinModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={() => setShowPinModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
            >
              <div className="bg-[#696E71] border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
                <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="h-8 w-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Subscription Active!</h2>
                <p className="text-gray-300 mb-8">Use this PIN code to access {serviceData.name}.</p>

                <div className="bg-black/30 rounded-xl p-6 mb-8 border border-white/10">
                  <span className="text-4xl font-mono font-bold text-white tracking-widest">8492-1039</span>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10 bg-transparent"
                    onClick={() => setShowPinModal(false)}
                  >
                    Close
                  </Button>
                  <Button
                    className="flex-1 bg-white text-black hover:bg-gray-200"
                    onClick={() => {
                      setShowPinModal(false)
                      router.push("/dashboard")
                    }}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
