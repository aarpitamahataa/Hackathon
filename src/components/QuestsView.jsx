import HabitForm from "./HabitForm.jsx";
import HabitRow from "./HabitRow.jsx";

export default function QuestsView({
  habits,
  visibleHabits,
  houses,
  search,
  inputRef,
  onAddHabit,
  onToggleToday,
  onEdit,
  onDeleteRequest,
}) {
  return (
    <div className="app-body">
      <div className="view-header">
        <h1 className="font-display">Quests</h1>
        <p className="view-subtitle">Every quest you're tracking, in one place.</p>
      </div>

      <HabitForm onSubmit={onAddHabit} houses={houses} inputRef={inputRef} submitLabel="Add" />

      {habits.length === 0 ? (
        <p className="empty-state">No quests yet. Add one above — your journey begins with a single step.</p>
      ) : search.trim() && visibleHabits.length === 0 ? (
        <p className="empty-state">No quests match "{search.trim()}".</p>
      ) : (
        <ul className="habit-list">
          {visibleHabits.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              onToggleToday={onToggleToday}
              onEdit={onEdit}
              onDeleteRequest={onDeleteRequest}
            />
          ))}
        </ul>
      )}

      <p className="hint">
        Tip: press <kbd>/</kbd> to jump to the add-quest box. There may or may not be a
        secret code that does something ridiculous.
      </p>
    </div>
  );
}
