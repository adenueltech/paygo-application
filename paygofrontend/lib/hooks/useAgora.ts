import { useState, useEffect, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

export interface AgoraConfig {
  appId: string;
  channel: string;
  token: string;
  uid?: number;
}

export interface RemoteUser {
  uid: number;
  videoTrack?: any;
  audioTrack?: any;
}

export interface DeviceInfo {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export const useAgora = (config: AgoraConfig | null) => {
  const [client, setClient] = useState<any>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<any>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<any>(null);
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [volume, setVolume] = useState(100);
  const [cameras, setCameras] = useState<DeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<DeviceInfo[]>([]);
  const [speakers, setSpeakers] = useState<DeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('');

  // Initialize client
  useEffect(() => {
    if (!config) return;

    const agoraClient = AgoraRTC.createClient({
      mode: 'rtc',
      codec: 'vp8'
    });

    setClient(agoraClient);

    // Get available devices
    const getDevices = async () => {
      try {
        const devices = await AgoraRTC.getDevices();
        const videoDevices = devices.filter((device: any) => device.kind === 'videoinput').map((device: any) => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
          kind: device.kind
        }));
        const audioDevices = devices.filter((device: any) => device.kind === 'audioinput').map((device: any) => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
          kind: device.kind
        }));
        const speakerDevices = devices.filter((device: any) => device.kind === 'audiooutput').map((device: any) => ({
          deviceId: device.deviceId,
          label: device.label || `Speaker ${device.deviceId.slice(0, 8)}`,
          kind: device.kind
        }));

        setCameras(videoDevices);
        setMicrophones(audioDevices);
        setSpeakers(speakerDevices);

        if (videoDevices.length > 0) setSelectedCamera(videoDevices[0].deviceId);
        if (audioDevices.length > 0) setSelectedMicrophone(audioDevices[0].deviceId);
      } catch (error) {
        console.error('Error getting devices:', error);
      }
    };

    getDevices();

    return () => {
      agoraClient.leave();
    };
  }, [config]);

  // Handle remote users
  useEffect(() => {
    if (!client) return;

    const handleUserPublished = async (user: any, mediaType: 'video' | 'audio') => {
      await client.subscribe(user, mediaType);

      setRemoteUsers(prev => {
        const existingUser = prev.find(u => u.uid === user.uid);
        if (existingUser) {
          return prev.map(u =>
            u.uid === user.uid
              ? {
                  ...u,
                  videoTrack: mediaType === 'video' ? user.videoTrack : u.videoTrack,
                  audioTrack: mediaType === 'audio' ? user.audioTrack : u.audioTrack
                }
              : u
          );
        } else {
          return [...prev, {
            uid: user.uid,
            videoTrack: mediaType === 'video' ? user.videoTrack : undefined,
            audioTrack: mediaType === 'audio' ? user.audioTrack : undefined
          }];
        }
      });
    };

    const handleUserUnpublished = (user: any, mediaType: 'video' | 'audio') => {
      setRemoteUsers(prev =>
        prev.map(u =>
          u.uid === user.uid
            ? {
                ...u,
                videoTrack: mediaType === 'video' ? undefined : u.videoTrack,
                audioTrack: mediaType === 'audio' ? undefined : u.audioTrack
              }
            : u
        )
      );
    };

    const handleUserJoined = (user: any) => {
      setRemoteUsers(prev => [...prev, { uid: user.uid }]);
    };

    const handleUserLeft = (user: any) => {
      setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
    };

    client.on('user-published', handleUserPublished);
    client.on('user-unpublished', handleUserUnpublished);
    client.on('user-joined', handleUserJoined);
    client.on('user-left', handleUserLeft);

    return () => {
      client.off('user-published', handleUserPublished);
      client.off('user-unpublished', handleUserUnpublished);
      client.off('user-joined', handleUserJoined);
      client.off('user-left', handleUserLeft);
    };
  }, [client]);

  // Join channel
  const joinChannel = async () => {
    if (!client || !config) return;

    try {
      // Create local tracks
      const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
        { microphoneId: selectedMicrophone },
        { cameraId: selectedCamera }
      );

      setLocalAudioTrack(microphoneTrack);
      setLocalVideoTrack(cameraTrack);

      // Join channel
      await client.join(config.appId, config.channel, config.token, config.uid);

      // Publish tracks
      await client.publish([microphoneTrack, cameraTrack]);

      setIsConnected(true);
    } catch (error) {
      console.error('Error joining channel:', error);
      throw error;
    }
  };

  // Leave channel
  const leaveChannel = async () => {
    if (!client) return;

    try {
      // Stop and close local tracks
      if (localAudioTrack) {
        localAudioTrack.stop();
        localAudioTrack.close();
        setLocalAudioTrack(null);
      }
      if (localVideoTrack) {
        localVideoTrack.stop();
        localVideoTrack.close();
        setLocalVideoTrack(null);
      }

      // Leave channel
      await client.leave();
      setIsConnected(false);
      setRemoteUsers([]);
    } catch (error) {
      console.error('Error leaving channel:', error);
    }
  };

  // Toggle video
  const toggleVideo = async () => {
    if (!localVideoTrack) return;

    try {
      if (isVideoEnabled) {
        await client.unpublish(localVideoTrack);
        localVideoTrack.stop();
      } else {
        await client.publish(localVideoTrack);
      }
      setIsVideoEnabled(!isVideoEnabled);
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  };

  // Toggle audio
  const toggleAudio = async () => {
    if (!localAudioTrack) return;

    try {
      if (isAudioEnabled) {
        await client.unpublish(localAudioTrack);
        localAudioTrack.stop();
      } else {
        await client.publish(localAudioTrack);
      }
      setIsAudioEnabled(!isAudioEnabled);
    } catch (error) {
      console.error('Error toggling audio:', error);
    }
  };

  // Set volume
  const setAudioVolume = (newVolume: number) => {
    setVolume(newVolume);
    if (localAudioTrack) {
      localAudioTrack.setVolume(newVolume);
    }
    // Set volume for remote users
    remoteUsers.forEach(user => {
      if (user.audioTrack) {
        user.audioTrack.setVolume(newVolume);
      }
    });
  };

  // Switch camera
  const switchCamera = async (deviceId: string) => {
    if (!localVideoTrack) return;

    try {
      await localVideoTrack.setDevice(deviceId);
      setSelectedCamera(deviceId);
    } catch (error) {
      console.error('Error switching camera:', error);
    }
  };

  // Switch microphone
  const switchMicrophone = async (deviceId: string) => {
    if (!localAudioTrack) return;

    try {
      await localAudioTrack.setDevice(deviceId);
      setSelectedMicrophone(deviceId);
    } catch (error) {
      console.error('Error switching microphone:', error);
    }
  };

  return {
    // State
    client,
    localVideoTrack,
    localAudioTrack,
    remoteUsers,
    isConnected,
    isVideoEnabled,
    isAudioEnabled,
    volume,
    cameras,
    microphones,
    speakers,
    selectedCamera,
    selectedMicrophone,

    // Actions
    joinChannel,
    leaveChannel,
    toggleVideo,
    toggleAudio,
    setAudioVolume,
    switchCamera,
    switchMicrophone
  };
};
