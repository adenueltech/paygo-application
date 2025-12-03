import { Users, DollarSign, Clock, Star } from "lucide-react"

const stats = [
  {
    title: "Total Revenue",
    value: "₦125,000",
    change: "+15%",
    icon: DollarSign,
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    title: "Active Sessions",
    value: "24",
    change: "+4",
    icon: Clock,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    title: "Total Clients",
    value: "156",
    change: "+12%",
    icon: Users,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    title: "Average Rating",
    value: "4.9",
    change: "0.2",
    icon: Star,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
]

export function VendorStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
              {stat.change}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
          <p className="text-sm text-gray-400">{stat.title}</p>
        </div>
      ))}
    </div>
  )
}
