import { getFileMap } from "@/app/lib/scanner";
import { parseAudioFile } from "@/app/lib/metadata";
import type { Song } from "@/app/lib/types";
import MainLayout from "@/app/components/MainLayout";

async function getSongs(): Promise<Song[]> {
  try {
    const fileMap = await getFileMap();
    const results = await Promise.allSettled(
      [...fileMap.values()].map((fp) => parseAudioFile(fp))
    );
    return results
      .filter(
        (r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof parseAudioFile>>> =>
          r.status === "fulfilled"
      )
      .map((r) => r.value.song)
      .sort((a, b) => a.title.localeCompare(b.title));
  } catch {
    return [];
  }
}

export default async function Home() {
  const songs = await getSongs();
  return <MainLayout songs={songs} />;
}
