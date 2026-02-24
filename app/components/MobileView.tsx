"use client";

import { useRef } from "react";
import type { Song } from "@/app/lib/types";
import { formatTotalDuration } from "@/app/lib/format";
import { usePlayer } from "@/app/context/PlayerContext";
import ArtworkDisplay from "./ArtworkDisplay";
import PlaybackControls from "./PlaybackControls";
import MusicPlayer from "./MusicPlayer";
import SongList from "./SongList";

interface MobileViewProps {
  songs: Song[];
  query: string;
  onQueryChange: (q: string) => void;
  onLogout: () => void;
}

export default function MobileView({
  songs,
  query,
  onQueryChange,
  onLogout,
}: MobileViewProps) {
  const { queue, currentIndex, toggleShowQueue, showQueue } = usePlayer();
  const mobileMainRef = useRef<HTMLElement>(null);
  const currentItem = queue[currentIndex];

  return (
    <div className="flex flex-col flex-1 overflow-hidden md:hidden">
      <header
        className="shrink-0 flex items-center justify-between px-4 pt-9 pb-3 border-b border-white/5"
        style={{
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(12px)",
        }}
      >
        <button
          onClick={toggleShowQueue}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/70 hover:text-white transition-colors"
          aria-label="Toggle queue"
        >
          <span className="material-symbols-outlined text-[22px]">
            queue_music
          </span>
        </button>
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ color: "#ffffff", fontVariationSettings: "'FILL' 1" }}
          >
            headphones
          </span>
          <span className="text-white font-bold text-sm tracking-tight">
            LocalFM
          </span>
        </div>
        <button
          onClick={onLogout}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/70 hover:text-white transition-colors"
          aria-label="Log out"
        >
          <span className="material-symbols-outlined text-[22px]">logout</span>
        </button>
      </header>

      <main
        ref={mobileMainRef}
        className="flex-1 overflow-y-auto"
        style={{ background: "transparent" }}
      >
        <div
          className="absolute top-0 left-0 w-full h-105 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.04) 0%, transparent 100%)",
          }}
        />

        <div className="relative flex flex-col items-center px-6 pt-6 pb-4 gap-4">
          <ArtworkDisplay
            songId={currentItem?.song.id}
            album={currentItem?.song.album}
            hasArtwork={currentItem?.song.hasArtwork}
            className="w-52 h-52 rounded-2xl shadow-[0_16px_40px_-8px_rgba(0,0,0,0.5)]"
            iconSize={72}
          />

          <div className="text-center w-full max-w-xs">
            <h2 className="text-xl font-bold text-white truncate">
              {currentItem ? currentItem.song.title : "Your Library"}
            </h2>
            <div className="flex items-center justify-center gap-2 text-sm mt-1 flex-wrap">
              {currentItem ? (
                <>
                  <span style={{ color: "rgba(255,255,255,0.55)" }}>
                    {currentItem.song.artist}
                  </span>
                  {currentItem.song.album &&
                    currentItem.song.album !== "Unknown Album" && (
                      <>
                        <span className="text-white/25">·</span>
                        <span className="text-white/40 truncate max-w-35">
                          {currentItem.song.album}
                        </span>
                      </>
                    )}
                </>
              ) : (
                <>
                  <span className="text-white/40">{songs.length} tracks</span>
                  <span className="text-white/25">·</span>
                  <span className="text-white/40">
                    {formatTotalDuration(songs)}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center w-full pt-1">
            <PlaybackControls size="mobile" />
          </div>

          <div className="relative w-full max-w-sm mt-1">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/30">
              <span className="material-symbols-outlined text-[18px]">
                search
              </span>
            </span>
            <input
              type="search"
              placeholder="Search songs, artists, albums…"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              className="w-full rounded-full pl-9 pr-4 py-2.5 text-sm outline-none text-white border border-white/8 focus:border-primary/50 transition-colors"
              style={{ background: "rgba(255,255,255,0.05)" }}
            />
          </div>
        </div>

        <div className="px-2">
          <SongList songs={songs} query={query} />
        </div>
        <div className="h-36" />
      </main>

      <MusicPlayer />

      <nav
        className="shrink-0 flex items-center justify-around px-2 py-3 border-t border-white/5"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}
      >
        <button className="flex flex-col items-center gap-0.5 min-w-14">
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ color: "#ffffff", fontVariationSettings: "'FILL' 1" }}
          >
            library_music
          </span>
          <span className="text-[10px] font-bold" style={{ color: "#ffffff" }}>
            Library
          </span>
        </button>

        <button
          onClick={toggleShowQueue}
          className="flex flex-col items-center gap-0.5 min-w-14 transition-colors"
        >
          <span
            className="material-symbols-outlined text-[24px] transition-colors"
            style={{
              color: showQueue ? "#ffffff" : "rgba(255,255,255,0.35)",
            }}
          >
            queue_music
          </span>
          <span
            className="text-[10px] font-medium transition-colors"
            style={{
              color: showQueue ? "#ffffff" : "rgba(255,255,255,0.35)",
            }}
          >
            Queue
          </span>
        </button>

        <button
          onClick={onLogout}
          className="flex flex-col items-center gap-0.5 min-w-14 group"
        >
          <span className="material-symbols-outlined text-[24px] text-white/35 group-hover:text-white/70 transition-colors">
            logout
          </span>
          <span className="text-[10px] font-medium text-white/35 group-hover:text-white/70 transition-colors">
            Log out
          </span>
        </button>
      </nav>
    </div>
  );
}
