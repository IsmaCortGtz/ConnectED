import { useState, useEffect, useRef } from 'react';
// @ts-expect-error
import { WebRTCClient } from '@/lib/webrtc-client';
import { RemotePeer } from '../types';

export function usePeers(
    client: WebRTCClient | null,
    localPeerId: string | null,
    localUserId: string
) {
  const [peers, setPeers] = useState<Map<string, RemotePeer>>(new Map());
  const peersRef = useRef<Map<string, RemotePeer>>(new Map());

  // Keep ref in sync with state for access in event listeners
  useEffect(() => {
    peersRef.current = peers;
  }, [peers]);

    useEffect(() => {
        if (!client) {
            setPeers(new Map());
            peersRef.current = new Map();
            return;
        }

        const shouldSkipPeer = (peer: RemotePeer) => {
            if (!peer || !peer.peerId) return true;
            if (localPeerId && peer.peerId === localPeerId) return true;
            if (localUserId && peer.userId === localUserId) return true;
            return false;
        };

        const normalizePeer = (peer: RemotePeer): RemotePeer => ({
            peerId: peer.peerId,
            userId: peer.userId || peer.peerId,
            userName: peer.userName || peer.userId || peer.peerId,
            audioEnabled: peer.audioEnabled ?? true,
            videoEnabled: peer.videoEnabled ?? true,
            screenEnabled: peer.screenEnabled ?? false,
            speaking: peer.speaking ?? false,
        });

        const seedList = Array.isArray(client.peers) ? client.peers : [];
        if (seedList.length > 0) {
            const seeded = new Map(peersRef.current);
            seedList.forEach((peer: RemotePeer) => {
                if (shouldSkipPeer(peer)) return;
                seeded.set(peer.peerId, normalizePeer(peer));
            });
            setPeers(seeded);
        }

        const handlePeerList = (e: any) => {
            const list = e.detail?.peers || [];
            const newPeers = new Map(peersRef.current);

            list.forEach((peer: RemotePeer) => {
                if (shouldSkipPeer(peer)) {
                    return;
                }

                newPeers.set(peer.peerId, normalizePeer(peer));
            });
            setPeers(newPeers);
        };

        const handlePeerJoined = (e: any) => {
            const { peer } = e.detail;
            if (shouldSkipPeer(peer)) {
                return;
            }
            const newPeers = new Map(peersRef.current);
            let p = newPeers.get(peer.peerId);

            const userName = peer.userName || peer.userId || peer.peerId;

            if (!p) {
                p = {
                    peerId: peer.peerId,
                    userId: peer.userId,
                    userName: userName,
                    audioEnabled: peer.audioEnabled,
                    videoEnabled: peer.videoEnabled,
                    screenEnabled: peer.screenEnabled,
                    speaking: false,
                };
            } else {
                p.userId = peer.userId;
                p.userName = userName || p.userName;
                p.audioEnabled = peer.audioEnabled;
                p.videoEnabled = peer.videoEnabled;
                p.screenEnabled = peer.screenEnabled;
            }
            newPeers.set(peer.peerId, p);
            setPeers(newPeers);
        };

        const handlePeerLeft = (e: any) => {
            const { peerId, userId } = e.detail;
            if ((peerId && localPeerId && peerId === localPeerId) || (userId && localUserId && userId === localUserId)) {
                return;
            }
            const newPeers = new Map(peersRef.current);
            if (newPeers.has(peerId)) {
                newPeers.delete(peerId);
                setPeers(newPeers);
            }
        };

        const handleMediaState = (e: any) => {
            const { peerId, userId, audioEnabled, videoEnabled, screenEnabled } = e.detail;
            if ((peerId && localPeerId && peerId === localPeerId) || (userId && localUserId && userId === localUserId)) {
                return;
            }
            const newPeers = new Map(peersRef.current);
            let peer = newPeers.get(peerId);

            if (peer) {
                peer.audioEnabled = audioEnabled;
                peer.videoEnabled = videoEnabled;
                peer.screenEnabled = screenEnabled;
                newPeers.set(peerId, { ...peer });
            } else {
                newPeers.set(peerId, {
                    peerId,
                    userId: peerId,
                    userName: peerId,
                    audioEnabled: audioEnabled ?? true,
                    videoEnabled: videoEnabled ?? true,
                    screenEnabled: screenEnabled ?? false,
                    speaking: false,
                });
            }
            setPeers(newPeers);
        };

        const handleSpeaking = (e: any) => {
            const { peerId, userId, speaking } = e.detail;
            if ((peerId && localPeerId && peerId === localPeerId) || (userId && localUserId && userId === localUserId)) {
                return;
            }
            const newPeers = new Map(peersRef.current);
            const peer = newPeers.get(peerId);
            if (peer) {
                peer.speaking = speaking;
                newPeers.set(peerId, { ...peer });
                setPeers(newPeers);
            }
        };

        client.addEventListener('peer-list', handlePeerList);
        client.addEventListener('peer-joined', handlePeerJoined);
        client.addEventListener('peer-left', handlePeerLeft);
        client.addEventListener('media-state', handleMediaState);
        client.addEventListener('speaking', handleSpeaking);

        return () => {
            client.removeEventListener('peer-list', handlePeerList);
            client.removeEventListener('peer-joined', handlePeerJoined);
            client.removeEventListener('peer-left', handlePeerLeft);
            client.removeEventListener('media-state', handleMediaState);
            client.removeEventListener('speaking', handleSpeaking);
        };
    }, [client, localPeerId, localUserId]);

    useEffect(() => {
        if (!localPeerId && !localUserId) return;
        const next = new Map(peersRef.current);
        let changed = false;
        for (const [peerId, peer] of next.entries()) {
            if ((localPeerId && peerId === localPeerId) || (localUserId && peer.userId === localUserId)) {
                next.delete(peerId);
                changed = true;
            }
        }
        if (changed) {
            setPeers(next);
        }
    }, [localPeerId, localUserId]);

  return { peers, setPeers };
}
