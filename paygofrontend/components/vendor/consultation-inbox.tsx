import { Check, X, Clock, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const consultations = [
  {
    id: 1,
    client: "John Doe",
    service: "Web Development Consultation",
    message: "Need help with React app architecture and best practices.",
    time: "2 hours ago",
    status: "pending",
    avatar: "/placeholder-user.jpg"
  },
  {
    id: 2,
    client: "Sarah Wilson",
    service: "UI/UX Design Review",
    message: "Looking for feedback on my mobile app design.",
    time: "4 hours ago",
    status: "pending",
    avatar: "/placeholder-user.jpg"
  },
  {
    id: 3,
    client: "Mike Johnson",
    service: "SEO Optimization",
    message: "Want to improve my website's search rankings.",
    time: "1 day ago",
    status: "accepted",
    avatar: "/placeholder-user.jpg"
  }
]

export function ConsultationInbox() {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Consultation Requests</h3>
        <Badge className="bg-blue-500/20 text-blue-400">
          {consultations.filter(c => c.status === "pending").length} Pending
        </Badge>
      </div>

      <div className="space-y-4">
        {consultations.map((consultation) => (
          <div key={consultation.id} className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
            <img
              src={consultation.avatar}
              alt={consultation.client}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-white font-medium">{consultation.client}</h4>
                  <Badge
                    variant="outline"
                    className="text-xs bg-white/10 text-gray-300 border-white/20"
                  >
                    {consultation.service}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  {consultation.time}
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-3">{consultation.message}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-400">Consultation Request</span>
                </div>
                {consultation.status === "pending" ? (
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                      <X className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                ) : (
                  <Badge className="bg-green-500/20 text-green-400">
                    Accepted
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {consultations.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No consultation requests yet.</p>
        </div>
      )}
    </div>
  )
}