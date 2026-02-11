import { useState, useCallback, useRef, useEffect } from 'react';
// @ts-expect-error
import { WebRTCClient } from '@/lib/webrtc-client';
import { RemoteTile, TileKind, TileSource, RemotePeer } from '../types';

const LOG_PREFIX = '[webrtc-tiles]';

const peerIdFromStreamId = (streamId: string) => {
  const parts = String(streamId || '').split(':');
  return parts.length > 1 ? parts[0] : streamId;
};

export function useRemoteTiles(
    client: WebRTCClient | null, 
    localPeerId: string | null,
    peers: Map<string, RemotePeer>,
    setPeers: (peers: Map<string, RemotePeer>) => void
) {
  const [tiles, setTiles] = useState<RemoteTile[]>([]);
  const tilesRef = useRef<Map<string, RemoteTile>>(new Map());

  // We need refs to access latest state in callbacks without re-attaching listeners constantly
  const peersRef = useRef(peers);
  useEffect(() => {
    peersRef.current = peers;
  }, [peers]);

  const upsertTile = useCallback((tile: RemoteTile) => {
    const next = new Map(tilesRef.current);
    next.set(tile.id, { ...tile, updatedAt: Date.now() });
    tilesRef.current = next;
    setTiles(Array.from(next.values()));
  }, []);

  const removeTiles = useCallback((predicate: (tile: RemoteTile) => boolean) => {
    const next = new Map(tilesRef.current);
    let changed = false;
    for (const [id, tile] of next.entries()) {
      if (predicate(tile)) {
        next.delete(id);
        changed = true;
      }
    }
    if (changed) {
        tilesRef.current = next;
        setTiles(Array.from(next.values()));
    }
  }, []);

  useEffect(() => {
    if (!client) {
        tilesRef.current = new Map();
        setTiles([]);
        return;
    }

    const handleTrack = (e: any) => {
      const { track, streams } = e.detail;
      const stream = streams && streams.length > 0 ? streams[0] : null;
      const streamId = stream?.id || track.id;
      const peerId = peerIdFromStreamId(streamId);

      if (!peerId || peerId === localPeerId) {
        return;
      }

      const currentPeers = peersRef.current;
      let peer = currentPeers.get(peerId);
      
      // Note: We avoid modifying peers state here if possible, 
      // letting usePeers handle peer addition via other events if possible,
      // but if the peer is missing we should track it temporarily or 
      // rely on the shared setPeers function if we really need to add it.
      // The original code added it.
      
      let peersUpdated = false;
      const newPeers = new Map(currentPeers);

      if (!peer) {
        peer = {
            peerId,
            userId: peerId,
            audioEnabled: true,
            videoEnabled: true,
            screenEnabled: false,
            speaking: false,
        };
        newPeers.set(peerId, peer);
        peersUpdated = true;
      }

      const kind = track.kind === 'video' ? 'video' : 'audio';
      const mediaStream = stream ?? new MediaStream([track]);
      
      let source: TileSource = 'camera';
      
      if (kind === 'video') {
        const screenStreamId = client?.peerScreenStreams?.get(peerId);
        const isScreenByMap = screenStreamId && screenStreamId === streamId;
        
        const existingCameraTiles = Array.from(tilesRef.current.values()).filter(
          (tile) => tile.peerId === peerId && tile.kind === 'video' && tile.source === 'camera'
        );
        const isScreenByExistence = existingCameraTiles.length > 0;
        
        const peerState = newPeers.get(peerId);
        const isScreenByState = peerState?.screenEnabled ?? false;
        
        if (isScreenByMap || (isScreenByExistence && isScreenByState)) {
          source = 'screen';
        }
      }
      
      const tileId = `${streamId}-${kind}-${track.id}`;

      upsertTile({
        id: tileId,
        peerId,
        streamId,
        kind,
        source,
        stream: mediaStream,
        updatedAt: Date.now(),
      });

      // Update peer media state based on track reception
      const peerState = newPeers.get(peerId);
      if (peerState) {
        if (kind === 'video' && source === 'camera') {
            if (!peerState.videoEnabled) {
                peerState.videoEnabled = true;
                peersUpdated = true;
            }
        }
        if (kind === 'audio') {
            if (!peerState.audioEnabled) {
                peerState.audioEnabled = true;
                peersUpdated = true;
            }
        }
      }
      
      if (peersUpdated) {
          setPeers(newPeers);
      }

      const clearTile = () => {
        removeTiles((tile) => tile.id === tileId);
        
        // If track ended, update peer state
        if (kind === 'video' && source === 'camera') {
            const currentPeersRef = peersRef.current; // Get fresh ref
            const p = currentPeersRef.get(peerId);
            if (p && p.videoEnabled) {
                const np = new Map(currentPeersRef);
                const updatedPeer = np.get(peerId);
                if (updatedPeer) {
                    updatedPeer.videoEnabled = false;
                    setPeers(np);
                }
            }
        }
      };

      track.onended = clearTile;

      if (stream) {
        const onRemoveTrack = (event: MediaStreamTrackEvent) => {
          if (event.track?.id === track.id) {
            clearTile();
          }
        };
        stream.addEventListener('removetrack', onRemoveTrack);
      }
    };

    const handlePeerLeft = (e: any) => {
        const { peerId } = e.detail;
        removeTiles((tile) => tile.peerId === peerId);
    };

    const handleMediaState = (e: any) => {
        const { peerId, screenEnabled } = e.detail;
        if (screenEnabled === false) {
            removeTiles((tile) => tile.peerId === peerId && tile.kind === 'video' && tile.source === 'screen');
        }
    };

    client.addEventListener('track', handleTrack);
    client.addEventListener('peer-left', handlePeerLeft);
    client.addEventListener('media-state', handleMediaState);

    return () => {
        client.removeEventListener('track', handleTrack);
        client.removeEventListener('peer-left', handlePeerLeft);
        client.removeEventListener('media-state', handleMediaState);
    };
  }, [client, localPeerId, upsertTile, removeTiles, setPeers]);

  return { tiles };
}
