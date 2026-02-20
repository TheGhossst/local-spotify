import { NextResponse } from "next/server";
import { getFileMap } from "@/app/lib/scanner";
import { parseAudioFile } from "@/app/lib/metadata";
import type { Song } from "@/app/lib/types";

// In-process cache so we don't re-parse on every request
let songsCache: Song[] | null = null;

export const dynamic = "force-dynamic";

export async function GET() {
  if (songsCache) {
    return NextResponse.json(songsCache);
  }

  const fileMap = await getFileMap();
  const results = await Promise.allSettled(
    [...fileMap.values()].map((fp) => parseAudioFile(fp))
  );

  const songs: Song[] = results
    .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof parseAudioFile>>> => r.status === "fulfilled")
    .map((r) => r.value.song)
    .sort((a, b) => a.title.localeCompare(b.title));

  songsCache = songs;
  return NextResponse.json(songs);
}
