import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import './video-call.scss';

import { useWebRTC } from './hooks/useWebRTC';
import { VideoGrid } from './components/VideoGrid';
import { Controls } from './components/Controls';
import { ParticipantsList } from './components/ParticipantsList';
import { LoadingScreen } from './components/LoadingScreen';

export default function VideoCall() {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const [showParticipants, setShowParticipants] = useState(false);
  
  const userId = useSelector((state: RootState) => state.auth.id.toString());
  const userName = useSelector((state: RootState) => `${state.auth.name} ${state.auth.last_name}`);

  const sessionId = lessonId ?? '';

  const {
    isConnected,
    isConnecting,
    localStream,
    peers,
    tiles,
    localPeerId,
    audioEnabled,
    videoEnabled,
    screenEnabled,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    disconnect
  } = useWebRTC({ userId, userName, sessionId });

  const handleHangup = () => {
    disconnect();
    navigate(-1);
  };

  const toggleParticipants = () => {
    setShowParticipants(!showParticipants);
  };

  // Detect support
  const supportsScreenShare = !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);

  return (
    <div className="video-call-container">
      {isConnecting && !isConnected && <LoadingScreen />}

      {isConnected && (
        <>
          <VideoGrid
            peers={peers}
            tiles={tiles}
            localStream={localStream}
            localPeerId={localPeerId}
            userName={userName}
            localAudioEnabled={audioEnabled}
            localVideoEnabled={videoEnabled}
            localScreenEnabled={screenEnabled}
          />

          <Controls
            audioEnabled={audioEnabled}
            videoEnabled={videoEnabled}
            screenEnabled={screenEnabled}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onToggleScreen={toggleScreenShare}
            onToggleParticipants={toggleParticipants}
            onHangup={handleHangup}
            supportsScreenShare={supportsScreenShare}
            showParticipants={showParticipants}
          />

            <ParticipantsList
            open={showParticipants}
              peers={Array.from(peers.values())}
              userName={userName}
              localAudioEnabled={audioEnabled}
              localVideoEnabled={videoEnabled}
              onClose={() => setShowParticipants(false)}
            />
        </>
      )}
    </div>
  );
}
