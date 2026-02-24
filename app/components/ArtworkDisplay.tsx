"use client";

import { useState } from "react";

interface ArtworkDisplayProps {
  songId?: string;
  album?: string;
  hasArtwork?: boolean;
  className?: string;
  iconSize?: number;
}

export default function ArtworkDisplay({
  songId,
  album,
  hasArtwork,
  className = "",
  iconSize = 72,
}: ArtworkDisplayProps) {
  const [erroredSongId, setErroredSongId] = useState<string | undefined>(
    undefined,
  );

  const showArtwork = hasArtwork && songId && erroredSongId !== songId;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: "#1a1a1a" }}
    >
      {showArtwork ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/artwork/${songId}`}
          alt={album}
          className="w-full h-full object-cover"
          onError={() => setErroredSongId(songId)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: `${iconSize}px`,
              color: "rgba(255,255,255,0.2)",
            }}
          >
            library_music
          </span>
        </div>
      )}
    </div>
  );
}
