// Calendar/heatmap helpers for the Chronicle view. Everything here is derived purely
// from habit check-in history — nothing is fabricated or estimated.

import { isScheduledOn } from "./frequency.js";

function toISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Builds a Monday-first calendar grid for the given month as an array of weeks,
 * each with 7 { iso, inMonth } cells, so leading/trailing days from adjacent months
 * fill out the grid without leaving ragged edges.
 */
export function getMonthMatrix(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7; // Monday = 0
  const gridStart = new Date(year, month, 1 - startWeekday);

  const weeks = [];
  let cursor = new Date(gridStart);
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push({ iso: toISO(cursor), inMonth: cursor.getMonth() === month });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
    // Stop once we've filled the month and the grid is back to Monday with no more
    // in-month days ahead (avoids a wasted trailing all-next-month week).
    if (w >= 3 && week.every((c) => !c.inMonth)) break;
  }
  return weeks;
}

/**
 * Completion info for one calendar day, either aggregated across all given habits or
 * scoped to a single one. `level` (0-4) drives heatmap shading; 0 always means
 * "nothing scheduled or nothing done", never a fabricated in-between state.
 */
export function computeDayInfo(habits, iso, todayISOStr) {
  const scheduled = habits.filter((h) => isScheduledOn(h, iso));
  const done = scheduled.filter((h) => h.checkIns.includes(iso));
  const notYetDue = iso >= todayISOStr; // today isn't "missed" until the day is over

  if (scheduled.length === 0) {
    return { level: 0, doneCount: 0, totalScheduled: 0, doneHabits: [], notYetDue };
  }

  const fraction = done.length / scheduled.length;
  let level;
  if (done.length === 0) level = notYetDue ? 0 : 1; // 1 = missed (strictly past, nothing done)
  else if (fraction < 0.5) level = 2;
  else if (fraction < 1) level = 3;
  else level = 4; // fully cleared

  return {
    level,
    doneCount: done.length,
    totalScheduled: scheduled.length,
    doneHabits: done.map((h) => ({ name: h.name, emoji: h.emoji })),
    notYetDue,
  };
}

/** Human-readable status for a day, distinguishing "nothing was ever scheduled" from
 * "scheduled but not due yet" — both render as level 0 but mean different things. */
export function describeDayStatus(info) {
  if (info.totalScheduled === 0) return "Nothing scheduled";
  if (info.doneCount === 0) return info.notYetDue ? "Not yet due" : "Missed";
  if (info.doneCount === info.totalScheduled) return "Fully fulfilled";
  return "Partially fulfilled";
}

export const WEEKDAY_HEADER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function monthLabel(year, month) {
  return new Date(year, month, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function formatDayLabel(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
