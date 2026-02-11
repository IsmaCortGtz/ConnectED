/**
 * Framework-ready WebRTC SFU Client
 * 
 * Compatible con: Vanilla JS, React, Vue, Solid, Svelte, etc.
 * 
 * Usa EventTarget API para emitir eventos que cualquier framework puede escuchar.
 * No tiene dependencia en callbacks del constructor ni estado interno acoplado.
 */

export class WebRTCClient extends EventTarget {
	constructor(options) {
		super();

		// Validar inputs
		const maxStringLen = 256;
		if (!options.url || typeof options.url !== 'string') {
			throw new Error('Invalid url option');
		}
		if (!options.userId || typeof options.userId !== 'string' || options.userId.length > maxStringLen) {
			throw new Error('Invalid userId: must be non-empty string (max 256 chars)');
		}
		if (!options.sessionId || typeof options.sessionId !== 'string' || options.sessionId.length > maxStringLen) {
			throw new Error('Invalid sessionId: must be non-empty string (max 256 chars)');
		}

		this.url = options.url;
		this.userId = options.userId;
		this.sessionId = options.sessionId;

		// State (readable pero no writable desde outside)
		this._state = {
			connected: false,
			peerId: null,
			audioEnabled: false,
			videoEnabled: false,
			screenEnabled: false,
			localStream: null,
			peers: new Map(), // peerId -> { peerId, userId, audioEnabled, videoEnabled, screenEnabled, speaking }
	connectionState: 'disconnected', // connecting, connected, disconnected, failed
		};

		// Private internal state
		this.ws = null;
		this.pubPC = null;
		this.subPC = null;
		this.localStream = null;
		this.audioSender = null;
		this.videoSender = null;
		this.audioTrack = null;
		this.videoTrack = null;
		this.screenSender = null;
		this.speakingTimer = null;
		this.speakingState = false;
		this.mediaState = { audioEnabled: false, videoEnabled: false, screenEnabled: false };
		this.screenStreamId = null;
		this.peerScreenStreams = new Map();
		this.makingOffer = false;
		this.pendingPubNegotiation = false;
		this.pendingCandidates = { pub: [], sub: [] };
		this.subOfferQueue = [];
		this.processingSubOffer = false;
		this.audioContext = null;

		// Optional legacy callbacks (para backward compatibility)
		this.onTrack = options.onTrack || null;
		this.onStateChange = options.onStateChange || null;
		this.onPeerLeft = options.onPeerLeft || null;
		this.onPeerList = options.onPeerList || null;
		this.onPeerJoined = options.onPeerJoined || null;
		this.onMediaState = options.onMediaState || null;
		this.onSpeaking = options.onSpeaking || null;
		this.onScreenStream = options.onScreenStream || null;
		this.onTrackRemoved = options.onTrackRemoved || null;
		this.onAuthorizing = options.onAuthorizing || null;
		this.onAuthorizationFailed = options.onAuthorizationFailed || null;
	}

	/**
	 * Getter para estado (read-only desde outside)
	 */
	get state() {
		return { ...this._state };
	}

	get isConnected() {
		return this._state.connected;
	}

	get peerId() {
		return this._state.peerId;
	}

	get peers() {
		return Array.from(this._state.peers.values());
	}

	async connect() {
		this._setState({ connectionState: 'connecting' });
		this._emit('connecting');

		try {
			this.ws = new WebSocket(this.url);
			await new Promise((resolve, reject) => {
				this.ws.onopen = resolve;
				this.ws.onerror = reject;
			});

			this.ws.onmessage = (event) => this.handleMessage(event);
			this.ws.onclose = () => this._handleDisconnect();

			this.initPubPC();
			this.initSubPC();

			console.log("[CLIENT] Sending join request, waiting for authorization...");
			this._emit('authorizing');
			if (this.onAuthorizing) this.onAuthorizing();

			this.send({
				type: "join",
				userId: this.userId,
				sessionId: this.sessionId,
			});
		} catch (error) {
			this._setState({ connectionState: 'failed' });
			this._emit('connection-error', { error });
			throw error;
		}
	}

	disconnect() {
		if (this.localStream) {
			this.localStream.getTracks().forEach((track) => track.stop());
		}
		if (this.screenSender) {
			const track = this.screenSender.track;
			if (track) {
				track.stop();
			}
		}
		if (this.pubPC) {
			this.pubPC.close();
		}
		if (this.subPC) {
			this.subPC.close();
		}
		if (this.ws) {
			this.ws.close();
		}
		this.stopSpeakingDetection();
		this._handleDisconnect();
	}

	async startScreenShare() {
		if (!this.pubPC) {
			throw new Error("not connected");
		}
		if (this.screenSender) {
			return;
		}

		const display = await navigator.mediaDevices.getDisplayMedia({ video: true });
		const track = display.getVideoTracks()[0];
		if (!track) {
			return;
		}
		this.screenStreamId = display.id || null;

		this.screenSender = this.pubPC.addTrack(track, display);
		await this.forceSingleEncoding(this.screenSender);
		track.onended = () => this.stopScreenShare();
		this.mediaState.screenEnabled = true;
		this._setState({ screenEnabled: true });
		this.sendMediaState();
		if (this.screenStreamId) {
			this.send({ type: "screen_stream", screenEnabled: true, screenStreamId: this.screenStreamId });
		}
		await this.negotiatePub();
	}

	async stopScreenShare() {
		if (!this.pubPC || !this.screenSender) {
			return;
		}

		const track = this.screenSender.track;
		await this.screenSender.replaceTrack(null);
		if (track) {
			track.stop();
		}
		this.screenSender = null;
		this.mediaState.screenEnabled = false;
		this._setState({ screenEnabled: false });
		this.sendMediaState();
		if (this.screenStreamId) {
			if (this.peerId) {
				this.send({ type: "track_removed", trackKind: "screen", streamId: `${this.peerId}:${this.screenStreamId}` });
			}
			this.send({ type: "screen_stream", screenEnabled: false, screenStreamId: this.screenStreamId });
		}
		this.screenStreamId = null;
		await this.negotiatePub();
	}

	async toggleAudio(enabled) {
		if (!this.pubPC) {
			console.error("[CLIENT] toggleAudio: pubPC not initialized");
			return;
		}
		
		try {
			if (!enabled) {
				if (this.audioSender) {
					await this.audioSender.replaceTrack(null);
				}
				if (this.audioTrack) {
					this.audioTrack.stop();
					this.audioTrack = null;
				}
				this.mediaState.audioEnabled = false;
				this._setState({ audioEnabled: false });
				this.sendMediaState();
				this.stopSpeakingDetection();
				await this.negotiatePub();
				return;
			}

			const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
			const track = stream.getAudioTracks()[0];
			if (!track) {
				throw new Error("No audio track in stream");
			}
			if (this.audioSender) {
				await this.audioSender.replaceTrack(track);
			} else {
				this.audioSender = this.pubPC.addTrack(track, stream);
			}
			this.audioTrack = track;
			await this.forceSingleEncoding(this.audioSender);
			this.mediaState.audioEnabled = true;
			this._setState({ audioEnabled: true });
			this.sendMediaState();
			this.startSpeakingDetection();
			await this.negotiatePub();
		} catch (error) {
			this._emit('toggle-audio-error', { error });
			console.error("[CLIENT] toggleAudio ERROR:", error);
			throw error;
		}
	}

	async toggleVideo(enabled) {
		if (!this.pubPC) {
			console.error("[CLIENT] toggleVideo: pubPC not initialized");
			return;
		}
		
		try {
			if (!enabled) {
				if (this.videoSender) {
					await this.videoSender.replaceTrack(null);
				}
				if (this.videoTrack) {
					this.videoTrack.stop();
					this.videoTrack = null;
				}
				this.mediaState.videoEnabled = false;
				this._setState({ videoEnabled: false });
				this.sendMediaState();
				await this.negotiatePub();
				return;
			}

			const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
			const track = stream.getVideoTracks()[0];
			if (!track) {
				throw new Error("No video track in stream");
			}
			if (this.videoSender) {
				await this.videoSender.replaceTrack(track);
			} else {
				this.videoSender = this.pubPC.addTrack(track, stream);
			}
			this.videoTrack = track;
			await this.forceSingleEncoding(this.videoSender);
			this.mediaState.videoEnabled = true;
			this._setState({ videoEnabled: true });
			this.sendMediaState();
			await this.negotiatePub();
		} catch (error) {
			this._emit('toggle-video-error', { error });
			console.error("[CLIENT] toggleVideo ERROR:", error);
			throw error;
		}
	}

	// ========================
	// Internal Methods / Privados
	// ========================

	_setState(updates) {
		this._state = { ...this._state, ...updates };
		this._emit('state-change', { state: { ...this._state } });
		if (this.onStateChange) this.onStateChange(this._state);
	}

	_emit(eventType, detail = {}) {
		// Emitir como custom event (compatible con todos los frameworks)
		this.dispatchEvent(new CustomEvent(eventType, { detail }));
	}

	_handleDisconnect() {
		this._setState({ connected: false, connectionState: 'disconnected', peerId: null });
		this._emit('disconnected');
		if (this.onStateChange) this.onStateChange('closed');
	}

	emitState(state) {
		if (this.onStateChange) {
			this.onStateChange(state);
		}
	}

	async handleMessage(event) {
		let msg;
		try {
			msg = JSON.parse(event.data);
		} catch {
			return;
		}

		switch (msg.type) {
		case "joined":
			this._setState({ 
				connected: true, 
				peerId: msg.peerId,
				connectionState: 'connected'
			});
			// Emit connected event
			this._emit('connected', { peerId: msg.peerId });
			this.send({ type: "sub_ready" });
			await this.startLocalMedia();
			return;
		case "peer_list":
			{
				const users = msg.users || [];
				users.forEach(u => this._state.peers.set(u.peerId, u));
				this._emit('peer-list', { peers: users });
				if (this.onPeerList) this.onPeerList(users);
			}
			return;
		case "peer_joined":
			{
				const peer = {
					peerId: msg.peerId,
					userId: msg.userId,
					audioEnabled: msg.audioEnabled ?? true,
					videoEnabled: msg.videoEnabled ?? true,
					screenEnabled: msg.screenEnabled ?? false,
					speaking: msg.speaking ?? false,
				};
				this._state.peers.set(msg.peerId, peer);
				this._emit('peer-joined', { peer });
				if (this.onPeerJoined) this.onPeerJoined(peer);
			}
			return;
		case "pub_answer":
			await this.onPubAnswer(msg.sdp);
			return;
		case "sub_offer":
			await this.onSubOffer(msg.sdp);
			return;
		case "candidate":
			await this.onCandidate(msg);
			return;
		case "error":
			console.error("[CLIENT] Error from server:", msg.message);
			if (msg.message === "access denied" || msg.message === "authorization failed") {
				this._emit('authorization-failed', { reason: msg.message });
				if (this.onAuthorizationFailed) this.onAuthorizationFailed(msg.message);
			}
			return;
		case "peer_left":
			{
				this._state.peers.delete(msg.peerId);
				this._emit('peer-left', { peerId: msg.peerId });
				if (this.onPeerLeft) this.onPeerLeft(msg.peerId);
			}
			return;
		case "media_state":
			{
				const peerInfo = this._state.peers.get(msg.peerId);
				if (peerInfo) {
					peerInfo.audioEnabled = msg.audioEnabled;
					peerInfo.videoEnabled = msg.videoEnabled;
					peerInfo.screenEnabled = msg.screenEnabled;
				}
				this._emit('media-state', { 
					peerId: msg.peerId, 
					audioEnabled: msg.audioEnabled,
					videoEnabled: msg.videoEnabled,
					screenEnabled: msg.screenEnabled,
				});
				if (this.onMediaState) {
					this.onMediaState({
						peerId: msg.peerId,
						userId: msg.userId,
						audioEnabled: msg.audioEnabled,
						videoEnabled: msg.videoEnabled,
						screenEnabled: msg.screenEnabled,
					});
				}
			}
			return;
		case "speaking":
			{
				const peerInfo = this._state.peers.get(msg.peerId);
				if (peerInfo) {
					peerInfo.speaking = msg.speaking;
				}
				this._emit('speaking', { peerId: msg.peerId, speaking: msg.speaking });
				if (this.onSpeaking) {
					this.onSpeaking({
						peerId: msg.peerId,
						userId: msg.userId,
						speaking: msg.speaking,
					});
				}
			}
			return;
		case "screen_stream":
			{
				const screenInfo = {
					peerId: msg.peerId,
					screenEnabled: msg.screenEnabled,
					screenStreamId: msg.screenStreamId,
				};
				this._emit('screen-stream', screenInfo);
				if (this.onScreenStream) this.onScreenStream(screenInfo);
			}
			return;
		default:
			return;
		}
	}

	initPubPC() {
		if (this.pubPC) {
			return;
		}
		this.pubPC = new RTCPeerConnection();

		this.pubPC.onicecandidate = (event) => {
			if (!event.candidate) {
				return;
			}
			this.send({
				type: "candidate",
				target: "pub",
				candidate: event.candidate.candidate,
				sdpMid: event.candidate.sdpMid,
				sdpMLineIndex: event.candidate.sdpMLineIndex,
			});
		};

		this.pubPC.onconnectionstatechange = () => {
			this._emit('connection-state-change', { state: this.pubPC.connectionState });
			this.emitState(this.pubPC.connectionState);
		};

		this.pubPC.onsignalingstatechange = () => {
			if (this.pubPC.signalingState === "stable" && this.pendingPubNegotiation) {
				this.pendingPubNegotiation = false;
				this.negotiatePub();
			}
		};
	}

	initSubPC() {
		if (this.subPC) {
			return;
		}
		this.subPC = new RTCPeerConnection();
		this.subPC.addTransceiver("audio", { direction: "recvonly" });
		this.subPC.addTransceiver("video", { direction: "recvonly" });

		this.subPC.onicecandidate = (event) => {
			if (!event.candidate) {
				return;
			}
			this.send({
				type: "candidate",
				target: "sub",
				candidate: event.candidate.candidate,
				sdpMid: event.candidate.sdpMid,
				sdpMLineIndex: event.candidate.sdpMLineIndex,
			});
		};

		this.subPC.onconnectionstatechange = () => {
			this.emitState(this.subPC.connectionState);
		};

		this.subPC.ontrack = (event) => {
			const streams = event.streams && event.streams.length > 0
				? event.streams
				: [new MediaStream([event.track])];
			this._emit('track', { track: event.track, streams });
			if (this.onTrack) {
				this.onTrack(event.track, streams[0]);
			}
		};

		this.processSubOffers();
	}

	async startLocalMedia() {
		if (!this.pubPC) {
			return;
		}
		this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
		for (const track of this.localStream.getTracks()) {
			const sender = this.pubPC.addTrack(track, this.localStream);
			await this.forceSingleEncoding(sender);
			if (track.kind === "audio") {
				this.audioSender = sender;
				this.audioTrack = track;
			} else if (track.kind === "video") {
				this.videoSender = sender;
				this.videoTrack = track;
			}
		}

		this.mediaState.audioEnabled = true;
		this.mediaState.videoEnabled = true;
		this.mediaState.screenEnabled = false;
		this._setState({ 
			audioEnabled: true,
			videoEnabled: true,
			screenEnabled: false,
			localStream: this.localStream
		});
		this.sendMediaState();
		this.startSpeakingDetection();

		await this.negotiatePub();
	}

	startSpeakingDetection() {
		if (!this.audioTrack || this.speakingTimer) {
			return;
		}
		this.audioContext = new AudioContext();
		const source = this.audioContext.createMediaStreamSource(new MediaStream([this.audioTrack]));
		const analyser = this.audioContext.createAnalyser();
		analyser.fftSize = 256;
		source.connect(analyser);
		const data = new Uint8Array(analyser.frequencyBinCount);
		this.speakingTimer = setInterval(() => {
			analyser.getByteFrequencyData(data);
			let sum = 0;
			for (let i = 0; i < data.length; i++) {
				sum += data[i];
			}
			const avg = sum / data.length;
			const speaking = avg > 12;
			if (speaking !== this.speakingState) {
				this.speakingState = speaking;
				if (this.peerId) {
					this._emit('local-speaking', { speaking });
					if (this.onSpeaking) {
						this.onSpeaking({
							peerId: this.peerId,
							userId: this.userId,
							speaking,
						});
					}
				}
				this.send({ type: "speaking", speaking });
			}
		}, 250);
	}

	stopSpeakingDetection() {
		if (this.speakingTimer) {
			clearInterval(this.speakingTimer);
			this.speakingTimer = null;
		}
		if (this.audioContext) {
			this.audioContext.close();
			this.audioContext = null;
		}
		if (this.speakingState) {
			this.speakingState = false;
			this.send({ type: "speaking", speaking: false });
		}
	}

	sendMediaState() {
		const payload = {
			type: "media_state",
			audioEnabled: this.mediaState.audioEnabled,
			videoEnabled: this.mediaState.videoEnabled,
			screenEnabled: this.mediaState.screenEnabled,
		};
		this.send(payload);
	}

	async forceSingleEncoding(sender) {
		if (!sender) {
			return;
		}

		try {
			const params = sender.getParameters();
			if (!params.encodings || params.encodings.length === 0) {
				params.encodings = [{}];
			} else if (params.encodings.length > 1) {
				params.encodings = [params.encodings[0]];
			}
			await sender.setParameters(params);
		} catch {
			return;
		}
	}

	async negotiatePub() {
		if (!this.pubPC) {
			return;
		}
		if (this.pubPC.signalingState !== "stable") {
			this.pendingPubNegotiation = true;
			return;
		}

		try {
			this.makingOffer = true;
			const offer = await this.pubPC.createOffer();
			await this.pubPC.setLocalDescription(offer);
			this.send({ type: "pub_offer", sdp: offer.sdp });
		} finally {
			this.makingOffer = false;
		}
	}

	async onPubAnswer(sdp) {
		if (!this.pubPC) {
			return;
		}
		if (!sdp) {
			return;
		}
		const answer = { type: "answer", sdp };
		await this.pubPC.setRemoteDescription(answer);
		await this.flushCandidates("pub");
	}

	async onSubOffer(sdp) {
		if (!sdp) {
			return;
		}
		this.subOfferQueue.push(sdp);
		await this.processSubOffers();
	}

	async processSubOffers() {
		if (this.processingSubOffer || !this.subPC) {
			return;
		}
		this.processingSubOffer = true;
		try {
			while (this.subOfferQueue.length > 0) {
				if (this.subPC.signalingState !== "stable") {
					await new Promise((resolve) => setTimeout(resolve, 50));
					continue;
				}

				const sdp = this.subOfferQueue.shift();
				if (!sdp) {
					continue;
				}
				try {
					const offer = { type: "offer", sdp };
					await this.subPC.setRemoteDescription(offer);
					const answer = await this.subPC.createAnswer();
					await this.subPC.setLocalDescription(answer);
					this.send({ type: "sub_answer", sdp: answer.sdp });
					await this.flushCandidates("sub");
				} catch {
					continue;
				}
			}
		} finally {
			this.processingSubOffer = false;
		}
	}

	async onCandidate(msg) {
		if (!msg.candidate) {
			return;
		}
		const target = msg.target === "sub" ? "sub" : "pub";
		const pc = target === "sub" ? this.subPC : this.pubPC;
		if (!pc) {
			return;
		}
		const candidate = {
			candidate: msg.candidate,
			sdpMid: msg.sdpMid || null,
			sdpMLineIndex: msg.sdpMLineIndex || 0,
		};
		if (!pc.remoteDescription) {
			this.pendingCandidates[target].push(candidate);
			return;
		}
		await pc.addIceCandidate(candidate);
	}

	async flushCandidates(target) {
		const pc = target === "sub" ? this.subPC : this.pubPC;
		if (!pc || !pc.remoteDescription) {
			return;
		}

		while (this.pendingCandidates[target].length > 0) {
			const candidate = this.pendingCandidates[target].shift();
			try {
				await pc.addIceCandidate(candidate);
			} catch {
				return;
			}
		}
	}

	send(payload) {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
			console.warn("[CLIENT] Cannot send, WebSocket not open. readyState:", this.ws?.readyState);
			return;
		}
		this.ws.send(JSON.stringify(payload));
	}
}

// Export también la clase original para backward compatibility
export { WebRTCClient as WebRTCClientFrameworkReady };
