"use client";

import { useMemo } from "react";
import type { Song } from "@/app/lib/types";
import SongCard from "./SongCard";
import { usePlayer } from "@/app/context/PlayerContext";

interface SongListProps {
  songs: Song[];
  query: string;
}

export default function SongList({ songs, query }: SongListProps) {
  const { queue, currentIndex } = usePlayer();
  const currentSongId = queue[currentIndex]?.song.id;

  const filtered = useMemo(() => {
    if (!query.trim()) return songs;
    const q = query.toLowerCase();
    return songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q),
    );
  }, [songs, query]);

  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
        <span
          className="material-symbols-outlined text-slate-600"
          style={{ fontSize: "56px" }}
        >
          music_off
        </span>
        <p className="text-sm text-slate-400">
          No audio files found in{" "}
          <code className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
            ~/Music
          </code>
        </p>
        <p className="text-xs text-slate-500">
          Add MP3, FLAC, WAV, OGG, M4A, or AAC files to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {filtered.length === 0 ? (
        <p className="px-4 py-8 text-sm text-center text-slate-400">
          No results for &ldquo;{query}&rdquo;
        </p>
      ) : (
        filtered.map((song, index) => (
          <SongCard
            key={song.id}
            song={song}
            allSongs={filtered}
            isActive={song.id === currentSongId}
            index={index}
          />
        ))
      )}
    </div>
  );
}

