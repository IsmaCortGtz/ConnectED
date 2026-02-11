import { useWebRTCConnection } from './useWebRTCConnection';
import { useLocalMedia } from './useLocalMedia';
import { usePeers } from './usePeers';
import { useRemoteTiles } from './useRemoteTiles';

const LOG_PREFIX = '[webrtc-hook]';

interface UseWebRTCOptions {
  userId: string;
  userName: string;
  sessionId: string;
}

export function useWebRTC({ userId, userName, sessionId }: UseWebRTCOptions) {
  // 1. Manage Connection
  const { 
    client, 
    isConnected, 
    isConnecting, 
    localPeerId, 
    disconnect 
  } = useWebRTCConnection({ userId, userName, sessionId });

  // 2. Manage Local Media
  const {
    localStream,
    audioEnabled,
    videoEnabled,
    screenEnabled,
    toggleAudio,
    toggleVideo,
    toggleScreenShare
  } = useLocalMedia(client, isConnected);

  // 3. Manage Remote Peers
  const { peers, setPeers } = usePeers(client, localPeerId, userId);

  // 4. Manage Remote Tiles (Tracks)
  const { tiles } = useRemoteTiles(client, localPeerId, peers, setPeers);

  return {
    isConnected,
    isConnecting,
    localStream,
    peers,
    tiles,
    localPeerId,
    audioEnabled,
    videoEnabled,
    screenEnabled,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    disconnect,
  };
}
