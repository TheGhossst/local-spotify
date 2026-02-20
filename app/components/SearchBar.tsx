"use client";

interface SearchBarProps {
  query: string;
  onChange: (q: string) => void;
}

export default function SearchBar({ query, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-md">
      <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle
            cx="11"
            cy="11"
            r="7"
            stroke="var(--text-secondary)"
            strokeWidth="2"
          />
          <path
            d="M16.5 16.5L21 21"
            stroke="var(--text-secondary)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <input
        type="search"
        placeholder="Search songs, artists, albums…"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-full pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2"
        style={{
          background: "var(--surface-raised)",
          color: "var(--text-primary)",
          border: "1px solid #333",
        }}
      />
      {query && (
        <button
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-3 flex items-center"
          aria-label="Clear search"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="var(--text-secondary)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
