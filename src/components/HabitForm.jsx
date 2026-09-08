import { useState } from "react";
import { DEFAULT_EMOJIS, DEFAULT_COLORS } from "../lib/storage.js";
import { WEEKDAY_ORDER, WEEKDAY_LABELS } from "../lib/frequency.js";

const MAX_NAME_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 140;

function habitToFormState(habit) {
  return {
    name: habit?.name || "",
    description: habit?.description || "",
    emoji: habit?.emoji || DEFAULT_EMOJIS[0],
    color: habit?.color || DEFAULT_COLORS[0],
    houseId: habit?.houseId || "",
    frequencyType: habit?.frequencyType || "daily",
    scheduledDays: habit?.scheduledDays || [],
    frequencyTarget: habit?.frequencyTarget || 3,
    reminderEnabled: habit?.reminderEnabled || false,
    reminderTime: habit?.reminderTime || "20:00",
  };
}

/**
 * Create/edit form for a habit. Used inline (compact, "More options" collapsed) when
 * adding a habit, and inside a modal (fully expanded) when editing one — same component,
 * same validation, so the two flows can never drift apart.
 */
export default function HabitForm({
  habit,
  houses,
  onSubmit,
  onCancel,
  inputRef,
  submitLabel = "Add",
  startExpanded = false,
}) {
  const [form, setForm] = useState(() => habitToFormState(habit));
  const [expanded, setExpanded] = useState(startExpanded);
  const [error, setError] = useState("");

  function update(patch) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function toggleDay(day) {
    update({
      scheduledDays: form.scheduledDays.includes(day)
        ? form.scheduledDays.filter((d) => d !== day)
        : [...form.scheduledDays, day].sort(),
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      setError("Give your habit a name.");
      return;
    }
    if (form.frequencyType === "days" && form.scheduledDays.length === 0) {
      setError("Pick at least one day.");
      return;
    }
    setError("");
    onSubmit({
      ...form,
      name: trimmedName,
      description: form.description.trim(),
      houseId: form.houseId || null,
      frequencyTarget: Math.min(31, Math.max(1, Number(form.frequencyTarget) || 1)),
    });
    if (!habit) {
      setForm(habitToFormState(null));
    }
  }

  return (
    <form className="habit-form" onSubmit={handleSubmit}>
      <label htmlFor="habit-name">{habit ? "Quest name" : "Add a Quest"}</label>
      <div className="add-habit-row">
        <input
          id="habit-name"
          ref={inputRef}
          type="text"
          value={form.name}
          onChange={(e) => update({ name: e.target.value })}
          maxLength={MAX_NAME_LENGTH}
          placeholder="e.g. Drink a glass of water"
          autoComplete="off"
        />
        {!habit && (
          <button type="submit" className="btn-primary">
            {submitLabel}
          </button>
        )}
      </div>

      <div className="picker-row" role="group" aria-label="Choose an emoji">
        {DEFAULT_EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            className={"emoji-swatch" + (e === form.emoji ? " emoji-swatch-selected" : "")}
            aria-pressed={e === form.emoji}
            aria-label={`Use emoji ${e}`}
            onClick={() => update({ emoji: e })}
          >
            {e}
          </button>
        ))}
      </div>

      <div className="picker-row" role="group" aria-label="Choose a color">
        {DEFAULT_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            className={"color-swatch" + (c === form.color ? " color-swatch-selected" : "")}
            style={{ background: c }}
            aria-pressed={c === form.color}
            aria-label={`Use color ${c}`}
            onClick={() => update({ color: c })}
          />
        ))}
      </div>

      {!expanded && (
        <button type="button" className="link-button" onClick={() => setExpanded(true)}>
          + More options
        </button>
      )}

      {expanded && (
        <div className="habit-form-advanced">
          <div className="form-field">
            <label htmlFor="habit-description">Description (optional)</label>
            <input
              id="habit-description"
              type="text"
              value={form.description}
              onChange={(e) => update({ description: e.target.value })}
              maxLength={MAX_DESCRIPTION_LENGTH}
              placeholder="e.g. 8 glasses"
              autoComplete="off"
            />
          </div>

          {houses && houses.length > 0 && (
            <div className="form-field">
              <label htmlFor="habit-house">House</label>
              <select
                id="habit-house"
                className="house-select"
                value={form.houseId}
                onChange={(e) => update({ houseId: e.target.value })}
              >
                <option value="">No house</option>
                {houses.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.emoji} {h.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-field">
            <label>Frequency</label>
            <div className="frequency-options" role="radiogroup" aria-label="Frequency">
              {[
                { value: "daily", label: "Every day" },
                { value: "days", label: "Specific days" },
                { value: "week", label: "X times per week" },
                { value: "month", label: "X times per month" },
              ].map((opt) => (
                <label key={opt.value} className="frequency-option">
                  <input
                    type="radio"
                    name="frequencyType"
                    value={opt.value}
                    checked={form.frequencyType === opt.value}
                    onChange={() => update({ frequencyType: opt.value })}
                  />
                  {opt.label}
                </label>
              ))}
            </div>

            {form.frequencyType === "days" && (
              <div className="day-chip-row" role="group" aria-label="Choose days">
                {WEEKDAY_ORDER.map((day) => (
                  <button
                    key={day}
                    type="button"
                    className={"day-chip" + (form.scheduledDays.includes(day) ? " day-chip-selected" : "")}
                    aria-pressed={form.scheduledDays.includes(day)}
                    onClick={() => toggleDay(day)}
                  >
                    {WEEKDAY_LABELS[day]}
                  </button>
                ))}
              </div>
            )}

            {(form.frequencyType === "week" || form.frequencyType === "month") && (
              <div className="target-row">
                <span>Target:</span>
                <input
                  type="number"
                  min="1"
                  max="31"
                  className="target-input"
                  value={form.frequencyTarget}
                  onChange={(e) => update({ frequencyTarget: e.target.value })}
                />
                <span>times per {form.frequencyType}</span>
              </div>
            )}
          </div>

          <div className="form-field">
            <label className="reminder-toggle-label">
              <input
                type="checkbox"
                checked={form.reminderEnabled}
                onChange={(e) => update({ reminderEnabled: e.target.checked })}
              />
              Remind me about this habit
            </label>
            {form.reminderEnabled && (
              <input
                type="time"
                className="reminder-time-input"
                value={form.reminderTime}
                onChange={(e) => update({ reminderTime: e.target.value })}
                aria-label="Reminder time"
              />
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {habit && (
        <div className="habit-form-footer">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Save changes
          </button>
        </div>
      )}
    </form>
  );
}
