package sfu

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/pion/interceptor"
	"github.com/pion/webrtc/v3"
)

const (
	writeWait  = 10 * time.Second
	pongWait   = 30 * time.Second
	pingPeriod = (pongWait * 9) / 10
)

type Server struct {
	api      *webrtc.API
	rooms    map[string]*Room
	mu       sync.RWMutex
	upgrader websocket.Upgrader
}

func NewServer() *Server {
	media := &webrtc.MediaEngine{}
	if err := media.RegisterDefaultCodecs(); err != nil {
		log.Fatal(err)
	}
	if err := media.RegisterHeaderExtension(webrtc.RTPHeaderExtensionCapability{URI: "urn:ietf:params:rtp-hdrext:sdes:mid"}, webrtc.RTPCodecTypeAudio); err != nil {
		log.Fatal(err)
	}
	if err := media.RegisterHeaderExtension(webrtc.RTPHeaderExtensionCapability{URI: "urn:ietf:params:rtp-hdrext:sdes:mid"}, webrtc.RTPCodecTypeVideo); err != nil {
		log.Fatal(err)
	}
	if err := media.RegisterHeaderExtension(webrtc.RTPHeaderExtensionCapability{URI: "urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id"}, webrtc.RTPCodecTypeVideo); err != nil {
		log.Fatal(err)
	}
	if err := media.RegisterHeaderExtension(webrtc.RTPHeaderExtensionCapability{URI: "urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id"}, webrtc.RTPCodecTypeVideo); err != nil {
		log.Fatal(err)
	}
	registry := &interceptor.Registry{}
	if err := webrtc.RegisterDefaultInterceptors(media, registry); err != nil {
		log.Fatal(err)
	}
	api := webrtc.NewAPI(
		webrtc.WithMediaEngine(media),
		webrtc.WithInterceptorRegistry(registry),
	)

	return &Server{
		api:   api,
		rooms: map[string]*Room{},
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				origin := r.Header.Get("Origin")
				if origin == "" {
					return true // Permitir si no hay Origin (same-origin)
				}
				// Validar contra lista de orígenes permitidos
				// allowedOrigins := map[string]bool{
				// 	"http://localhost:8080":   true,
				// 	"http://localhost:3000":   true,
				// 	"http://127.0.0.1:8080":   true,
				// 	"http://192.168.1.200:8080":   true,
				// }
				// return allowedOrigins[origin]
				return true // Permitir todas las conexiones (ajustar para producción)
			},
		},
	}
}

func (s *Server) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := s.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}
	defer conn.Close()

	// Limitar a 64KB para prevenir ataques de memoria/DoS
	const maxMessageSize = 64 * 1024
	conn.SetReadLimit(int64(maxMessageSize))
	_ = conn.SetReadDeadline(time.Now().Add(pongWait))
	conn.SetPongHandler(func(string) error {
		return conn.SetReadDeadline(time.Now().Add(pongWait))
	})

	_, data, err := conn.ReadMessage()
	if err != nil {
		log.Printf("ReadMessage error: %v", err)
		return
	}

	var join Signal
	if err := json.Unmarshal(data, &join); err != nil {
		log.Printf("JSON unmarshal error: %v", err)
		_ = sendJSON(conn, Signal{Type: "error", Message: "invalid json"})
		return
	}

	// Validar campos requeridos y longitud
	const maxStringLen = 256
	if join.Type != "join" || join.SessionID == "" || join.UserID == "" ||
	   len(join.SessionID) > maxStringLen || len(join.UserID) > maxStringLen {
		_ = sendJSON(conn, Signal{Type: "error", Message: "invalid join parameters"})
		return
	}

	// Authorize user (with 5-second timeout for DB/external calls)
	authCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	authorized, err := AuthorizeUser(authCtx, join.UserID, join.SessionID)
	cancel()

	if err != nil {
		log.Printf("authorization error for user=%s session=%s: %v", join.UserID, join.SessionID, err)
		_ = sendJSON(conn, Signal{Type: "error", Message: "authorization failed"})
		return
	}

	if !authorized {
		log.Printf("authorization denied for user=%s session=%s", join.UserID, join.SessionID)
		_ = sendJSON(conn, Signal{Type: "error", Message: "access denied"})
		return
	}

	room := s.getOrCreateRoom(join.SessionID)
	peerID := uuid.NewString()
	peer, err := NewPeer(peerID, join.UserID, join.UserName, room, conn, s.api)
	if err != nil {
		_ = sendJSON(conn, Signal{Type: "error", Message: "peer setup failed"})
		return
	}

	log.Printf("peer connected user=%s session=%s peer=%s", join.UserID, join.SessionID, peerID)
	defer log.Printf("peer disconnected user=%s session=%s peer=%s", join.UserID, join.SessionID, peerID)

	room.AddPeer(peer)
	_ = peer.Send(Signal{Type: "peer_list", Users: room.SnapshotUsers(peerID)})
	info := peer.userInfo()
	// Broadcast peer_joined to all peers including originator for consistency
	room.BroadcastToAll(Signal{Type: "peer_joined", PeerID: info.PeerID, UserID: info.UserID, UserName: info.UserName, AudioEnabled: info.AudioEnabled, VideoEnabled: info.VideoEnabled, ScreenEnabled: info.ScreenEnabled, Speaking: info.Speaking})
	_ = peer.Send(Signal{Type: "joined", PeerID: peerID})

	peer.Start()
	peer.ReadLoop()

	room.RemovePeer(peerID)
	peer.Close()
}

func (s *Server) getOrCreateRoom(id string) *Room {
	s.mu.RLock()
	room := s.rooms[id]
	s.mu.RUnlock()
	if room != nil {
		return room
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	if room = s.rooms[id]; room != nil {
		return room
	}
	room = NewRoom(id)
	s.rooms[id] = room
	return room
}
