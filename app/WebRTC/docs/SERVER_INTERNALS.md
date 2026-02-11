# Funcionamiento Interno del Servidor WebRTC SFU

Este documento detalla el arquitectura, flujo de datos y mecanismos internos del servidor SFU (Selective Forwarding Unit).

## Índice

1. [Arquitectura General](#arquitectura-general)
2. [Componentes Principales](#componentes-principales)
3. [Flujo de Conexión](#flujo-de-conexión)
4. [Protocolo de Señalización](#protocolo-de-señalización)
5. [Gestión de Sesiones](#gestión-de-sesiones)
6. [WebRTC Peer Connections](#webrtc-peer-connections)
7. [Flujo de Medios](#flujo-de-medios)
8. [Manejo de Errores y Reconexión](#manejo-de-errores-y-reconexión)
9. [Seguridad y Validación](#seguridad-y-validación)

---

## Arquitectura General

El servidor es un **SFU (Selective Forwarding Unit)** que actúa como intermediario para las conexiones WebRTC. A diferencia de un MCU (Multipoint Control Unit), el SFU no realiza mezcla de audio/video, solo reenvía selectivamente los streams.

### Topología de Conexión

```
Cliente A ─┐
           ├─► Servidor SFU ─┬─► Cliente B
Cliente C ─┤                 │
           │                 └─► Cliente D
           │
          WebSocket (Señalización)
          & WebRTC PeerConnection
```

### Flujo de Datos

- **Señalización (WebSocket)**: control, estado, offer/answer SDP, ICE candidates
- **Medios (UDP)**: videos y audios viajan directamente entre cliente y servidor via SRTP

---

## Componentes Principales

### 1. Server

**Archivo**: `sfu/server.go`

```go
type Server struct {
    api      *webrtc.API          // API WebRTC de Pion
    rooms    map[string]*Room     // Mapa de sesiones activas
    mu       sync.RWMutex         // Sincronización thread-safe
    upgrader websocket.Upgrader   // Configurador de WebSocket
}
```

**Responsabilidades**:
- Inicializar y configurar la API WebRTC con codecs y extensiones RTP
- Aceptar conexiones WebSocket
- Enrutar mensajes entre clientes
- Gestionar ciclo de vida de rooms (sesiones)

**Inicialización de MediaEngine**:
```
1. Registrar codecs por defecto (H264, VP8, VP9 para video; Opus, G722 para audio)
2. Registrar extensiones RTP:
   - sdes:mid (Media stream identification)
   - sdes:rtp-stream-id (RTP stream identification)
   - sdes:repaired-rtp-stream-id (Para reparación con ULPFEC)
3. Registrar interceptores (NACK, RTCP, etc.)
4. Crear instancia de API WebRTC
```

**CORS Validation** (Seguridad):
```go
CheckOrigin: func(r *http.Request) bool {
    // Whitelist de orígenes permitidos
    allowedOrigins := map[string]bool{
        "http://localhost:8080":   true,
        "http://localhost:3000":   true,
        "http://127.0.0.1:8080":   true,
    }
    return allowedOrigins[origin]
}
```

### 2. Room

**Archivo**: `sfu/room.go`

```go
type Room struct {
    sessionID string
    peers     map[string]*Peer    // Mapa peerId -> Peer
    mu        sync.RWMutex        // Lock para modificaciones concurrentes
}
```

**Responsabilidades**:
- Mantener lista de peers conectados en una sesión
- Coordinar el broadcasting de mensajes
- Limpiar recursos cuando peers se desconectan

**Ciclo de vida**:
1. Room se crea cuando llega el primer `join` con nuevo sessionID
2. Durante la sesión: acepta nuevos peers y retransmite sus eventos
3. Cuando el último peer se desconecta, la Room se elimina

### 3. Peer

**Archivo**: `sfu/peer.go`

```go
type Peer struct {
    peerId          string
    userId          string
    sessionID       string
    conn            *websocket.Conn        // WebSocket del cliente
    pubPC           *webrtc.PeerConnection // Para publicar (enviar) streams
    subPC           *webrtc.PeerConnection // Para suscribirse (recibir) streams
    audioEnabled    bool
    videoEnabled    bool
    screenEnabled   bool
    speaking        bool
    stateMu         sync.RWMutex          // Thread-safety para estado
}
```

**Responsabilidades**:
- Mantener estado de un cliente conectado
- Manejar las dos PeerConnections (publicadora y suscriptora)
- Procesar mensajes SDP y ICE candidates
- Emitir eventos a otros peers cuando hay cambios

**Dos PeerConnections**:

1. **pubPC (Publisher)**
   - El cliente ENVÍA audio/video a través de esta conexión
   - Recibe `offer` del cliente (getUserMedia streams)
   - Servidor responde con `answer`
   - Los tracks publicados llegan via `ontrack` event

2. **subPC (Subscriber)**
   - El cliente RECIBE audio/video de otros peers
   - Servidor envía `offer` (stream de otros clientes)
   - Cliente responde con `answer`
   - Se agregan tracks via `AddTrack()` cuando otros peers publican

---

## Flujo de Conexión

### Fase 1: WebSocket Upgrade (Señalización)

```
1. Cliente hace request HTTP con Upgrade: websocket
2. Servidor valida origen (CORS whitelist)
3. Validación exitosa → se establece WebSocket
4. Aplicar límites de lectura (64KB max message size)
```

### Fase 2: Mensaje JOIN

**Cliente envía**:
```json
{
    "type": "join",
    "userId": "user123",
    "sessionId": "room456"
}
```

**Servidor procesa**:
1. Validar campos (no vacíos, max 256 caracteres)
2. Generar `peerId` único (UUID)
3. Buscar o crear Room para `sessionId`
4. Crear instancia de Peer
5. Inicializar pubPC y subPC
6. Responder con `joined`:

```json
{
    "type": "joined",
    "peerId": "peer-abc123"
}
```

### Fase 3: Emit Existing Peers

Servidor notifica al nuevo peer de peers existentes:

```json
[
    {
        "type": "peer_joined",
        "peerId": "peer-xyz",
        "userId": "user456",
        "audioEnabled": true,
        "videoEnabled": true,
        "screenEnabled": false,
        "speaking": false
    },
    {...}
]
```

**Paralelamente**: Notifica a peers existentes del nuevo peer.

### Fase 4: Establecer Oferta de Publicación

**Cliente**:
1. Llama `getUserMedia()` para obtener tracks locales
2. Crea offer SDP en pubPC
3. Envía offer al servidor:

```json
{
    "type": "offer",
    "sdp": "v=0\r\no=..."
}
```

**Servidor**:
1. Recibe offer en `pubPC.OnICECandidate`
2. Llama `SetRemoteDescription(offer)`
3. Crea answer
4. Envía answer al cliente:

```json
{
    "type": "answer",
    "sdp": "v=0\r\no=..."
}
```

### Fase 5: ICE Candidates Intercambio

**Bidireccional**:

```
Cliente envía:
{
    "type": "candidate",
    "candidate": "candidate:...",
    "sdpMid": "0",
    "sdpMLineIndex": 0
}

Servidor recibe → AddICECandidate() en la PC correcta
Servidor envía candidates de vuelta al cliente
```

---

## Protocolo de Señalización

Todos los mensajes viajan por WebSocket como JSON.

### Tipos de Mensajes

#### 1. Control

| Tipo | Dirección | Payload | Propósito |
|------|-----------|---------|-----------|
| `join` | Cliente → Servidor | userId, sessionId | Solicitar unirse a sesión |
| `joined` | Servidor → Cliente | peerId | Confirmación de unión |

#### 2. Peer Management

| Tipo | Dirección | Payload | Propósito |
|------|-----------|---------|-----------|
| `peer_joined` | Servidor → Cliente | peerId, userId, audioEnabled, videoEnabled, screenEnabled, speaking | Nuevo peer se unió |
| `peer_left` | Servidor → Cliente | peerId | Peer se desconectó |

#### 3. MediaState

| Tipo | Dirección | Payload | Propósito |
|------|-----------|---------|-----------|
| `media_state` | Servidor ↔ Cliente | peerId, audioEnabled, videoEnabled, screenEnabled, speaking | Cambio en estado de medios |

#### 4. WebRTC Signaling

| Tipo | Dirección | Payload | Propósito |
|------|-----------|---------|-----------|
| `offer` | Ambas | sdp | Oferta de conexión RTC |
| `answer` | Ambas | sdp | Respuesta de conexión RTC |
| `candidate` | Ambas | candidate, sdpMid, sdpMLineIndex | Candidato ICE |

### Validación de Entrada

Todo mensaje se valida:
1. Unmarshalling JSON seguro con límites de tamaño
2. Validar longitud de strings (máx 256 caracteres)
3. Validar presencia de campos requeridos
4. Logueo de errores de parsing

---

## Gestión de Sesiones

### Creación de Room

```
{
    sessionID: string
    peers: map[peerId] → Peer
    mu: sync.RWMutex  // Protege acceso concurrente
}
```

**Cuándo se crea**:
- Primer cliente con nuevo sessionID

**Cuándo se destruye**:
- Último peer se desconecta o se desconecta la websocket

### Sincronización Thread-Safe

**Problema**: Múltiples clientes pueden enviar mensajes simultáneamente

**Solución**:
```go
// En Room.go
s.mu.RLock()          // Read lock para leer peers
peer := s.peers[id]
s.mu.RUnlock()

s.mu.Lock()           // Write lock para modificar
delete(s.peers, id)
s.mu.Unlock()

// En Peer.go
p.stateMu.Lock()      // Protege audioEnabled, videoEnabled, etc.
p.audioEnabled = value
p.stateMu.Unlock()
```

### Broadcast de Mensajes

Cuando un peer cambia estado (ej: toggleAudio):

```
1. Peer local: peers[A].audioEnabled = false
2. Peer envía: { type: "media_state", peerId: "A", audioEnabled: false }
3. Servidor recibe en Peer A
4. Para cada peer B en room:
   - Si B != A: enviar media_state a B
```

---

## WebRTC Peer Connections

### Configuración de pubPC (Publicadora)

```go
pubPC, err := s.api.NewPeerConnection(webrtc.Configuration{
    ICEServers: []webrtc.ICEServer{
        {
            URLs: []string{"stun:stun.l.google.com:19302"},
        },
    },
})
```

**Eventos**:

1. **OnICECandidate**
   ```go
   pubPC.OnICECandidate(func(candidate *webrtc.ICECandidate) {
       if candidate != nil {
           send({ type: "candidate", candidate: candidate.Candidate, ... })
       }
   })
   ```

2. **OnTrack** (Recibir tracks del cliente)
   ```go
   pubPC.OnTrack(func(track *webrtc.TrackRemote, receiver *webrtc.RTPReceiver) {
       // Cuando cliente publica audio/video
       // Aquí se guardan los tracks para reenviarlos a otros peers
   })
   ```

### Configuración de subPC (Suscriptora)

```go
subPC, err := s.api.NewPeerConnection(webrtc.Configuration{...})
```

**Flujo**:
1. Servidor detecta nuevo track en otro peer (OnTrack de su pubPC)
2. Servidor agrega track a subPC de este peer: `subPC.AddTrack(track)`
3. Genera offer automática
4. Cliente responde con answer

---

## Flujo de Medios

### Publicación (Upstream)

```
Cliente A:
1. getUserMedia() → localStream con video/audio tracks
2. addTrack() a pubPC
3. pubPC.OnICEGatheringStateChange → "complete"
4. Entra modo DTLS handshake & SRTP comenzó

Servidor:
5. pubPC.OnTrack() → Recibe track de "Client A"
6. Para cada Peer B, C, D en room:
   - subPC[B].AddTrack(track de A)
   - subPC[C].AddTrack(track de A)
   - subPC[D].AddTrack(track de A)
```

### Suscripción (Downstream)

```
Servidor:
1. AddTrack() en subPC[B] con track de A
2. subPC[B] genera offer automática
3. SendOffer al cliente B

Cliente B:
4. Recibe offer, hace SetRemoteDescription
5. Crea answer
6. SendAnswer al servidor

Servidor:
7. Recibe answer, SetRemoteDescription en subPC[B]
8. WebRTC handshake completado
9. Cliente B comienza a recibir media de A
```

### Cambios de Medios Habilitados

Cuando Cliente A hace `toggleAudio(false)`:

```
Cliente A:
1. Pausar track de audio: audioTrack.enabled = false
2. Enviar: { type: "media_state", audioEnabled: false }

Servidor:
3. Recibir en Peer A
4. A.audioEnabled = false
5. Para cada Peer B, C, D:
   - Enviar: { type: "media_state", peerId: "A", audioEnabled: false }

Clientes B, C, D:
6. Reciben media_state
7. Actualizan estado local
8. (El media mismo sigue transmitiendo, UI decide qué mostrar)
```

**Nota**: El track sigue transmitiéndose UDP, solo se pausan en el cliente. Esto permite "mute" rápido sin renegociar SDP.

---

## Manejo de Errores y Reconexión

### Desconexión del Cliente

**Escenario**: WebSocket se cierra (red muere, cliente cierra pestaña)

```go
// En ReadLoop
_, data, err := conn.ReadMessage()
if err != nil {
    // WebSocket cerrado
    p.HandleDisconnect()
}

// En HandleDisconnect
1. Cerrar pubPC y subPC
2. Eliminar Peer del Room
3. Enviar "peer_left" a todos los otros peers
4. Si Room.peers está vacío: eliminar Room
```

### Errores WebRTC

**Escenarios de error**:

1. **ICE Connection Failed**
   - Problema de red, firewall bloquea
   - Servidor puede reconectar con nuevo STUN server
   - Cliente debe reintentar

2. **DTLS Handshake Failed**
   - Timeout en encrypted channel setup
   - Generalmente causado por NAT/firewall
   - Reintento automático con backoff exponencial

3. **Codec Incompatible**
   - Raro: cliente y servidor comparten codecs por defecto
   - Loguear y desconectar

### Reconexión

Actualmente **NO es soportado**. Si se pierde WebSocket:
1. Cliente debe hacer `disconnect()`
2. Crear nuevo WebRTCClient
3. Llamar `connect()` nuevamente

Implementación futura podría soportar "reconnect" guardando state.

---

## Seguridad y Validación

### 1. CORS - Origen Validation

```go
allowedOrigins := map[string]bool{
    "http://localhost:8080":   true,
    "http://localhost:3000":   true,
    "http://127.0.0.1:8080":   true,
}
return allowedOrigins[origin]
```

**Impacto**: Previene WebSocket hijacking desde otros dominios.

### 2. Input Validation

```go
const maxStringLen = 256

// En join message
if len(msg.UserID) == 0 || len(msg.UserID) > maxStringLen {
    log.Printf("Invalid userId: %v", err)
    return
}
if len(msg.SessionID) == 0 || len(msg.SessionID) > maxStringLen {
    log.Printf("Invalid sessionId: %v", err)
    return
}
```

**Impacto**: Previene buffer overflows y DoS.

### 3. WebSocket Buffer Limit

```go
const maxMessageSize = 64 * 1024  // 64KB
conn.SetReadLimit(int64(maxMessageSize))
```

**Impacto**: 
- Previene Memory exhaustion DoS
- 1000 conexiones × 64KB = 64MB (razonable)
- vs 1000 × 1MB = 1GB (ataque)

### 4. Error Logging

```go
var msg Signal
if err := json.Unmarshal(data, &msg); err != nil {
    log.Printf("JSON unmarshal error: %v, data: %s", err, string(data))
    return
}
```

**Impacto**: Detecta intentos de payload malformado.

### 5. SDP/Candidate Validation

```go
if msg.SDP != "" {
    // Processar SDP
}

if msg.Candidate != nil {
    // Procesar candidate
    pubPC.AddICECandidate(*msg.Candidate)
}
```

**Impacto**: Evita procesamiento de mensajes vacíos.

### 6. DTLS Encryption

Todo media es encriptado DTLS/SRTP:
- Servidor tiene certificate auto-generado
- Cliente verifica fingerprint en SDP
- Traffic no puede ser eavesdropped

---

## Ejemplo Completo: Flujo de Dos Usuarios

### 1. Alice se conecta

```
Alice:
  WebSocket.send({ type: "join", userId: "alice", sessionId: "room-1" })
  
Servidor:
  1. Crear Room("room-1") si no existe
  2. Crear Peer(peerId: "alice-abc", userId: "alice")
  3. Inicializar pubPC y subPC para Alice
  4. Responder: { type: "joined", peerId: "alice-abc" }
  5. Enviar lista vacía de peers: []
```

### 2. Bob se conecta

```
Bob:
  WebSocket.send({ type: "join", userId: "bob", sessionId: "room-1" })
  
Servidor:
  1. Room("room-1") ya existe
  2. Crear Peer(peerId: "bob-xyz", userId: "bob")
  3. Responder a Bob: { type: "joined", peerId: "bob-xyz" }
  4. Enviar a Bob lista de peers existentes:
     [{ peerId: "alice-abc", userId: "alice", ... }]
  5. Enviar a Alice que Bob se unió:
     { type: "peer_joined", peerId: "bob-xyz", userId: "bob", ... }
```

### 3. Alice publica video

```
Alice:
  1. getUserMedia() → videoTrack
  2. pubPC.addTrack(videoTrack)
  3. Crear offer: "v=0\r\no=..."
  4. WebSocket.send({ type: "offer", sdp: "..." })
  
Servidor (Alice.pubPC):
  1. SetRemoteDescription(offer)
  2. Crear answer
  3. WebSocket.send({ type: "answer", sdp: "..." })
  4. pubPC.OnTrack() ← videoTrack de Alice llega
  
Alice:
  5. SetRemoteDescription(answer)
  6. ICE gathering → OnICECandidate events
  
Alice & Servidor:
  7. Intercambiar ICE candidates hasta "connected"
```

### 4. Servidor envia video de Alice a Bob

```
Servidor (cuando recibe track de Alice):
  1. Para cada peer en room (Bob en este caso):
     subPC[Bob].AddTrack(videoTrack de Alice)
  2. subPC[Bob] genera offer automática
  3. WebSocket.send({ type: "offer", sdp: "..." })

Bob:
  1. SetRemoteDescription(offer)
  2. Crear answer
  3. WebSocket.send({ type: "answer", sdp: "..." })
  
Servidor:
  4. SetRemoteDescription(answer en subPC[Bob])
  5. Media stream fluye: Alice → Servidor → Bob
```

### 5. Alice activa audio también

```
Alice:
  1. getUserMedia({ audio: true, video: true })
  2. pubPC.addTrack(audioTrack)
  3. Renegotiate (nuevo offer)
  4. WebSocket.send({ type: "offer", sdp: "..." })

Servidor (igual que para video):
  1. OnTrack() recibe audioTrack
  2. subPC[Bob].AddTrack(audioTrack de Alice)
  3. Nuevo offer, Bob responde con answer
  4. Media fluye: audio Alice → Bob
```

---

## Conclusión

El servidor SFU es un intermediario inteligente que:
- **No mezcla** (a diferencia de MCU)
- **Mantiene dos conexiones por peer** (pub y sub)
- **Valida todo** (entrada, origen, tamaño)
- **Es thread-safe** (RWMutex en room y peer)
- **Encripta media** (DTLS/SRTP)
- **Es escalable** (cada peer es independiente)

La arquitectura permite que múltiples clientes compartan video/audio de forma eficiente, con control fino sobre qué medios se habilitan/deshabilitan en tiempo real.
