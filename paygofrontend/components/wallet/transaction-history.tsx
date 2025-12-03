import { ArrowUpRight, ArrowDownLeft, RefreshCw, Play, Clock, CheckCircle } from "lucide-react"

const transactions = [
  {
    id: 1,
    type: "payment",
    title: "Netflix Premium",
    date: "Today, 10:23 AM",
    amount: "-₦50.00",
    status: "completed",
    icon: Play,
    color: "bg-red-500",
  },
  {
    id: 2,
    type: "deposit",
    title: "Top Up via Bank",
    date: "Yesterday, 4:15 PM",
    amount: "+₦50,000.00",
    status: "completed",
    icon: ArrowDownLeft,
    color: "bg-green-500",
  },
  {
    id: 3,
    type: "swap",
    title: "USDT to NGN",
    date: "Yesterday, 4:10 PM",
    amount: "50 USDT",
    status: "completed",
    icon: RefreshCw,
    color: "bg-blue-500",
  },
  {
    id: 4,
    type: "payment",
    title: "Legal Consultation",
    date: "Oct 24, 2:30 PM",
    amount: "-₦4,500.00",
    status: "completed",
    icon: Play,
    color: "bg-purple-500",
  },
  {
    id: 5,
    type: "withdrawal",
    title: "Withdrawal to Bank",
    date: "Oct 22, 9:00 AM",
    amount: "-₦10,000.00",
    status: "completed",
    icon: ArrowUpRight,
    color: "bg-gray-500",
  },
]

const pendingTransactions = [
  {
    id: 6,
    type: "withdrawal",
    title: "Bank Withdrawal",
    date: "2 hours ago",
    amount: "-₦25,000.00",
    status: "pending",
    icon: Clock,
    color: "bg-yellow-500",
    estimatedTime: "1-3 business days",
  },
  {
    id: 7,
    type: "deposit",
    title: "Crypto Deposit (BTC)",
    date: "4 hours ago",
    amount: "+₦150,000.00",
    status: "processing",
    icon: Clock,
    color: "bg-blue-500",
    estimatedTime: "10-30 minutes",
  },
]

export function TransactionHistory() {
  return (
    <div className="space-y-6">
      {/* Pending Transactions */}
      {pendingTransactions.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-white font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-400" />
            Pending Transactions ({pendingTransactions.length})
          </h4>
          {pendingTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 hover:bg-yellow-500/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-full ${tx.color}/20 flex items-center justify-center`}>
                  <tx.icon className={`h-5 w-5 ${tx.color.replace("bg-", "text-")}`} />
                </div>
                <div>
                  <h4 className="text-white font-medium">{tx.title}</h4>
                  <p className="text-sm text-gray-400">{tx.date}</p>
                  <p className="text-xs text-yellow-400">{tx.estimatedTime}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-medium ${tx.amount.startsWith("+") ? "text-green-400" : "text-white"}`}>{tx.amount}</p>
                <p className="text-xs text-yellow-400 capitalize flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></div>
                  {tx.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed Transactions */}
      <div className="space-y-4">
        <h4 className="text-white font-medium flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-400" />
          Recent Transactions
        </h4>
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className={`h-10 w-10 rounded-full ${tx.color}/20 flex items-center justify-center`}>
                <tx.icon className={`h-5 w-5 ${tx.color.replace("bg-", "text-")}`} />
              </div>
              <div>
                <h4 className="text-white font-medium">{tx.title}</h4>
                <p className="text-sm text-gray-400">{tx.date}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-medium ${tx.amount.startsWith("+") ? "text-green-400" : "text-white"}`}>{tx.amount}</p>
              <p className="text-xs text-gray-500 capitalize">{tx.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
