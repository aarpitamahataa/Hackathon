import HabitRow from "./HabitRow.jsx";
import { groupHabitsByHouse } from "../lib/houses.js";
import { computeHabitStats } from "../lib/streaks.js";
import { todayISO } from "../lib/dates.js";

export default function HabitList({ habits, houses, onToggleToday, onEdit, onDeleteRequest }) {
  if (habits.length === 0) {
    return (
      <p className="empty-state">
        No quests yet. Add one above — your journey begins with a single step.
      </p>
    );
  }

  const today = todayISO();
  const isDoneToday = (habit) => computeHabitStats(habit, today).periodTargetMet;
  const groups = groupHabitsByHouse(habits, houses, isDoneToday);

  return (
    <div className="house-groups">
      {groups.map(({ house, habits: members, fulfilled, total }) => (
        <section key={house.id || "unsworn"} className="house-group" style={{ "--house-accent": house.color }}>
          <header className="house-group-header">
            <span className="house-emblem" aria-hidden="true">
              {house.emoji}
            </span>
            <h2 className="house-name">{house.name}</h2>
            <span className="house-fraction">
              {fulfilled}/{total} fulfilled
            </span>
          </header>
          <ul className="habit-list">
            {members.map((habit) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                onToggleToday={onToggleToday}
                onEdit={onEdit}
                onDeleteRequest={onDeleteRequest}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
