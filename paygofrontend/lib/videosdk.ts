// VideoSDK configuration and utilities
export const VIDEOSDK_TOKEN = process.env.NEXT_PUBLIC_VIDEOSDK_TOKEN || "your-videosdk-token-here";

// API call to create stream/room
export const createStream = async (token: string) => {
  const res = await fetch(`https://api.videosdk.live/v2/rooms`, {
    method: "POST",
    headers: {
      authorization: `${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    throw new Error(`Failed to create stream: ${res.status}`);
  }

  const { roomId: streamId } = await res.json();
  return streamId;
};

// Generate VideoSDK auth token from backend
export const generateVideoSDKToken = async (sessionId: string) => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const response = await fetch(`${API_BASE_URL}/api/v1/streams/${sessionId}/videosdk-token`);

  if (!response.ok) {
    throw new Error(`Failed to get VideoSDK token: ${response.status}`);
  }

  const { videosdkConfig } = await response.json();
  return videosdkConfig.token;
};