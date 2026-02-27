"use client";

import type { Song } from "@/app/lib/types";
import { usePlayer } from "@/app/context/PlayerContext";
import { formatTime } from "@/app/lib/format";
import ArtworkDisplay from "./ArtworkDisplay";
import PlaybackControls from "./PlaybackControls";

interface DesktopSidebarProps {
  onLogout: () => void;
  songs?: Song[];
}

export default function DesktopSidebar({
  onLogout,
  songs,
}: DesktopSidebarProps) {
  const {
    queue,
    currentIndex,
    toggleShowQueue,
    showQueue,
    seek,
    currentTime,
    duration,
  } = usePlayer();

  const currentItem = queue[currentIndex];

  return (
    <aside className="hidden md:flex w-72 lg:w-80 flex-col shrink-0 border-r border-white/8">
      <div className="flex items-center justify-between px-5 pt-6 pb-5 shrink-0">
        <div className="flex items-center gap-2.5">
          <span
            className="material-symbols-outlined text-[28px]"
            style={{ color: "#ffffff", fontVariationSettings: "'FILL' 1" }}
          >
            headphones
          </span>
          <span className="text-white font-extrabold text-lg tracking-tight">
            LocalFM
          </span>
        </div>
        <button
          onClick={onLogout}
          className="w-8 h-8 flex items-center justify-center rounded-full text-white/30 hover:text-white/80 hover:bg-white/5 transition-colors"
          aria-label="Log out"
          title="Log out"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
        </button>
      </div>

      <div className="px-5 shrink-0">
        <ArtworkDisplay
          songId={currentItem?.song.id}
          album={currentItem?.song.album}
          hasArtwork={currentItem?.song.hasArtwork}
          className="w-full aspect-square rounded-2xl shadow-[0_12px_40px_-8px_rgba(0,0,0,0.5)]"
          iconSize={72}
        />
      </div>

      <div className="px-5 pt-4 text-center shrink-0">
        <p className="text-white font-bold text-base truncate leading-tight">
          {currentItem ? currentItem.song.title : "Nothing playing"}
        </p>
        <p
          className="text-sm truncate mt-1"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          {currentItem ? currentItem.song.artist : "—"}
        </p>
        {currentItem?.song.album &&
          currentItem.song.album !== "Unknown Album" && (
            <p className="text-xs truncate mt-0.5 text-white/35">
              {currentItem.song.album}
            </p>
          )}
      </div>

      <div className="px-5 pt-5 shrink-0">
        <div
          className="relative group/seek cursor-pointer py-1.5"
          onClick={(e) => {
            if (!duration) return;
            const rect = e.currentTarget.getBoundingClientRect();
            seek(duration * ((e.clientX - rect.left) / rect.width));
          }}
        >
          <div
            className="h-1 rounded-full overflow-visible relative"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <div
              className="h-full rounded-full absolute top-0 left-0 transition-[width] duration-100"
              style={{
                width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                background: "rgba(255,255,255,0.75)",
              }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow opacity-0 group-hover/seek:opacity-100 transition-opacity"
              style={{
                left: `calc(${
                  duration > 0 ? (currentTime / duration) * 100 : 0
                }% - 6px)`,
              }}
            />
          </div>
        </div>
        <div className="flex justify-between -mt-0.5">
          <span className="text-[10px] tabular-nums text-white/30">
            {formatTime(currentTime)}
          </span>
          <span className="text-[10px] tabular-nums text-white/30">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      <div className="px-5 pt-3 shrink-0">
        <PlaybackControls size="desktop" songs={songs} />
      </div>

      <div className="flex-1" />

      <div className="px-4 pb-6 shrink-0">
        <button
          onClick={toggleShowQueue}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-white/8"
          style={{ color: showQueue ? "#ffffff" : "#94a3b8" }}
        >
          <span className="material-symbols-outlined text-[20px]">
            queue_music
          </span>
          Queue
        </button>
      </div>
    </aside>
  );
}
