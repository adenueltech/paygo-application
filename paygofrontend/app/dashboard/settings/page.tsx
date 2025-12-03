"use client"

import { Globe, Moon, Lock, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">App Settings</h1>
        <p className="text-gray-400">Configure your application preferences.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="divide-y divide-white/10">
          <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Globe className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Language & Region</h3>
                <p className="text-sm text-gray-400">English (US) • Nigeria</p>
              </div>
            </div>
            <Button variant="ghost" className="text-gray-400">
              Edit
            </Button>
          </div>

          <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Moon className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Appearance</h3>
                <p className="text-sm text-gray-400">Dark Mode</p>
              </div>
            </div>
            <Button variant="ghost" className="text-gray-400">
              Edit
            </Button>
          </div>

          <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Lock className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Privacy & Security</h3>
                <p className="text-sm text-gray-400">Manage data and permissions</p>
              </div>
            </div>
            <Button variant="ghost" className="text-gray-400">
              View
            </Button>
          </div>

          <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Help & Support</h3>
                <p className="text-sm text-gray-400">FAQs and Customer Service</p>
              </div>
            </div>
            <Button variant="ghost" className="text-gray-400">
              Open
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <p className="text-sm text-gray-500">Version 1.0.0 • Build 2024.10.24</p>
      </div>
    </div>
  )
}
