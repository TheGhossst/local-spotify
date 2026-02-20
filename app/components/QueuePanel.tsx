"use client";

import Image from "next/image";
import { useState } from "react";
import { usePlayer } from "@/app/context/PlayerContext";

function formatDuration(secs: number): string {
  if (!secs || isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function QueuePanel() {
  const {
    queue,
    currentIndex,
    playIndex,
    removeFromQueue,
    clearQueue,
    showQueue,
  } = usePlayer();
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  if (!showQueue) return null;

  return (
    <aside
      className="fixed right-0 top-0 z-50 flex flex-col border-l overflow-hidden
                 w-full sm:w-80
                 bottom-33.5 md:bottom-0"
      style={{ background: "var(--surface)", borderColor: "rgba(255,255,255,0.07)" }}
    >
      <div
        className="flex items-center justify-between px-5 py-4 border-b shrink-0"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        <h2
          className="text-sm font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Queue
        </h2>
        <button
          onClick={clearQueue}
          className="text-xs rounded px-2 py-1 transition-colors hover:bg-white/10"
          style={{ color: "var(--text-secondary)" }}
        >
          Clear all
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {queue.length === 0 && (
          <p
            className="px-5 py-8 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Queue is empty
          </p>
        )}
        {queue.map((item, idx) => {
          const isActive = idx === currentIndex;
          const imgError = imgErrors[item.song.id];
          return (
            <div
              key={item.queueId}
              className="group flex items-center gap-3 px-4 py-2 cursor-pointer rounded-lg mx-2 transition-colors"
              style={{
                background: isActive ? "var(--surface-raised)" : "transparent",
              }}
              onMouseEnter={(e) =>
                !isActive &&
                ((e.currentTarget as HTMLElement).style.background =
                  "var(--surface-raised)")
              }
              onMouseLeave={(e) =>
                !isActive &&
                ((e.currentTarget as HTMLElement).style.background =
                  "transparent")
              }
              onClick={() => playIndex(idx)}
            >
              <div
                className="relative w-9 h-9 rounded shrink-0 overflow-hidden"
                style={{ background: "var(--bg)" }}
              >
                {item.song.hasArtwork && !imgError ? (
                  <Image
                    src={`/api/artwork/${item.song.id}`}
                    alt={item.song.album}
                    fill
                    sizes="36px"
                    className="object-cover"
                    onError={() =>
                      setImgErrors((prev) => ({
                        ...prev,
                        [item.song.id]: true,
                      }))
                    }
                  />
                ) : (
                  <span className="flex items-center justify-center w-full h-full">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="var(--text-secondary)"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="var(--accent)"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-medium truncate"
                  style={{
                    color: isActive ? "var(--accent)" : "var(--text-primary)",
                  }}
                >
                  {item.song.title}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {item.song.artist}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {formatDuration(item.song.duration)}
                </span>
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 p-1 rounded hover:bg-white/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromQueue(item.queueId);
                  }}
                  aria-label="Remove from queue"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 6L6 18M6 6l12 12"
                      stroke="var(--text-secondary)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
