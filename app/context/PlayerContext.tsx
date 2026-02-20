"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Song, QueueItem } from "@/app/lib/types";
import { RepeatMode } from "@/app/lib/types";

interface PlayerState {
  queue: QueueItem[];
  currentIndex: number;
  isPlaying: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  volume: number;
  currentTime: number;
  duration: number;
  showQueue: boolean;
}

interface PlayerActions {
  playSong: (song: Song, replaceQueue?: Song[]) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (queueId: string) => void;
  clearQueue: () => void;
  playIndex: (index: number) => void;
  next: () => void;
  prev: () => void;
  togglePlay: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleShowQueue: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

type PlayerContextType = PlayerState & PlayerActions;

const PlayerContext = createContext<PlayerContextType | null>(null);

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for non-secure contexts (HTTP on iOS Safari, etc.)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function makeQueueItem(song: Song): QueueItem {
  return { song, queueId: generateId() };
}

const STORAGE_KEY = "ls_player_state";

function loadPersistedState(): Partial<PlayerState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return {
      queue: parsed.queue ?? [],
      currentIndex: parsed.currentIndex ?? 0,
      shuffle: parsed.shuffle ?? false,
      repeat: parsed.repeat ?? RepeatMode.Off,
      volume: parsed.volume ?? 1,
    };
  } catch {
    return {};
  }
}

export function PlayerContextProvider({ children }: { children: React.ReactNode }) {
  const persisted = loadPersistedState();

  const [queue, setQueue] = useState<QueueItem[]>(persisted.queue ?? []);
  const [currentIndex, setCurrentIndex] = useState(persisted.currentIndex ?? 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(persisted.shuffle ?? false);
  const [repeat, setRepeat] = useState<RepeatMode>(persisted.repeat ?? RepeatMode.Off);
  const [volume, setVolumeState] = useState(persisted.volume ?? 1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showQueue, setShowQueue] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ queue, currentIndex, shuffle, repeat, volume })
    );
  }, [queue, currentIndex, shuffle, repeat, volume]);

  const handleEnded = useCallback(() => {
    setQueue((q) => {
      setCurrentIndex((ci) => {
        setRepeat((rep) => {
          if (rep === RepeatMode.One) {
            audioRef.current?.play().catch(() => {});
            return rep;
          }
          setShuffle((shuf) => {
            if (rep === RepeatMode.Off && ci >= q.length - 1) {
              setIsPlaying(false);
              return shuf;
            }
            let next: number;
            if (shuf) {
              next = Math.floor(Math.random() * q.length);
            } else {
              next = rep === RepeatMode.All ? (ci + 1) % q.length : ci + 1;
            }
            const audio = audioRef.current;
            if (audio) {
              audio.src = `/api/stream/${q[next]?.song.id}`;
              audio.play().catch(() => {});
            }
            setCurrentIndex(next);
            return shuf;
          });
          return rep;
        });
        return ci;
      });
      return q;
    });
  }, [audioRef]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => handleEnded();
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [handleEnded]);

  const playSong = useCallback((song: Song, replaceQueue?: Song[]) => {
    const newQueue = replaceQueue
      ? replaceQueue.map(makeQueueItem)
      : [makeQueueItem(song)];
    const idx = newQueue.findIndex((qi) => qi.song.id === song.id);
    setQueue(newQueue);
    setCurrentIndex(idx >= 0 ? idx : 0);
    const audio = audioRef.current;
    if (audio) {
      audio.src = `/api/stream/${song.id}`;
      audio.play().catch(() => {});
    }
    setIsPlaying(true);
  }, []);

  const addToQueue = useCallback((song: Song) => {
    setQueue((q) => [...q, makeQueueItem(song)]);
  }, []);

  const removeFromQueue = useCallback((queueId: string) => {
    setQueue((q) => {
      const idx = q.findIndex((qi) => qi.queueId === queueId);
      if (idx === -1) return q;
      const next = q.filter((_, i) => i !== idx);
      setCurrentIndex((ci) => (idx < ci ? ci - 1 : ci));
      return next;
    });
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentIndex(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setIsPlaying(false);
  }, []);

  const playIndex = useCallback((index: number) => {
    setCurrentIndex(index);
    setQueue((q) => {
      const audio = audioRef.current;
      if (audio && q[index]) {
        audio.src = `/api/stream/${q[index].song.id}`;
        audio.play().catch(() => {});
      }
      return q;
    });
    setIsPlaying(true);
  }, []);

  const next = useCallback(() => {
    setQueue((q) => {
      setCurrentIndex((ci) => {
        setShuffle((shuf) => {
          let ni: number;
          if (shuf) {
            ni = Math.floor(Math.random() * q.length);
          } else {
            ni = (ci + 1) % q.length;
          }
          const audio = audioRef.current;
          if (audio && q[ni]) {
            audio.src = `/api/stream/${q[ni].song.id}`;
            audio.play().catch(() => {});
          }
          setCurrentIndex(ni);
          return shuf;
        });
        return ci;
      });
      return q;
    });
  }, []);

  const prev = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    setQueue((q) => {
      setCurrentIndex((ci) => {
        const ni = (ci - 1 + q.length) % q.length;
        if (audio && q[ni]) {
          audio.src = `/api/stream/${q[ni].song.id}`;
          audio.play().catch(() => {});
        }
        return ni;
      });
      return q;
    });
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !queue.length) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [queue]);

  const toggleShuffle = useCallback(() => setShuffle((s) => !s), []);

  const toggleRepeat = useCallback(() => {
    setRepeat((r) => {
      if (r === RepeatMode.Off) return RepeatMode.All;
      if (r === RepeatMode.All) return RepeatMode.One;
      return RepeatMode.Off;
    });
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  }, []);

  const toggleShowQueue = useCallback(() => setShowQueue((s) => !s), []);

  // ── Media Session API ────────────────────────────────────────────────────
  // Keeps audio playing on mobile when the screen turns off or the user
  // switches apps. The browser treats the page as active media and lets it
  // run in the background as long as the tab is open.

  // Stable refs so action handlers never need to be re-registered
  const nextRef = useRef(next);
  const prevRef = useRef(prev);
  useEffect(() => { nextRef.current = next; }, [next]);
  useEffect(() => { prevRef.current = prev; }, [prev]);

  // 1. Update metadata whenever the current track changes
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const item = queue[currentIndex];
    if (!item) return;
    const { song } = item;
    const artwork: MediaImage[] = song.hasArtwork
      ? [{ src: `${window.location.origin}/api/artwork/${song.id}`, sizes: "512x512", type: "image/jpeg" }]
      : [];
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title,
      artist: song.artist,
      album: song.album,
      artwork,
    });
  }, [queue, currentIndex]);

  // 2. Mirror play/pause state so lock-screen controls reflect reality
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);

  // 3. Register lock-screen action handlers once (play, pause, skip, seek)
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;

    navigator.mediaSession.setActionHandler("play", () => {
      audioRef.current?.play().catch(() => {});
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      audioRef.current?.pause();
    });
    navigator.mediaSession.setActionHandler("nexttrack", () => nextRef.current());
    navigator.mediaSession.setActionHandler("previoustrack", () => prevRef.current());
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (details.seekTime !== undefined && audioRef.current) {
        audioRef.current.currentTime = details.seekTime;
      }
    });
    navigator.mediaSession.setActionHandler("seekbackward", (details) => {
      if (audioRef.current) {
        audioRef.current.currentTime = Math.max(
          0,
          audioRef.current.currentTime - (details.seekOffset ?? 10)
        );
      }
    });
    navigator.mediaSession.setActionHandler("seekforward", (details) => {
      if (audioRef.current) {
        audioRef.current.currentTime = Math.min(
          audioRef.current.duration || Infinity,
          audioRef.current.currentTime + (details.seekOffset ?? 10)
        );
      }
    });

    return () => {
      const actions: MediaSessionAction[] = [
        "play", "pause", "nexttrack", "previoustrack",
        "seekto", "seekbackward", "seekforward",
      ];
      actions.forEach((action) => {
        try { navigator.mediaSession.setActionHandler(action, null); } catch { /* unsupported */ }
      });
    };
  }, []); // handlers use refs

  // 4. Keep the lock-screen progress bar in sync
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    if (!duration || !isFinite(duration)) return;
    try {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate: audioRef.current?.playbackRate ?? 1,
        position: Math.min(currentTime, duration),
      });
    } catch { /* setPositionState not supported on this browser */ }
  }, [currentTime, duration]);
  // ────────────────────────────────────────────────────────────────────────

  return (
    <PlayerContext.Provider
      value={{
        queue,
        currentIndex,
        isPlaying,
        shuffle,
        repeat,
        volume,
        currentTime,
        duration,
        showQueue,
        playSong,
        addToQueue,
        removeFromQueue,
        clearQueue,
        playIndex,
        next,
        prev,
        togglePlay,
        toggleShuffle,
        toggleRepeat,
        seek,
        setVolume,
        toggleShowQueue,
        audioRef,
      }}
    >
      <audio ref={audioRef} preload="metadata" />
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextType {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerContextProvider");
  return ctx;
}
