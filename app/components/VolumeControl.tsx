"use client";

import { useState } from "react";
import { usePlayer } from "@/app/context/PlayerContext";

function VolumeIcon({ level }: { level: number }) {
  if (level === 0) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" />
        <path
          d="M17 9l4 6M21 9l-4 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (level < 0.5) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" />
        <path
          d="M15.5 8.5A4 4 0 0115.5 15.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" />
      <path
        d="M15.5 8.5A4 4 0 0115.5 15.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M19 5.5A9 9 0 0119 18.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function VolumeControl() {
  const { volume, setVolume } = usePlayer();
  const [prevVolume, setPrevVolume] = useState(1);

  function toggleMute() {
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
    } else {
      setVolume(prevVolume);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleMute}
        className="shrink-0"
        style={{ color: "var(--text-secondary)" }}
        aria-label={volume === 0 ? "Unmute" : "Mute"}
      >
        <VolumeIcon level={volume} />
      </button>
      <div className="relative w-24 h-1 group">
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: "var(--surface-raised)" }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${volume * 100}%`, background: "var(--accent)" }}
        />
        <input
          type="range"
          min={0}
          max={1}
          step={0.02}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Volume"
        />
      </div>
    </div>
  );
}
