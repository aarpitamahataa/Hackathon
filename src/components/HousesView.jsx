import HabitList from "./HabitList.jsx";

export default function HousesView({ habits, visibleHabits, houses, search, onToggleToday, onEdit, onDeleteRequest }) {
  return (
    <div className="app-body">
      <div className="view-header">
        <h1 className="font-display">Houses</h1>
        <p className="view-subtitle">Your quests, organized by the houses you've sworn them to.</p>
      </div>

      {habits.length > 0 && search.trim() && visibleHabits.length === 0 ? (
        <p className="empty-state">No quests match "{search.trim()}".</p>
      ) : (
        <HabitList
          habits={visibleHabits}
          houses={houses}
          onToggleToday={onToggleToday}
          onEdit={onEdit}
          onDeleteRequest={onDeleteRequest}
        />
      )}
    </div>
  );
}
