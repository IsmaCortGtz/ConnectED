import React, { useEffect, useRef } from 'react';
import './video-tile.scss';

interface VideoTileProps {
  videoStream: MediaStream | null;
  audioStream?: MediaStream | null;
  userName: string;
  isLocal?: boolean;
  audioEnabled?: boolean;
  videoEnabled?: boolean;
  isSpeaking?: boolean;
  isScreen?: boolean;
}

export const VideoTile: React.FC<VideoTileProps> = ({
  videoStream,
  audioStream,
  userName,
  isLocal = false,
  audioEnabled = true,
  videoEnabled = true,
  isSpeaking = false,
  isScreen = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (videoRef.current) {
        if (videoStream && videoEnabled) {
            if (videoRef.current.srcObject !== videoStream) {
                videoRef.current.srcObject = videoStream;
                videoRef.current.play().catch(console.error);
            }
        } else {
            videoRef.current.srcObject = null;
        }
    }
  }, [videoStream, videoEnabled]);

  useEffect(() => {
    if (audioRef.current) {
        if (audioStream && audioEnabled) {
             if (audioRef.current.srcObject !== audioStream) {
                audioRef.current.srcObject = audioStream;
                audioRef.current.play().catch(console.error);
             }
        } else {
            audioRef.current.srcObject = null;
        }
    }
  }, [audioStream, audioEnabled]);

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const containerClass = `video-box ${isLocal ? 'local-card' : ''} ${isScreen ? 'screen-share-box' : ''} ${isSpeaking ? 'speaking' : ''}`;

  // Local videos should be muted to avoid feedback, remote audio handled by audio ref
  // If isLocal, we mute the <video> tag just in case, and don't render <audio>
  
  return (
    <div className={containerClass}>
      <div className="video-content">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal || isScreen}
          className="video"
          style={{ display: videoStream && videoEnabled ? 'block' : 'none' }}
        />
        
        {!isLocal && (
          <audio
            ref={audioRef}
            autoPlay
            playsInline
            style={{ display: 'none' }}
          />
        )}

        {(!videoStream || !videoEnabled) && !isScreen && (
          <div className="video-placeholder">
            <div className="initials">{initials}</div>
          </div>
        )}
      </div>

      <div className="video-label">
        <span className="user-name">
          {userName} {isLocal && !isScreen ? '(You)' : ''} {isScreen ? '- Screen' : ''}
        </span>
      </div>
    </div>
  );
};
