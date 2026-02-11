package sfu

import (
	"sync"

	"github.com/pion/webrtc/v3"
)

type Room struct {
	id        string
	peers     map[string]*Peer
	published map[string]*PublishedTrack
	mu        sync.RWMutex
}

func NewRoom(id string) *Room {
	return &Room{
		id:        id,
		peers:     map[string]*Peer{},
		published: map[string]*PublishedTrack{},
	}
}

func (r *Room) AddPeer(peer *Peer) {
	r.mu.Lock()
	r.peers[peer.id] = peer
	r.mu.Unlock()

	added := 0
	r.mu.RLock()
	for _, pub := range r.published {
		if peer.AddSubscription(pub) == nil {
			pub.RequestKeyframe()
			added++
		}
	}
	r.mu.RUnlock()

	if added > 0 {
		peer.negotiateSub()
	}
}

func (r *Room) SnapshotUsers(excludePeerID string) []UserInfo {
	r.mu.RLock()
	defer r.mu.RUnlock()

	users := make([]UserInfo, 0, len(r.peers))
	for _, peer := range r.peers {
		if peer.id == excludePeerID {
			continue
		}
		users = append(users, peer.userInfo())
	}
	return users
}

func (r *Room) Broadcast(msg Signal, excludePeerID string) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, peer := range r.peers {
		if peer.id == excludePeerID {
			continue
		}
		_ = peer.Send(msg)
	}
}

func (r *Room) BroadcastToAll(msg Signal) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, peer := range r.peers {
		_ = peer.Send(msg)
	}
}

func (r *Room) RemovePeer(peerID string) {
	r.mu.Lock()
	peer := r.peers[peerID]
	delete(r.peers, peerID)

	var removed []*PublishedTrack
	for key, pub := range r.published {
		if pub.publisherID == peerID {
			delete(r.published, key)
			removed = append(removed, pub)
		}
	}
	remaining := make([]*Peer, 0, len(r.peers))
	for _, other := range r.peers {
		remaining = append(remaining, other)
	}
	r.mu.Unlock()

	if peer == nil {
		return
	}

	for _, pub := range removed {
		pub.Stop()
		for _, other := range remaining {
			other.RemoveSubscription(pub.key)
		}
	}

	for _, other := range remaining {
		_ = other.Send(Signal{Type: "peer_left", PeerID: peerID})
	}

	r.mu.RLock()
	for _, pub := range r.published {
		pub.RemoveSubscriber(peerID)
	}
	r.mu.RUnlock()
}

func (r *Room) AddPublishedTrack(peer *Peer, track *webrtc.TrackRemote) {
	pub := NewPublishedTrack(peer, track)

	r.mu.Lock()
	r.published[pub.key] = pub
	peers := make([]*Peer, 0, len(r.peers))
	for _, other := range r.peers {
		peers = append(peers, other)
	}
	r.mu.Unlock()

	pub.Start()

	for _, other := range peers {
		if other.id == peer.id {
			continue
		}
		if other.AddSubscription(pub) == nil {
			pub.RequestKeyframe()
			other.negotiateSub()
		}
	}
}

func (r *Room) RemovePublishedTrack(publisherID string, streamID string) {
	r.mu.Lock()
	var keysToRemove []string
	for key, pub := range r.published {
		// Match by publisher ID and streamID (format: publisherId:originalStreamId)
		if pub.publisherID == publisherID && pub.streamID == streamID {
			keysToRemove = append(keysToRemove, key)
		}
	}
	
	// Get list of subscribers while still locked
	subscribers := make([]*Peer, 0)
	for _, peer := range r.peers {
		subscribers = append(subscribers, peer)
	}
	r.mu.Unlock()

	// Remove subscriptions and stop published tracks
	for _, key := range keysToRemove {
		r.mu.RLock()
		pub := r.published[key]
		r.mu.RUnlock()
		
		if pub != nil {
			pub.Stop()
			for _, sub := range subscribers {
				sub.RemoveSubscription(key)
			}
		}
		
		r.mu.Lock()
		delete(r.published, key)
		r.mu.Unlock()
	}
}

// RemovePublishedTracksByKind removes all published tracks of a specific kind for a publisher
func (r *Room) RemovePublishedTracksByKind(publisherID string, kind string) {
	r.mu.Lock()
	var keysToRemove []string
	for key, pub := range r.published {
		// Match by publisher ID and track kind
		if pub.publisherID == publisherID && pub.remote.Kind().String() == kind {
			keysToRemove = append(keysToRemove, key)
		}
	}
	
	// Get list of subscribers while still locked
	subscribers := make([]*Peer, 0)
	for _, peer := range r.peers {
		subscribers = append(subscribers, peer)
	}
	r.mu.Unlock()

	// Remove subscriptions and stop published tracks
	for _, key := range keysToRemove {
		r.mu.RLock()
		pub := r.published[key]
		r.mu.RUnlock()
		
		if pub != nil {
			pub.Stop()
			for _, sub := range subscribers {
				sub.RemoveSubscription(key)
			}
		}
		
		r.mu.Lock()
		delete(r.published, key)
		r.mu.Unlock()
	}
}
