"use client"

import { useState, useEffect, useRef } from "react"
import { PhoneOff, MessageSquare, Share2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  MeetingProvider,
  MeetingConsumer,
  useMeeting,
  useParticipant,
  Constants,
} from "@videosdk.live/react-sdk"
import { createStream, generateVideoSDKToken } from "@/lib/videosdk"

// Join Screen - Handles joining or creating a stream
function JoinView({ initializeStream, setMode }: { initializeStream: (id?: string) => Promise<void>, setMode: (mode: "SEND_AND_RECV" | "RECV_ONLY") => void }) {
  const [streamId, setStreamId] = useState("")

  const handleAction = async (mode: "SEND_AND_RECV" | "RECV_ONLY") => {
    // Sets the mode (Host or Audience) and initializes the stream
    setMode(mode)
    await initializeStream(streamId)
  }

  return (
    <div className="container max-w-md mx-auto p-8">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Join Live Stream</h2>

      {/* Button to create a new stream */}
      <Button
        onClick={() => handleAction(Constants.modes.SEND_AND_RECV as "SEND_AND_RECV")}
        className="w-full mb-4 bg-blue-600 hover:bg-blue-700"
      >
        Create Live Stream as Host
      </Button>

      {/* Input field for entering an existing Stream ID */}
      <input
        type="text"
        placeholder="Enter Stream Id"
        value={streamId}
        onChange={(e) => setStreamId(e.target.value)}
        className="w-full p-3 mb-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
      />

      {/* Button to join as a host */}
      <Button
        onClick={() => handleAction(Constants.modes.SEND_AND_RECV as "SEND_AND_RECV")}
        className="w-full mb-2 bg-green-600 hover:bg-green-700"
      >
        Join as Host
      </Button>

      {/* Button to join as an audience member */}
      <Button
        onClick={() => handleAction(Constants.modes.RECV_ONLY as "RECV_ONLY")}
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        Join as Audience
      </Button>
    </div>
  )
}

// Live Stream Container - Manages joining and displaying the stream
function LSContainer({ streamId, onLeave }: { streamId: string, onLeave: () => void }) {
  const [joined, setJoined] = useState(false)
  const [duration, setDuration] = useState(0)
  const [cost, setCost] = useState(0)
  const [showLowBalance, setShowLowBalance] = useState(false)

  const { join, leave } = useMeeting({
    onMeetingJoined: () => setJoined(true),
    onMeetingLeft: onLeave,
    onError: (error) => alert(error.message),
  })

  // Timer and cost calculation
  useEffect(() => {
    if (!joined) return

    const timer = setInterval(() => {
      setDuration((prev) => prev + 1)
      setCost((prev) => prev + 8.33) // ~500 NGN per min

      // Simulate low balance alert after 10 seconds for demo
      if (duration === 10) setShowLowBalance(true)
    }, 1000)

    return () => clearInterval(timer)
  }, [duration, joined])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-black rounded-2xl overflow-hidden relative">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-20 flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="bg-black/40 backdrop-blur-md rounded-lg px-4 py-2 text-white border border-white/10">
            <p className="text-xs text-gray-400">Session Cost</p>
            <p className="font-mono font-bold text-lg">₦{Math.floor(cost).toLocaleString()}</p>
          </div>
          <div className="bg-red-500/20 backdrop-blur-md rounded-lg px-4 py-2 text-red-400 border border-red-500/30 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono font-bold">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-md rounded-lg px-4 py-2 text-white border border-white/10 text-right">
          <p className="text-xs text-gray-400">Remaining Balance</p>
          <p className={`font-mono font-bold text-lg ${showLowBalance ? "text-red-400" : "text-green-400"}`}>
            ₦{Math.max(5000 - cost, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
        {joined ? <StreamView /> : (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Stream Id: {streamId}</h3>
            <Button onClick={join} className="bg-blue-600 hover:bg-blue-700">
              Join Stream
            </Button>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="h-20 bg-gray-900 border-t border-white/10 flex items-center justify-center gap-4 px-6 z-20">
        <LSControls />
      </div>

      {/* Low Balance Alert */}
      <AnimatePresence>
        {showLowBalance && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-red-500/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 z-30"
          >
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Low Balance! Top up to continue session.</span>
            <Button size="sm" className="bg-white text-red-600 hover:bg-gray-100 rounded-full h-8">
              Top Up
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Component to display the live stream view
function StreamView() {
  const { participants } = useMeeting()

  return (
    <div className="w-full h-full p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full">
        {[...participants.values()]
          .filter((p) => p.mode === Constants.modes.SEND_AND_RECV)
          .map((p) => (
            <Participant participantId={p.id} key={p.id} />
          ))}
      </div>
    </div>
  )
}

// Component to render audio and video streams for a participant
function Participant({ participantId }: { participantId: string }) {
  const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } =
    useParticipant(participantId)

  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Function to attach or clear the stream
  const setupStream = (stream: any, ref: React.RefObject<any>, condition: boolean) => {
    if (ref.current && stream) {
      ref.current.srcObject = condition
        ? new MediaStream([stream.track])
        : null
      condition && ref.current.play().catch(console.error)
    }
  }

  useEffect(() => setupStream(micStream, audioRef, micOn), [micStream, micOn])
  useEffect(() => setupStream(webcamStream, videoRef, webcamOn), [webcamStream, webcamOn])

  return (
    <div className="bg-gray-800 rounded-xl p-4 relative">
      <p className="text-white mb-2">
        {displayName} | Webcam: {webcamOn ? "ON" : "OFF"} | Mic: {micOn ? "ON" : "OFF"}
      </p>
      <audio ref={audioRef} autoPlay muted={isLocal} />
      {webcamOn && (
        <video
          ref={videoRef}
          autoPlay
          muted={isLocal}
          className="w-full h-48 object-cover rounded-lg"
        />
      )}
    </div>
  )
}

// Component for managing stream controls
function LSControls() {
  const { leave, toggleMic, toggleWebcam, changeMode, meeting } = useMeeting()
  const currentMode = meeting.localParticipant?.mode
  const router = useRouter()

  const handleLeave = () => {
    leave()
    router.push("/dashboard/sessions")
  }

  const handleToggleMic = () => {
    toggleMic()
  }

  const handleToggleWebcam = () => {
    toggleWebcam()
  }

  const handleChangeMode = () => {
    const newMode = currentMode === Constants.modes.SEND_AND_RECV
      ? Constants.modes.RECV_ONLY
      : Constants.modes.SEND_AND_RECV
    changeMode(newMode as "SEND_AND_RECV" | "RECV_ONLY")
  }

  return (
    <>
      <Button onClick={handleLeave} variant="destructive" size="icon" className="h-14 w-14 rounded-full">
        <PhoneOff className="h-6 w-6" />
      </Button>

      {currentMode === Constants.modes.SEND_AND_RECV && (
        <>
          <Button onClick={handleToggleMic} variant="secondary" size="icon" className="h-12 w-12 rounded-full">
            🎤
          </Button>
          <Button onClick={handleToggleWebcam} variant="secondary" size="icon" className="h-12 w-12 rounded-full">
            📹
          </Button>
        </>
      )}

      <Button
        onClick={handleChangeMode}
        variant="secondary"
        size="icon"
        className="h-12 w-12 rounded-full"
      >
        {currentMode === Constants.modes.SEND_AND_RECV ? "👁️" : "🎭"}
      </Button>
    </>
  )
}

export default function LiveSessionPage({ params }: { params: { id: string } }) {
  const [streamId, setStreamId] = useState<string | null>(null)
  const [mode, setMode] = useState<"SEND_AND_RECV" | "RECV_ONLY">(Constants.modes.SEND_AND_RECV as "SEND_AND_RECV")
  const [authToken, setAuthToken] = useState<string | null>(null)

  // Initialize VideoSDK token
  useEffect(() => {
    const initializeToken = async () => {
      try {
        const token = await generateVideoSDKToken(params.id)
        setAuthToken(token)
      } catch (error) {
        console.error('Failed to get VideoSDK token:', error)
        alert('Failed to initialize live stream. Please check your VideoSDK configuration.')
      }
    }

    initializeToken()
  }, [params.id])

  const initializeStream = async (id?: string) => {
    const newStreamId = id || (await createStream(authToken!))
    setStreamId(newStreamId)
  }

  const onStreamLeave = () => setStreamId(null)

  return authToken && streamId ? (
    <MeetingProvider
      config={{
        meetingId: streamId,
        micEnabled: true,
        webcamEnabled: true,
        name: "PayGo User",
        mode,
        debugMode: false,
      }}
      token={authToken}
    >
      <LSContainer streamId={streamId} onLeave={onStreamLeave} />
    </MeetingProvider>
  ) : (
    <JoinView initializeStream={initializeStream} setMode={setMode} />
  )
}

