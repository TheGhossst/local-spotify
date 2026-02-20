"use client";

import { useEffect, useRef, useState } from "react";
import type { Song } from "@/app/lib/types";
import SongList from "./SongList";
import MusicPlayer from "./MusicPlayer";
import QueuePanel from "./QueuePanel";
import { usePlayer } from "@/app/context/PlayerContext";

function formatTime(secs: number): string {
  if (!secs || isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatTotalDuration(songs: Song[]): string {
  const total = songs.reduce((acc, s) => acc + (s.duration || 0), 0);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  if (hrs > 0) return `${hrs} hr ${mins} min`;
  return `${mins} min`;
}

interface MainLayoutProps {
  songs: Song[];
}

export default function MainLayout({ songs }: MainLayoutProps) {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(false);
  const [artworkError, setArtworkError] = useState(false);
  const mobileMainRef = useRef<HTMLElement>(null);

  const {
    queue,
    currentIndex,
    togglePlay,
    toggleShuffle,
    toggleRepeat,
    isPlaying,
    shuffle,
    repeat,
    toggleShowQueue,
    showQueue,
    next,
    prev,
    seek,
    currentTime,
    duration,
  } = usePlayer();

  const currentItem = queue[currentIndex];
  const prevSongIdRef = useRef<string | undefined>(currentItem?.song.id);
  if (prevSongIdRef.current !== currentItem?.song.id) {
    prevSongIdRef.current = currentItem?.song.id;
    setArtworkError(false);
  }

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const showArtwork = currentItem?.song.hasArtwork && !artworkError;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div
      className="h-screen flex overflow-hidden transition-opacity duration-300"
      style={{ background: "#102217", opacity: visible ? 1 : 0 }}
    >
      {/* ── DESKTOP SIDEBAR (hidden on mobile) ─────────────────── */}
      <aside
        className="hidden md:flex w-72 lg:w-80 flex-col shrink-0 border-r border-white/8"
        style={{ background: "#0d1c13" }}
      >
        {/* Logo + logout */}
        <div className="flex items-center justify-between px-5 pt-6 pb-5 shrink-0">
          <div className="flex items-center gap-2.5">
            <span
              className="material-symbols-outlined text-[28px]"
              style={{ color: "#2bee79", fontVariationSettings: "'FILL' 1" }}
            >
              headphones
            </span>
            <span className="text-white font-extrabold text-lg tracking-tight">
              LocalFM
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-8 h-8 flex items-center justify-center rounded-full text-white/30 hover:text-white/80 hover:bg-white/5 transition-colors"
            aria-label="Log out"
            title="Log out"
          >
            <span className="material-symbols-outlined text-[18px]">
              logout
            </span>
          </button>
        </div>

        <div className="px-5 shrink-0">
          <div
            className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-[0_12px_40px_-8px_rgba(43,238,121,0.3)]"
            style={{ background: "#1a3d24" }}
          >
            {showArtwork ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/artwork/${currentItem!.song.id}`}
                alt={currentItem!.song.album}
                className="w-full h-full object-cover"
                onError={() => setArtworkError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "72px", color: "rgba(43,238,121,0.2)" }}
                >
                  library_music
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 pt-4 text-center shrink-0">
          <p className="text-white font-bold text-base truncate leading-tight">
            {currentItem ? currentItem.song.title : "Nothing playing"}
          </p>
          <p className="text-sm truncate mt-1" style={{ color: "#2bee79" }}>
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
                  left: `calc(${duration > 0 ? (currentTime / duration) * 100 : 0}% - 6px)`,
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
          <div className="flex items-center justify-between">
            <button
              onClick={toggleShuffle}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors"
              style={{ color: shuffle ? "#2bee79" : "#94a3b8" }}
              aria-label="Shuffle"
            >
              <span className="material-symbols-outlined text-[20px]">
                shuffle
              </span>
            </button>
            <button
              onClick={prev}
              className="w-9 h-9 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Previous"
            >
              <span className="material-symbols-outlined text-[26px]">
                skip_previous
              </span>
            </button>
            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform border border-white/10"
              style={{ background: "rgba(255,255,255,0.1)", color: "#ffffff" }}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "34px", fontVariationSettings: "'FILL' 1" }}
              >
                {isPlaying ? "pause" : "play_arrow"}
              </span>
            </button>
            <button
              onClick={next}
              className="w-9 h-9 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Next"
            >
              <span className="material-symbols-outlined text-[26px]">
                skip_next
              </span>
            </button>
            <button
              onClick={toggleRepeat}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors"
              style={{ color: repeat !== "off" ? "#2bee79" : "#94a3b8" }}
              aria-label="Repeat"
            >
              <span className="material-symbols-outlined text-[20px]">
                {repeat === "one" ? "repeat_one" : "repeat"}
              </span>
            </button>
          </div>
        </div>

        <div className="flex-1" />
        <div className="px-4 pb-6 shrink-0">
          <button
            onClick={toggleShowQueue}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-white/8"
            style={{ color: showQueue ? "#2bee79" : "#94a3b8" }}
          >
            <span className="material-symbols-outlined text-[20px]">
              queue_music
            </span>
            Queue
          </button>
        </div>
      </aside>

      <div className="hidden md:flex flex-col flex-1 overflow-hidden">
        <header
          className="shrink-0 flex items-center gap-4 px-6 py-4 border-b border-white/6"
          style={{ background: "#0f1f16" }}
        >
          <div className="relative flex-1 max-w-sm">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/30">
              <span className="material-symbols-outlined text-[18px]">
                search
              </span>
            </span>
            <input
              type="search"
              placeholder="Search songs, artists, albums…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-full pl-9 pr-4 py-2 text-sm outline-none text-white border border-white/8 focus:border-primary/50 transition-colors"
              style={{ background: "rgba(255,255,255,0.05)" }}
            />
          </div>
          <p className="text-xs text-white/25 shrink-0 ml-auto">
            {songs.length} {songs.length === 1 ? "track" : "tracks"} ·{" "}
            {formatTotalDuration(songs)}
          </p>
        </header>

        <main
          className="flex-1 overflow-y-auto px-2 pt-1"
          style={{ background: "#102217" }}
        >
          <SongList songs={songs} query={query} />
          <div className="h-4" />
        </main>
      </div>

      <QueuePanel />

      {/*(hidden on md+)*/}
      <div className="flex flex-col flex-1 overflow-hidden md:hidden">
        <header
          className="shrink-0 flex items-center justify-between px-4 pt-9 pb-3 border-b border-white/5"
          style={{ background: "#0d1c13" }}
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
              style={{ color: "#2bee79", fontVariationSettings: "'FILL' 1" }}
            >
              headphones
            </span>
            <span className="text-white font-bold text-sm tracking-tight">
              LocalFM
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/70 hover:text-white transition-colors"
            aria-label="Log out"
          >
            <span className="material-symbols-outlined text-[22px]">
              logout
            </span>
          </button>
        </header>

        <main
          ref={mobileMainRef}
          className="flex-1 overflow-y-auto"
          style={{ background: "#102217" }}
        >
          <div
            className="absolute top-0 left-0 w-full h-105 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(43,238,121,0.12) 0%, transparent 100%)",
            }}
          />

          <div className="relative flex flex-col items-center px-6 pt-6 pb-4 gap-4">
            <div
              className="relative w-52 h-52 rounded-2xl overflow-hidden shadow-[0_16px_40px_-8px_rgba(43,238,121,0.3)]"
              style={{ background: "#1a3d24" }}
            >
              {showArtwork ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/artwork/${currentItem!.song.id}`}
                  alt={currentItem!.song.album}
                  className="w-full h-full object-cover"
                  onError={() => setArtworkError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "72px", color: "rgba(43,238,121,0.25)" }}
                  >
                    library_music
                  </span>
                </div>
              )}
            </div>

            <div className="text-center w-full max-w-xs">
              <h2 className="text-xl font-bold text-white truncate">
                {currentItem ? currentItem.song.title : "Your Library"}
              </h2>
              <div className="flex items-center justify-center gap-2 text-sm mt-1 flex-wrap">
                {currentItem ? (
                  <>
                    <span style={{ color: "#2bee79" }}>
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

            <div className="flex items-center justify-center gap-5 w-full pt-1">
              <button
                onClick={toggleShuffle}
                className="transition-colors"
                style={{ color: shuffle ? "#2bee79" : "#94a3b8" }}
                aria-label="Shuffle"
              >
                <span className="material-symbols-outlined text-[24px]">
                  shuffle
                </span>
              </button>
              <button
                onClick={prev}
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Previous"
              >
                <span className="material-symbols-outlined text-[30px]">
                  skip_previous
                </span>
              </button>
              <button
                onClick={togglePlay}
                className="w-16 h-16 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform border border-white/10"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  color: "#ffffff",
                }}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: "40px",
                    fontVariationSettings: "'FILL' 1",
                  }}
                >
                  {isPlaying ? "pause" : "play_arrow"}
                </span>
              </button>
              <button
                onClick={next}
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Next"
              >
                <span className="material-symbols-outlined text-[30px]">
                  skip_next
                </span>
              </button>
              <button
                onClick={toggleRepeat}
                className="transition-colors"
                style={{ color: repeat !== "off" ? "#2bee79" : "#94a3b8" }}
                aria-label="Repeat"
              >
                <span className="material-symbols-outlined text-[24px]">
                  {repeat === "one" ? "repeat_one" : "repeat"}
                </span>
              </button>
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
                onChange={(e) => setQuery(e.target.value)}
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
          style={{ background: "#0d1c13" }}
        >
          <button className="flex flex-col items-center gap-0.5 min-w-14">
            <span
              className="material-symbols-outlined text-[24px]"
              style={{ color: "#2bee79", fontVariationSettings: "'FILL' 1" }}
            >
              library_music
            </span>
            <span
              className="text-[10px] font-bold"
              style={{ color: "#2bee79" }}
            >
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
                color: showQueue ? "#2bee79" : "rgba(255,255,255,0.35)",
              }}
            >
              queue_music
            </span>
            <span
              className="text-[10px] font-medium transition-colors"
              style={{
                color: showQueue ? "#2bee79" : "rgba(255,255,255,0.35)",
              }}
            >
              Queue
            </span>
          </button>

          <button
            onClick={handleLogout}
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
    </div>
  );
}
