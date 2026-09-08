import { formatTime } from "../lib/dates.js";

/** Shown only when there's something to actually remind the user about — see the
 * visibility rules computed in App.jsx (pendingCount > 0 AND time has passed AND not
 * dismissed today AND reminders are enabled). */
export default function ReminderBanner({ pendingCount, deadline, onView, onDismiss }) {
  if (pendingCount <= 0) return null;

  return (
    <div className="reminder-banner" role="status">
      <div className="reminder-banner-text">
        <p className="reminder-banner-title">
          You still have {pendingCount} habit{pendingCount === 1 ? "" : "s"} left today.
        </p>
        {deadline && <p className="reminder-banner-subtitle">Finish them before {formatTime(deadline)}.</p>}
      </div>
      <div className="reminder-banner-actions">
        <button type="button" className="reminder-banner-view" onClick={onView}>
          View habits
        </button>
        <button type="button" className="reminder-banner-dismiss" aria-label="Dismiss reminder" onClick={onDismiss}>
          ×
        </button>
      </div>
    </div>
  );
}
