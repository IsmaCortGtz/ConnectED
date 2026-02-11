export interface RemotePeer {
  peerId: string;
  userId: string;
  userName?: string; // Added userName
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenEnabled: boolean;
  speaking: boolean;
}

export type TileKind = 'video' | 'audio';
export type TileSource = 'camera' | 'screen';

export interface RemoteTile {
  id: string;
  peerId: string;
  streamId: string;
  kind: TileKind;
  source: TileSource;
  stream: MediaStream;
  updatedAt: number;
}
