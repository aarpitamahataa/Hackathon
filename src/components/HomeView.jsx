import Hero from "./Hero.jsx";
import StatsBar from "./StatsBar.jsx";
import ReminderBanner from "./ReminderBanner.jsx";
import WeeklyTrendChart from "./WeeklyTrendChart.jsx";
import MonthlyHeatmap from "./MonthlyHeatmap.jsx";

export default function HomeView({
  habits,
  rankTitle,
  fulfilled,
  total,
  currentStreak,
  bestStreak,
  xp,
  hasHabits,
  showReminderBanner,
  pendingCount,
  reminderDeadline,
  onViewQuests,
  onDismissReminder,
}) {
  return (
    <>
      <Hero
        rankTitle={rankTitle}
        fulfilled={fulfilled}
        total={total}
        currentStreak={currentStreak}
        bestStreak={bestStreak}
      />

      {showReminderBanner && (
        <ReminderBanner
          pendingCount={pendingCount}
          deadline={reminderDeadline}
          onView={onViewQuests}
          onDismiss={onDismissReminder}
        />
      )}

      <div className="app-body">
        {hasHabits && <StatsBar xp={xp} />}

        {hasHabits ? (
          <div className="chart-grid">
            <WeeklyTrendChart habits={habits} />
            <MonthlyHeatmap habits={habits} />
          </div>
        ) : (
          <p className="empty-state">
            Your weekly and monthly overview will appear here once you start tracking quests.
          </p>
        )}
      </div>
    </>
  );
}
