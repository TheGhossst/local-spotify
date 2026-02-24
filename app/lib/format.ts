import type { Song } from "@/app/lib/types";

export function formatTime(secs: number): string {
  if (!secs || isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatTotalDuration(songs: Song[]): string {
  const total = songs.reduce((acc, s) => acc + (s.duration || 0), 0);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  if (hrs > 0) return `${hrs} hr ${mins} min`;
  return `${mins} min`;
}
