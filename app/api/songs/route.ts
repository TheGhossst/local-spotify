import { NextResponse } from "next/server";
import { getFileMap } from "@/app/lib/scanner";
import { parseAudioFile } from "@/app/lib/metadata";
import type { Song } from "@/app/lib/types";

// In-process cache keyed to the scanner's fileMap reference.
// When invalidateCache() in scanner.ts replaces the map, these go stale automatically.
let fileMapSnapshot: Map<string, string> | null = null;
let songsCache: Song[] | null = null;

export const dynamic = "force-dynamic";

export async function GET() {
  const fileMap = await getFileMap();

  // Return cached songs only when the underlying file map hasn't changed.
  if (songsCache && fileMapSnapshot === fileMap) {
    return NextResponse.json(songsCache);
  }

  const results = await Promise.allSettled(
    [...fileMap.values()].map((fp) => parseAudioFile(fp)),
  );

  const songs: Song[] = results
    .filter(
      (
        r,
      ): r is PromiseFulfilledResult<
        Awaited<ReturnType<typeof parseAudioFile>>
      > => r.status === "fulfilled",
    )
    .map((r) => r.value.song)
    .sort((a, b) => a.title.localeCompare(b.title));

  fileMapSnapshot = fileMap;
  songsCache = songs;
  return NextResponse.json(songs);
}
