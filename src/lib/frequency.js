// Habit frequency: "daily" (every day), "days" (specific weekdays), "week" (X times per
// week), or "month" (X times per month). Stored on the habit as frequencyType plus either
// scheduledDays (for "days") or frequencyTarget (for "week"/"month").

export const FREQUENCY_TYPES = ["daily", "days", "week", "month"];

// JS Date#getDay() order (0=Sun..6=Sat), but presented Monday-first in the UI.
export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
export const WEEKDAY_LABELS = { 0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat" };

export function defaultFrequency() {
  return { frequencyType: "daily", scheduledDays: [], frequencyTarget: 3 };
}

/** Whether a habit is expected/actionable on a given ISO date (ignores completion). */
export function isScheduledOn(habit, iso) {
  if (habit.startDate && iso < habit.startDate) return false;
  const type = habit.frequencyType || "daily";
  if (type === "days") {
    const [y, m, d] = iso.split("-").map(Number);
    const weekday = new Date(y, m - 1, d).getDay();
    return (habit.scheduledDays || []).includes(weekday);
  }
  // "daily", "week", and "month" habits are actionable any day.
  return true;
}

/** Short human-readable summary of a habit's frequency, e.g. "Every day", "Mon, Wed, Fri". */
export function describeFrequency(habit) {
  const type = habit.frequencyType || "daily";
  if (type === "daily") return "Every day";
  if (type === "days") {
    const days = habit.scheduledDays || [];
    if (days.length === 0) return "No days selected";
    if (days.length === 7) return "Every day";
    return WEEKDAY_ORDER.filter((d) => days.includes(d))
      .map((d) => WEEKDAY_LABELS[d])
      .join(", ");
  }
  const target = habit.frequencyTarget || 1;
  if (type === "week") return `${target}x per week`;
  return `${target}x per month`;
}
