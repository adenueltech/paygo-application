import { MoreHorizontal, Video, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

const sessions = [
  {
    id: 1,
    title: "Legal Consultation - Contract Review",
    client: "John Doe",
    time: "Now",
    status: "live",
    earnings: "₦500/min",
  },
  {
    id: 2,
    title: "Business Strategy Session",
    client: "Sarah Smith",
    time: "Today, 2:00 PM",
    status: "upcoming",
    earnings: "₦15,000 fixed",
  },
  {
    id: 3,
    title: "Tech Support - Server Setup",
    client: "Mike Johnson",
    time: "Tomorrow, 10:00 AM",
    status: "upcoming",
    earnings: "₦200/min",
  },
]

export function ActiveSessionsList() {
  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div
              className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                session.status === "live" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
              }`}
            >
              {session.status === "live" ? <Video className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
            </div>
            <div>
              <h4 className="text-white font-medium">{session.title}</h4>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>{session.client}</span>
                <span>•</span>
                <span className={session.status === "live" ? "text-red-400 font-medium" : ""}>{session.time}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-white font-medium">{session.earnings}</p>
              <p className="text-xs text-gray-500 capitalize">{session.status}</p>
            </div>
            <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
