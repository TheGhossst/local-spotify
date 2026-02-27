"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayer } from "@/app/context/PlayerContext";
import ArtworkDisplay from "./ArtworkDisplay";
import { RepeatMode } from "@/app/lib/types";
import { formatTime } from "@/app/lib/format";

interface NowPlayingModalProps {
  onClose: () => void;
}

export default function NowPlayingModal({ onClose }: NowPlayingModalProps) {
  const {
    queue,
    currentIndex,
    isPlaying,
    shuffle,
    repeat,
    volume,
    currentTime,
    duration,
    togglePlay,
    toggleShuffle,
    toggleRepeat,
    next,
    prev,
    seek,
    setVolume,
  } = usePlayer();

  const currentItem = queue[currentIndex];
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const startYRef = useRef<number>(0);
  const prevVolumeRef = useRef<number>(1);
  const [translateY, setTranslateY] = useState(0);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimateIn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  function handleClose() {
    setAnimateIn(false);
    setTimeout(onClose, 280);
  }

  function handleTouchStart(e: React.TouchEvent) {
    startYRef.current = e.touches[0].clientY;
  }

  function handleTouchMove(e: React.TouchEvent) {
    const delta = e.touches[0].clientY - startYRef.current;
    if (delta > 0) setTranslateY(delta);
  }

  function handleTouchEnd() {
    if (translateY > 120) {
      handleClose();
    } else {
      setTranslateY(0);
    }
  }

  if (!currentItem) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col md:hidden"
      style={{
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(32px)",
        transform: animateIn
          ? `translateY(${translateY}px)`
          : "translateY(100%)",
        transition:
          translateY > 0
            ? "none"
            : "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {currentItem.song.hasArtwork && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/artwork/${currentItem.song.id}`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none select-none"
          style={{ filter: "blur(40px)", transform: "scale(1.1)" }}
        />
      )}

      <div className="flex justify-center pt-3 pb-1 shrink-0">
        <div className="w-10 h-1 rounded-full bg-white/25" />
      </div>
      <div className="flex items-center justify-between px-5 pt-2 pb-1 shrink-0">
        <button
          onClick={handleClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/8 text-white/60 hover:text-white transition-colors"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-[22px]">
            keyboard_arrow_down
          </span>
        </button>
        <div className="text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-white/40">
            Now Playing
          </p>
        </div>
        <div className="w-9 h-9" />
      </div>

      <div className="flex-1 flex flex-col px-6 pt-4 pb-6 gap-5 overflow-y-auto">
        <div className="flex justify-center">
          <ArtworkDisplay
            songId={currentItem.song.id}
            album={currentItem.song.album}
            hasArtwork={currentItem.song.hasArtwork}
            className="w-64 h-64 rounded-2xl shadow-[0_24px_64px_-12px_rgba(0,0,0,0.7)]"
            iconSize={80}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col min-w-0">
            <h2 className="text-2xl font-bold text-white truncate leading-tight">
              {currentItem.song.title}
            </h2>
            <p
              className="text-base truncate mt-1"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              {currentItem.song.artist}
            </p>
            {currentItem.song.album &&
              currentItem.song.album !== "Unknown Album" && (
                <p className="text-sm truncate mt-0.5 text-white/35">
                  {currentItem.song.album}
                </p>
              )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="relative h-1.5 group/seek">
            <div className="absolute inset-0 rounded-full bg-white/15" />
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ width: `${progress}%`, background: "#ffffff" }}
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
          <div className="flex justify-between">
            <span className="text-xs tabular-nums text-white/40">
              {formatTime(currentTime)}
            </span>
            <span className="text-xs tabular-nums text-white/40">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={toggleShuffle}
            className="w-10 h-10 flex items-center justify-center rounded-full transition-colors"
            style={{ color: shuffle ? "#ffffff" : "rgba(255,255,255,0.35)" }}
            aria-label="Shuffle"
          >
            <span className="material-symbols-outlined text-[24px]">
              shuffle
            </span>
          </button>

          <button
            onClick={prev}
            className="w-12 h-12 flex items-center justify-center rounded-full text-white/70 hover:text-white transition-colors"
            aria-label="Previous"
          >
            <span className="material-symbols-outlined text-[36px]">
              skip_previous
            </span>
          </button>

          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            style={{ background: "#ffffff", color: "#000000" }}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "44px", fontVariationSettings: "'FILL' 1" }}
            >
              {isPlaying ? "pause" : "play_arrow"}
            </span>
          </button>

          <button
            onClick={next}
            className="w-12 h-12 flex items-center justify-center rounded-full text-white/70 hover:text-white transition-colors"
            aria-label="Next"
          >
            <span className="material-symbols-outlined text-[36px]">
              skip_next
            </span>
          </button>

          <button
            onClick={toggleRepeat}
            className="w-10 h-10 flex items-center justify-center rounded-full transition-colors"
            style={{
              color:
                repeat !== RepeatMode.Off
                  ? "#ffffff"
                  : "rgba(255,255,255,0.35)",
            }}
            aria-label="Repeat"
          >
            <span className="material-symbols-outlined text-[24px]">
              {repeat === RepeatMode.One ? "repeat_one" : "repeat"}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (volume > 0) {
                prevVolumeRef.current = volume;
                setVolume(0);
              } else {
                setVolume(prevVolumeRef.current);
              }
            }}
            className="text-white/40 hover:text-white transition-colors"
            aria-label={volume === 0 ? "Unmute" : "Mute"}
          >
            <span className="material-symbols-outlined text-[20px]">
              {volume === 0
                ? "volume_off"
                : volume < 0.5
                  ? "volume_down"
                  : "volume_up"}
            </span>
          </button>
          <div className="relative flex-1 h-1 group/vol">
            <div className="absolute inset-0 rounded-full bg-white/15" />
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-white/60"
              style={{ width: `${volume * 100}%` }}
            />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Volume"
            />
          </div>
          <button
            onClick={() => setVolume(1)}
            className="text-white/40 hover:text-white transition-colors"
            aria-label="Full volume"
          >
            <span className="material-symbols-outlined text-[20px]">
              volume_up
            </span>
          </button>
        </div>

        {queue.length > 1 && (
          <div className="mt-1 border-t border-white/8 pt-4">
            <p className="text-xs font-semibold tracking-widest uppercase text-white/30 mb-3">
              Up next
            </p>
            <div className="flex flex-col gap-1">
              {queue.slice(currentIndex + 1, currentIndex + 4).map((item) => (
                <div
                  key={item.queueId}
                  className="flex items-center gap-3 px-2 py-1.5 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <ArtworkDisplay
                    songId={item.song.id}
                    album={item.song.album}
                    hasArtwork={item.song.hasArtwork}
                    className="w-9 h-9 rounded-md shrink-0"
                    iconSize={20}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-white truncate">
                      {item.song.title}
                    </span>
                    <span className="text-xs text-white/40 truncate">
                      {item.song.artist}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
