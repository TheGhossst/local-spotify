"use client";

import { usePlayer } from "@/app/context/PlayerContext";

function fmt(secs: number): string {
  if (!secs || isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ProgressBar() {
  const { currentTime, duration, seek } = usePlayer();
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-2 w-full">
      <span
        className="text-xs tabular-nums w-10 text-right"
        style={{ color: "var(--text-secondary)" }}
      >
        {fmt(currentTime)}
      </span>
      <div className="relative flex-1 h-1 group">
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: "var(--surface-raised)" }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all"
          style={{ width: `${progress}%`, background: "var(--accent)" }}
        />
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.5}
          value={currentTime}
          onChange={(e) => seek(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Seek"
        />
      </div>
      <span
        className="text-xs tabular-nums w-10"
        style={{ color: "var(--text-secondary)" }}
      >
        {fmt(duration)}
      </span>
    </div>
  );
}
