"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wallet, ArrowRight, Check, CreditCard, Smartphone, Monitor, Briefcase, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

const steps = [
  { id: "wallet", title: "Setup Wallet" },
  { id: "topup", title: "Add Funds" },
  { id: "interests", title: "Select Interests" },
  { id: "complete", title: "All Set" },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      const userType = localStorage.getItem("userType") || "user"
      router.push(userType === "vendor" ? "/dashboard/vendor" : "/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-[#696E71] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between mb-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${index <= currentStep ? "text-white" : "text-gray-500"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors ${
                    index <= currentStep ? "bg-white text-black" : "bg-white/10"
                  }`}
                >
                  {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span className="text-xs font-medium">{step.title}</span>
              </div>
            ))}
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-xl min-h-[400px] flex flex-col">
          <AnimatePresence mode="wait">
            {currentStep === 0 && <WalletSetup key="wallet" onNext={nextStep} />}
            {currentStep === 1 && <TopUp key="topup" onNext={nextStep} />}
            {currentStep === 2 && <InterestSelection key="interests" onNext={nextStep} />}
            {currentStep === 3 && <Completion key="complete" onNext={nextStep} />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function WalletSetup({ onNext }: { onNext: () => void }) {
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateWallet = async () => {
    setIsCreating(true)
    // Simulate wallet creation
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsCreating(false)
    onNext()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      <h2 className="text-2xl font-bold text-white mb-2">Creating Your Wallet</h2>
      <p className="text-gray-300 mb-8">We're setting up your secure digital wallet automatically.</p>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Wallet className="h-12 w-12 text-white" />
            </div>
            {isCreating && (
              <motion.div
                className="absolute inset-0 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            )}
          </div>

          {!isCreating ? (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-green-300 font-medium">Wallet Created Successfully!</span>
                </div>
                <p className="text-green-200 text-sm mt-1">Your secure wallet is ready to use</p>
              </div>
              <Button onClick={onNext} className="bg-white text-black hover:bg-gray-200 px-8">
                Continue
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-white text-lg font-medium">Setting up your wallet...</div>
              <div className="flex justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!isCreating && (
        <div className="mt-auto">
          <div className="bg-white/5 rounded-lg p-4 space-y-2">
            <h4 className="text-white font-medium text-sm">Your Wallet Details</h4>
            <div className="text-xs text-gray-400 space-y-1">
              <div>Address: 0x71C...39A2</div>
              <div>Network: Ethereum & Polygon</div>
              <div>Security: Hardware-backed encryption</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

function TopUp({ onNext }: { onNext: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      <h2 className="text-2xl font-bold text-white mb-2">Add Funds</h2>
      <p className="text-gray-300 mb-8">Top up your wallet to start using services immediately.</p>

      <div className="flex-1 flex flex-col justify-center items-center mb-8">
        <div className="w-full max-w-xs">
          <label className="text-sm font-medium text-gray-300 mb-2 block">Amount (NGN)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">₦</span>
            <Input
              type="number"
              defaultValue="1000"
              className="pl-8 text-2xl font-bold bg-white/5 border-white/10 text-white h-16"
            />
          </div>
          <div className="flex gap-2 mt-4">
            {[1000, 5000, 10000].map((amount) => (
              <button
                key={amount}
                className="flex-1 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                ₦{amount.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="ghost" onClick={onNext} className="text-gray-400 hover:text-white">
          Skip for now
        </Button>
        <Button onClick={onNext} className="bg-white text-black hover:bg-gray-200">
          Add Funds
        </Button>
      </div>
    </motion.div>
  )
}

function InterestSelection({ onNext }: { onNext: () => void }) {
  const [selected, setSelected] = useState<string[]>([])

  const toggleInterest = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const interests = [
    { id: "entertainment", title: "Entertainment", icon: Monitor, desc: "Streaming, Gaming, Music" },
    { id: "saas", title: "SaaS Tools", icon: Database, desc: "Productivity, Design, Dev" },
    { id: "consultation", title: "Consultation", icon: Briefcase, desc: "Legal, Medical, Advisory" },
    { id: "utilities", title: "Data & Utilities", icon: Smartphone, desc: "Internet, Airtime, Bills" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      <h2 className="text-2xl font-bold text-white mb-2">What are you interested in?</h2>
      <p className="text-gray-300 mb-8">We'll personalize your dashboard based on your needs.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {interests.map((interest) => (
          <button
            key={interest.id}
            onClick={() => toggleInterest(interest.id)}
            className={`p-4 rounded-xl border text-left transition-all ${
              selected.includes(interest.id)
                ? "bg-white text-black border-white"
                : "bg-white/5 border-white/10 text-white hover:bg-white/10"
            }`}
          >
            <interest.icon
              className={`h-6 w-6 mb-3 ${selected.includes(interest.id) ? "text-black" : "text-gray-400"}`}
            />
            <h3 className="font-medium">{interest.title}</h3>
            <p className={`text-sm ${selected.includes(interest.id) ? "text-gray-600" : "text-gray-400"}`}>
              {interest.desc}
            </p>
          </button>
        ))}
      </div>

      <div className="flex justify-end mt-auto">
        <Button onClick={onNext} className="bg-white text-black hover:bg-gray-200 px-8">
          Continue
        </Button>
      </div>
    </motion.div>
  )
}

function Completion({ onNext }: { onNext: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col h-full items-center justify-center text-center"
    >
      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
        <Check className="h-10 w-10 text-green-400" />
      </div>
      <h2 className="text-3xl font-bold text-white mb-4">You're all set!</h2>
      <p className="text-gray-300 max-w-md mb-8">
        Your wallet is ready and your dashboard has been personalized. You can pause or stop payments anytime and track
        spending in real-time.
      </p>

      <Button onClick={onNext} className="bg-white text-black hover:bg-gray-200 px-8 py-6 text-lg">
        Go to Dashboard
      </Button>
    </motion.div>
  )
}
