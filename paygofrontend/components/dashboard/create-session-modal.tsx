"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, DollarSign, Users, Video, CheckCircle, Loader2 } from "lucide-react"

interface CreateSessionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateSessionModal({ isOpen, onClose }: CreateSessionModalProps) {
  const [step, setStep] = useState(1)
  const [sessionType, setSessionType] = useState<"consultation" | "streaming">("consultation")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [pricingType, setPricingType] = useState<"minute" | "hour" | "fixed">("minute")
  const [rate, setRate] = useState("")
  const [duration, setDuration] = useState("")
  const [maxParticipants, setMaxParticipants] = useState("1")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCreate = async () => {
    setIsProcessing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsProcessing(false)
    setStep(2)
  }

  const resetModal = () => {
    setStep(1)
    setSessionType("consultation")
    setTitle("")
    setDescription("")
    setPricingType("minute")
    setRate("")
    setDuration("")
    setMaxParticipants("1")
    setIsProcessing(false)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#696E71] border-white/10 text-white sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {step === 1 ? "Create New Session" : "Session Created!"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 1 && (
            <>
              {/* Session Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">Session Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSessionType("consultation")}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
                      sessionType === "consultation"
                        ? "bg-white/10 border-white text-white"
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    <Users className="h-6 w-6" />
                    <span className="text-sm font-medium">Consultation</span>
                  </button>
                  <button
                    onClick={() => setSessionType("streaming")}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
                      sessionType === "streaming"
                        ? "bg-white/10 border-white text-white"
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    <Video className="h-6 w-6" />
                    <span className="text-sm font-medium">Live Streaming</span>
                  </button>
                </div>
              </div>

              {/* Session Details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-300">Session Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Legal Consultation, Financial Planning"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-300">Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                    placeholder="Describe what this session covers..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 min-h-[80px]"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-300">Pricing</Label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setPricingType("minute")}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      pricingType === "minute"
                        ? "bg-white/10 border-white text-white"
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-sm font-medium">Per Minute</span>
                  </button>
                  <button
                    onClick={() => setPricingType("hour")}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      pricingType === "hour"
                        ? "bg-white/10 border-white text-white"
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-sm font-medium">Per Hour</span>
                  </button>
                  <button
                    onClick={() => setPricingType("fixed")}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      pricingType === "fixed"
                        ? "bg-white/10 border-white text-white"
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-sm font-medium">Fixed Rate</span>
                  </button>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      type="number"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      placeholder={`Rate in ₦/${pricingType === "fixed" ? "" : pricingType === "hour" ? "hr" : "min"}`}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    />
                  </div>
                  {pricingType !== "fixed" && (
                    <div className="w-32">
                      <Input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="Duration"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Settings */}
              {sessionType === "streaming" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-300">Maximum Participants</Label>
                  <Select value={maxParticipants} onValueChange={setMaxParticipants}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#696E71] border-white/10 text-white">
                      <SelectItem value="1">1 participant</SelectItem>
                      <SelectItem value="10">Up to 10</SelectItem>
                      <SelectItem value="50">Up to 50</SelectItem>
                      <SelectItem value="100">Up to 100</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Summary */}
              <div className="bg-black/20 rounded-lg p-4 space-y-2">
                <h4 className="text-white font-medium">Session Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white capitalize">{sessionType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rate:</span>
                    <span className="text-white">
                      ₦{rate || "0"}/{pricingType === "fixed" ? "session" : pricingType === "hour" ? "hr" : "min"}
                    </span>
                  </div>
                  {duration && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Duration:</span>
                      <span className="text-white">{duration} {pricingType === "hour" ? "hours" : "minutes"}</span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={handleCreate}
                className="w-full bg-white text-black hover:bg-gray-200 h-12 text-lg"
                disabled={!title || !rate || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Session...
                  </>
                ) : (
                  "Create Session"
                )}
              </Button>
            </>
          )}

          {step === 2 && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Session Created!</h3>
                <p className="text-gray-400">
                  Your {sessionType} session "{title}" has been created and is now live.
                </p>
              </div>
              <div className="bg-black/20 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Session ID:</span>
                  <span className="text-white font-mono">SES_{Date.now()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-green-400">Active</span>
                </div>
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10 bg-transparent"
                  onClick={() => setStep(1)}
                >
                  Create Another
                </Button>
                <Button
                  className="flex-1 bg-white text-black hover:bg-gray-200"
                  onClick={handleClose}
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}