import { useEffect, useMemo, useRef, useState } from "react";
import SideNav from "./components/SideNav.jsx";
import TopBar from "./components/TopBar.jsx";
import RightRail from "./components/RightRail.jsx";
import HomeView from "./components/HomeView.jsx";
import QuestsView from "./components/QuestsView.jsx";
import HousesView from "./components/HousesView.jsx";
import ChronicleView from "./components/ChronicleView.jsx";
import HabitForm from "./components/HabitForm.jsx";
import Toast from "./components/Toast.jsx";
import Modal from "./components/Modal.jsx";
import ConfirmDialog from "./components/ConfirmDialog.jsx";
import SettingsModal from "./components/SettingsModal.jsx";
import { loadHabits, saveHabits, loadSettings, saveSettings, loadHouses } from "./lib/storage.js";
import { todayISO, nowHM } from "./lib/dates.js";
import { computeHabitStats } from "./lib/streaks.js";
import { isScheduledOn } from "./lib/frequency.js";
import { totalXP, levelFromXP, titleForLevel } from "./lib/gamification.js";
import { fireConfetti } from "./lib/confetti.js";
import { playCheck, playUncheck, playLevelUp, playAllDone } from "./lib/sound.js";

const QUIPS = [
  "Nice. Future you says thanks.",
  "That's a rep in the bank.",
  "Small win. Big pattern.",
  "Consistency unlocked.",
  "You showed up. That's the whole game.",
  "Look at you, being reliable.",
  "One more brick in the wall of you.",
];

const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

export default function App() {
  const [allHabits, setAllHabits] = useState(() => loadHabits());
  const [settings, setSettings] = useState(() => loadSettings());
  const [houses] = useState(() => loadHouses());
  const [search, setSearch] = useState("");
  const [view, setView] = useState("home"); // "home" | "quests" | "houses" | "chronicle"
  const [toast, setToast] = useState(null);
  const [editingHabit, setEditingHabit] = useState(null);
  const [deletingHabit, setDeletingHabit] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const inputRef = useRef(null);
  const toastTimerRef = useRef(null);
  const konamiProgress = useRef(0);

  const habits = useMemo(() => allHabits.filter((h) => h.active !== false), [allHabits]);
  const visibleHabits = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return habits;
    return habits.filter((h) => h.name.toLowerCase().includes(q));
  }, [habits, search]);

  useEffect(() => {
    saveHabits(allHabits);
  }, [allHabits]);

  useEffect(() => {
    saveSettings(settings);
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.classList.toggle("party-mode", settings.partyMode);
  }, [settings]);

  // Global keyboard shortcuts: "/" jumps to the Quests page and focuses its add-quest
  // input, and the classic Konami code toggles a delightfully unnecessary party mode.
  useEffect(() => {
    function handleKeyDown(e) {
      const isTyping = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
      if (e.key === "/" && !isTyping) {
        e.preventDefault();
        setView("quests");
        requestAnimationFrame(() => inputRef.current?.focus());
      }

      const expected = KONAMI[konamiProgress.current];
      if (e.key === expected) {
        konamiProgress.current += 1;
        if (konamiProgress.current === KONAMI.length) {
          konamiProgress.current = 0;
          setSettings((prev) => {
            const partyMode = !prev.partyMode;
            showToast({
              message: partyMode ? "🎉 PARTY MODE ACTIVATED 🎉" : "Party mode off. Back to business.",
              kind: "party",
            });
            if (partyMode) fireConfetti({ particleCount: 220, spread: 100, originY: 0.15 });
            return { ...prev, partyMode };
          });
        }
      } else {
        konamiProgress.current = expected === e.key ? konamiProgress.current : 0;
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function showToast(next, { withTimeout = 3200 } = {}) {
    clearTimeout(toastTimerRef.current);
    setToast(next);
    if (withTimeout) {
      toastTimerRef.current = setTimeout(() => setToast(null), withTimeout);
    }
  }

  function handleAddHabit(values) {
    const now = new Date().toISOString();
    const newHabit = {
      id: crypto.randomUUID(),
      ...values,
      startDate: todayISO(),
      active: true,
      createdAt: now,
      updatedAt: now,
      checkIns: [],
    };
    setAllHabits((prev) => [...prev, newHabit]);
  }

  function handleSaveEdit(values) {
    setAllHabits((prev) =>
      prev.map((h) =>
        h.id === editingHabit.id
          ? { ...h, ...values, updatedAt: new Date().toISOString() }
          : h,
      ),
    );
    setEditingHabit(null);
    showToast({ message: `Saved "${values.name}".` });
  }

  function handleToggleToday(habitId) {
    const today = todayISO();
    const prevXP = totalXP(habits);
    const prevLevel = levelFromXP(prevXP).level;

    setAllHabits((prev) => {
      const next = prev.map((habit) => {
        if (habit.id !== habitId) return habit;
        const isDone = habit.checkIns.includes(today);
        return {
          ...habit,
          checkIns: isDone
            ? habit.checkIns.filter((d) => d !== today)
            : [...habit.checkIns, today],
        };
      });

      const target = next.find((h) => h.id === habitId);
      const nowDone = target?.checkIns.includes(today);
      const activeNext = next.filter((h) => h.active !== false);

      if (nowDone) {
        playCheck(settings.muted);
        const nextXP = totalXP(activeNext);
        const nextLevel = levelFromXP(nextXP).level;

        if (nextLevel > prevLevel) {
          playLevelUp(settings.muted);
          fireConfetti({ particleCount: 180, spread: 90, originY: 0.25 });
          showToast({
            message: `⭐ Rank ${nextLevel} reached — you are now the ${titleForLevel(nextLevel)}.`,
            kind: "level",
          });
        } else {
          const allDoneNow =
            activeNext.length > 0 &&
            activeNext.every((h) => !isScheduledOn(h, today) || h.checkIns.includes(today));
          if (allDoneNow) {
            playAllDone(settings.muted);
            fireConfetti({ particleCount: 200, spread: 110, originY: 0.2 });
            showToast({ message: "🎊 Every quest fulfilled today. Well fought.", kind: "celebrate" });
          } else {
            showToast({ message: QUIPS[Math.floor(Math.random() * QUIPS.length)] });
          }
        }
      } else {
        playUncheck(settings.muted);
      }

      return next;
    });
  }

  function handleConfirmDelete() {
    const removed = deletingHabit;
    setDeletingHabit(null);
    if (!removed) return;
    // Soft delete: keep the record (and its check-in history) around, just hide it from
    // the active list. This lets "Undo" instantly restore it with history intact.
    setAllHabits((prev) => prev.map((h) => (h.id === removed.id ? { ...h, active: false } : h)));

    showToast(
      {
        message: `Deleted "${removed.name}".`,
        onUndo: () => setAllHabits((prev) => prev.map((h) => (h.id === removed.id ? { ...h, active: true } : h))),
      },
      { withTimeout: 5000 },
    );
  }

  function toggleTheme() {
    setSettings((prev) => ({ ...prev, theme: prev.theme === "dark" ? "light" : "dark" }));
  }

  function toggleMuted() {
    setSettings((prev) => ({ ...prev, muted: !prev.muted }));
  }

  const xp = totalXP(habits);
  const rankTitle = titleForLevel(levelFromXP(xp).level);

  const today = todayISO();
  const scheduledTodayHabits = habits.filter((h) => isScheduledOn(h, today));
  const fulfilledToday = scheduledTodayHabits.filter((h) => computeHabitStats(h, today).periodTargetMet).length;
  const currentStreakOverall = habits.reduce((max, h) => Math.max(max, computeHabitStats(h, today).current), 0);
  const bestStreakOverall = habits.reduce((max, h) => Math.max(max, computeHabitStats(h, today).best), 0);

  // --- In-app reminder banner (shown on the Home page) -------------------------------
  const nowTime = nowHM();
  const pendingHabits = habits.filter((h) => {
    if (!isScheduledOn(h, today)) return false;
    const stats = computeHabitStats(h, today);
    return !stats.periodTargetMet;
  });
  const triggeredHabits = pendingHabits.filter((h) => {
    if (settings.reminderEnabled === false) return false;
    if (h.reminderEnabled === false || !h.reminderEnabled) {
      return nowTime >= settings.defaultReminderTime;
    }
    return nowTime >= (h.reminderTime || settings.defaultReminderTime);
  });
  const reminderDismissedToday = settings.reminderDismissedDate === today;
  const showReminderBanner = settings.reminderEnabled && !reminderDismissedToday && triggeredHabits.length > 0;

  function dismissReminder() {
    setSettings((prev) => ({ ...prev, reminderDismissedDate: today }));
  }

  return (
    <div className="app-shell">
      <SideNav activeSection={view} onNavigate={setView} onOpenSettings={() => setSettingsOpen(true)} />

      <div className="app-main">
        <TopBar
          search={search}
          onSearchChange={setSearch}
          muted={settings.muted}
          onToggleMuted={toggleMuted}
          theme={settings.theme}
          onToggleTheme={toggleTheme}
        />

        <main className="app">
          {view === "home" && (
            <HomeView
              habits={habits}
              rankTitle={rankTitle}
              fulfilled={fulfilledToday}
              total={scheduledTodayHabits.length}
              currentStreak={currentStreakOverall}
              bestStreak={bestStreakOverall}
              xp={xp}
              hasHabits={habits.length > 0}
              showReminderBanner={showReminderBanner}
              pendingCount={pendingHabits.length}
              reminderDeadline={settings.defaultReminderTime}
              onViewQuests={() => setView("quests")}
              onDismissReminder={dismissReminder}
            />
          )}

          {view === "quests" && (
            <QuestsView
              habits={habits}
              visibleHabits={visibleHabits}
              houses={houses}
              search={search}
              inputRef={inputRef}
              onAddHabit={handleAddHabit}
              onToggleToday={handleToggleToday}
              onEdit={setEditingHabit}
              onDeleteRequest={setDeletingHabit}
            />
          )}

          {view === "houses" && (
            <HousesView
              habits={habits}
              visibleHabits={visibleHabits}
              houses={houses}
              search={search}
              onToggleToday={handleToggleToday}
              onEdit={setEditingHabit}
              onDeleteRequest={setDeletingHabit}
            />
          )}

          {view === "chronicle" && <ChronicleView habits={habits} />}
        </main>
      </div>

      <RightRail habits={habits} />

      {editingHabit && (
        <Modal title="Edit Quest" onClose={() => setEditingHabit(null)}>
          <HabitForm
            habit={editingHabit}
            houses={houses}
            onSubmit={handleSaveEdit}
            onCancel={() => setEditingHabit(null)}
            startExpanded
          />
        </Modal>
      )}

      {deletingHabit && (
        <ConfirmDialog
          title="Abandon this quest?"
          message="Your quest's history and progress may also be removed."
          confirmLabel="Abandon quest"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingHabit(null)}
        />
      )}

      {settingsOpen && (
        <SettingsModal
          settings={settings}
          onChange={(patch) => setSettings((prev) => ({ ...prev, ...patch }))}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      <Toast toast={toast} onUndo={() => setToast(null)} onDismiss={() => setToast(null)} />
    </div>
  );
}
