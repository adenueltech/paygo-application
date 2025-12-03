"use client"

import { useState } from "react"
import { Wallet, ChevronDown, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConnectWalletModal } from "./connect-wallet-modal"
import { motion } from "framer-motion"
import Link from "next/link"

export function Navbar() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <nav className="absolute top-0 left-0 right-0 z-40 w-full px-6 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 text-white">
            <Wallet className="h-8 w-8" />
            <span className="text-2xl font-bold">PayGo</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-gray-300">
            <a href="#" className="hover:text-white transition-colors">
              Home
            </a>
            <a href="#" className="hover:text-white transition-colors">
              AboutUs
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Benefits
            </a>
            <a href="#" className="hover:text-white transition-colors">
              ContactUs
            </a>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button className="flex items-center gap-1 text-gray-300 hover:text-white border border-white/20 rounded-full px-3 py-1 text-sm">
              EN <ChevronDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-1 text-gray-300 hover:text-white border border-white/20 rounded-full px-3 py-1 text-sm">
              NGN <ChevronDown className="h-3 w-3" />
            </button>
            <Link href="/auth" className="text-white hover:text-gray-200 font-medium">
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 bg-[#696E71] p-6 md:hidden flex flex-col gap-4 shadow-xl border-t border-white/10"
          >
            <a href="#" className="text-white py-2">
              Home
            </a>
            <a href="#" className="text-white py-2">
              AboutUs
            </a>
            <a href="#" className="text-white py-2">
              Benefits
            </a>
            <a href="#" className="text-white py-2">
              ContactUs
            </a>
            <div className="flex gap-4 py-2">
              <button className="text-white border border-white/20 rounded-full px-3 py-1 text-sm">EN</button>
              <button className="text-white border border-white/20 rounded-full px-3 py-1 text-sm">NGN</button>
            </div>
            <Link href="/auth" className="text-white text-left py-2">
              Sign Up
            </Link>
          </motion.div>
        )}
      </nav>

      <ConnectWalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
