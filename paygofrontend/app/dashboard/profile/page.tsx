"use client"

import { User, Mail, Phone, MapPin, Shield, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-gray-400">Manage your account information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white">
              J
            </div>
            <h2 className="text-xl font-bold text-white">Jeffery Bezos</h2>
            <p className="text-gray-400 text-sm mb-4">Premium Member</p>
            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent">
              Change Avatar
            </Button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Member Since</span>
              <span className="text-white">Oct 2023</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Total Spent</span>
              <span className="text-white">₦1,250,000</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Sessions</span>
              <span className="text-white">42</span>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input defaultValue="Jeffery Bezos" className="pl-10 bg-white/5 border-white/10 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input defaultValue="jeffery@example.com" className="pl-10 bg-white/5 border-white/10 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input defaultValue="+234 801 234 5678" className="pl-10 bg-white/5 border-white/10 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input defaultValue="Lagos, Nigeria" className="pl-10 bg-white/5 border-white/10 text-white" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button className="bg-white text-black hover:bg-gray-200">Save Changes</Button>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Notifications</h4>
                    <p className="text-sm text-gray-400">Receive alerts for sessions and payments</p>
                  </div>
                </div>
                <div className="h-6 w-11 bg-green-500 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Two-Factor Auth</h4>
                    <p className="text-sm text-gray-400">Secure your account with 2FA</p>
                  </div>
                </div>
                <div className="h-6 w-11 bg-gray-600 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
