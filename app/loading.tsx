"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Scanning your library…",
  "Reading track metadata…",
  "Loading artwork…",
  "Almost there…",
];

export default function Loading() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fadeIn = requestAnimationFrame(() => setVisible(true));
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 1800);
    return () => {
      cancelAnimationFrame(fadeIn);
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="dot-grid min-h-screen flex flex-col items-center justify-center gap-8 relative overflow-hidden transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div className="glow-blob glow-blob-tl" />
      <div className="glow-blob glow-blob-br" />
      <div className="relative flex items-center justify-center">
        <svg
          className="absolute"
          width="72"
          height="72"
          viewBox="0 0 72 72"
          fill="none"
          style={{ animation: "spin 1.2s linear infinite" }}
        >
          <circle
            cx="36"
            cy="36"
            r="32"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="3"
          />
          <circle
            cx="36"
            cy="36"
            r="32"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="50 150"
            strokeDashoffset="0"
          />
        </svg>

        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <span
            className="material-symbols-outlined text-[28px] text-white"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            headphones
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          LocalFM
        </h1>
        <p
          key={msgIndex}
          className="text-sm transition-all duration-500"
          style={{
            color: "var(--text-secondary)",
            animation: "fadeSlideIn 0.4s ease",
          }}
        >
          {MESSAGES[msgIndex]}
        </p>
      </div>

      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-white/40"
            style={{
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.85); }
          50%       { opacity: 1;   transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
