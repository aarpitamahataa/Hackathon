import { BookOpen, UsersThree, ChartBar } from "@phosphor-icons/react";
import QuestIcon from "./QuestIcon.jsx";
import { todayISO, lastNDays } from "../lib/dates.js";

/** Recent completions across all habits, newest first — a genuine (not fabricated)
 * preview of history, drawn straight from check-in records. */
function recentCompletions(habits, limit = 5) {
  const entries = [];
  for (const habit of habits) {
    for (const iso of habit.checkIns || []) {
      entries.push({ iso, habit });
    }
  }
  entries.sort((a, b) => (a.iso < b.iso ? 1 : -1));
  return entries.slice(0, limit);
}

function formatDay(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function RightRail({ habits }) {
  const days = lastNDays(7);
  const today = todayISO();
  const weekCompletions = days.map((iso) => ({
    iso,
    count: habits.reduce((sum, h) => sum + (h.checkIns?.includes(iso) ? 1 : 0), 0),
  }));
  const weekTotal = weekCompletions.reduce((sum, d) => sum + d.count, 0);
  const recent = recentCompletions(habits, 5);

  return (
    <aside className="right-rail" aria-label="This week and chronicle">
      <section className="rail-panel">
        <h2 className="rail-panel-title">
          <ChartBar size={16} aria-hidden="true" /> This Week
        </h2>
        <div className="rail-week-bars" role="img" aria-label={`${weekTotal} quests fulfilled in the last 7 days`}>
          {weekCompletions.map((d) => (
            <div key={d.iso} className="rail-week-bar-col">
              <div
                className={"rail-week-bar" + (d.iso === today ? " rail-week-bar-today" : "")}
                style={{ height: `${Math.min(100, d.count * 28 + (d.count > 0 ? 8 : 2))}%` }}
                title={`${formatDay(d.iso)}: ${d.count} fulfilled`}
              />
            </div>
          ))}
        </div>
        <p className="rail-week-total">{weekTotal} quests fulfilled this week</p>
      </section>

      <section className="rail-panel">
        <h2 className="rail-panel-title">
          <BookOpen size={16} aria-hidden="true" /> Chronicle
        </h2>
        {recent.length === 0 ? (
          <p className="rail-empty">Your chronicle will fill in as you fulfill quests.</p>
        ) : (
          <ul className="rail-chronicle-list">
            {recent.map((entry, i) => (
              <li key={i} className="rail-chronicle-item">
                <QuestIcon value={entry.habit.emoji} size={14} />
                <span className="rail-chronicle-text">
                  <strong>{entry.habit.name}</strong>
                  <span className="rail-chronicle-date">{formatDay(entry.iso)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="rail-hint">See the full Chronicle for your complete history.</p>
      </section>

      <section className="rail-panel rail-panel-teaser">
        <h2 className="rail-panel-title">
          <UsersThree size={16} aria-hidden="true" /> Companions
        </h2>
        <p className="rail-empty">
          Accountability works better together. Inviting companions to share progress is coming soon.
        </p>
      </section>
    </aside>
  );
}
