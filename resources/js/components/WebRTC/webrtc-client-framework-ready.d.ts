/**
 * Tipos TypeScript para WebRTC Client Framework-Ready
 * 
 * Librería agnóstica de framework para conexiones WebRTC con servidor SFU.
 */

/**
 * Opciones de configuración para el cliente WebRTC
 */
export interface WebRTCClientOptions {
  /**
   * URL del servidor WebSocket
   * @example 'ws://localhost:8080'
   */
  url: string;

  /**
   * Identificador único del usuario
   * Máximo 256 caracteres
   */
  userId: string;

  /**
   * ID de la sesión/sala a la que conectarse
   * Máximo 256 caracteres
   */
  sessionId: string;

  /**
   * [Opcional] Callback legacy para cuando se recibe un track
   * @deprecated Usa addEventListener('track') en su lugar
   */
  onTrack?: (track: MediaStreamTrack, streams: MediaStream[]) => void;

  /**
   * [Opcional] Callback legacy para cuando un peer se une
   * @deprecated Usa addEventListener('peer-joined') en su lugar
   */
  onPeerJoined?: (peer: PeerInfo) => void;

  /**
   * [Opcional] Callback legacy para cuando un peer se va
   * @deprecated Usa addEventListener('peer-left') en su lugar
   */
  onPeerLeft?: (peerId: string) => void;

  /**
   * [Opcional] Callback legacy para cambios de estado de medios
   * @deprecated Usa addEventListener('media-state') en su lugar
   */
  onMediaState?: (state: MediaStateInfo) => void;

  /**
   * [Opcional] Callback legacy para detección de voz
   * @deprecated Usa addEventListener('speaking') en su lugar
   */
  onSpeaking?: (peerId: string, speaking: boolean) => void;

  /**
   * [Opcional] Callback legacy para cuando se recibe autorización
   * @deprecated Usa addEventListener('connected') en su lugar
   */
  onAuthorizing?: () => void;

  /**
   * [Opcional] Callback legacy para cuando la autorización falla
   * @deprecated Usa addEventListener('authorization-failed') en su lugar
   */
  onAuthorizationFailed?: (error: string) => void;

  /**
   * [Opcional] Callback legacy para cuando se recibe stream de pantalla
   * @deprecated Usa addEventListener('screen-stream') en su lugar
   */
  onScreenStream?: (peerId: string, streamId: string, enabled: boolean) => void;
}

/**
 * Información de un peer conectado
 */
export interface PeerInfo {
  peerId: string;
  userId: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenEnabled: boolean;
  speaking: boolean;
}

/**
 * Estado de medios de un peer
 */
export interface MediaStateInfo {
  peerId: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenEnabled: boolean;
}

/**
 * Estado actual de la conexión
 */
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'failed';

/**
 * Estado completo del cliente
 */
export interface ClientState {
  connected: boolean;
  peerId: string | null;
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenEnabled: boolean;
  localStream: MediaStream | null;
  peers: Map<string, PeerInfo>;
  connectionState: ConnectionState;
}

/**
 * Payload del evento 'connected'
 */
export interface ConnectedEventDetail {
  peerId: string;
}

/**
 * Payload del evento 'peer-joined'
 */
export interface PeerJoinedEventDetail extends PeerInfo {}

/**
 * Payload del evento 'peer-left'
 */
export interface PeerLeftEventDetail {
  peerId: string;
}

/**
 * Payload del evento 'track'
 */
export interface TrackEventDetail {
  track: MediaStreamTrack;
  streams: MediaStream[];
  peerId: string;
}

/**
 * Payload del evento 'media-state'
 */
export interface MediaStateEventDetail extends MediaStateInfo {}

/**
 * Payload del evento 'speaking'
 */
export interface SpeakingEventDetail {
  peerId: string;
  speaking: boolean;
}

/**
 * Payload del evento 'screen-stream'
 */
export interface ScreenStreamEventDetail {
  peerId: string;
  streamId: string;
  enabled: boolean;
}

/**
 * Payload del evento 'authorization-failed'
 */
export interface AuthorizationFailedEventDetail {
  error: string;
}

/**
 * Payload del evento 'connection-error'
 */
export interface ConnectionErrorEventDetail {
  error: Error;
}

/**
 * Payload del evento 'state-change'
 */
export interface StateChangeEventDetail {
  state: ClientState;
}

/**
 * Payload del evento 'toggle-audio-error'
 */
export interface ToggleAudioErrorEventDetail {
  error: Error;
}

/**
 * Payload del evento 'toggle-video-error'
 */
export interface ToggleVideoErrorEventDetail {
  error: Error;
}

/**
 * Mapa de tipos de eventos
 */
export interface WebRTCClientEventMap {
  'connecting': CustomEvent<void>;
  'connected': CustomEvent<ConnectedEventDetail>;
  'disconnected': CustomEvent<void>;
  'authorizing': CustomEvent<void>;
  'authorization-failed': CustomEvent<AuthorizationFailedEventDetail>;
  'peer-joined': CustomEvent<PeerJoinedEventDetail>;
  'peer-left': CustomEvent<PeerLeftEventDetail>;
  'track': CustomEvent<TrackEventDetail>;
  'media-state': CustomEvent<MediaStateEventDetail>;
  'speaking': CustomEvent<SpeakingEventDetail>;
  'screen-stream': CustomEvent<ScreenStreamEventDetail>;
  'connection-error': CustomEvent<ConnectionErrorEventDetail>;
  'state-change': CustomEvent<StateChangeEventDetail>;
  'toggle-audio-error': CustomEvent<ToggleAudioErrorEventDetail>;
  'toggle-video-error': CustomEvent<ToggleVideoErrorEventDetail>;
  'local-speaking': CustomEvent<{ speaking: boolean }>;
  'connection-state-change': CustomEvent<{ connectionState: ConnectionState }>;
}

/**
 * Cliente WebRTC agnóstico de framework
 * 
 * Extiende EventTarget para emitir eventos que cualquier framework puede escuchar.
 * Funciona con React, Vue, Solid, Svelte, Angular, vanilla JS, etc.
 * 
 * @example
 * ```typescript
 * const client = new WebRTCClient({
 *   url: 'ws://localhost:8080',
 *   userId: 'user123',
 *   sessionId: 'room1',
 * });
 * 
 * client.addEventListener('connected', (event) => {
 *   console.log('Conectado:', event.detail.peerId);
 * });
 * 
 * await client.connect();
 * await client.toggleAudio(true);
 * ```
 */
export class WebRTCClient extends EventTarget {
  /**
   * Constructor
   * @param options Opciones de configuración
   * @throws Error si las opciones no son válidas
   */
  constructor(options: WebRTCClientOptions);

  /**
   * Conectarse al servidor WebRTC
   * @returns Promesa que se resuelve cuando se establece conexión
   * @throws Error si falla la conexión
   */
  connect(): Promise<void>;

  /**
   * Desconectarse del servidor
   * @returns Promesa que se resuelve cuando se cierra la conexión
   */
  disconnect(): Promise<void>;

  /**
   * Activar o desactivar micrófono
   * @param enabled true para activar, false para desactivar
   * @returns Promesa que se resuelve cuando el cambio se aplica
   * @throws Error si el usuario rechaza permisos de micrófono
   */
  toggleAudio(enabled: boolean): Promise<void>;

  /**
   * Activar o desactivar cámara
   * @param enabled true para activar, false para desactivar
   * @returns Promesa que se resuelve cuando el cambio se aplica
   * @throws Error si el usuario rechaza permisos de cámara
   */
  toggleVideo(enabled: boolean): Promise<void>;

  /**
   * Iniciar compartición de pantalla
   * @returns Promesa que se resuelve cuando comienza la compartición
   * @throws Error si el usuario cancela o no soporta screen share
   */
  startScreenShare(): Promise<void>;

  /**
   * Detener compartición de pantalla
   * @returns Promesa que se resuelve cuando se detiene la compartición
   */
  stopScreenShare(): Promise<void>;

  // ========================
  // State Getters (Read-only)
  // ========================

  /**
   * ¿Está conectado al servidor?
   */
  get isConnected(): boolean;

  /**
   * ID único de este peer
   */
  get peerId(): string | null;

  /**
   * Lista de peers conectados
   */
  get peers(): PeerInfo[];

  /**
   * Estado completo actual
   */
  get state(): ClientState;

  /**
   * Estado actual de la conexión
   */
  get connectionState(): ConnectionState;

  // ========================
  // Event Listeners
  // ========================

  /**
   * Escuchar evento 'connecting'
   * Se dispara cuando comienza la conexión
   */
  addEventListener(
    type: 'connecting',
    listener: (event: CustomEvent<void>) => void,
    options?: AddEventListenerOptions | boolean
  ): void;

  /**
   * Escuchar evento 'connected'
   * Se dispara cuando la conexión está lista
   */
  addEventListener(
    type: 'connected',
    listener: (event: CustomEvent<ConnectedEventDetail>) => void,
    options?: AddEventListenerOptions | boolean
  ): void;

  /**
   * Escuchar evento 'disconnected'
   * Se dispara cuando se desconecta
   */
  addEventListener(
    type: 'disconnected',
    listener: (event: CustomEvent<void>) => void,
    options?: AddEventListenerOptions | boolean
  ): void;

  /**
   * Escuchar evento 'authorizing'
   * Se dispara durante la autorización
   */
  addEventListener(
    type: 'authorizing',
    listener: (event: CustomEvent<void>) => void,
    options?: AddEventListenerOptions | boolean
  ): void;

  /**
   * Escuchar evento 'authorization-failed'
   * Se dispara si la sesión es rechazada
   */
  addEventListener(
    type: 'authorization-failed',
    listener: (event: CustomEvent<AuthorizationFailedEventDetail>) => void,
    options?: AddEventListenerOptions | boolean
  ): void;

  /**
   * Escuchar evento 'peer-joined'
   * Se dispara cuando un nuevo peer se une
   */
  addEventListener(
    type: 'peer-joined',
    listener: (event: CustomEvent<PeerJoinedEventDetail>) => void,
    options?: AddEventListenerOptions | boolean
  ): void;

  /**
   * Escuchar evento 'peer-left'
   * Se dispara cuando un peer se desconecta
   */
  addEventListener(
    type: 'peer-left',
    listener: (event: CustomEvent<PeerLeftEventDetail>) => void,
    options?: AddEventListenerOptions | boolean
  ): void;

  /**
   * Escuchar evento 'track'
   * Se dispara cuando se recibe audio/video de otro peer
   */
  addEventListener(
    type: 'track',
    listener: (event: CustomEvent<TrackEventDetail>) => void,
    options?: AddEventListenerOptions | boolean
  ): void;

  /**
   * Escuchar evento 'media-state'
   * Se dispara cuando cambia el estado de audio/video de un peer
   */
  addEventListener(
    type: 'media-state',
    listener: (event: CustomEvent<MediaStateEventDetail>) => void,
    options?: AddEventListenerOptions | boolean
  ): void;

  /**
   * Escuchar evento 'speaking'
   * Se dispara cuando se detecta que un peer está hablando
   */
  addEventListener(
    type: 'speaking',
    listener: (event: CustomEvent<SpeakingEventDetail>) => void,
    options?: AddEventListenerOptions | boolean
  ): void;

  /**
   * Escuchar evento 'screen-stream'
   * Se dispara cuando un peer comparte/deja de compartir pantalla
   */
  addEventListener(
    type: 'screen-stream',
    listener: (event: CustomEvent<ScreenStreamEventDetail>) => void,
    options?: AddEventListenerOptions | boolean
  ): void;

  /**
   * Escuchar evento 'connection-error'
   * Se dispara en errores de conexión WebRTC
   */
  addEventListener(
    type: 'connection-error',
    listener: (event: CustomEvent<ConnectionErrorEventDetail>) => void,
    options?: AddEventListenerOptions | boolean
  ): void;

  /**
   * Escuchar evento 'state-change'
   * Se dispara cuando cualquier propiedad del estado cambia
   */
  addEventListener(
    type: 'state-change',
    listener: (event: CustomEvent<StateChangeEventDetail>) => void,
    options?: AddEventListenerOptions | boolean
  ): void;

  /**
   * Escuchar evento 'toggle-audio-error'
   * Se dispara cuando hay error al cambiar audio
   */
  addEventListener(
    type: 'toggle-audio-error',
    listener: (event: CustomEvent<ToggleAudioErrorEventDetail>) => void,
    options?: AddEventListenerOptions | boolean
  ): void;

  /**
   * Escuchar evento 'toggle-video-error'
   * Se dispara cuando hay error al cambiar video
   */
  addEventListener(
    type: 'toggle-video-error',
    listener: (event: CustomEvent<ToggleVideoErrorEventDetail>) => void,
    options?: AddEventListenerOptions | boolean
  ): void;

  /**
   * Escuchar evento 'local-speaking'
   * Se dispara cuando este cliente comienza/deja de hablar
   */
  addEventListener(
    type: 'local-speaking',
    listener: (event: CustomEvent<{ speaking: boolean }>) => void,
    options?: AddEventListenerOptions | boolean
  ): void;

  /**
   * Escuchar evento 'connection-state-change'
   * Se dispara cuando cambia el estado de conexión
   */
  addEventListener(
    type: 'connection-state-change',
    listener: (event: CustomEvent<{ connectionState: ConnectionState }>) => void,
    options?: AddEventListenerOptions | boolean
  ): void;

  /**
   * Escuchar evento genérico
   */
  addEventListener(
    type: string,
    listener: ((event: Event) => void) | ((event: CustomEvent<any>) => void),
    options?: AddEventListenerOptions | boolean
  ): void;

  /**
   * Dejar de escuchar evento
   */
  removeEventListener(
    type: string,
    listener: ((event: Event) => void) | ((event: CustomEvent<any>) => void),
    options?: EventListenerOptions | boolean
  ): void;

  /**
   * Limpiar todos los listeners
   */
  removeAllEventListeners(): void;
}

/**
 * Exportar clase por defecto
 */
export default WebRTCClient;
