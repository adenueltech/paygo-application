import { MoreHorizontal, Play, Pause, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const services = [
  {
    id: 1,
    name: "Netflix Premium",
    category: "Streaming",
    status: "active",
    rate: "₦50/hr",
    usage: "2h 15m",
    cost: "₦112.50",
    icon: "N",
    color: "bg-red-600",
  },
  {
    id: 2,
    name: "Legal Consultation",
    category: "Professional",
    status: "paused",
    rate: "₦200/min",
    usage: "45m",
    cost: "₦9,000",
    icon: "L",
    color: "bg-blue-600",
  },
  {
    id: 3,
    name: "AWS Server",
    category: "SaaS",
    status: "active",
    rate: "₦15/hr",
    usage: "24h",
    cost: "₦360.00",
    icon: "A",
    color: "bg-orange-500",
  },
]

export function ActiveServices() {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Active Services</h3>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          View All
        </Button>
      </div>
      <div className="divide-y divide-white/10">
        {services.map((service) => (
          <div key={service.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <div
                className={`h-10 w-10 rounded-lg ${service.color} flex items-center justify-center text-white font-bold`}
              >
                {service.icon}
              </div>
              <div>
                <h4 className="text-white font-medium">{service.name}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>{service.category}</span>
                  <span>•</span>
                  <span>{service.rate}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right hidden md:block">
                <p className="text-white font-medium">{service.cost}</p>
                <p className="text-sm text-gray-400">{service.usage}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className={`h-8 w-8 rounded-full ${
                    service.status === "active"
                      ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10"
                      : "text-green-400 hover:text-green-300 hover:bg-green-400/10"
                  }`}
                >
                  {service.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-white">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#696E71] border-white/10 text-white">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">View Details</DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">Usage History</DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem className="text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Stop Service
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
