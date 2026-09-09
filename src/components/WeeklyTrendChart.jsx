import { todayISO, lastNDays } from "../lib/dates.js";
import { isScheduledOn } from "../lib/frequency.js";

const WIDTH = 520;
const HEIGHT = 140;
const PAD_X = 16;
const PAD_TOP = 12;
const PAD_BOTTOM = 28;

function dayLabel(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "short" });
}

/** Original hand-built SVG area chart — no charting library — showing the last 7
 * days' completion rate. Percentages are real (done / scheduled for that day), never
 * interpolated or estimated for days with nothing scheduled (those simply show 0). */
export default function WeeklyTrendChart({ habits }) {
  const today = todayISO();
  const days = lastNDays(7);
  const points = days.map((iso) => {
    const scheduled = habits.filter((h) => isScheduledOn(h, iso));
    const done = scheduled.filter((h) => h.checkIns.includes(iso));
    const pct = scheduled.length > 0 ? Math.round((done.length / scheduled.length) * 100) : 0;
    return { iso, pct, doneCount: done.length, totalScheduled: scheduled.length };
  });

  const plotWidth = WIDTH - PAD_X * 2;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const stepX = points.length > 1 ? plotWidth / (points.length - 1) : 0;
  const xFor = (i) => PAD_X + i * stepX;
  const yFor = (pct) => PAD_TOP + plotHeight * (1 - pct / 100);

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(p.pct)}`).join(" ");
  const areaPath = `${linePath} L ${xFor(points.length - 1)} ${PAD_TOP + plotHeight} L ${xFor(0)} ${
    PAD_TOP + plotHeight
  } Z`;

  const avgPct = Math.round(points.reduce((sum, p) => sum + p.pct, 0) / points.length);

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h2 className="chart-card-title">Weekly Momentum</h2>
        <span className="chart-card-figure">{avgPct}% avg</span>
      </div>
      <svg
        className="weekly-chart"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Daily completion rate over the last 7 days, averaging ${avgPct} percent`}
      >
        <defs>
          <linearGradient id="weekly-area-fill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: "var(--fantasy-gold)" }} stopOpacity="0.35" />
            <stop offset="100%" style={{ stopColor: "var(--fantasy-gold)" }} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 50, 100].map((pct) => (
          <line
            key={pct}
            x1={PAD_X}
            x2={WIDTH - PAD_X}
            y1={yFor(pct)}
            y2={yFor(pct)}
            className="weekly-chart-gridline"
          />
        ))}

        <path d={areaPath} fill="url(#weekly-area-fill)" />
        <path d={linePath} fill="none" className="weekly-chart-line" />

        {points.map((p, i) => (
          <g key={p.iso}>
            <circle
              cx={xFor(i)}
              cy={yFor(p.pct)}
              r={p.iso === today ? 5 : 3.5}
              className={"weekly-chart-point" + (p.iso === today ? " weekly-chart-point-today" : "")}
            >
              <title>
                {dayLabel(p.iso)}: {p.totalScheduled > 0 ? `${p.doneCount}/${p.totalScheduled} (${p.pct}%)` : "Nothing scheduled"}
              </title>
            </circle>
            <text x={xFor(i)} y={HEIGHT - 8} textAnchor="middle" className="weekly-chart-label">
              {dayLabel(p.iso)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
