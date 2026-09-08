import { DEFAULT_HOUSES } from "./houses.js";

const STORAGE_KEY = "habit-tracker:habits";
const SETTINGS_KEY = "habit-tracker:settings";
const HOUSES_KEY = "habit-tracker:houses";

export function loadHabits() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    // Backfill fields for habits saved before newer features existed, so older data
    // keeps working exactly as before (daily frequency, active, no description/reminder).
    return parsed.map((habit, i) => ({
      emoji: DEFAULT_EMOJIS[i % DEFAULT_EMOJIS.length],
      color: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      description: "",
      frequencyType: "daily",
      scheduledDays: [],
      frequencyTarget: 3,
      reminderEnabled: false,
      reminderTime: "",
      startDate: habit.createdAt,
      active: true,
      houseId: null,
      updatedAt: habit.createdAt,
      ...habit,
    }));
  } catch {
    return [];
  }
}

export function saveHabits(habits) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  } catch {
    // localStorage unavailable (e.g. private browsing) — app still works for this session
  }
}

const DEFAULT_SETTINGS = {
  theme: "dark", // "light" (Dawn) | "dark" (Nightfall) — Nightfall is the primary identity

  muted: false,
  partyMode: false,
  lastSeenLevel: 1,
  reminderEnabled: true,
  defaultReminderTime: "20:00",
  reminderDismissedDate: null,
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function loadHouses() {
  try {
    const raw = localStorage.getItem(HOUSES_KEY);
    return raw ? JSON.parse(raw) : [...DEFAULT_HOUSES];
  } catch {
    return [...DEFAULT_HOUSES];
  }
}

export function saveHouses(houses) {
  try {
    localStorage.setItem(HOUSES_KEY, JSON.stringify(houses));
  } catch {
    // ignore
  }
}

export const DEFAULT_EMOJIS = ["✅", "💪", "📚", "🧘", "🏃", "💧", "🥗", "😴", "🎯", "🎨"];
export const DEFAULT_COLORS = [
  "#2f6f4f",
  "#3b82f6",
  "#e5484d",
  "#f4a300",
  "#a855f7",
  "#0891b2",
];
