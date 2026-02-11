package sfu

import (
	"fmt"
	"sync"
	"time"

	"github.com/pion/rtcp"
	"github.com/pion/rtp"
	"github.com/pion/webrtc/v3"
)

type PublishedTrack struct {
	key         string
	publisherID string
	publisher   *Peer
	trackID     string
	streamID    string
	codec       webrtc.RTPCodecCapability
	remote      *webrtc.TrackRemote

	mu          sync.RWMutex
	subscribers map[string]*webrtc.TrackLocalStaticRTP
	done        chan struct{}
}

func NewPublishedTrack(publisher *Peer, track *webrtc.TrackRemote) *PublishedTrack {
	trackID := publisher.id + ":" + track.StreamID() + ":" + track.ID() + ":" + fmt.Sprintf("%d", track.SSRC())
	streamID := publisher.id + ":" + track.StreamID()
	return &PublishedTrack{
		key:         trackKey(publisher.id, track),
		publisherID: publisher.id,
		publisher:   publisher,
		trackID:     trackID,
		streamID:    streamID,
		codec:       track.Codec().RTPCodecCapability,
		remote:      track,
		subscribers: map[string]*webrtc.TrackLocalStaticRTP{},
		done:        make(chan struct{}),
	}
}

func (p *PublishedTrack) Start() {
	go func() {
		for {
			select {
			case <-p.done:
				return
			default:
			}

			pkt, _, err := p.remote.ReadRTP()
			if err != nil {
				return
			}

			p.mu.RLock()
			for _, sub := range p.subscribers {
				pktCopy := cloneRTP(pkt)
				_ = sub.WriteRTP(pktCopy)
			}
			p.mu.RUnlock()
		}
	}()
}

func (p *PublishedTrack) Stop() {
	select {
	case <-p.done:
		return
	default:
		close(p.done)
	}
}

func (p *PublishedTrack) AddSubscriber(peerID string, track *webrtc.TrackLocalStaticRTP) {
	p.mu.Lock()
	p.subscribers[peerID] = track
	p.mu.Unlock()

	p.RequestKeyframeBurst()
}

func (p *PublishedTrack) RemoveSubscriber(peerID string) {
	p.mu.Lock()
	delete(p.subscribers, peerID)
	p.mu.Unlock()
}

func (p *PublishedTrack) RequestKeyframe() {
	if p.publisher == nil {
		return
	}
	_ = p.publisher.pubPC.WriteRTCP([]rtcp.Packet{
		&rtcp.PictureLossIndication{MediaSSRC: uint32(p.remote.SSRC())},
	})
}

func (p *PublishedTrack) RequestKeyframeBurst() {
	if p.publisher == nil {
		return
	}
	go func() {
		for i := 0; i < 5; i++ {
			p.RequestKeyframe()
			time.Sleep(500 * time.Millisecond)
		}
	}()
}

func trackKey(peerID string, track *webrtc.TrackRemote) string {
	return peerID + ":" + track.StreamID() + ":" + track.ID()
}

func cloneRTP(packet *rtp.Packet) *rtp.Packet {
	copyPacket := *packet
	return &copyPacket
}
