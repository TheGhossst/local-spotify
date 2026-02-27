"use client";

import { useEffect, useState } from "react";
import type { Song } from "@/app/lib/types";
import { formatTotalDuration } from "@/app/lib/format";
import SongList from "./SongList";
import QueuePanel from "./QueuePanel";
import DesktopSidebar from "./DesktopSidebar";
import MobileView from "./MobileView";

interface MainLayoutProps {
  songs: Song[];
}

export default function MainLayout({ songs }: MainLayoutProps) {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div
      className="dot-grid h-screen flex overflow-hidden transition-opacity duration-300 relative"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div className="glow-blob glow-blob-tl" />
      <div className="glow-blob glow-blob-br" />

      <DesktopSidebar onLogout={handleLogout} songs={songs} />

      <div className="hidden md:flex flex-col flex-1 overflow-hidden">
        <header
          className="shrink-0 flex items-center gap-4 px-6 py-4 border-b border-white/6"
          style={{
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(12px)",
          }}
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
          style={{ background: "transparent" }}
        >
          <SongList songs={songs} query={query} />
          <div className="h-4" />
        </main>
      </div>

      <QueuePanel />

      <MobileView
        songs={songs}
        query={query}
        onQueryChange={setQuery}
        onLogout={handleLogout}
      />
    </div>
  );
}
