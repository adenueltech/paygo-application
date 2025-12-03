"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { 
  Wallet, LayoutDashboard, ShoppingBag, Video, Settings, 
  LogOut, User, Briefcase, X 
} from "lucide-react"
import { cn } from "@/lib/utils"

const userNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Services & Sessions", href: "/dashboard/marketplace", icon: ShoppingBag },
  { name: "Wallet", href: "/dashboard/wallet", icon: Wallet },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

const vendorNavigation = [
  { name: "Dashboard", href: "/dashboard/vendor", icon: LayoutDashboard },
  { name: "Services", href: "/dashboard/vendor", icon: Briefcase },
  { name: "Wallet", href: "/dashboard/wallet", icon: Wallet },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

interface SidebarProps {
  isMobileMenuOpen?: boolean
  setIsMobileMenuOpen?: (open: boolean) => void
}

export function Sidebar({ isMobileMenuOpen = false, setIsMobileMenuOpen }: SidebarProps = {}) {
  const pathname = usePathname()
  const router = useRouter()
  const [userType, setUserType] = useState<"user" | "vendor">("user")

  useEffect(() => {
    const stored = localStorage.getItem("userType") as "user" | "vendor" | null
    if (stored) setUserType(stored)
  }, [])

  const navigation = userType === "vendor" ? vendorNavigation : userNavigation

  const handleSignOut = () => {
    localStorage.removeItem("userType")
    router.push("/")
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen?.(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 flex flex-col h-full shrink-0",
          "bg-[#696E71] border-r border-white/10 transition-transform duration-300 ease-in-out",
          "w-56 sm:w-60 lg:w-64", // Responsive sidebar width
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo + Close */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-white/10 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2 text-white">
            <Wallet className="h-8 w-8" />
            <span className="text-xl font-bold">PayGo</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen?.(false)}
            className="lg:hidden text-white hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen?.(false)}
                  className={cn(
                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive ? "bg-white/10 text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-4 shrink-0">
          <button
            onClick={handleSignOut}
            className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  )
}
