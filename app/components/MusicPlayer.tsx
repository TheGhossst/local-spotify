"use client";

import { useState, useRef } from "react";
import { usePlayer } from "@/app/context/PlayerContext";

export default function MusicPlayer() {
  const {
    queue,
    currentIndex,
    isPlaying,
    togglePlay,
    currentTime,
    duration,
    next,
    prev,
  } = usePlayer();

  const currentItem = queue[currentIndex];
  const [artworkError, setArtworkError] = useState(false);
  const prevSongIdRef = useRef<string | undefined>(currentItem?.song.id);
  if (prevSongIdRef.current !== currentItem?.song.id) {
    prevSongIdRef.current = currentItem?.song.id;
    setArtworkError(false);
  }

  if (!currentItem) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const showArtwork = currentItem.song.hasArtwork && !artworkError;

  return (
    <div
      className="shrink-0 px-3 py-2 border-t border-white/5"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(16px)" }}
    >
      <div
        className="relative flex items-center gap-3 px-3 py-2 rounded-xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.05)" }}
      >
        <div className="h-11 w-11 rounded-lg overflow-hidden shrink-0 bg-[#1a1a1a]">
          {showArtwork ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/artwork/${currentItem.song.id}`}
              alt={currentItem.song.album}
              className="w-full h-full object-cover"
              onError={() => setArtworkError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-primary/40 text-xl">
                music_note
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-bold truncate leading-tight">
            {currentItem.song.title}
          </p>
          <p className="text-primary text-xs truncate leading-tight mt-0.5">
            {currentItem.song.artist}
          </p>
        </div>
        <div className="flex items-center gap-1 pr-1 shrink-0">
          <button
            onClick={prev}
            className="text-white/70 hover:text-white transition-colors p-1"
            aria-label="Previous"
          >
            <span className="material-symbols-outlined text-[22px]">
              skip_previous
            </span>
          </button>
          <button
            onClick={togglePlay}
            className="text-white hover:text-primary transition-colors p-1"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            <span
              className="material-symbols-outlined text-[32px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {isPlaying ? "pause" : "play_arrow"}
            </span>
          </button>
          <button
            onClick={next}
            className="text-white/70 hover:text-white transition-colors p-1"
            aria-label="Next"
          >
            <span className="material-symbols-outlined text-[22px]">
              skip_next
            </span>
          </button>
        </div>

        <div className="absolute bottom-0 left-1 right-1 h-0.5 bg-slate-600/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
