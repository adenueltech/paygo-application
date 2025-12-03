import { Edit, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const services = [
  {
    id: 1,
    name: "Web Development Consultation",
    category: "Development",
    price: "₦50,000",
    status: "active",
    clients: 12
  },
  {
    id: 2,
    name: "UI/UX Design Review",
    category: "Design",
    price: "₦30,000",
    status: "active",
    clients: 8
  },
  {
    id: 3,
    name: "Mobile App Development",
    category: "Development",
    price: "₦150,000",
    status: "inactive",
    clients: 3
  },
  {
    id: 4,
    name: "SEO Optimization",
    category: "Marketing",
    price: "₦25,000",
    status: "active",
    clients: 15
  }
]

export function ServiceManagementTable() {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Service Management</h3>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Add New Service
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Service</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Category</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Price</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Clients</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-4 px-4">
                  <div className="text-white font-medium">{service.name}</div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-gray-400 text-sm">{service.category}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-white font-medium">{service.price}</span>
                </td>
                <td className="py-4 px-4">
                  <Badge
                    variant={service.status === "active" ? "default" : "secondary"}
                    className={service.status === "active"
                      ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                    }
                  >
                    {service.status}
                  </Badge>
                </td>
                <td className="py-4 px-4">
                  <span className="text-gray-400 text-sm">{service.clients}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <button className="text-gray-400 hover:text-white transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-white transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-red-400 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}