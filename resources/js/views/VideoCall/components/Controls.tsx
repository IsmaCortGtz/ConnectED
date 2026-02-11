import React from 'react';
import './controls.scss';
import { Icon } from '@/components/Icon';

interface ControlsProps {
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreen: () => void;
  onToggleParticipants: () => void;
  onHangup: () => void;
  supportsScreenShare: boolean;
  showParticipants: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  audioEnabled,
  videoEnabled,
  screenEnabled,
  onToggleAudio,
  onToggleVideo,
  onToggleScreen,
  onToggleParticipants,
  onHangup,
  supportsScreenShare,
  showParticipants,
}) => {
  return (
    <div className="controls">
      <button
        className={`btn audio ${audioEnabled ? 'active' : ''}`}
        onClick={onToggleAudio}
        title={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
      >
        <Icon icon={audioEnabled ? 'mic' : 'mic-off'} />
      </button>

      <button
        className={`btn video ${videoEnabled ? 'active' : ''}`}
        onClick={onToggleVideo}
        title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
      >
        <Icon icon={videoEnabled ? 'videocam' : 'videocam-off'} />
      </button>

      {supportsScreenShare && (
        <button
          className={`btn screen ${screenEnabled ? 'active' : ''}`}
          onClick={onToggleScreen}
          title={screenEnabled ? 'Stop sharing' : 'Share screen'}
        >
          <Icon icon='present-to-all' />
        </button>
      )}

      <button
        className={`btn participants ${showParticipants ? 'active' : ''}`}
        onClick={onToggleParticipants}
        title='Participants'
      >
        <Icon icon='person' />
      </button>

      <button className="btn hangup" onClick={onHangup} title="Leave call">
        <Icon icon='call-end' />
      </button>
    </div>
  );
};
