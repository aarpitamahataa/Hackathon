import { useEffect, useRef, useState } from "react";
import { todayISO } from "../lib/dates.js";
import { computeHabitStats, recentHeatmap } from "../lib/streaks.js";
import { describeFrequency } from "../lib/frequency.js";

const UNIT_LABEL = { day: "day", week: "week", month: "month" };

export default function HabitRow({ habit, onToggleToday, onEdit, onDeleteRequest }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [justFulfilled, setJustFulfilled] = useState(false);
  const menuRef = useRef(null);
  const wasDoneRef = useRef(null);
  const today = todayISO();
  const stats = computeHabitStats(habit, today);
  const heatmap = recentHeatmap(habit.checkIns, today, 14);
  const accent = habit.color || "var(--accent)";
  const notScheduledToday = !stats.scheduledToday;

  useEffect(() => {
    // Brief gold-ring pulse the moment a quest transitions to fulfilled — skipped on
    // first mount so reopening the app doesn't replay it for already-done habits.
    const justTransitioned = wasDoneRef.current === false && stats.doneToday;
    wasDoneRef.current = stats.doneToday;
    if (!justTransitioned) return;
    setJustFulfilled(true);
    const t = setTimeout(() => setJustFulfilled(false), 600);
    return () => clearTimeout(t);
  }, [stats.doneToday]);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    function handleKey(e) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  const streakLabel =
    stats.current > 0
      ? `${stats.current} ${UNIT_LABEL[stats.unit]}${stats.current === 1 ? "" : "s"} streak`
      : null;

  return (
    <li
      className={
        "habit-row" +
        (notScheduledToday ? " habit-row-unscheduled" : "") +
        (justFulfilled ? " habit-row-pulse" : "")
      }
      style={{ "--habit-accent": accent }}
    >
      <button
        type="button"
        className="habit-check"
        aria-pressed={stats.doneToday}
        onClick={() => onToggleToday(habit.id)}
      >
        <span className="habit-emoji" aria-hidden="true">
          {habit.emoji || "✅"}
        </span>
        <span className="habit-main">
          <span className={stats.doneToday ? "habit-name habit-name-done" : "habit-name"}>{habit.name}</span>
          {habit.description && <span className="habit-description">{habit.description}</span>}
          <span className="habit-meta">
            {streakLabel ? (
              <span className="habit-streak" title={streakLabel}>
                🔥 {stats.current}
              </span>
            ) : (
              <span className="habit-streak habit-streak-zero">Start a streak</span>
            )}
            <span className="habit-frequency">{describeFrequency(habit)}</span>
            {notScheduledToday && <span className="habit-badge">Not scheduled today</span>}
            {stats.unit !== "day" && stats.periodTargetMet && (
              <span className="habit-badge habit-badge-success">
                Goal met this {stats.unit} ({stats.thisPeriodCount}/{stats.periodTarget})
              </span>
            )}
            <span className="habit-heatmap" aria-hidden="true">
              {heatmap.map((cell) => (
                <span key={cell.iso} className={"heatmap-cell" + (cell.done ? " heatmap-cell-done" : "")} />
              ))}
            </span>
          </span>
        </span>
        <span className="habit-check-icon" aria-hidden="true">
          {stats.doneToday ? "✓" : ""}
        </span>
      </button>

      <div className="habit-menu" ref={menuRef}>
        <button
          type="button"
          className="habit-menu-trigger"
          aria-label={`More actions for ${habit.name}`}
          aria-expanded={menuOpen}
          aria-haspopup="true"
          onClick={() => setMenuOpen((v) => !v)}
        >
          ⋮
        </button>
        {menuOpen && (
          <div className="habit-menu-popover" role="menu">
            <button
              type="button"
              role="menuitem"
              className="habit-menu-item"
              onClick={() => {
                setMenuOpen(false);
                onEdit(habit);
              }}
            >
              Edit
            </button>
            <button
              type="button"
              role="menuitem"
              className="habit-menu-item habit-menu-item-danger"
              onClick={() => {
                setMenuOpen(false);
                onDeleteRequest(habit);
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
