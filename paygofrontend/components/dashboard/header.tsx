"use client"

import { Bell, Search, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  onMobileMenuToggle?: () => void
}

export function Header({ onMobileMenuToggle }: HeaderProps = {}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/10 bg-[#696E71]/95 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-[#696E71]/60">
      
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-gray-300 hover:text-white hover:bg-white/10 mr-2 shrink-0"
        onClick={onMobileMenuToggle}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </Button>

      {/* Search Input */}
      <div className="flex flex-1 items-center gap-4 min-w-0">
        <div className="relative w-full flex-1 min-w-0 max-w-sm sm:max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search services, transactions..."
            className="w-full bg-white/5 border-white/10 pl-9 text-white placeholder:text-gray-400 focus-visible:ring-white/20"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-white/10">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* Avatar Placeholder */}
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border border-white/20" />
      </div>
    </header>
  )
}
