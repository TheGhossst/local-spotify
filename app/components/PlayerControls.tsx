"use client";

import { usePlayer } from "@/app/context/PlayerContext";
import { RepeatMode } from "@/app/lib/types";

export default function PlayerControls() {
  const {
    isPlaying,
    shuffle,
    repeat,
    togglePlay,
    toggleShuffle,
    toggleRepeat,
    next,
    prev,
    queue,
  } = usePlayer();

  const hasTrack = queue.length > 0;

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={toggleShuffle}
        className="transition-colors"
        style={{ color: shuffle ? "var(--accent)" : "var(--text-secondary)" }}
        aria-label="Shuffle"
        title="Shuffle"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M16 3l4 4-4 4M8 7h12M16 17l4 4-4 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 17h4a4 4 0 004-4V9a4 4 0 014-4h0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <button
        onClick={prev}
        disabled={!hasTrack}
        className="disabled:opacity-30"
        style={{ color: "var(--text-primary)" }}
        aria-label="Previous"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M6 6h2v12H6zM17 6L8 12l9 6V6z" />
        </svg>
      </button>

      <button
        onClick={togglePlay}
        disabled={!hasTrack}
        className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-30 transition-transform active:scale-95"
        style={{ background: "var(--text-primary)", color: "var(--bg)" }}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
          </svg>
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M5 3l14 9-14 9V3z" />
          </svg>
        )}
      </button>

      <button
        onClick={next}
        disabled={!hasTrack}
        className="disabled:opacity-30"
        style={{ color: "var(--text-primary)" }}
        aria-label="Next"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M16 6h2v12h-2zM7 6l9 6-9 6V6z" />
        </svg>
      </button>

      <button
        onClick={toggleRepeat}
        className="relative transition-colors"
        style={{
          color:
            repeat !== RepeatMode.Off
              ? "var(--accent)"
              : "var(--text-secondary)",
        }}
        aria-label="Repeat"
        title={
          repeat === RepeatMode.Off
            ? "Repeat off"
            : repeat === RepeatMode.All
              ? "Repeat all"
              : "Repeat one"
        }
      >
        {repeat === RepeatMode.One ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text
              x="10"
              y="15.5"
              fontSize="7"
              fontWeight="bold"
              fill="currentColor"
            >
              1
            </text>
          </svg>
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
