import React, { useRef, useState, useEffect, useMemo } from 'react';
import { RemotePeer, RemoteTile, TileKind, TileSource } from '../types';
import { VideoTile } from './VideoTile';
import './video-grid.scss';

interface VideoGridProps {
  peers: Map<string, RemotePeer>;
  tiles: RemoteTile[];
  localStream: MediaStream | null;
  localPeerId: string | null;
  userName: string;
  localAudioEnabled: boolean;
  localVideoEnabled: boolean;
  localScreenEnabled: boolean;
}

interface GridLayout {
  columns: number;
  rows: number;
  tileWidth: number;
  tileHeight: number;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  peers,
  tiles,
  localStream,
  localPeerId,
  userName,
  localAudioEnabled,
  localVideoEnabled,
  localScreenEnabled,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Measure container on mount and resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      setDimensions({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  const getTile = (peerId: string, kind: TileKind, source: TileSource): RemoteTile | undefined => {
    const list = tiles.filter(
      (tile) => tile.peerId === peerId && tile.kind === kind && tile.source === source
    );
    if (list.length === 0) return undefined;
    return list.sort((a, b) => b.updatedAt - a.updatedAt)[0];
  };

  const localScreenTile = localPeerId ? getTile(localPeerId, 'video', 'screen') : undefined;
  const peerList = Array.from(peers.values()).filter((p) => p.peerId !== localPeerId);

  // Count total tiles
  const totalTiles = useMemo(() => {
    let count = 1; // Local camera
    if (localScreenEnabled && localScreenTile) count++;
    count += peerList.length;
    peerList.forEach((p) => {
      if (getTile(p.peerId, 'video', 'screen')) count++;
    });
    return count;
  }, [peerList, localScreenEnabled, localScreenTile]);

  // Calculate optimal grid layout (like Google Meet)
  const layout = useMemo((): GridLayout => {
    const { width, height } = dimensions;
    if (width === 0 || height === 0) {
      return { columns: 1, rows: 1, tileWidth: 0, tileHeight: 0 };
    }

    const VIDEO_ASPECT = 16 / 9; // ~1.778
    const GAP = 6;
    const PADDING = 24; // 12px top + 12px bottom
    const MIN_TILE_WIDTH = 80;

    const availWidth = width - PADDING;
    const availHeight = height - PADDING;

    // Limit max columns based on available width (responsive)
    let maxCols = 6;
    if (availWidth < 500) {
      maxCols = 1; // Very narrow: single column only
    } else if (availWidth < 800) {
      maxCols = 2; // Narrow: max 2 columns
    } else if (availWidth < 1200) {
      maxCols = 3; // Medium: max 3 columns
    }

    let bestLayout: GridLayout = { columns: 1, rows: totalTiles, tileWidth: 0, tileHeight: 0 };
    let bestArea = 0;

    // Try all reasonable combinations of columns x rows
    const maxColsToTry = Math.min(totalTiles, maxCols);
    for (let cols = 1; cols <= maxColsToTry; cols++) {
      const rows = Math.ceil(totalTiles / cols);

      // Calculate tile dimensions that maintain aspect ratio
      const tileWidth = (availWidth - GAP * (cols - 1)) / cols;
      const tileHeight = tileWidth / VIDEO_ASPECT;

      // Check if it fits
      const totalHeight = rows * tileHeight + GAP * (rows - 1);

      // Criteria: must fit vertically and have reasonable minimum size
      if (tileWidth >= MIN_TILE_WIDTH && totalHeight <= availHeight) {
        const area = tileWidth * tileHeight;
        if (area > bestArea) {
          bestArea = area;
          bestLayout = { columns: cols, rows, tileWidth, tileHeight };
        }
      }
    }

    // If no layout fits height (too many tiles), scale down proportionally
    if (bestArea === 0) {
      for (let cols = 1; cols <= maxColsToTry; cols++) {
        const rows = Math.ceil(totalTiles / cols);
        let tileWidth = (availWidth - GAP * (cols - 1)) / cols;
        let tileHeight = tileWidth / VIDEO_ASPECT;

        // If total height exceeds container, scale down tiles
        let totalHeight = rows * tileHeight + GAP * (rows - 1);
        if (totalHeight > availHeight) {
          const scaleFactor = availHeight / totalHeight;
          tileHeight *= scaleFactor;
          tileWidth = tileHeight * VIDEO_ASPECT;
        }

        if (tileWidth >= MIN_TILE_WIDTH) {
          const area = tileWidth * tileHeight;
          if (area > bestArea) {
            bestArea = area;
            bestLayout = { columns: cols, rows, tileWidth, tileHeight };
          }
        }
      }
    }

    // Last resort: single column, fit to available height
    if (bestArea === 0) {
      let tileWidth = Math.min(availWidth, 400);
      let tileHeight = tileWidth / VIDEO_ASPECT;
      const maxHeightPerTile = availHeight / totalTiles;
      
      if (tileHeight > maxHeightPerTile) {
        tileHeight = maxHeightPerTile - GAP;
        tileWidth = tileHeight * VIDEO_ASPECT;
      }
      
      bestLayout = { columns: 1, rows: totalTiles, tileWidth, tileHeight };
    }

    return bestLayout;
  }, [dimensions, totalTiles]);

  const tileHeightPx = layout.tileHeight > 0 ? `${layout.tileHeight}px` : 'auto';

  return (
    <div ref={containerRef} className="videos-container">
      <div
        className="videos-grid"
        style={{
          gridTemplateColumns: `repeat(${layout.columns}, 1fr)`,
          gridAutoRows: tileHeightPx,
          gap: '6px',
        }}
      >
        {/* Local Camera */}
        <VideoTile
          videoStream={localStream}
          userName={userName}
          isLocal={true}
          audioEnabled={localAudioEnabled}
          videoEnabled={localVideoEnabled}
          isSpeaking={false}
          isScreen={false}
        />

        {/* Local Screen Share */}
        {localScreenEnabled && localScreenTile && (
          <VideoTile
            videoStream={localScreenTile.stream}
            userName={userName}
            isLocal={true}
            audioEnabled={false}
            videoEnabled={true}
            isScreen={true}
          />
        )}

        {/* Remote Peers */}
        {peerList.map((peer) => {
          const cameraVideoTile = getTile(peer.peerId, 'video', 'camera');
          const cameraAudioTile = getTile(peer.peerId, 'audio', 'camera');
          const screenVideoTile = getTile(peer.peerId, 'video', 'screen');

          return (
            <React.Fragment key={peer.peerId}>
              <VideoTile
                videoStream={cameraVideoTile?.stream || null}
                audioStream={cameraAudioTile?.stream || null}
                userName={peer.userName || peer.userId}
                isLocal={false}
                audioEnabled={peer.audioEnabled}
                videoEnabled={peer.videoEnabled}
                isSpeaking={peer.speaking}
                isScreen={false}
              />

              {screenVideoTile && (
                <VideoTile
                  videoStream={screenVideoTile.stream}
                  userName={peer.userName || peer.userId}
                  isLocal={false}
                  audioEnabled={true}
                  videoEnabled={true}
                  isScreen={true}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
