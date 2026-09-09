import { useMemo, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import QuestIcon from "./QuestIcon.jsx";
import { todayISO } from "../lib/dates.js";
import {
  getMonthMatrix,
  computeDayInfo,
  describeDayStatus,
  WEEKDAY_HEADER,
  monthLabel,
  formatDayLabel,
} from "../lib/chronicle.js";

export default function ChronicleView({ habits }) {
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [filterId, setFilterId] = useState("all");
  const [selectedDay, setSelectedDay] = useState(null);

  const today = todayISO();
  const activeHabits = filterId === "all" ? habits : habits.filter((h) => h.id === filterId);
  const weeks = useMemo(() => getMonthMatrix(cursor.year, cursor.month), [cursor]);

  function changeMonth(delta) {
    setSelectedDay(null);
    setCursor((prev) => {
      const d = new Date(prev.year, prev.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  const selectedInfo = selectedDay ? computeDayInfo(activeHabits, selectedDay, today) : null;

  return (
    <section className="chronicle-view" aria-label="Chronicle">
      <div className="chronicle-header">
        <h1 className="font-display">Chronicle</h1>
        <p className="chronicle-subtitle">Your history of quests fulfilled, drawn from what you've actually logged.</p>
      </div>

      <div className="chronicle-controls">
        <div className="chronicle-month-nav">
          <button type="button" className="icon-toggle" onClick={() => changeMonth(-1)} aria-label="Previous month">
            <CaretLeft size={18} aria-hidden="true" />
          </button>
          <span className="chronicle-month-label">{monthLabel(cursor.year, cursor.month)}</span>
          <button type="button" className="icon-toggle" onClick={() => changeMonth(1)} aria-label="Next month">
            <CaretRight size={18} aria-hidden="true" />
          </button>
        </div>

        <select
          className="house-select chronicle-filter"
          value={filterId}
          onChange={(e) => {
            setFilterId(e.target.value);
            setSelectedDay(null);
          }}
          aria-label="Filter by quest"
        >
          <option value="all">All quests</option>
          {habits.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
      </div>

      {habits.length === 0 ? (
        <p className="empty-state">Your chronicle will appear here as you complete quests.</p>
      ) : (
        <>
          <div className="chronicle-grid" role="grid" aria-label={monthLabel(cursor.year, cursor.month)}>
            <div className="chronicle-grid-header" role="row">
              {WEEKDAY_HEADER.map((d) => (
                <span key={d} className="chronicle-weekday" role="columnheader">
                  {d}
                </span>
              ))}
            </div>
            {weeks.map((week, wi) => (
              <div className="chronicle-grid-row" role="row" key={wi}>
                {week.map((cell) => {
                  const info = computeDayInfo(activeHabits, cell.iso, today);
                  const isToday = cell.iso === today;
                  return (
                    <button
                      type="button"
                      key={cell.iso}
                      role="gridcell"
                      className={
                        "chronicle-day" +
                        ` chronicle-day-level-${info.level}` +
                        (cell.inMonth ? "" : " chronicle-day-outside") +
                        (isToday ? " chronicle-day-today" : "") +
                        (selectedDay === cell.iso ? " chronicle-day-selected" : "")
                      }
                      aria-label={`${formatDayLabel(cell.iso)}: ${describeDayStatus(info)}${
                        info.totalScheduled ? `, ${info.doneCount} of ${info.totalScheduled}` : ""
                      }`}
                      aria-pressed={selectedDay === cell.iso}
                      onClick={() => setSelectedDay(cell.iso === selectedDay ? null : cell.iso)}
                    >
                      {new Date(cell.iso).getDate()}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="chronicle-legend" aria-hidden="true">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((lvl) => (
              <span key={lvl} className={`chronicle-legend-swatch chronicle-day-level-${lvl}`} />
            ))}
            <span>More</span>
          </div>

          {selectedDay && selectedInfo && (
            <div className="chronicle-detail" role="status">
              <h2 className="chronicle-detail-date">{formatDayLabel(selectedDay)}</h2>
              {selectedInfo.totalScheduled === 0 ? (
                <p className="rail-empty">Nothing was scheduled this day.</p>
              ) : selectedInfo.doneHabits.length === 0 ? (
                <p className="rail-empty">{selectedInfo.notYetDue ? "Not yet due." : "Missed — nothing completed."}</p>
              ) : (
                <ul className="chronicle-detail-list">
                  {selectedInfo.doneHabits.map((h, i) => (
                    <li key={i}>
                      <QuestIcon value={h.emoji} size={14} /> {h.name}
                    </li>
                  ))}
                </ul>
              )}
              <p className="rail-hint">
                {selectedInfo.doneCount} of {selectedInfo.totalScheduled} fulfilled
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
