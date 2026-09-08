import Modal from "./Modal.jsx";

export default function SettingsModal({ settings, onChange, onClose }) {
  return (
    <Modal title="Reminder settings" onClose={onClose} labelledBy="settings-title">
      <div className="form-field">
        <label className="reminder-toggle-label">
          <input
            type="checkbox"
            checked={settings.reminderEnabled}
            onChange={(e) => onChange({ reminderEnabled: e.target.checked })}
          />
          Show a reminder banner for unfinished habits
        </label>
      </div>
      <div className="form-field">
        <label htmlFor="default-reminder-time">Default reminder time</label>
        <input
          id="default-reminder-time"
          type="time"
          className="reminder-time-input"
          value={settings.defaultReminderTime}
          onChange={(e) => onChange({ defaultReminderTime: e.target.value })}
          disabled={!settings.reminderEnabled}
        />
      </div>
      <p className="settings-hint">
        Individual habits can override this with their own reminder time in the habit's edit menu.
      </p>
    </Modal>
  );
}
