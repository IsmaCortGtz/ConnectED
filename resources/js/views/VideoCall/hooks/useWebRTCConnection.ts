import { useState, useEffect, useCallback } from 'react';
// @ts-expect-error
import { WebRTCClient } from '@/lib/webrtc-client';
import Alert from '@/components/Alert';

const LOG_PREFIX = '[webrtc-connection]';

const getWebSocketURL = () => {
  const isHttps = window.location.protocol === 'https:';
  const protocol = isHttps ? 'wss:' : 'ws:';
  const port = isHttps ? '8443' : '8080';
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:${port}/ws`;
};

interface UseWebRTCConnectionOptions {
  userId: string;
  userName: string;
  sessionId: string;
}

export function useWebRTCConnection({ userId, userName, sessionId }: UseWebRTCConnectionOptions) {
  const [client, setClient] = useState<WebRTCClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localPeerId, setLocalPeerId] = useState<string | null>(null);
  
  // Use a local variable inside the effect to track mount status per execution
  // This avoids issues with React Strict Mode reusing refs across effect runs
  useEffect(() => {
    if (!userId || !sessionId) return;
    
    let isMounted = true;

    const wsUrl = getWebSocketURL();
    console.log(LOG_PREFIX, 'Initializing WebRTC client', { userId, sessionId, wsUrl });
    
    setIsConnecting(true);
    setError(null);

    const newClient = new WebRTCClient({
      url: wsUrl,
      userId,
      userName,
      sessionId,
    });

    // Set client immediately
    setClient(newClient);

    const handleConnected = (e: any) => {
      if (!isMounted) return;
      console.info(LOG_PREFIX, 'connected', { peerId: e.detail.peerId });
      setLocalPeerId(e.detail.peerId);
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
    };

    const handleConnecting = () => {
      if (!isMounted) return;
      setIsConnecting(true);
    };

    const handleDisconnected = () => {
        if (!isMounted) return;
        setIsConnected(false);
        setIsConnecting(false);
        setLocalPeerId(null);
    };

    const handleConnectionError = (e: any) => {
      if (!isMounted) return;
      console.error('Connection error:', e.detail.error);
      // Don't show Alert here, just log. The connect promise catch will handle critical init errors.
      if (isConnected) {
         Alert.error('Connection Lost', 'Server disconnected.');
      }
      setIsConnecting(false);
    };

    const handleAuthorizationFailed = (e: any) => {
      if (!isMounted) return;
      Alert.error('Authorization rejected', 'Lesson does not exist or access denied.');
      setIsConnecting(false);
    };

    newClient.addEventListener('connected', handleConnected);
    newClient.addEventListener('connecting', handleConnecting);
    newClient.addEventListener('disconnected', handleDisconnected);
    newClient.addEventListener('connection-error', handleConnectionError);
    newClient.addEventListener('authorization-failed', handleAuthorizationFailed);

    newClient.connect().catch((err: any) => {
        // Strict Check: Only process error if this specific effect run is still mounted
        if (!isMounted) return;
        
        console.error(LOG_PREFIX, 'Failed to initialize WebRTC:', err);
        let errorMessage = 'Error initializing WebRTC';
        if (err instanceof Error) {
            errorMessage = err.message;
        }
        
        if (errorMessage.includes('insecure') || errorMessage.includes('SecurityError')) {
            errorMessage = `⚠️ Security Error: HTTPS requires WSS.`;
        } else if (errorMessage.includes('WebSocket') || errorMessage.includes('connect')) {
            errorMessage = `Could not connect to WebRTC server.`;
        } else if (errorMessage.includes('permission') || errorMessage.includes('NotAllowed')) {
            errorMessage = 'Camera/Microphone permissions denied.';
        } else if (errorMessage.includes('NotFound')) {
            errorMessage = 'No se encontró cámara o micrófono.';
        }
        
        Alert.error('Session Error', errorMessage);
        setError(errorMessage);
        setIsConnecting(false);
    });

    return () => {
        isMounted = false;
        
        newClient.removeEventListener('connected', handleConnected);
        newClient.removeEventListener('connecting', handleConnecting);
        newClient.removeEventListener('disconnected', handleDisconnected);
        newClient.removeEventListener('connection-error', handleConnectionError);
        newClient.removeEventListener('authorization-failed', handleAuthorizationFailed);
        
        // Disconnect immediately
        newClient.disconnect();
        
        setClient(null);
        setIsConnected(false);
        setLocalPeerId(null);
    };
  }, [userId, sessionId]); // Re-run if userId or sessionId changes

  const disconnect = useCallback(() => {
    if (client) {
        client.disconnect();
    }
  }, [client]);

  return { 
    client, 
    isConnected, 
    isConnecting, 
    error, 
    setError, 
    localPeerId, 
    disconnect 
  };
}
