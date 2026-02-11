# Guía de Uso: Librería WebRTC Agnóstica de Framework

Esta librería (`webrtc-client-framework-ready.js`) está diseñada para funcionar con **cualquier framework moderno**: React, Vue, Solid, Svelte, Angular, vanilla JavaScript, etc.

## Índice

1. [Características](#características)
2. [Instalación](#instalación)
3. [API Pública](#api-pública)
4. [Sistema de Eventos](#sistema-de-eventos)
5. [Manejo de Estado](#manejo-de-estado)
6. [React - Guía Detallada](#react--guía-detallada)
7. [Otros Frameworks](#otros-frameworks)
8. [Ejemplos Completos](#ejemplos-completos)
9. [Patrones Comunes](#patrones-comunes)
10. [Troubleshooting](#troubleshooting)

---

## Características

✅ **Agnóstica de Framework**: Funciona con cualquier librería o vanilla JS  
✅ **Event-Driven**: Emite CustomEvent para cambios de estado  
✅ **Observable State**: Getters para estado actual sin mutations  
✅ **Backward Compatible**: Legacy callbacks (`onTrack`, `onPeerJoined`) siguen funcionando  
✅ **TypeScript Ready**: Incluye tipos `.d.ts` completos  
✅ **Validación de Entrada**: Sanitiza automáticamente todos los inputs  
✅ **Memory Safe**: Limpia recursos (AudioContext, tracks, connections)

---

## Instalación

### Opción 1: Importar desde archivo local

```javascript
import { WebRTCClient } from './client/webrtc-client-framework-ready.js';
```

### Opción 2: Como módulo ES6

```javascript
// En tu proyecto
import { WebRTCClient } from '@tu-org/webrtc-client-framework-ready.js';
```

### Opción 3: Como global (script tag)

```html
<script src="./client/webrtc-client-framework-ready.js"></script>
<script>
  const client = new window.WebRTCClient({...});
</script>
```

---

## API Pública

### Constructor

```javascript
const client = new WebRTCClient({
    url: 'ws://localhost:8080',           // WebSocket del servidor (required)
    userId: 'user@example.com',           // ID único del usuario (required)
    sessionId: 'room123',                 // ID de sesión/sala (required)
    onTrack: (track) => {},               // [Optional] Legacy callback
    onPeerJoined: (peer) => {},          // [Optional] Legacy callback
    onPeerLeft: (peerId) => {},          // [Optional] Legacy callback
    onMediaState: (state) => {},         // [Optional] Legacy callback
    // ... más callbacks legacy si los necesitas
});
```

**Validación**:
- `url`: Must be a valid WebSocket URL
- `userId`: Non-empty string, max 256 characters
- `sessionId`: Non-empty string, max 256 characters

### Métodos

#### connect()

Establecer conexión con el servidor.

```javascript
await client.connect();
```

**Flujo**:
1. Abre WebSocket
2. Envía mensaje `join` con userId y sessionId
3. Recibe `joined` con peerId único
4. Inicializa PeerConnections para publicación y suscripción
5. Emite evento `connecting` y luego `connected`

**Puede fallar si**:
- URL inválida
- Servidor no responde
- CORS rejection
- Credenciales inválidas (sessionId no existe)

#### disconnect()

Cerrar conexión con el servidor.

```javascript
await client.disconnect();
```

**Flujo**:
1. Detiene audio/video
2. Cierra PeerConnections
3. Cierra WebSocket
4. Limpia recursos (AudioContext, tracks)
5. Emite evento `disconnected`

#### toggleAudio(enabled: boolean)

Activar o desactivar micrófono.

```javascript
await client.toggleAudio(true);   // Encender micrófono
await client.toggleAudio(false);  // Apagar micrófono
```

**Efectos**:
- Si `true`: Solicita acceso a micrófono (primer uso)
- Si `false`: Pausa track de audio (no remueve)
- Emite evento `media-state` a otros peers
- Actualiza getter `client.state.audioEnabled`

**Puede fallar si**:
- Usuario rechaza permiso de micrófono
- Browser no soporta WebRTC
- No conectado al servidor

#### toggleVideo(enabled: boolean)

Activar o desactivar cámara.

```javascript
await client.toggleVideo(true);   // Encender cámara
await client.toggleVideo(false);  // Apagar cámara
```

**Efectos**: Idéntico a `toggleAudio` pero para video.

#### startScreenShare()

Compartir pantalla.

```javascript
await client.startScreenShare();
```

**Flujo**:
1. Solicita al usuario seleccionar qué compartir (tab/window/screen)
2. Obtiene stream de pantalla
3. Reemplaza video track con screen track en PeerConnection
4. Emite evento `screen-stream` con `enabled: true`
5. Otros peers reciben nuevo track (mayormente)

**Limitaciones**:
- Solo funciona en HTTPS (o localhost)
- Usuario debe confirmar en diálogo nativo

#### stopScreenShare()

Detener compartición de pantalla.

```javascript
await client.stopScreenShare();
```

**Retorna a**: Video de cámara (si está habilitado).

---

## Sistema de Eventos

La librería extiende `EventTarget`, por lo que puedes usar:

```javascript
client.addEventListener('event-name', (event) => {
    console.log(event.detail);  // Payload del evento
});

client.removeEventListener('event-name', handler);
```

### Lista de Eventos

#### `connecting`

Se dispara cuando comienza la conexión.

```javascript
client.addEventListener('connecting', () => {
    console.log('Conectando al servidor...');
});
```

#### `connected`

Se dispara cuando la conexión está lista.

```javascript
client.addEventListener('connected', (event) => {
    console.log('Conectado con peerId:', event.detail.peerId);
});
```

#### `disconnected`

Se dispara cuando se desconecta.

```javascript
client.addEventListener('disconnected', () => {
    console.log('Desconectado del servidor');
});
```

#### `peer-joined`

Nuevo peer se unió a la sesión.

```javascript
client.addEventListener('peer-joined', (event) => {
    const { peerId, userId, audioEnabled, videoEnabled } = event.detail;
    console.log('Se unió:', userId, 'audio:', audioEnabled);
});
```

#### `peer-left`

Un peer se desconectó.

```javascript
client.addEventListener('peer-left', (event) => {
    const { peerId } = event.detail;
    console.log('Se fue:', peerId);
});
```

#### `track`

Recibimos audio/video de un peer.

```javascript
client.addEventListener('track', (event) => {
    const { track, streams, peerId } = event.detail;
    const stream = streams[0];
    
    // Reproducir en <video>
    const video = document.getElementById('remote-video');
    video.srcObject = stream;
    video.play();
});
```

**Nota**: Un peer puede tener múltiples tracks (audio + video + screen), se dispara evento para cada uno.

#### `media-state`

El estado de audio/video/screen de un peer cambió.

```javascript
client.addEventListener('media-state', (event) => {
    const { peerId, audioEnabled, videoEnabled, screenEnabled } = event.detail;
    console.log(`${peerId}: audio=${audioEnabled}, video=${videoEnabled}`);
});
```

Permite mostrar "muted" badge cuando alguien apaga micrófono.

#### `speaking`

Un peer está hablando (detección de voz).

```javascript
client.addEventListener('speaking', (event) => {
    const { peerId, speaking } = event.detail;
    console.log(`${peerId} ${speaking ? 'hablando' : 'callado'}`);
});
```

Útil para destacar speaker activo.

#### `authorization-failed`

Credenciales rechazadas.

```javascript
client.addEventListener('authorization-failed', (event) => {
    const { error } = event.detail;
    console.error('No autorizado:', error);
});
```

#### `connection-error`

Error en conexión WebRTC.

```javascript
client.addEventListener('connection-error', (event) => {
    const { error } = event.detail;
    console.error('Error de conexión:', error);
});
```

#### `state-change`

Cambio en el estado interno (cualquier propiedad de `client.state`).

```javascript
client.addEventListener('state-change', (event) => {
    const { state } = event.detail;  // Snapshot del nuevo estado
    console.log('Estado actualizado:', state);
});
```

---

## Manejo de Estado

### Getters (Read-Only)

Accede al estado actual sin mutar:

```javascript
// Conectado?
if (client.isConnected) {
    console.log('Conectado');
}

// ID de este peer
console.log(client.peerId);  // "peer-abc123"

// Lista de otros peers
client.peers.forEach((peer) => {
    console.log(peer.peerId, peer.userId, peer.audioEnabled);
});

// Snapshot completo del estado
const state = client.state;
console.log(state.audioEnabled, state.videoEnabled, state.screenEnabled);

// Estado de conexión
if (client.connectionState === 'connected') {
    // ...
}
```

### Estados de Conexión

```
disconnected → connecting → connected
                ↓
              failed
```

- **disconnected**: No hay conexión activa
- **connecting**: En proceso de establecer conexión
- **connected**: Listo para publicar/recibir medios
- **failed**: Intento de conexión falló

---

## React – Guía Detallada

### Setup Inicial

```javascript
import { useState, useEffect, useRef } from 'react';
import { WebRTCClient } from '../client/webrtc-client-framework-ready.js';

function VideoChat() {
    const clientRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [peers, setPeers] = useState([]);
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [videoEnabled, setVideoEnabled] = useState(false);
    const [localStream, setLocalStream] = useState(null);
    const [tracks, setTracks] = useState({}); // peerId -> stream
    
    useEffect(() => {
        // Crear cliente (una sola vez)
        if (!clientRef.current) {
            clientRef.current = new WebRTCClient({
                url: 'ws://localhost:8080',
                userId: 'user-' + Math.random().toString(36).substr(2, 9),
                sessionId: 'demo-room',
            });
        }
        
        const client = clientRef.current;
        
        // Listeners de eventos
        const handleConnected = (event) => {
            setIsConnected(true);
            console.log('Conectado:', event.detail.peerId);
        };
        
        const handleDisconnected = () => {
            setIsConnected(false);
            setPeers([]);
            setTracks({});
        };
        
        const handlePeerJoined = (event) => {
            const { peerId, userId } = event.detail;
            setPeers((prev) => [...prev, { peerId, userId, ...event.detail }]);
        };
        
        const handlePeerLeft = (event) => {
            const { peerId } = event.detail;
            setPeers((prev) => prev.filter((p) => p.peerId !== peerId));
            setTracks((prev) => {
                const newTracks = { ...prev };
                delete newTracks[peerId];
                return newTracks;
            });
        };
        
        const handleTrack = (event) => {
            const { peerId, streams } = event.detail;
            if (streams.length > 0) {
                setTracks((prev) => ({
                    ...prev,
                    [peerId]: streams[0],
                }));
            }
        };
        
        const handleMediaState = (event) => {
            const { peerId, audioEnabled, videoEnabled } = event.detail;
            setPeers((prev) =>
                prev.map((p) =>
                    p.peerId === peerId
                        ? { ...p, audioEnabled, videoEnabled }
                        : p
                )
            );
        };
        
        // Agregar listeners
        client.addEventListener('connected', handleConnected);
        client.addEventListener('disconnected', handleDisconnected);
        client.addEventListener('peer-joined', handlePeerJoined);
        client.addEventListener('peer-left', handlePeerLeft);
        client.addEventListener('track', handleTrack);
        client.addEventListener('media-state', handleMediaState);
        
        // Cleanup
        return () => {
            client.removeEventListener('connected', handleConnected);
            client.removeEventListener('disconnected', handleDisconnected);
            client.removeEventListener('peer-joined', handlePeerJoined);
            client.removeEventListener('peer-left', handlePeerLeft);
            client.removeEventListener('track', handleTrack);
            client.removeEventListener('media-state', handleMediaState);
        };
    }, []);
    
    // Conectar al montar
    useEffect(() => {
        if (clientRef.current && !isConnected) {
            clientRef.current.connect().catch(console.error);
        }
        
        return () => {
            if (clientRef.current && isConnected) {
                clientRef.current.disconnect().catch(console.error);
            }
        };
    }, []);
    
    // Handlers
    const handleToggleAudio = async () => {
        try {
            await clientRef.current.toggleAudio(!audioEnabled);
            setAudioEnabled(!audioEnabled);
        } catch (error) {
            console.error('Error al cambiar audio:', error);
            alert('No se pudo cambiar audio: ' + error.message);
        }
    };
    
    const handleToggleVideo = async () => {
        try {
            await clientRef.current.toggleVideo(!videoEnabled);
            setVideoEnabled(!videoEnabled);
        } catch (error) {
            console.error('Error al cambiar video:', error);
        }
    };
    
    return (
        <div style={{ padding: '20px' }}>
            <h1>Video Chat</h1>
            
            <div style={{ marginBottom: '20px' }}>
                <button onClick={handleToggleAudio}>
                    Micrófono: {audioEnabled ? '🔴 ON' : '⚫ OFF'}
                </button>
                <button onClick={handleToggleVideo} style={{ marginLeft: '10px' }}>
                    Cámara: {videoEnabled ? '🔴 ON' : '⚫ OFF'}
                </button>
                <span style={{ marginLeft: '20px' }}>
                    {isConnected ? '✅ Conectado' : '❌ Desconectado'}
                </span>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
                <h2>Participantes ({peers.length})</h2>
                {peers.map((peer) => (
                    <div
                        key={peer.peerId}
                        style={{
                            border: '1px solid #ccc',
                            padding: '10px',
                            marginBottom: '10px',
                        }}
                    >
                        <p>
                            <strong>{peer.userId}</strong> {peer.peerId}
                        </p>
                        <p>
                            🎤 {peer.audioEnabled ? 'Habla' : 'Silenciado'} |
                            📷 {peer.videoEnabled ? 'Visible' : 'Cámara off'}
                        </p>
                        <video
                            autoPlay
                            muted={false}
                            srcObject={tracks[peer.peerId]}
                            style={{
                                width: '300px',
                                height: '200px',
                                backgroundColor: '#000',
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default VideoChat;
```

### Usando Custom Hooks

Para reutilizar lógica, crea un hook:

```javascript
// hooks/useWebRTCClient.js
import { useEffect, useRef, useState } from 'react';
import { WebRTCClient } from '../client/webrtc-client-framework-ready.js';

export function useWebRTCClient(url, userId, sessionId) {
    const clientRef = useRef(null);
    const [state, setState] = useState({
        isConnected: false,
        peers: [],
        audioEnabled: false,
        videoEnabled: false,
        peerId: null,
        tracks: {},
    });
    
    useEffect(() => {
        const client = new WebRTCClient({ url, userId, sessionId });
        clientRef.current = client;
        
        const updateState = (updates) => {
            setState((prev) => ({ ...prev, ...updates }));
        };
        
        client.addEventListener('connected', (e) => {
            updateState({ isConnected: true, peerId: e.detail.peerId });
        });
        
        client.addEventListener('disconnected', () => {
            updateState({ isConnected: false, peers: [], tracks: {} });
        });
        
        client.addEventListener('peer-joined', (e) => {
            updateState({
                peers: [...state.peers, e.detail],
            });
        });
        
        client.addEventListener('peer-left', (e) => {
            const { peerId } = e.detail;
            updateState({
                peers: state.peers.filter((p) => p.peerId !== peerId),
                tracks: Object.fromEntries(
                    Object.entries(state.tracks).filter(([id]) => id !== peerId)
                ),
            });
        });
        
        client.addEventListener('track', (e) => {
            const { peerId, streams } = e.detail;
            if (streams.length > 0) {
                updateState({
                    tracks: { ...state.tracks, [peerId]: streams[0] },
                });
            }
        });
        
        return () => {
            if (clientRef.current?.isConnected) {
                clientRef.current.disconnect().catch(() => {});
            }
        };
    }, [url, userId, sessionId]);
    
    return {
        ...state,
        client: clientRef.current,
        connect: () => clientRef.current?.connect(),
        disconnect: () => clientRef.current?.disconnect(),
        toggleAudio: (enabled) => clientRef.current?.toggleAudio(enabled),
        toggleVideo: (enabled) => clientRef.current?.toggleVideo(enabled),
    };
}
```

**Uso del hook**:

```javascript
function App() {
    const {
        isConnected,
        peers,
        client,
        connect,
        toggleAudio,
        toggleVideo,
    } = useWebRTCClient(
        'ws://localhost:8080',
        'alice',
        'room-1'
    );
    
    return (
        <div>
            <button onClick={connect}>Conectar</button>
            <button onClick={() => toggleAudio(true)}>Audio ON</button>
            <p>{isConnected ? 'Conectado' : 'Desconectado'}</p>
            <p>Peers: {peers.length}</p>
        </div>
    );
}
```

---

## Otros Frameworks

### Vue 3 (Composition API)

```javascript
<template>
    <div>
        <h1>Video Chat</h1>
        <button @click="connectClient">
            {{ isConnected ? '✅ Conectado' : '❌ Desconectado' }}
        </button>
        <button @click="toggleAudioLocal">
            Micrófono: {{ audioEnabled ? 'ON' : 'OFF' }}
        </button>
        
        <div v-for="peer in peers" :key="peer.peerId">
            <h3>{{ peer.userId }}</h3>
            <video
                :srcObject="tracks[peer.peerId]"
                autoplay
                :muted="false"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { WebRTCClient } from '../client/webrtc-client-framework-ready.js';

const clientRef = ref(null);
const isConnected = ref(false);
const peers = ref([]);
const audioEnabled = ref(false);
const tracks = ref({});

onMounted(async () => {
    clientRef.value = new WebRTCClient({
        url: 'ws://localhost:8080',
        userId: 'vue-user-' + Math.random().toString(36).substr(2, 9),
        sessionId: 'vue-room',
    });
    
    const client = clientRef.value;
    
    client.addEventListener('connected', () => {
        isConnected.value = true;
    });
    
    client.addEventListener('peer-joined', (event) => {
        peers.value.push(event.detail);
    });
    
    client.addEventListener('track', (event) => {
        const { peerId, streams } = event.detail;
        if (streams[0]) {
            tracks.value[peerId] = streams[0];
        }
    });
    
    await client.connect();
});

onUnmounted(() => {
    if (clientRef.value?.isConnected) {
        clientRef.value.disconnect();
    }
});

const connectClient = () => clientRef.value.connect();
const toggleAudioLocal = async () => {
    audioEnabled.value = !audioEnabled.value;
    await clientRef.value.toggleAudio(audioEnabled.value);
};
</script>
```

### Solid.js

```javascript
import { createSignal, onMount, onCleanup } from 'solid-js';
import { WebRTCClient } from '../client/webrtc-client-framework-ready.js';

function VideoChat() {
    let clientRef;
    const [isConnected, setIsConnected] = createSignal(false);
    const [peers, setPeers] = createSignal([]);
    const [audioEnabled, setAudioEnabled] = createSignal(false);
    const [tracks, setTracks] = createSignal({});
    
    onMount(async () => {
        clientRef = new WebRTCClient({
            url: 'ws://localhost:8080',
            userId: 'solid-user-' + Math.random().toString(36).substr(2, 9),
            sessionId: 'solid-room',
        });
        
        clientRef.addEventListener('connected', () => {
            setIsConnected(true);
        });
        
        clientRef.addEventListener('peer-joined', (event) => {
            setPeers((prev) => [...prev, event.detail]);
        });
        
        clientRef.addEventListener('track', (event) => {
            const { peerId, streams } = event.detail;
            setTracks((prev) => ({
                ...prev,
                [peerId]: streams[0],
            }));
        });
        
        await clientRef.connect();
    });
    
    onCleanup(async () => {
        if (clientRef?.isConnected) {
            await clientRef.disconnect();
        }
    });
    
    const handleAudio = async () => {
        const newState = !audioEnabled();
        await clientRef.toggleAudio(newState);
        setAudioEnabled(newState);
    };
    
    return (
        <div>
            <h1>Video Chat</h1>
            <button onClick={handleAudio}>
                Micrófono: {audioEnabled() ? 'ON' : 'OFF'}
            </button>
            <p>{isConnected() ? '✅ Conectado' : '❌ Desconectado'}</p>
            <div>
                {peers().map((peer) => (
                    <div key={peer.peerId}>
                        <h3>{peer.userId}</h3>
                        <video
                            srcObject={tracks()[peer.peerId]}
                            autoplay
                            muted={false}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default VideoChat;
```

---

## Ejemplos Completos

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
    <title>Video Chat</title>
    <style>
        body { font-family: Arial; padding: 20px; }
        #peers { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        video { width: 100%; background: #000; }
        .peer-box { border: 1px solid #ccc; padding: 10px; }
        .controls { margin-bottom: 20px; }
        button { padding: 10px 20px; margin-right: 10px; cursor: pointer; }
    </style>
</head>
<body>
    <h1>Video Chat - Vanilla JS</h1>
    
    <div class="controls">
        <button id="btnAudio">🔴 Audio</button>
        <button id="btnVideo">🔴 Video</button>
        <button id="btnScreen">📺 Compartir Pantalla</button>
        <span id="status">Desconectado</span>
    </div>
    
    <div id="peers"></div>
    
    <script type="module">
        import { WebRTCClient } from './client/webrtc-client-framework-ready.js';
        
        const client = new WebRTCClient({
            url: 'ws://localhost:8080',
            userId: 'vanilla-user-' + Math.random().toString(36).substr(2, 9),
            sessionId: 'vanilla-room',
        });
        
        let audioOn = false;
        let videoOn = false;
        
        const peersDiv = document.getElementById('peers');
        const statusSpan = document.getElementById('status');
        const tracks = new Map();
        
        client.addEventListener('connected', (e) => {
            statusSpan.textContent = '✅ Conectado: ' + e.detail.peerId;
        });
        
        client.addEventListener('disconnected', () => {
            statusSpan.textContent = '❌ Desconectado';
            peersDiv.innerHTML = '';
        });
        
        client.addEventListener('peer-joined', (e) => {
            const { peerId, userId } = e.detail;
            const box = document.createElement('div');
            box.className = 'peer-box';
            box.id = 'peer-' + peerId;
            box.innerHTML = `
                <h3>${userId}</h3>
                <video id="video-${peerId}" autoplay muted="false"></video>
            `;
            peersDiv.appendChild(box);
        });
        
        client.addEventListener('peer-left', (e) => {
            const { peerId } = e.detail;
            const box = document.getElementById('peer-' + peerId);
            if (box) box.remove();
            tracks.delete(peerId);
        });
        
        client.addEventListener('track', (e) => {
            const { peerId, streams } = e.detail;
            if (streams[0]) {
                const video = document.getElementById('video-' + peerId);
                if (video) {
                    video.srcObject = streams[0];
                }
                tracks.set(peerId, streams[0]);
            }
        });
        
        document.getElementById('btnAudio').addEventListener('click', async () => {
            audioOn = !audioOn;
            await client.toggleAudio(audioOn);
            document.getElementById('btnAudio').textContent = 
                (audioOn ? '🟢' : '🔴') + ' Audio';
        });
        
        document.getElementById('btnVideo').addEventListener('click', async () => {
            videoOn = !videoOn;
            await client.toggleVideo(videoOn);
            document.getElementById('btnVideo').textContent = 
                (videoOn ? '🟢' : '🔴') + ' Video';
        });
        
        document.getElementById('btnScreen').addEventListener('click', async () => {
            if (client.state.screenEnabled) {
                await client.stopScreenShare();
            } else {
                await client.startScreenShare();
            }
        });
        
        // Conectar
        client.connect().catch((error) => {
            statusSpan.textContent = '❌ Error: ' + error.message;
        });
    </script>
</body>
</html>
```

---

## Patrones Comunes

### Manejo de Errores

```javascript
const client = new WebRTCClient({...});

client.addEventListener('authorization-failed', (e) => {
    console.error('Sesión rechazada:', e.detail.error);
    // Redirigir a login, mostrar mensaje, etc.
});

client.addEventListener('connection-error', (e) => {
    console.error('Error de conexión:', e.detail.error);
    // Reintentar automáticamente
    setTimeout(() => client.connect(), 3000);
});

try {
    await client.toggleAudio(true);
} catch (error) {
    console.error('No se pudo activar audio:', error.message);
    // Mostrar alerta, deshabilitar botón, etc.
}
```

### Renderizar Video Remoto

```javascript
// En el listener de 'track'
client.addEventListener('track', (event) => {
    const { peerId, track, streams } = event.detail;
    const stream = streams[0];
    
    // Crear o actualizar elemento <video>
    let video = document.getElementById(`video-${peerId}`);
    if (!video) {
        video = document.createElement('video');
        video.id = `video-${peerId}`;
        video.autoplay = true;
        video.playsinline = true;  // Importante para mobile
        document.body.appendChild(video);
    }
    
    video.srcObject = stream;
    video.play().catch(e => console.warn('Autoplay error:', e));
});
```

### Detectar Speaker Activo

```javascript
const activeSpeaker = new Map();

client.addEventListener('speaking', (event) => {
    const { peerId, speaking } = event.detail;
    
    if (speaking) {
        activeSpeaker.set(peerId, true);
        // Destacar visualmente
        document.getElementById(`video-${peerId}`)?.style.border = '3px solid gold';
    } else {
        activeSpeaker.delete(peerId);
        document.getElementById(`video-${peerId}`)?.style.border = '1px solid gray';
    }
});
```

### Compartición de Pantalla Condicional

```javascript
const handleScreenShare = async () => {
    try {
        if (client.state.screenEnabled) {
            // Parar
            await client.stopScreenShare();
            console.log('Pantalla compartida detenida');
        } else {
            // Iniciar
            await client.startScreenShare();
            console.log('Pantalla siendo compartida');
        }
    } catch (error) {
        if (error.message.includes('Permission denied')) {
            alert('Usuario canceló la selección de pantalla');
        } else {
            alert('Error: ' + error.message);
        }
    }
};
```

---

## Troubleshooting

### Problema: "Connection refused"

**Causa**: Servidor no está escuchando.

**Solución**:
```bash
cd /Users/fidelgalvan/Documents/Proyectos/Test
go run .
# Debería imprimir: server listening on :8080
```

### Problema: "CORS error"

**Causa**: Origen de cliente no está en whitelist del servidor.

**Solución**: Editar `sfu/server.go` y agregar tu origen:
```go
allowedOrigins := map[string]bool{
    "http://localhost:8080":   true,
    "http://localhost:3000":   true,
    "http://127.0.0.1:8080":   true,
    "http://tu-dominio.com":   true,  // Agregar aquí
}
```

### Problema: "Permission denied" para micrófono/cámara

**Causa**: Browser pide permiso y usuario rechaza.

**Solución**:
- Verificar browser muestra prompt
- En incógnito, permisos se piden siempre
- Revisa configuración de permisos del website

### Problema: "Video is blank / no media appearing"

**Causa Común**:
1. Audio habilitado pero video deshabilitado
2. `srcObject` asignado pero video no reproduciendo
3. Peer está silenciado en servidor

**Diagnóstico**:
```javascript
client.addEventListener('track', (e) => {
    console.log('Track recibido:', e.detail.track.kind, e.detail.track.enabled);
    console.log('Peers:', client.peers);
});

client.addEventListener('media-state', (e) => {
    console.log('Media state:', e.detail);
});
```

### Problema: "Memory leak - process size keeps growing"

**Causa**: No limpiar tracks cuando peer se va.

**Solución**:
```javascript
client.addEventListener('peer-left', (event) => {
    const { peerId } = event.detail;
    
    // Detener el video
    const video = document.getElementById(`video-${peerId}`);
    if (video) {
        video.srcObject = null;  // Importante
        video.remove();
    }
    
    // Limpiar referencias
    delete trackMap[peerId];
});
```

### Problema: "TypeScript errors - types not recognized"

**Solución**: Asegurar archivo `.d.ts` está junto al `.js`:
```
client/
  webrtc-client-framework-ready.js
  webrtc-client-framework-ready.d.ts    ← Debe estar aquí
```

```typescript
import { WebRTCClient } from './client/webrtc-client-framework-ready';
// Sin .js, TypeScript busca .d.ts automáticamente
```

---

Esta guía cubrirá el 95% de casos de uso. Para preguntas específicas de tu framework, consulta la documentación oficial del framework + ejemplos en este documento.
