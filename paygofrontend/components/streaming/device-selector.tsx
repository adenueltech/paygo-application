"use client"

import { useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Monitor, Camera, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DeviceInfo } from '@/lib/hooks/useAgora';

interface DeviceSelectorProps {
  cameras: DeviceInfo[];
  microphones: DeviceInfo[];
  speakers: DeviceInfo[];
  selectedCamera: string;
  selectedMicrophone: string;
  volume: number;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  onCameraChange: (deviceId: string) => void;
  onMicrophoneChange: (deviceId: string) => void;
  onVolumeChange: (volume: number) => void;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
}

export function DeviceSelector({
  cameras,
  microphones,
  speakers,
  selectedCamera,
  selectedMicrophone,
  volume,
  isAudioEnabled,
  isVideoEnabled,
  onCameraChange,
  onMicrophoneChange,
  onVolumeChange,
  onToggleAudio,
  onToggleVideo
}: DeviceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {/* Audio Toggle */}
      <Button
        variant="secondary"
        size="icon"
        className={`h-12 w-12 rounded-full ${
          !isAudioEnabled ? "bg-red-500 hover:bg-red-600 text-white" : "bg-gray-700 hover:bg-gray-600 text-white"
        }`}
        onClick={onToggleAudio}
      >
        {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
      </Button>

      {/* Video Toggle */}
      <Button
        variant="secondary"
        size="icon"
        className={`h-12 w-12 rounded-full ${
          !isVideoEnabled ? "bg-red-500 hover:bg-red-600 text-white" : "bg-gray-700 hover:bg-gray-600 text-white"
        }`}
        onClick={onToggleVideo}
      >
        {isVideoEnabled ? <Camera className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
      </Button>

      {/* Device Settings Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className="h-12 w-12 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Audio & Video Settings</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Camera Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Camera</label>
              <Select value={selectedCamera} onValueChange={onCameraChange}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select camera" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {cameras.map((camera) => (
                    <SelectItem key={camera.deviceId} value={camera.deviceId} className="text-white">
                      {camera.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Microphone Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Microphone</label>
              <Select value={selectedMicrophone} onValueChange={onMicrophoneChange}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select microphone" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {microphones.map((mic) => (
                    <SelectItem key={mic.deviceId} value={mic.deviceId} className="text-white">
                      {mic.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Volume Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">Volume</label>
                <div className="flex items-center gap-2">
                  {volume === 0 ? (
                    <VolumeX className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-400">{volume}%</span>
                </div>
              </div>
              <Slider
                value={[volume]}
                onValueChange={(value) => onVolumeChange(value[0])}
                max={200}
                step={10}
                className="w-full"
              />
            </div>

            {/* Speaker Selection (if available) */}
            {speakers.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Speaker</label>
                <Select defaultValue={speakers[0]?.deviceId}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Select speaker" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {speakers.map((speaker) => (
                      <SelectItem key={speaker.deviceId} value={speaker.deviceId} className="text-white">
                        {speaker.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}