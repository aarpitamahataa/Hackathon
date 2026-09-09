import { useEffect, useRef } from "react";
import { X } from "@phosphor-icons/react";

/** Accessible dialog overlay. Renders as a centered card on wide screens and a bottom
 * sheet on narrow ones (see .modal-sheet in styles.css). Closes on Escape or overlay click. */
export default function Modal({ title, onClose, children, labelledBy }) {
  const sheetRef = useRef(null);
  const titleId = labelledBy || "modal-title";

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    // Move focus into the dialog so keyboard/screen-reader users land inside it.
    const firstField = sheetRef.current?.querySelector("input, button, textarea, select");
    firstField?.focus();
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="modal-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={sheetRef}
      >
        <div className="modal-header">
          <h2 id={titleId} className="modal-title">
            {title}
          </h2>
          <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
