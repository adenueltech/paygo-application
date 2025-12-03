"use client"
import { Video, Calendar, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

const upcomingSessions = [
  {
    id: 1,
    title: "Legal Consultation",
    provider: "Barr. Sarah James",
    time: "Today, 2:00 PM",
    duration: "30 mins",
    rate: "₦500/min",
    status: "upcoming",
    image: "S",
    color: "bg-blue-600",
  },
  {
    id: 2,
    title: "Financial Advisory",
    provider: "Mike Ross",
    time: "Tomorrow, 10:00 AM",
    duration: "1 hour",
    rate: "₦15,000 fixed",
    status: "upcoming",
    image: "M",
    color: "bg-green-600",
  },
]

export default function SessionsPage() {
  const router = useRouter()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Live Sessions</h1>
        <p className="text-gray-400">Join your scheduled consultations and manage bookings.</p>
      </div>

      {/* Active Session Card */}
      <div className="bg-gradient-to-r from-red-900/50 to-red-600/20 border border-red-500/30 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="text-red-400 font-medium text-sm">Live Now</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white mb-2">Medical Consultation</h2>
          <p className="text-gray-300 mb-6">Dr. Emily Watson • General Practitioner</p>

          <div className="flex flex-wrap gap-6 mb-8">
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="h-5 w-5 text-red-400" />
              <span>Started 5 mins ago</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Video className="h-5 w-5 text-red-400" />
              <span>Video Call</span>
            </div>
          </div>

          <Button
            onClick={() => router.push("/dashboard/sessions/live/1")}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-red-900/20"
          >
            Join Session
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-6">Upcoming Sessions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingSessions.map((session) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`h-12 w-12 rounded-full ${session.color} flex items-center justify-center text-white font-bold text-lg`}
                >
                  {session.image}
                </div>
                <div className="bg-white/10 px-3 py-1 rounded-full text-xs text-white">{session.duration}</div>
              </div>

              <h4 className="text-lg font-bold text-white mb-1">{session.title}</h4>
              <p className="text-gray-400 text-sm mb-4">{session.provider}</p>

              <div className="flex items-center gap-4 text-sm text-gray-300 mb-6">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{session.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-white">{session.rate}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1 bg-white text-black hover:bg-gray-200">View Details</Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                  Reschedule
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
