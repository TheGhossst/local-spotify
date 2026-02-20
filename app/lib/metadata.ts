import path from "node:path";
import type { Song } from "./types";
import { pathToId } from "./scanner";

const MIME_MAP: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".flac": "audio/flac",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".opus": "audio/ogg; codecs=opus",
  ".wma": "audio/x-ms-wma",
};

export interface ParsedSong {
  song: Song;
  artworkBuffer?: Buffer;
  artworkMime?: string;
}

export async function parseAudioFile(filePath: string): Promise<ParsedSong> {
  const { parseFile } = await import("music-metadata");

  const ext = path.extname(filePath).toLowerCase();
  const mimeType = MIME_MAP[ext] ?? "audio/mpeg";
  const filename = path.basename(filePath, ext);

  let title = filename;
  let artist = "Unknown Artist";
  let album = "Unknown Album";
  let duration = 0;
  let hasArtwork = false;
  let artworkBuffer: Buffer | undefined;
  let artworkMime: string | undefined;

  try {
    const meta = await parseFile(filePath, { skipCovers: false });
    const t = meta.common;
    const f = meta.format;

    title = t.title ?? filename;
    artist = t.artist ?? t.albumartist ?? "Unknown Artist";
    album = t.album ?? "Unknown Album";
    duration = f.duration ?? 0;

    const picture = t.picture?.[0];
    if (picture) {
      hasArtwork = true;
      artworkBuffer = Buffer.from(picture.data);
      artworkMime = picture.format;
    }
  } catch {
    // metadata parsing failed — use filename defaults
  }

  const song: Song = {
    id: pathToId(filePath),
    title,
    artist,
    album,
    duration,
    filePath,
    hasArtwork,
    mimeType,
  };

  return { song, artworkBuffer, artworkMime };
}
