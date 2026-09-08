// Simple XP/level system: every check-in across every habit earns XP.
// Level thresholds grow so early levels come fast and later ones feel earned.

const BASE_XP_PER_LEVEL = 50;
const GROWTH = 1.35;

export function totalXP(habits) {
  return habits.reduce((sum, h) => sum + (h.checkIns?.length || 0) * 10, 0);
}

/** XP required to go from level N to N+1 (level is 1-indexed). */
function xpForLevel(level) {
  return Math.round(BASE_XP_PER_LEVEL * Math.pow(GROWTH, level - 1));
}

export function levelFromXP(xp) {
  let level = 1;
  let remaining = xp;
  let needed = xpForLevel(level);
  while (remaining >= needed) {
    remaining -= needed;
    level += 1;
    needed = xpForLevel(level);
  }
  return {
    level,
    xpIntoLevel: remaining,
    xpForNextLevel: needed,
    progress: needed === 0 ? 1 : remaining / needed,
  };
}

// Character rank, earned the same way as before (XP from check-ins) — just given a
// name that fits the world instead of a generic gamer title.
const TITLES = [
  "Ashbound Novice",
  "Wanderer of the Grey Path",
  "Ember-Marked Wanderer",
  "Sworn Adherent",
  "Warden of Habit",
  "Emberguard Knight",
  "Knight of the Long Dawn",
  "Bearer of the Gilded Vow",
  "Champion of the Old Path",
  "Lord of the Unbroken Flame",
];

export function titleForLevel(level) {
  return TITLES[Math.min(level - 1, TITLES.length - 1)];
}
