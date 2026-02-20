export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // seconds
  filePath: string;
  hasArtwork: boolean;
  mimeType: string;
}

export enum RepeatMode {
  Off = "off",
  All = "all",
  One = "one",
}

export interface QueueItem {
  song: Song;
  queueId: string; // unique per queue entry so duplicates work
}
