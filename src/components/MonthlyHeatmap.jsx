import { todayISO, lastNDays } from "../lib/dates.js";
import { computeDayInfo, describeDayStatus, formatDayLabel } from "../lib/chronicle.js";

const DAYS = 28;

/** Compact trailing-28-day heatmap strip for the Home overview — a smaller, faster
 * read than the full Chronicle calendar, same underlying data and color language. */
export default function MonthlyHeatmap({ habits }) {
  const today = todayISO();
  const days = lastNDays(DAYS);
  const infos = days.map((iso) => ({ iso, ...computeDayInfo(habits, iso, today) }));
  const fulfilledCount = infos.filter((d) => d.level === 4).length;

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h2 className="chart-card-title">Monthly Overview</h2>
        <span className="chart-card-figure">{fulfilledCount}/{DAYS} fully cleared</span>
      </div>
      <div className="monthly-strip" role="img" aria-label={`${fulfilledCount} of the last ${DAYS} days fully cleared`}>
        {infos.map((d) => (
          <span
            key={d.iso}
            className={`monthly-strip-cell chronicle-day-level-${d.level}`}
            title={`${formatDayLabel(d.iso)}: ${describeDayStatus(d)}`}
          />
        ))}
      </div>
      <div className="chronicle-legend">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((lvl) => (
          <span key={lvl} className={`chronicle-legend-swatch chronicle-day-level-${lvl}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
