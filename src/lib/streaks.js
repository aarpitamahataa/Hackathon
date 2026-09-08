// Streak + heatmap helpers, all derived from a habit's checkIns (array of "YYYY-MM-DD"
// strings) plus its frequency rules. Nothing here reads UI state — everything is computed
// fresh from persisted check-in history so it stays correct no matter how it was reached.

import { isScheduledOn } from "./frequency.js";

function parseISO(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date, delta) {
  const next = new Date(date);
  next.setDate(next.getDate() + delta);
  return next;
}

/** Current streak: consecutive days ending today (or yesterday, so missing "today" doesn't
 * zero out a streak until the day is actually over). */
export function currentStreak(checkIns, todayISOStr) {
  if (!checkIns || checkIns.length === 0) return 0;
  const done = new Set(checkIns);
  let cursor = parseISO(todayISOStr);

  // If today isn't checked yet, start counting from yesterday instead so the streak
  // doesn't visually die the moment midnight passes before you've checked in.
  if (!done.has(toISO(cursor))) {
    cursor = addDays(cursor, -1);
  }

  let streak = 0;
  while (done.has(toISO(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Longest streak ever, across all recorded check-ins. */
export function longestStreak(checkIns) {
  if (!checkIns || checkIns.length === 0) return 0;
  const sorted = [...checkIns].sort();
  let longest = 1;
  let running = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = parseISO(sorted[i - 1]);
    const cur = parseISO(sorted[i]);
    const diffDays = Math.round((cur - prev) / 86400000);
    if (diffDays === 1) {
      running += 1;
    } else if (diffDays > 1) {
      running = 1;
    }
    longest = Math.max(longest, running);
  }
  return longest;
}

/** Last `days` days as { iso, done } for a small GitHub-style heatmap strip, oldest first. */
export function recentHeatmap(checkIns, todayISOStr, days = 14) {
  const done = new Set(checkIns || []);
  const today = parseISO(todayISOStr);
  const cells = [];
  for (let i = days - 1; i >= 0; i--) {
    const iso = toISO(addDays(today, -i));
    cells.push({ iso, done: done.has(iso) });
  }
  return cells;
}

// --- Frequency-aware stats (streak counter feature) ---------------------------------

function periodKey(iso, unit) {
  const date = parseISO(iso);
  if (unit === "week") {
    const dow = date.getDay(); // 0 Sun..6 Sat
    const sinceMonday = (dow + 6) % 7;
    return toISO(addDays(date, -sinceMonday)); // key = ISO date of that week's Monday
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function previousPeriodKey(key, unit) {
  if (unit === "week") return toISO(addDays(parseISO(key), -7));
  const [y, m] = key.split("-").map(Number);
  const prevMonth = m === 1 ? 12 : m - 1;
  const prevYear = m === 1 ? y - 1 : y;
  return `${prevYear}-${String(prevMonth).padStart(2, "0")}`;
}

function dayBasedStreaks(habit, todayISOStr, doneSet) {
  // Current streak: walk backward from today, skipping non-scheduled days, stopping at
  // the first scheduled-but-missed day (today itself gets a grace period).
  let cursor = parseISO(todayISOStr);
  if (isScheduledOn(habit, todayISOStr) && !doneSet.has(todayISOStr)) {
    cursor = addDays(cursor, -1);
  }
  let current = 0;
  while (!habit.startDate || toISO(cursor) >= habit.startDate) {
    const iso = toISO(cursor);
    if (isScheduledOn(habit, iso)) {
      if (doneSet.has(iso)) current += 1;
      else break;
    }
    cursor = addDays(cursor, -1);
    if (current > 20000) break; // sanity guard against runaway loops
  }

  // Best streak ever: walk forward from the earlier of startDate/first check-in.
  const sortedCheckIns = [...doneSet].sort();
  const earliest = habit.startDate || sortedCheckIns[0] || todayISOStr;
  let best = 0;
  let running = 0;
  let walker = parseISO(earliest);
  const end = parseISO(todayISOStr);
  let scheduledCount = 0;
  while (walker <= end) {
    const iso = toISO(walker);
    if (isScheduledOn(habit, iso)) {
      scheduledCount += 1;
      if (doneSet.has(iso)) {
        running += 1;
        best = Math.max(best, running);
      } else if (iso !== todayISOStr) {
        running = 0;
      }
    }
    walker = addDays(walker, 1);
  }

  return { current, best, scheduledCount, unit: "day" };
}

function periodBasedStreaks(habit, todayISOStr, doneSet) {
  const unit = habit.frequencyType; // "week" | "month"
  const target = Math.max(1, habit.frequencyTarget || 1);
  const counts = new Map();
  for (const iso of doneSet) {
    const key = periodKey(iso, unit);
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  const earliest = habit.startDate || [...doneSet].sort()[0] || todayISOStr;
  const firstKey = periodKey(earliest, unit);
  const todayKey = periodKey(todayISOStr, unit);

  // Current streak: current (possibly in-progress) period doesn't break the streak if
  // it hasn't hit target yet — only a fully-elapsed period that missed target does.
  let current = 0;
  let cursorKey = todayKey;
  let first = true;
  let periodsElapsed = 0;
  while (true) {
    const count = counts.get(cursorKey) || 0;
    if (count >= target) {
      current += 1;
    } else if (!first) {
      break;
    }
    first = false;
    periodsElapsed += 1;
    if (cursorKey <= firstKey) break;
    cursorKey = previousPeriodKey(cursorKey, unit);
  }

  // Best streak ever across all periods from the first one to now.
  let best = 0;
  let running = 0;
  let walkKey = firstKey;
  let guard = 0;
  while (walkKey <= todayKey && guard < 2000) {
    const count = counts.get(walkKey) || 0;
    const isCurrent = walkKey === todayKey;
    if (count >= target) {
      running += 1;
      best = Math.max(best, running);
    } else if (!isCurrent) {
      running = 0;
    }
    walkKey = unit === "week" ? toISO(addDays(parseISO(walkKey), 7)) : nextMonthKey(walkKey);
    guard += 1;
  }

  return { current, best, periodsElapsed, target, unit };
}

function nextMonthKey(key) {
  const [y, m] = key.split("-").map(Number);
  const nextMonth = m === 12 ? 1 : m + 1;
  const nextYear = m === 12 ? y + 1 : y;
  return `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
}

/**
 * Unified, frequency-aware stats for a habit, derived entirely from persisted check-ins.
 * Returns current/best streaks (with their unit — "day", "week", or "month"), total
 * completions, completion rate, last completed date, and whether today's target is met.
 */
export function computeHabitStats(habit, todayISOStr) {
  const checkIns = habit.checkIns || [];
  const doneSet = new Set(checkIns);
  const type = habit.frequencyType || "daily";
  const totalCompletions = checkIns.length;
  const lastCompletedDate = checkIns.length ? [...checkIns].sort().at(-1) : null;
  const doneToday = doneSet.has(todayISOStr);

  if (type === "daily" || type === "days") {
    const { current, best, scheduledCount } = dayBasedStreaks(habit, todayISOStr, doneSet);
    const completionRate = scheduledCount > 0 ? Math.min(1, totalCompletions / scheduledCount) : 0;
    return {
      current,
      best,
      unit: "day",
      totalCompletions,
      completionRate,
      lastCompletedDate,
      doneToday,
      scheduledToday: isScheduledOn(habit, todayISOStr),
      periodTargetMet: doneToday,
    };
  }

  const { current, best, periodsElapsed, target } = periodBasedStreaks(habit, todayISOStr, doneSet);
  const completionRate = periodsElapsed > 0 ? Math.min(1, totalCompletions / (target * periodsElapsed)) : 0;
  const thisPeriodCount = checkIns.filter((iso) => periodKey(iso, type) === periodKey(todayISOStr, type)).length;
  return {
    current,
    best,
    unit: type, // "week" | "month"
    totalCompletions,
    completionRate,
    lastCompletedDate,
    doneToday,
    scheduledToday: true,
    periodTargetMet: thisPeriodCount >= target,
    thisPeriodCount,
    periodTarget: target,
  };
}
