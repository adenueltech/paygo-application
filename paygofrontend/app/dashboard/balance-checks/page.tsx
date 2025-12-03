import { BalanceSummary } from "@/components/dashboard/balance-summary"
import { BalanceCard } from "@/components/dashboard/balance-card"

const mockBalances = [
  {
    type: "Wallet",
    balance: 1250,
    currency: "$",
    lastUpdated: "5 minutes ago",
    status: "success" as const,
  },
  {
    type: "Bank Account",
    balance: 5000,
    currency: "$",
    lastUpdated: "1 hour ago",
    status: "success" as const,
  },
  {
    type: "Service A",
    balance: 300,
    currency: "$",
    lastUpdated: "2 hours ago",
    status: "warning" as const,
  },
  {
    type: "Service B",
    balance: 150,
    currency: "$",
    lastUpdated: "30 minutes ago",
    status: "success" as const,
  },
]

const totalBalance = mockBalances.reduce((sum, balance) => sum + balance.balance, 0)

export default function BalanceChecksPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Balance Checks</h1>
        <p className="text-gray-400">Monitor and verify balances across all your accounts and services.</p>
      </div>

      <BalanceSummary totalBalance={totalBalance} currency="$" />

      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Balance Sources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockBalances.map((balance, index) => (
            <BalanceCard
              key={index}
              type={balance.type}
              balance={balance.balance}
              currency={balance.currency}
              lastUpdated={balance.lastUpdated}
              status={balance.status}
            />
          ))}
        </div>
      </div>
    </div>
  )
}