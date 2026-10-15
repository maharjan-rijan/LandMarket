import { useEffect, useRef } from "react";
import { CloseIcon } from "@/hooks/icons";

// Uses the native <dialog> element: focus trap, Esc to close and backdrop come for free.
//
// The position is set inline on purpose. A CSS reset that zeroes margins (Tailwind's does)
// removes the browser's automatic centring and leaves the popup stuck at the top, so the
// centring is spelled out here and cannot be undone by a stylesheet.
const centred = {
  position: "fixed",
  inset: 0,
  margin: "auto",
  width: "min(32rem, calc(100vw - 2rem))",
  height: "fit-content",
  maxHeight: "calc(100vh - 2rem)",
  overflowY: "auto",
};

export default function Modal({ open, onClose, title, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="modal"
      style={centred}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-body">
        <div className="flex items-start justify-between gap-4">
          <h2 style={{ fontSize: "1.3rem" }}>{title}</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon size={20} />
          </button>
        </div>
        <div className="mt-4">{open && children}</div>
      </div>
    </dialog>
  );
}
