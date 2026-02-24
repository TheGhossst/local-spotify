import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const AUDIO_EXTENSIONS = new Set([
  ".mp3",
  ".flac",
  ".wav",
  ".ogg",
  ".m4a",
  ".aac",
  ".opus",
  ".wma",
]);

export const MUSIC_DIR = path.join(os.homedir(), "Music");

export function pathToId(filePath: string): string {
  const rel = path.relative(MUSIC_DIR, filePath);
  return Buffer.from(rel).toString("base64url");
}

export function idToPath(id: string): string {
  const rel = Buffer.from(id, "base64url").toString("utf8");
  const resolved = path.join(MUSIC_DIR, rel);
  // Guard against path-traversal attacks: the resolved path must stay inside MUSIC_DIR.
  const musicDirWithSep = MUSIC_DIR.endsWith(path.sep) ? MUSIC_DIR : MUSIC_DIR + path.sep;
  if (resolved !== MUSIC_DIR && !resolved.startsWith(musicDirWithSep)) {
    throw new Error("Forbidden");
  }
  return resolved;
}

let cache: Map<string, string> | null = null;

async function walk(dir: string, results: Map<string, string>): Promise<void> {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, results);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (AUDIO_EXTENSIONS.has(ext)) {
        results.set(pathToId(full), full);
      }
    }
  }
}

export async function getFileMap(): Promise<Map<string, string>> {
  if (cache) return cache;
  const map = new Map<string, string>();
  await walk(MUSIC_DIR, map);
  cache = map;
  return map;
}

export function invalidateCache(): void {
  cache = null;
}
