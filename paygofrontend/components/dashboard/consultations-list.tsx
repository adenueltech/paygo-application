import { MessageSquare, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const consultations = [
  {
    id: 1,
    vendor: "Tech Solutions Inc.",
    service: "Web Development Consultation",
    status: "pending",
    date: "2023-11-20",
    avatar: "/placeholder-logo.png"
  },
  {
    id: 2,
    vendor: "Design Studio",
    service: "UI/UX Design Review",
    status: "accepted",
    date: "2023-11-19",
    avatar: "/placeholder-logo.png"
  },
  {
    id: 3,
    vendor: "SEO Experts",
    service: "SEO Optimization",
    status: "completed",
    date: "2023-11-18",
    avatar: "/placeholder-logo.png"
  }
]

export function ConsultationsList() {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">My Consultations</h3>
        <Badge className="bg-blue-500/20 text-blue-400">
          {consultations.length} Total
        </Badge>
      </div>

      <div className="space-y-4">
        {consultations.map((consultation) => (
          <div key={consultation.id} className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
            <img
              src={consultation.avatar}
              alt={consultation.vendor}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-white font-medium">{consultation.vendor}</h4>
                  <Badge
                    variant="outline"
                    className="text-xs bg-white/10 text-gray-300 border-white/20"
                  >
                    {consultation.service}
                  </Badge>
                </div>
                <div className="text-xs text-gray-400">
                  {consultation.date}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge
                  className={`${
                    consultation.status === "pending"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : consultation.status === "accepted"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                </Badge>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Message
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {consultations.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No consultations yet.</p>
        </div>
      )}
    </div>
  )
}