"use client";

import type { Song } from "@/app/lib/types";
import { usePlayer } from "@/app/context/PlayerContext";

function formatDuration(secs: number): string {
  if (!secs || isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface SongCardProps {
  song: Song;
  allSongs: Song[];
  isActive: boolean;
  index: number;
}

export default function SongCard({
  song,
  allSongs,
  isActive,
  index,
}: SongCardProps) {
  const { playSong, addToQueue, isPlaying } = usePlayer();

  return (
    <div
      className="group flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer hover:bg-white/6 active:bg-white/10"
      onClick={() => playSong(song, allSongs)}
    >
      <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
        <div className="w-7 text-center shrink-0">
          {isActive ? (
            <span
              className="material-symbols-outlined text-base leading-none"
              style={{
                color: "#2bee79",
                fontVariationSettings: isPlaying ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              equalizer
            </span>
          ) : (
            <span className="text-sm font-medium text-white/30 group-hover:text-white/60 transition-colors tabular-nums">
              {index + 1}
            </span>
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <span
            className="font-semibold text-sm truncate transition-colors"
            style={{ color: isActive ? "#2bee79" : "#ffffff" }}
          >
            {song.title}
          </span>
          <span
            className="text-xs truncate transition-colors"
            style={{ color: isActive ? "rgba(43,238,121,0.65)" : "#64748b" }}
          >
            {song.artist}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        <span
          className="text-xs tabular-nums"
          style={{ color: isActive ? "rgba(43,238,121,0.65)" : "#475569" }}
        >
          {formatDuration(song.duration)}
        </span>
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10"
          title="Add to queue"
          onClick={(e) => {
            e.stopPropagation();
            addToQueue(song);
          }}
          aria-label="Add to queue"
        >
          <span className="material-symbols-outlined text-[18px]">
            add_to_queue
          </span>
        </button>
      </div>
    </div>
  );
}
