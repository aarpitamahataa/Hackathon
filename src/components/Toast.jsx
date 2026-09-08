export default function Toast({ toast, onUndo, onDismiss }) {
  if (!toast) return null;

  return (
    <div className={"toast" + (toast.kind ? ` toast-${toast.kind}` : "")} role="status">
      <span className="toast-message">{toast.message}</span>
      {toast.onUndo && (
        <button
          type="button"
          className="toast-action"
          onClick={() => {
            toast.onUndo();
            onUndo();
          }}
        >
          Undo
        </button>
      )}
      <button type="button" className="toast-dismiss" aria-label="Dismiss" onClick={onDismiss}>
        ×
      </button>
    </div>
  );
}
