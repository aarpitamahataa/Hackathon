import { MagnifyingGlass, SpeakerHigh, SpeakerX, Moon, Sun } from "@phosphor-icons/react";

export default function TopBar({ search, onSearchChange, muted, onToggleMuted, theme, onToggleTheme }) {
  return (
    <header className="top-bar">
      <span className="top-bar-wordmark font-display">Emberpath</span>

      <div className="top-bar-search">
        <MagnifyingGlass size={18} aria-hidden="true" className="top-bar-search-icon" />
        <input
          type="search"
          placeholder="Search your quests"
          aria-label="Search your quests"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="header-actions">
        <button
          type="button"
          className="icon-toggle"
          onClick={onToggleMuted}
          aria-pressed={muted}
          title={muted ? "Unmute" : "Mute sound effects"}
        >
          {muted ? <SpeakerX size={20} aria-hidden="true" /> : <SpeakerHigh size={20} aria-hidden="true" />}
        </button>
        <button
          type="button"
          className="icon-toggle"
          onClick={onToggleTheme}
          aria-pressed={theme === "dark"}
          title="Toggle Nightfall / Dawn"
        >
          {theme === "dark" ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}
