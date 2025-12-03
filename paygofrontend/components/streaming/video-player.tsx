"use client"

import { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  videoTrack: any;
  className?: string;
  muted?: boolean;
}

export function VideoPlayer({ videoTrack, className = '', muted = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoTrack && videoRef.current) {
      videoTrack.play(videoRef.current);
    }

    return () => {
      if (videoTrack) {
        videoTrack.stop();
      }
    };
  }, [videoTrack]);

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {videoTrack ? (
        <video
          ref={videoRef}
          muted={muted}
          className="w-full h-full object-cover"
          playsInline
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <div className="text-center text-gray-400">
            <div className="w-16 h-16 rounded-full bg-gray-700 mx-auto mb-2 flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <p className="text-sm">No video</p>
          </div>
        </div>
      )}
    </div>
  );
}