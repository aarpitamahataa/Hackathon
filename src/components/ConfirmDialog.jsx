import Modal from "./Modal.jsx";

/** Destructive-action confirmation dialog. The confirm button is never auto-focused. */
export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) {
  return (
    <Modal title={title} onClose={onCancel} labelledBy="confirm-title">
      <p className="confirm-message">{message}</p>
      <div className="confirm-actions">
        <button type="button" className="btn-secondary" onClick={onCancel} autoFocus>
          {cancelLabel}
        </button>
        <button type="button" className="btn-danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
