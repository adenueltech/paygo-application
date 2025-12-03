'use client'

import { useAuth } from "@/lib/auth"
import { WalletCard } from "@/components/dashboard/wallet-card"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { SpendingOverview } from "@/components/dashboard/spending-overview"
import { ActiveServices } from "@/components/dashboard/active-services"
import { ConsultationsList } from "@/components/dashboard/consultations-list"
import { AnalyticsMetrics } from "@/components/dashboard/analytics-metrics"
import { MonthlySpendingChart } from "@/components/dashboard/monthly-spending-chart"
import { TopServicesChart } from "@/components/dashboard/top-services-chart"
import { UsageOverTimeChart } from "@/components/dashboard/usage-over-time-chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="w-full max-w-full">
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 w-full">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user?.name || 'User'}
          </h1>
          <p className="text-gray-400">Here's what's happening with your services today.</p>
        </div>

        {/* Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">

          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            <WalletCard />

            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
              <QuickActions />
            </div>

            <Tabs defaultValue="active" className="w-full">
              <TabsList className="bg-white/5 border border-white/10 text-gray-400 overflow-x-auto">
                <TabsTrigger value="active" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
                  Active Services
                </TabsTrigger>
                <TabsTrigger value="subscriptions" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
                  Subscriptions
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
                  History
                </TabsTrigger>
                <TabsTrigger value="consultations" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
                  Consultations
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-4">
                <ActiveServices />
              </TabsContent>

              <TabsContent value="subscriptions" className="mt-4">
                <div className="rounded-xl bg-white/5 border border-white/10 p-8 text-center text-gray-400">
                  No active subscriptions found.
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <div className="rounded-xl bg-white/5 border border-white/10 p-8 text-center text-gray-400">
                  No transaction history yet.
                </div>
              </TabsContent>

              <TabsContent value="consultations" className="mt-4">
                <ConsultationsList />
              </TabsContent>

              <TabsContent value="analytics" className="mt-4 space-y-6">
                <AnalyticsMetrics />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <MonthlySpendingChart />
                  <TopServicesChart />
                </div>

                <UsageOverTimeChart />
              </TabsContent>
            </Tabs>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-8">
            <SpendingOverview />

            <div className="rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Did you know?</h3>
              <p className="text-blue-100 text-sm mb-4">
                You saved ₦1,000 this month by pausing unused services automatically.
              </p>
              <button className="text-sm font-medium bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg w-full">
                View Savings Report
              </button>
            </div>

            <div className="rounded-xl bg-white/5 border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Suggested for you</h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-700 flex items-center justify-center text-white font-bold">
                    S
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-medium">Spotify Premium</h4>
                    <p className="text-xs text-gray-400">Music • ₦20/hr</p>
                  </div>
                  <button className="ml-auto text-xs bg-white text-black px-3 py-1 rounded-full hover:bg-gray-200">Add</button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                    Z
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-medium">Zoom Pro</h4>
                    <p className="text-xs text-gray-400">SaaS • ₦100/hr</p>
                  </div>
                  <button className="ml-auto text-xs bg-white text-black px-3 py-1 rounded-full hover:bg-gray-200">Add</button>
                </div>
              </div>
            </div>
          </div>
        </div> {/* end grid */}
      </div>
    </div>
  )
}
