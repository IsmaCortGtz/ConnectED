package sfu

import (
	"encoding/json"

	"github.com/gorilla/websocket"
)

type Signal struct {
	Type          string `json:"type"`
	UserID        string `json:"userId"`
	UserName      string `json:"userName,omitempty"`
	SessionID     string `json:"sessionId,omitempty"`
	PeerID        string `json:"peerId"`
	Target        string `json:"target,omitempty"`
	Users         []UserInfo `json:"users,omitempty"`
	AudioEnabled  bool   `json:"audioEnabled"`
	VideoEnabled  bool   `json:"videoEnabled"`
	ScreenEnabled bool   `json:"screenEnabled"`
	Speaking      bool   `json:"speaking"`
	ScreenStreamID string `json:"screenStreamId,omitempty"`
	TrackKind     string `json:"trackKind,omitempty"`
	StreamID      string `json:"streamId,omitempty"`
	SDP           string `json:"sdp,omitempty"`
	Candidate     string `json:"candidate,omitempty"`
	SDPMid        string `json:"sdpMid,omitempty"`
	SDPMLineIndex uint16 `json:"sdpMLineIndex,omitempty"`
	Message       string `json:"message,omitempty"`
}

type UserInfo struct {
	PeerID        string `json:"peerId"`
	UserID        string `json:"userId"`
	UserName      string `json:"userName,omitempty"`
	AudioEnabled  bool   `json:"audioEnabled"`
	VideoEnabled  bool   `json:"videoEnabled"`
	ScreenEnabled bool   `json:"screenEnabled"`
	Speaking      bool   `json:"speaking"`
}

func sendJSON(conn *websocket.Conn, msg Signal) error {
	data, err := json.Marshal(msg)
	if err != nil {
		return err
	}
	return conn.WriteMessage(websocket.TextMessage, data)
}
