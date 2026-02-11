import React from 'react';
import { RemotePeer } from '../types';
import { Icon } from '@/components/Icon';
import './participants-list.scss';
import { Button } from '@/components/Button';

interface ParticipantsListProps {
  peers: RemotePeer[];
  userName: string;
  localAudioEnabled: boolean;
  localVideoEnabled: boolean;
  open: boolean;
  onClose: () => void;
}

export const ParticipantsList: React.FC<ParticipantsListProps> = ({
  peers,
  userName,
  localAudioEnabled,
  localVideoEnabled,
  open,
  onClose,
}) => {
  const participantCount = peers.length + 1;

  return (
    <div className={`participants-panel ${open ? 'open' : ''}`}>
      <div className="panel-header">
        <Button className="close-btn" onClick={onClose} title="Close">
          <Icon icon='close' />
        </Button>
        <div className="panel-title">Participants ({participantCount})</div>
      </div>
      <div className="participants-list">
        <div className="participant">
          <span className="participant-name">{userName} (You)</span>
          <div className="participant-status">
            {localAudioEnabled && <span className="status-icon">🎤</span>}
            {localVideoEnabled && <span className="status-icon">📹</span>}
          </div>
        </div>
        {peers.map((peer) => (
          <div key={peer.peerId} className="participant">
            <span className="participant-name">{peer.userName || peer.userId}</span>
            <div className="participant-status">
              {peer.audioEnabled && <span className="status-icon">🎤</span>}
              {peer.videoEnabled && <span className="status-icon">📹</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
