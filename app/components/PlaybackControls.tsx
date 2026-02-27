"use client";

import type { Song } from "@/app/lib/types";
import { usePlayer } from "@/app/context/PlayerContext";

interface PlaybackControlsProps {
  size: "desktop" | "mobile";
  songs?: Song[];
}

export default function PlaybackControls({
  size,
  songs,
}: PlaybackControlsProps) {
  const {
    togglePlay,
    toggleShuffle,
    toggleRepeat,
    isPlaying,
    shuffle,
    repeat,
    next,
    prev,
    queue,
    playAll,
  } = usePlayer();

  function handlePlayPause() {
    if (!queue.length && songs?.length) {
      playAll(songs);
    } else {
      togglePlay();
    }
  }

  const isDesktop = size === "desktop";

  return (
    <div
      className={`flex items-center ${
        isDesktop ? "justify-between" : "justify-center gap-5"
      } w-full`}
    >
      <button
        onClick={toggleShuffle}
        className={`${isDesktop ? "w-9 h-9" : ""} flex items-center justify-center rounded-full ${
          isDesktop ? "hover:bg-white/5" : ""
        } transition-colors`}
        style={{ color: shuffle ? "#ffffff" : "#94a3b8" }}
        aria-label="Shuffle"
      >
        <span
          className={`material-symbols-outlined ${
            isDesktop ? "text-[20px]" : "text-[24px]"
          }`}
        >
          shuffle
        </span>
      </button>

      <button
        onClick={prev}
        className={`${
          isDesktop
            ? "w-9 h-9 text-white/60 hover:text-white hover:bg-white/5"
            : "text-white/60 hover:text-white"
        } flex items-center justify-center rounded-full transition-colors`}
        aria-label="Previous"
      >
        <span
          className={`material-symbols-outlined ${
            isDesktop ? "text-[26px]" : "text-[30px]"
          }`}
        >
          skip_previous
        </span>
      </button>

      <button
        onClick={handlePlayPause}
        className={`${
          isDesktop ? "w-14 h-14" : "w-16 h-16"
        } rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform border border-white/10`}
        style={{ background: "rgba(255,255,255,0.1)", color: "#ffffff" }}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: isDesktop ? "34px" : "40px",
            fontVariationSettings: "'FILL' 1",
          }}
        >
          {isPlaying ? "pause" : "play_arrow"}
        </span>
      </button>

      <button
        onClick={next}
        className={`${
          isDesktop
            ? "w-9 h-9 text-white/60 hover:text-white hover:bg-white/5"
            : "text-white/60 hover:text-white"
        } flex items-center justify-center rounded-full transition-colors`}
        aria-label="Next"
      >
        <span
          className={`material-symbols-outlined ${
            isDesktop ? "text-[26px]" : "text-[30px]"
          }`}
        >
          skip_next
        </span>
      </button>

      <button
        onClick={toggleRepeat}
        className={`${isDesktop ? "w-9 h-9" : ""} flex items-center justify-center rounded-full ${
          isDesktop ? "hover:bg-white/5" : ""
        } transition-colors`}
        style={{ color: repeat !== "off" ? "#ffffff" : "#94a3b8" }}
        aria-label="Repeat"
      >
        <span
          className={`material-symbols-outlined ${
            isDesktop ? "text-[20px]" : "text-[24px]"
          }`}
        >
          {repeat === "one" ? "repeat_one" : "repeat"}
        </span>
      </button>
    </div>
  );
}
