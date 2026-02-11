import { useState, useEffect, useCallback } from 'react';
// @ts-expect-error
import { WebRTCClient } from '@/lib/webrtc-client';

export function useLocalMedia(client: WebRTCClient | null, isConnected: boolean) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenEnabled, setScreenEnabled] = useState(false);

  const updateLocalPreview = useCallback(() => {
    const stream = client?.getLocalPreviewStream() || null;
    setLocalStream(stream);
  }, [client]);

  // Update preview when connected or state changes
  useEffect(() => {
    if (!client) {
        setLocalStream(null);
        return;
    }

    const handleStateChange = (e: any) => {
        const state = e.detail?.state;
        if (state?.localStream) {
            updateLocalPreview();
        }
    };
    
    // Also listen for connected to update preview initially
    const handleConnected = () => {
        setTimeout(updateLocalPreview, 0);
        setTimeout(updateLocalPreview, 300);
    };

    client.addEventListener('state-change', handleStateChange);
    client.addEventListener('connected', handleConnected);

    if (isConnected) {
        updateLocalPreview();
    }

    return () => {
        client.removeEventListener('state-change', handleStateChange);
        client.removeEventListener('connected', handleConnected);
    };
  }, [client, isConnected, updateLocalPreview]);

  const toggleAudio = useCallback(async () => {
    if (!client) return;
    try {
      const newState = !audioEnabled;
      await client.toggleAudio(newState);
      setAudioEnabled(newState);
      updateLocalPreview();
    } catch (err) {
      console.error('Toggle audio error:', err);
    }
  }, [client, audioEnabled, updateLocalPreview]);

  const toggleVideo = useCallback(async () => {
    if (!client) return;
    try {
      const newState = !videoEnabled;
      await client.toggleVideo(newState);
      setVideoEnabled(newState);
      updateLocalPreview();
    } catch (err) {
      console.error('Toggle video error:', err);
    }
  }, [client, videoEnabled, updateLocalPreview]);

  const toggleScreenShare = useCallback(async () => {
    if (!client) return;
    try {
      if (screenEnabled) {
        await client.stopScreenShare();
        setScreenEnabled(false);
      } else {
        await client.startScreenShare();
        setScreenEnabled(true);
      }
    } catch (err) {
      console.error('Screen share error:', err);
      throw err;
    }
  }, [client, screenEnabled]);

  return {
    localStream,
    audioEnabled,
    videoEnabled,
    screenEnabled,
    toggleAudio,
    toggleVideo,
    toggleScreenShare
  };
}
