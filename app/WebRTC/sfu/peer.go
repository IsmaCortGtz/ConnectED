package sfu

import (
	"encoding/json"
	"errors"
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/pion/webrtc/v3"
)

type Peer struct {
	id        string
	userID    string
	userName  string
	room      *Room
	ws        *websocket.Conn
	api       *webrtc.API
	pubPC     *webrtc.PeerConnection
	subPC     *webrtc.PeerConnection
	send      chan []byte
	closed    chan struct{}
	closeOnce sync.Once

	subscriptions map[string]*webrtc.RTPSender
	stateMu       sync.RWMutex // Protege: audioEnabled, videoEnabled, screenEnabled, speaking
	audioEnabled  bool
	videoEnabled  bool
	screenEnabled bool
	screenStreamID string
	speaking      bool
	subReady      bool

	subNegotiationMu   sync.Mutex
	pendingSubNegotiation bool
}

func NewPeer(id, userID, userName string, room *Room, ws *websocket.Conn, api *webrtc.API) (*Peer, error) {
	pubPC, err := api.NewPeerConnection(webrtc.Configuration{})
	if err != nil {
		return nil, err
	}

	if _, err := pubPC.AddTransceiverFromKind(webrtc.RTPCodecTypeAudio, webrtc.RTPTransceiverInit{
		Direction: webrtc.RTPTransceiverDirectionRecvonly,
	}); err != nil {
		return nil, err
	}
	if _, err := pubPC.AddTransceiverFromKind(webrtc.RTPCodecTypeVideo, webrtc.RTPTransceiverInit{
		Direction: webrtc.RTPTransceiverDirectionRecvonly,
	}); err != nil {
		return nil, err
	}

	subPC, err := api.NewPeerConnection(webrtc.Configuration{})
	if err != nil {
		return nil, err
	}

	peer := &Peer{
		id:            id,
		userID:        userID,
		userName:      userName,
		room:          room,
		ws:            ws,
		api:           api,
		pubPC:         pubPC,
		subPC:         subPC,
		send:          make(chan []byte, 32),
		closed:        make(chan struct{}),
		subscriptions: map[string]*webrtc.RTPSender{},
		audioEnabled:  true,
		videoEnabled:  true,
		screenEnabled: false,
		speaking:      false,
		subReady:      false,
	}

	pubPC.OnICECandidate(func(c *webrtc.ICECandidate) {
		if c == nil {
			return
		}
		candidate := c.ToJSON()
		_ = peer.Send(Signal{
			Type:          "candidate",
			Target:        "pub",
			Candidate:     candidate.Candidate,
			SDPMid:        valueOrEmpty(candidate.SDPMid),
			SDPMLineIndex: valueOrZero(candidate.SDPMLineIndex),
		})
	})

	subPC.OnICECandidate(func(c *webrtc.ICECandidate) {
		if c == nil {
			return
		}
		candidate := c.ToJSON()
		_ = peer.Send(Signal{
			Type:          "candidate",
			Target:        "sub",
			Candidate:     candidate.Candidate,
			SDPMid:        valueOrEmpty(candidate.SDPMid),
			SDPMLineIndex: valueOrZero(candidate.SDPMLineIndex),
		})
	})

	pubPC.OnConnectionStateChange(func(state webrtc.PeerConnectionState) {
		switch state {
		case webrtc.PeerConnectionStateFailed, webrtc.PeerConnectionStateDisconnected, webrtc.PeerConnectionStateClosed:
			peer.Close()
		}
	})

	subPC.OnConnectionStateChange(func(state webrtc.PeerConnectionState) {
		switch state {
		case webrtc.PeerConnectionStateFailed, webrtc.PeerConnectionStateDisconnected, webrtc.PeerConnectionStateClosed:
			peer.Close()
		}
	})

	pubPC.OnTrack(func(track *webrtc.TrackRemote, _ *webrtc.RTPReceiver) {
		peer.room.AddPublishedTrack(peer, track)
	})

	return peer, nil
}

func (p *Peer) Start() {
	go p.writeLoop()
}

func (p *Peer) Done() <-chan struct{} {
	return p.closed
}

func (p *Peer) ReadLoop() {
	for {
		_, data, err := p.ws.ReadMessage()
		if err != nil {
			return
		}

		var msg Signal
		if err := json.Unmarshal(data, &msg); err != nil {
			log.Printf("[PEER %s] JSON unmarshal error: %v", p.id[:8], err)
			continue
		}
		p.handleSignal(msg)
	}
}

func (p *Peer) Send(msg Signal) error {
	data, err := json.Marshal(msg)
	if err != nil {
		log.Printf("[PEER %s] JSON marshal error: %v", p.id[:8], err)
		return err
	}
	log.Printf("[PEER %s] Sending signal: type=%s data_len=%d", p.id[:8], msg.Type, len(data))

	select {
	case p.send <- data:
		return nil
	case <-p.closed:
		return errors.New("peer closed")
	}
}

func (p *Peer) Close() {
	p.closeOnce.Do(func() {
		close(p.closed)
		_ = p.pubPC.Close()
		_ = p.subPC.Close()
		_ = p.ws.Close()
	})
}

func (p *Peer) AddSubscription(pub *PublishedTrack) error {
	localTrack, err := webrtc.NewTrackLocalStaticRTP(pub.codec, pub.trackID, pub.streamID)
	if err != nil {
		return err
	}

	sender, err := p.subPC.AddTrack(localTrack)
	if err != nil {
		return err
	}

	p.subscriptions[pub.key] = sender
	pub.AddSubscriber(p.id, localTrack)
	go p.readRTCP(sender)
	return nil
}

func (p *Peer) RemoveSubscription(key string) {
	sender := p.subscriptions[key]
	if sender == nil {
		return
	}
	_ = p.subPC.RemoveTrack(sender)
	delete(p.subscriptions, key)
	p.negotiateSub()
}

func (p *Peer) negotiateSub() {
	p.subNegotiationMu.Lock()
	defer p.subNegotiationMu.Unlock()
	if !p.subReady {
		p.pendingSubNegotiation = true
		return
	}

	if p.subPC.SignalingState() != webrtc.SignalingStateStable {
		p.pendingSubNegotiation = true
		return
	}

	offer, err := p.subPC.CreateOffer(nil)
	if err != nil {
		return
	}
	if err := p.subPC.SetLocalDescription(offer); err != nil {
		return
	}
	_ = p.Send(Signal{Type: "sub_offer", SDP: offer.SDP})
}

func (p *Peer) flushSubNegotiation() {
	p.subNegotiationMu.Lock()
	pending := p.pendingSubNegotiation && p.subPC.SignalingState() == webrtc.SignalingStateStable
	p.pendingSubNegotiation = false
	p.subNegotiationMu.Unlock()

	if pending {
		p.negotiateSub()
	}
}

func (p *Peer) handleSignal(msg Signal) {
	log.Printf("[PEER %s] received signal: type=%s", p.id[:8], msg.Type)
	switch msg.Type {
	case "pub_offer":
		if msg.SDP != "" {
			p.handlePubOffer(msg.SDP)
		}
	case "sub_answer":
		if msg.SDP != "" {
			p.handleSubAnswer(msg.SDP)
		}
	case "candidate":
		if msg.Candidate != "" {
			p.handleCandidate(msg)
		}
	case "sub_ready":
		p.subReady = true
		p.flushSubNegotiation()
	case "media_state":
		p.stateMu.Lock()
		p.audioEnabled = msg.AudioEnabled
		p.videoEnabled = msg.VideoEnabled
		p.screenEnabled = msg.ScreenEnabled
		p.stateMu.Unlock()
		log.Printf("[PEER %s] media_state received: audio=%v video=%v screen=%v", p.id[:8], msg.AudioEnabled, msg.VideoEnabled, msg.ScreenEnabled)
		// Keep published tracks alive when toggling media so resume works reliably.
		// Broadcast to ALL peers including the originator so they all stay in sync
		p.stateMu.RLock()
		broadcast := Signal{
			Type:          "media_state",
			PeerID:        p.id,
			UserID:        p.userID,
			AudioEnabled:  p.audioEnabled,
			VideoEnabled:  p.videoEnabled,
			ScreenEnabled: p.screenEnabled,
		}
		p.stateMu.RUnlock()
		log.Printf("[PEER %s] broadcasting media_state: %+v", p.id[:8], broadcast)
		p.room.BroadcastToAll(broadcast)
	case "screen_stream":
		p.stateMu.Lock()
		p.screenStreamID = msg.ScreenStreamID
		enabled := msg.ScreenEnabled
		if !enabled {
			p.screenStreamID = ""
		}
		p.stateMu.Unlock()
		// Broadcast to ALL peers including the originator
		p.room.BroadcastToAll(Signal{
			Type:          "screen_stream",
			PeerID:        p.id,
			UserID:        p.userID,
			ScreenEnabled: enabled,
			ScreenStreamID: p.screenStreamID,
		})
	case "speaking":
		p.stateMu.Lock()
		p.speaking = msg.Speaking
		p.stateMu.Unlock()
		// Broadcast to ALL peers including the originator
		p.room.BroadcastToAll(Signal{
			Type:    "speaking",
			PeerID:  p.id,
			UserID:  p.userID,
			Speaking: p.speaking,
		})
	case "track_removed":
		// Broadcast to ALL peers including the originator
		log.Printf("[PEER %s] track_removed: trackKind=%s streamId=%s", p.id[:8], msg.TrackKind, msg.StreamID)
		p.room.BroadcastToAll(Signal{
			Type:      "track_removed",
			PeerID:    p.id,
			UserID:    p.userID,
			TrackKind: msg.TrackKind,
			StreamID:  msg.StreamID,
		})
		// Actually remove the published track from room
		if msg.StreamID != "" {
			p.room.RemovePublishedTrack(p.id, msg.StreamID)
		}
	}
}

func (p *Peer) userInfo() UserInfo {
	return UserInfo{
		PeerID:        p.id,
		UserName:      p.userName,
		UserID:        p.userID,
		AudioEnabled:  p.audioEnabled,
		VideoEnabled:  p.videoEnabled,
		ScreenEnabled: p.screenEnabled,
		Speaking:      p.speaking,
	}
}

func (p *Peer) handlePubOffer(sdp string) {
	if sdp == "" {
		return
	}

	offer := webrtc.SessionDescription{Type: webrtc.SDPTypeOffer, SDP: sdp}
	if err := p.pubPC.SetRemoteDescription(offer); err != nil {
		return
	}

	answer, err := p.pubPC.CreateAnswer(nil)
	if err != nil {
		return
	}
	if err := p.pubPC.SetLocalDescription(answer); err != nil {
		return
	}

	_ = p.Send(Signal{Type: "pub_answer", SDP: answer.SDP})
}

func (p *Peer) handleSubAnswer(sdp string) {
	if sdp == "" {
		return
	}

	answer := webrtc.SessionDescription{Type: webrtc.SDPTypeAnswer, SDP: sdp}
	if err := p.subPC.SetRemoteDescription(answer); err != nil {
		return
	}
	p.flushSubNegotiation()
}

func (p *Peer) handleCandidate(msg Signal) {
	if msg.Candidate == "" {
		return
	}

	candidate := webrtc.ICECandidateInit{
		Candidate:     msg.Candidate,
		SDPMid:        &msg.SDPMid,
		SDPMLineIndex: uint16Ptr(msg.SDPMLineIndex),
	}
	if msg.Target == "sub" {
		_ = p.subPC.AddICECandidate(candidate)
		return
	}
	_ = p.pubPC.AddICECandidate(candidate)
}

func (p *Peer) writeLoop() {
	ticker := time.NewTicker(pingPeriod)
	defer ticker.Stop()
	for {
		select {
		case data := <-p.send:
			_ = p.ws.SetWriteDeadline(time.Now().Add(writeWait))
			if err := p.ws.WriteMessage(websocket.TextMessage, data); err != nil {
				log.Printf("[PEER %s] WriteMessage error: %v", p.id[:8], err)
				return
			}
		case <-ticker.C:
			_ = p.ws.SetWriteDeadline(time.Now().Add(writeWait))
			if err := p.ws.WriteMessage(websocket.PingMessage, []byte("ping")); err != nil {
				return
			}
		case <-p.closed:
			return
		}
	}
}

func (p *Peer) readRTCP(sender *webrtc.RTPSender) {
	buf := make([]byte, 1500)
	for {
		if _, _, err := sender.Read(buf); err != nil {
			return
		}
	}
}

func valueOrEmpty(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}

func valueOrZero(value *uint16) uint16 {
	if value == nil {
		return 0
	}
	return *value
}

func uint16Ptr(value uint16) *uint16 {
	return &value
}
