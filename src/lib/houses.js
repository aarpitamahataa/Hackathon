// Houses: original, user-editable groupings for habits ("The House of Body", etc.).
// A habit optionally belongs to one house via habit.houseId. Unassigned habits fall
// under a synthetic "Unsworn" group in the UI rather than a stored house.

// Every house color stays within the site's black/gold/crimson/stone palette —
// distinguished by shade and warmth, not by hue, so nothing reads as an off-brand
// pink/orange/blue accent.
export const DEFAULT_HOUSES = [
  { id: "house-body", name: "House of Body", emoji: "⚔", color: "#8a3a3a" },
  { id: "house-mind", name: "House of Mind", emoji: "◈", color: "#8a7a4a" },
  { id: "house-discipline", name: "House of Discipline", emoji: "☉", color: "#c9a24b" },
  { id: "house-spirit", name: "House of Spirit", emoji: "✦", color: "#6b3a42" },
  { id: "house-craft", name: "House of Craft", emoji: "⚒", color: "#6b5a35" },
];

export const UNASSIGNED_HOUSE = { id: null, name: "Unsworn Quests", emoji: "◇", color: "#7a7568" };

/** Groups active habits by house, in house-list order, with an "Unsworn" group last
 * (only present if there are any homeless habits). Each group carries its own
 * completion fraction for today so a house header can show "2/3 fulfilled". */
export function groupHabitsByHouse(habits, houses, isDoneToday) {
  const byId = new Map(houses.map((h) => [h.id, h]));
  const buckets = new Map();

  for (const habit of habits) {
    const key = habit.houseId && byId.has(habit.houseId) ? habit.houseId : null;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(habit);
  }

  const groups = [];
  for (const house of houses) {
    const members = buckets.get(house.id);
    if (members && members.length > 0) {
      groups.push(toGroup(house, members, isDoneToday));
    }
  }
  const unassigned = buckets.get(null);
  if (unassigned && unassigned.length > 0) {
    groups.push(toGroup(UNASSIGNED_HOUSE, unassigned, isDoneToday));
  }
  return groups;
}

function toGroup(house, members, isDoneToday) {
  const fulfilled = members.filter(isDoneToday).length;
  return { house, habits: members, fulfilled, total: members.length };
}
