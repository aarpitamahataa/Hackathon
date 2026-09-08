import { levelFromXP, titleForLevel } from "../lib/gamification.js";

export default function StatsBar({ xp }) {
  const { level, progress, xpIntoLevel, xpForNextLevel } = levelFromXP(xp);
  const title = titleForLevel(level);
  const nextTitle = titleForLevel(level + 1);

  return (
    <div className="stats-bar">
      <div className="stats-bar-top">
        <span className="stats-level">
          Rank {level} <span className="stats-title">{title}</span>
        </span>
        <span className="stats-next" title={`${xpIntoLevel}/${xpForNextLevel} toward "${nextTitle}"`}>
          Next: {nextTitle}
        </span>
      </div>
      <div
        className="xp-track"
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress to next rank"
      >
        <div className="xp-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
    </div>
  );
}
