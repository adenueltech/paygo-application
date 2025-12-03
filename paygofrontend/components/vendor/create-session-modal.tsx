"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CreateSessionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateSessionModal({ isOpen, onClose }: CreateSessionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#696E71] border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New Session</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Session Title</label>
            <Input
              placeholder="e.g., Legal Consultation"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Pricing Model</label>
              <Select defaultValue="per-min">
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#696E71] border-white/10 text-white">
                  <SelectItem value="per-min">Per Minute</SelectItem>
                  <SelectItem value="per-hour">Per Hour</SelectItem>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Rate (NGN)</label>
              <Input
                type="number"
                placeholder="500"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Date & Time</label>
            <div className="grid grid-cols-2 gap-4">
              <Input type="date" className="bg-white/5 border-white/10 text-white" />
              <Input type="time" className="bg-white/5 border-white/10 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Description</label>
            <textarea
              className="w-full h-24 rounded-md bg-white/5 border border-white/10 text-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="Describe what this session covers..."
            />
          </div>

          <div className="pt-4 flex gap-4">
            <Button
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10 bg-transparent"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button className="flex-1 bg-white text-black hover:bg-gray-200" onClick={onClose}>
              Create Session
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
